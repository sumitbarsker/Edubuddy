# =========================================================
# EduBuddy - AI Model Training
# =========================================================

import os
import joblib

from sklearn.tree import DecisionTreeClassifier


# =========================================================
# MODEL PATH
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "study_model.pkl"
)


# =========================================================
# TRAINING DATA
# =========================================================

# Features:
#
# 1. Difficulty       -> 1 to 5
# 2. Previous Score   -> 0 to 100
# 3. Available Hours  -> study hours
#
# Target:
#
# HIGH / MEDIUM / LOW

X = [

    # difficulty, score, hours

    [5, 30, 2],
    [5, 40, 3],
    [5, 50, 4],
    [4, 35, 3],
    [4, 45, 4],
    [4, 50, 5],

    [3, 40, 2],
    [3, 50, 3],
    [3, 60, 4],
    [3, 65, 5],

    [2, 50, 2],
    [2, 60, 3],
    [2, 70, 4],
    [2, 75, 5],

    [1, 70, 2],
    [1, 80, 3],
    [1, 85, 4],
    [1, 90, 5],

    [5, 60, 2],
    [4, 65, 2],
    [3, 70, 2],

    [5, 75, 6],
    [4, 80, 6],
    [3, 85, 6],

    [2, 85, 6],
    [1, 90, 6]
]


y = [

    "HIGH",
    "HIGH",
    "HIGH",
    "HIGH",
    "HIGH",
    "HIGH",

    "HIGH",
    "HIGH",
    "MEDIUM",
    "MEDIUM",

    "MEDIUM",
    "MEDIUM",
    "MEDIUM",
    "MEDIUM",

    "LOW",
    "LOW",
    "LOW",
    "LOW",

    "HIGH",
    "MEDIUM",
    "MEDIUM",

    "MEDIUM",
    "MEDIUM",
    "MEDIUM",

    "LOW",
    "LOW"
]


# =========================================================
# CREATE MODEL
# =========================================================

print()
print(
    "======================================"
)

print(
    "      EduBuddy AI Model Training"
)

print(
    "======================================"
)

print()


model = DecisionTreeClassifier(
    max_depth=5,
    random_state=42
)


# =========================================================
# TRAIN
# =========================================================

model.fit(
    X,
    y
)


# =========================================================
# SAVE MODEL
# =========================================================

joblib.dump(
    model,
    MODEL_PATH
)


print(
    "Model trained successfully."
)

print()

print(
    "Model saved at:"
)

print(
    MODEL_PATH
)

print()

print(
    "======================================"
)

print(
    "Training completed."
)

print(
    "======================================"
)
