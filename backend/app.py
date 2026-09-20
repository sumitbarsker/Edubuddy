from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)

DATABASE = "edubuddy.db"


# ==============================
# DATABASE
# ==============================

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            note TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task TEXT NOT NULL,
            time TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS chat (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

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
        "message": "EduBuddy Backend is running 🚀"
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

    data = request.get_json()

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
        (note, datetime.now().isoformat())
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

    data = request.get_json()

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

    data = request.get_json()

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
# AI HISTORY
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


@app.route("/api/ai/history", methods=["POST"])
def save_ai_history():

    data = request.get_json()

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

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
