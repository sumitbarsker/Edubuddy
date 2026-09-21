# =========================================================
# EduBuddy - Flask Backend
# =========================================================

from flask import Flask, request, jsonify
from flask_cors import CORS

import sqlite3
import os
from datetime import datetime


# =========================================================
# FLASK CONFIGURATION
# =========================================================

app = Flask(__name__)

CORS(app)


# =========================================================
# PATHS
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

DATABASE = os.path.join(
    BASE_DIR,
    "edubuddy.db"
)


# =========================================================
# AI IMPORT
# =========================================================

AI_AVAILABLE = False

predict_priority = None
recommended_hours = None


try:

    AIML_DIR = os.path.abspath(
        os.path.join(
            BASE_DIR,
            "..",
            "aiml"
        )
    )


    if AIML_DIR not in os.sys.path:

        os.sys.path.insert(
            0,
            AIML_DIR
        )


    from predictor import (
        predict_priority,
        recommended_hours
    )


    AI_AVAILABLE = True

    print(
        "AI model loaded successfully."
    )


except Exception as error:

    print(
        "AI model could not be loaded:"
    )

    print(error)

    AI_AVAILABLE = False


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db():

    connection = sqlite3.connect(
        DATABASE
    )

    connection.row_factory = (
        sqlite3.Row
    )

    return connection


# =========================================================
# DATABASE INITIALIZATION
# =========================================================

def init_db():

    connection = get_db()

    cursor = connection.cursor()


    # -----------------------------
    # Notes
    # -----------------------------

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS notes (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            note TEXT NOT NULL,

            created_at TEXT NOT NULL

        )
        """
    )


    # -----------------------------
    # Tasks
    # -----------------------------

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS tasks (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            task TEXT NOT NULL,

            time TEXT,

            created_at TEXT NOT NULL

        )
        """
    )


    # -----------------------------
    # Chat
    # -----------------------------

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS chat (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            username TEXT,

            message TEXT NOT NULL,

            created_at TEXT NOT NULL

        )
        """
    )


    # -----------------------------
    # AI History
    # -----------------------------

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS ai_history (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            subject TEXT,

            difficulty INTEGER,

            score REAL,

            available_hours REAL,

            priority TEXT,

            recommended_hours REAL,

            created_at TEXT NOT NULL

        )
        """
    )


    connection.commit()

    connection.close()


# =========================================================
# DATABASE INIT
# =========================================================

init_db()


# =========================================================
# HELPER
# =========================================================

def current_time():

    return datetime.now().isoformat()


# =========================================================
# HOME / HEALTH CHECK
# =========================================================

@app.route(
    "/",
    methods=["GET"]
)
def home():

    return jsonify({

        "status": "success",

        "message":
            "EduBuddy backend is running.",

        "ai_available":
            AI_AVAILABLE

    })


# =========================================================
# NOTES
# =========================================================


@app.route(
    "/api/notes",
    methods=["GET"]
)
def get_notes():

    connection = get_db()

    rows = connection.execute(
        """
        SELECT
            id,
            note,
            created_at
        FROM notes
        ORDER BY id DESC
        """
    ).fetchall()

    connection.close()


    return jsonify([
        dict(row)
        for row in rows
    ])


@app.route(
    "/api/notes",
    methods=["POST"]
)
def create_note():

    data = request.get_json(
        silent=True
    ) or {}


    note = str(
        data.get("note", "")
    ).strip()


    if not note:

        return jsonify({

            "error":
                "Note cannot be empty."

        }), 400


    created_at =
        current_time()


    connection = get_db()

    cursor = connection.cursor()


    cursor.execute(
        """
        INSERT INTO notes (
            note,
            created_at
        )

        VALUES (?, ?)
        """,

        (
            note,
            created_at
        )
    )


    note_id = cursor.lastrowid

    connection.commit()

    connection.close()


    return jsonify({

        "id":
            note_id,

        "note":
            note,

        "created_at":
            created_at

    }), 201


@app.route(
    "/api/notes/<int:note_id>",
    methods=["DELETE"]
)
def delete_note(note_id):

    connection = get_db()

    cursor = connection.cursor()


    cursor.execute(
        """
        DELETE FROM notes
        WHERE id = ?
        """,

        (note_id,)
    )


    deleted =
        cursor.rowcount


    connection.commit()

    connection.close()


    if deleted == 0:

        return jsonify({

            "error":
                "Note not found."

        }), 404


    return jsonify({

        "success": True

    })


# =========================================================
# TASKS
# =========================================================


@app.route(
    "/api/tasks",
    methods=["GET"]
)
def get_tasks():

    connection = get_db()

    rows = connection.execute(
        """
        SELECT
            id,
            task,
            time,
            created_at
        FROM tasks
        ORDER BY id DESC
        """
    ).fetchall()

    connection.close()


    return jsonify([
        dict(row)
        for row in rows
    ])


@app.route(
    "/api/tasks",
    methods=["POST"]
)
def create_task():

    data = request.get_json(
        silent=True
    ) or {}


    task = str(
        data.get("task", "")
    ).strip()


    time = str(
        data.get("time", "")
    ).strip()


    if not task:

        return jsonify({

            "error":
                "Task cannot be empty."

        }), 400


    created_at =
        current_time()


    connection = get_db()

    cursor = connection.cursor()


    cursor.execute(
        """
        INSERT INTO tasks (
            task,
            time,
            created_at
        )

        VALUES (?, ?, ?)
        """,

        (
            task,
            time,
            created_at
        )
    )


    task_id = cursor.lastrowid

    connection.commit()

    connection.close()


    return jsonify({

        "id":
            task_id,

        "task":
            task,

        "time":
            time,

        "created_at":
            created_at

    }), 201


@app.route(
    "/api/tasks/<int:task_id>",
    methods=["DELETE"]
)
def delete_task(task_id):

    connection = get_db()

    cursor = connection.cursor()


    cursor.execute(
        """
        DELETE FROM tasks
        WHERE id = ?
        """,

        (task_id,)
    )


    deleted =
        cursor.rowcount


    connection.commit()

    connection.close()


    if deleted == 0:

        return jsonify({

            "error":
                "Task not found."

        }), 404


    return jsonify({

        "success": True

    })


# =========================================================
# CHAT
# =========================================================


@app.route(
    "/api/chat",
    methods=["GET"]
)
def get_chat():

    connection = get_db()

    rows = connection.execute(
        """
        SELECT
            id,
            username,
            message,
            created_at
        FROM chat
        ORDER BY id ASC
        """
    ).fetchall()

    connection.close()


    return jsonify([
        dict(row)
        for row in rows
    ])


@app.route(
    "/api/chat",
    methods=["POST"]
)
def create_chat():

    data = request.get_json(
        silent=True
    ) or {}


    username = str(
        data.get(
            "username",
            "Student"
        )
    ).strip()


    message = str(
        data.get(
            "message",
            ""
        )
    ).strip()


    if not message:

        return jsonify({

            "error":
                "Message cannot be empty."

        }), 400


    if not username:

        username = "Student"


    created_at =
        current_time()


    connection = get_db()

    cursor = connection.cursor()


    cursor.execute(
        """
        INSERT INTO chat (
            username,
            message,
            created_at
        )

        VALUES (?, ?, ?)
        """,

        (
            username,
            message,
            created_at
        )
    )


    connection.commit()


    /*
       Basic backend reply.

       Frontend also has its own fallback.
    */

    lower_message =
        message.lower()


    if "python" in lower_message:

        reply = (
            "For Python, start with variables, "
            "data types, conditions, loops, "
            "functions and lists."
        )

    elif (
        "machine learning" in lower_message
        or "ml" in lower_message
    ):

        reply = (
            "For Machine Learning, focus on "
            "preprocessing, regression, "
            "classification, clustering and "
            "model evaluation."
        )

    elif "exam" in lower_message:

        reply = (
            "For exams, focus on definitions, "
            "important theory, diagrams, "
            "formulas and practice questions."
        )

    else:

        reply = (
            "Break the topic into smaller parts, "
            "understand the basics first and "
            "revise regularly."
        )


    connection.close()


    return jsonify({

        "success":
            True,

        "username":
            username,

        "message":
            message,

        "reply":
            reply,

        "created_at":
            created_at

    }), 201


# =========================================================
# AI PREDICTION
# =========================================================


@app.route(
    "/api/ai/predict",
    methods=["POST"]
)
def ai_predict():

    data = request.get_json(
        silent=True
    ) or {}


    try:

        difficulty =
            int(
                data.get(
                    "difficulty"
                )
            )


        previous_score =
            float(
                data.get(
                    "previous_score"
                )
            )


        available_hours =
            float(
                data.get(
                    "available_hours"
                )
            )

    except (
        TypeError,
        ValueError
    ):

        return jsonify({

            "error":
                "difficulty, previous_score and available_hours must be numbers."

        }), 400


    # -----------------------------
    # Validation
    # -----------------------------

    if not 1 <= difficulty <= 5:

        return jsonify({

            "error":
                "Difficulty must be between 1 and 5."

        }), 400


    if not 0 <= previous_score <= 100:

        return jsonify({

            "error":
                "Previous score must be between 0 and 100."

        }), 400


    if available_hours <= 0:

        return jsonify({

            "error":
                "Available hours must be greater than 0."

        }), 400


    # -----------------------------
    # AI availability
    # -----------------------------

    if not AI_AVAILABLE:

        return jsonify({

            "error":
                "AI model is not available. "
                "Run train_model.py first."

        }), 503


    try:

        priority =
            predict_priority(
                difficulty,
                previous_score,
                available_hours
            )


        hours =
            recommended_hours(
                priority,
                available_hours
            )


        return jsonify({

            "priority":
                priority,

            "recommended_hours":
                hours

        })


    except Exception as error:

        print(
            "AI prediction error:",
            error
        )


        return jsonify({

            "error":
                "AI prediction failed."

        }), 500


# =========================================================
# AI HISTORY
# =========================================================


@app.route(
    "/api/ai/history",
    methods=["GET"]
)
def get_ai_history():

    connection = get_db()


    rows = connection.execute(
        """
        SELECT
            id,
            subject,
            difficulty,
            score,
            available_hours,
            priority,
            recommended_hours,
            created_at

        FROM ai_history

        ORDER BY id DESC
        """
    ).fetchall()


    connection.close()


    return jsonify([
        dict(row)
        for row in rows
    ])


@app.route(
    "/api/ai/history",
    methods=["POST"]
)
def create_ai_history():

    data = request.get_json(
        silent=True
    ) or {}


    subject = str(
        data.get(
            "subject",
            ""
        )
    ).strip()


    try:

        difficulty =
            int(
                data.get(
                    "difficulty"
                )
            )


        score =
            float(
                data.get(
                    "score"
                )
            )


        available_hours =
            float(
                data.get(
                    "availableHours",
                    data.get(
                        "available_hours"
                    )
                )
            )


        priority =
            str(
                data.get(
                    "priority",
                    ""
                )
            ).upper()


        recommended =
            float(
                data.get(
                    "recommendedHours",
                    data.get(
                        "recommended_hours"
                    )
                )
            )

    except (
        TypeError,
        ValueError
    ):

        return jsonify({

            "error":
                "Invalid AI history data."

        }), 400


    if not subject:

        subject = "Unknown"


    created_at =
        current_time()


    connection = get_db()

    cursor = connection.cursor()


    cursor.execute(
        """
        INSERT INTO ai_history (

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
            subject,
            difficulty,
            score,
            available_hours,
            priority,
            recommended,
            created_at
        )
    )


    history_id =
        cursor.lastrowid


    connection.commit()

    connection.close()


    return jsonify({

        "id":
            history_id,

        "subject":
            subject,

        "difficulty":
            difficulty,

        "score":
            score,

        "available_hours":
            available_hours,

        "priority":
            priority,

        "recommended_hours":
            recommended,

        "created_at":
            created_at

    }), 201


# =========================================================
# ERROR HANDLERS
# =========================================================


@app.errorhandler(404)
def not_found(error):

    return jsonify({

        "error":
            "API endpoint not found."

    }), 404


@app.errorhandler(500)
def server_error(error):

    return jsonify({

        "error":
            "Internal server error."

    }), 500


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    print()
    print(
        "======================================"
    )
    print(
        "        EduBuddy Backend"
    )
    print(
        "======================================"
    )
    print(
        f"Database: {DATABASE}"
    )
    print(
        f"AI Available: {AI_AVAILABLE}"
    )
    print(
        "Server: http://127.0.0.1:5000"
    )
    print(
        "======================================"
    )
    print()


    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
