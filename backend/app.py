from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os
import sys

app = Flask(__name__)
CORS(app)

# ==============================
# PATHS
# ==============================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATABASE = os.path.join(
    BASE_DIR,
    "edubuddy.db"
)

# AIML folder path
AIML_PATH = os.path.abspath(
    os.path.join(BASE_DIR, "..", "aiml")
)

sys.path.append(AIML_PATH)

# Import AI predictor
try:
    from predictor import predict_priority, recommended_hours
    AI_AVAILABLE = True
except Exception as e:
    print("⚠️ AI model could not be loaded:", e)
    AI_AVAILABLE = False


# ==============================
# DATABASE
# ==============================

def get_db():

    conn = sqlite3.connect(DATABASE)

    conn.row_factory = sqlite3.Row

    return conn


def init_db():

    conn = get_db()

    # NOTES
    conn.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            note TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    # TASKS
    conn.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task TEXT NOT NULL,
            time TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    # CHAT
    conn.execute("""
        CREATE TABLE IF NOT EXISTS chat (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    # AI HISTORY
    conn.execute("""
        CREATE TABLE IF NOT EXISTS ai_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT NOT NULL,
            difficulty INTEGER NOT NULL,
            score REAL NOT NULL,
            available_hours REAL NOT NULL,
            priority TEXT NOT NULL,
            recommended_hours REAL NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    conn.commit()

    conn.close()


# ==============================
# HOME / TEST
# ==============================

@app.route("/")
def home():

    return jsonify({
        "success": True,
        "message": "EduBuddy Backend is running 🚀",
        "ai_model": "Available" if AI_AVAILABLE else "Unavailable"
    })


# ==============================
# NOTES
# ==============================

@app.route("/api/notes", methods=["GET"])
def get_notes():

    conn = get_db()

    notes = conn.execute(
        "SELECT * FROM notes ORDER BY id DESC"
    ).fetchall()

    conn.close()

    return jsonify([
        dict(note)
        for note in notes
    ])


@app.route("/api/notes", methods=["POST"])
def add_note():

    data = request.get_json() or {}

    note = data.get("note", "").strip()

    if not note:

        return jsonify({
            "success": False,
            "message": "Note cannot be empty"
        }), 400

    conn = get_db()

    cursor = conn.execute(
        """
        INSERT INTO notes (note, created_at)
        VALUES (?, ?)
        """,
        (
            note,
            datetime.now().isoformat()
        )
    )

    conn.commit()

    note_id = cursor.lastrowid

    conn.close()

    return jsonify({
        "success": True,
        "id": note_id,
        "message": "Note saved successfully"
    })


@app.route("/api/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):

    conn = get_db()

    conn.execute(
        "DELETE FROM notes WHERE id = ?",
        (note_id,)
    )

    conn.commit()

    conn.close()

    return jsonify({
        "success": True,
        "message": "Note deleted"
    })


# ==============================
# TASKS / ROUTINE
# ==============================

@app.route("/api/tasks", methods=["GET"])
def get_tasks():

    conn = get_db()

    tasks = conn.execute(
        "SELECT * FROM tasks ORDER BY time"
    ).fetchall()

    conn.close()

    return jsonify([
        dict(task)
        for task in tasks
    ])


@app.route("/api/tasks", methods=["POST"])
def add_task():

    data = request.get_json() or {}

    task = data.get("task", "").strip()

    time = data.get("time", "").strip()

    if not task or not time:

        return jsonify({
            "success": False,
            "message": "Task and time are required"
        }), 400

    conn = get_db()

    cursor = conn.execute(
        """
        INSERT INTO tasks
        (task, time, created_at)
        VALUES (?, ?, ?)
        """,
        (
            task,
            time,
            datetime.now().isoformat()
        )
    )

    conn.commit()

    task_id = cursor.lastrowid

    conn.close()

    return jsonify({
        "success": True,
        "id": task_id,
        "message": "Task added successfully"
    })


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):

    conn = get_db()

    conn.execute(
        "DELETE FROM tasks WHERE id = ?",
        (task_id,)
    )

    conn.commit()

    conn.close()

    return jsonify({
        "success": True,
        "message": "Task deleted"
    })


# ==============================
# STUDY CHAT
# ==============================

@app.route("/api/chat", methods=["GET"])
def get_chat():

    conn = get_db()

    messages = conn.execute(
        """
        SELECT * FROM chat
        ORDER BY id ASC
        """
    ).fetchall()

    conn.close()

    return jsonify([
        dict(message)
        for message in messages
    ])


@app.route("/api/chat", methods=["POST"])
def send_message():

    data = request.get_json() or {}

    username = data.get("username", "").strip()

    message = data.get("message", "").strip()

    if not username or not message:

        return jsonify({
            "success": False,
            "message": "Username and message are required"
        }), 400

    conn = get_db()

    cursor = conn.execute(
        """
        INSERT INTO chat
        (username, message, created_at)
        VALUES (?, ?, ?)
        """,
        (
            username,
            message,
            datetime.now().isoformat()
        )
    )

    conn.commit()

    message_id = cursor.lastrowid

    conn.close()

    return jsonify({
        "success": True,
        "id": message_id,
        "message": "Message sent successfully"
    })


# ==============================
# AI PREDICTION
# ==============================

@app.route("/api/ai/predict", methods=["POST"])
def ai_predict():

    # Check whether model loaded
    if not AI_AVAILABLE:

        return jsonify({
            "success": False,
            "message": "AI model is not available. Please train the model first."
        }), 500

    data = request.get_json() or {}

    # ==============================
    # GET INPUT
    # ==============================

    try:

        difficulty = int(
            data.get("difficulty")
        )

        previous_score = float(
            data.get("previous_score")
        )

        available_hours = float(
            data.get("available_hours")
        )

    except (TypeError, ValueError):

        return jsonify({
            "success": False,
            "message": "Invalid AI input"
        }), 400


    # ==============================
    # VALIDATION
    # ==============================

    if difficulty < 1 or difficulty > 5:

        return jsonify({
            "success": False,
            "message": "Difficulty must be between 1 and 5"
        }), 400


    if previous_score < 0 or previous_score > 100:

        return jsonify({
            "success": False,
            "message": "Previous score must be between 0 and 100"
        }), 400


    if available_hours <= 0:

        return jsonify({
            "success": False,
            "message": "Available hours must be greater than 0"
        }), 400


    # ==============================
    # AI PREDICTION
    # ==============================

    try:

        priority = predict_priority(
            difficulty,
            previous_score,
            available_hours
        )

        study_hours = recommended_hours(
            priority,
            available_hours
        )

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "AI prediction failed",
            "error": str(e)
        }), 500


    # ==============================
    # RESPONSE
    # ==============================

    return jsonify({

        "success": True,

        "difficulty": difficulty,

        "previous_score": previous_score,

        "available_hours": available_hours,

        "priority": priority,

        "recommended_hours": study_hours,

        "message": "AI prediction generated successfully"

    })


# ==============================
# AI HISTORY - GET
# ==============================

@app.route("/api/ai/history", methods=["GET"])
def get_ai_history():

    conn = get_db()

    history = conn.execute(
        """
        SELECT * FROM ai_history
        ORDER BY id DESC
        LIMIT 20
        """
    ).fetchall()

    conn.close()

    return jsonify([
        dict(item)
        for item in history
    ])


# ==============================
# AI HISTORY - SAVE
# ==============================

@app.route("/api/ai/history", methods=["POST"])
def save_ai_history():

    data = request.get_json() or {}

    required = [
        "subject",
        "difficulty",
        "score",
        "availableHours",
        "priority",
        "recommendedHours"
    ]

    for field in required:

        if field not in data:

            return jsonify({
                "success": False,
                "message": f"{field} is required"
            }), 400


    conn = get_db()

    cursor = conn.execute(
        """
        INSERT INTO ai_history
        (
            subject,
            difficulty,
            score,
            available_hours,
            priority,
            recommended_hours,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            data["subject"],
            data["difficulty"],
            data["score"],
            data["availableHours"],
            data["priority"],
            data["recommendedHours"],
            datetime.now().isoformat()
        )
    )

    conn.commit()

    history_id = cursor.lastrowid

    conn.close()

    return jsonify({
        "success": True,
        "id": history_id,
        "message": "AI recommendation saved"
    })


# ==============================
# START SERVER
# ==============================

if __name__ == "__main__":

    init_db()

    print("")
    print("===================================")
    print("🚀 EduBuddy Backend Started")
    print("📡 http://127.0.0.1:5000")
    print(
        "🤖 AI Model:",
        "Available" if AI_AVAILABLE else "Unavailable"
    )
    print("===================================")
    print("")

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
