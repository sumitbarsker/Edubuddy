import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier


# ==========================================
# TRAINING DATA
# ==========================================

data = {
    "difficulty": [
        1, 1, 2, 2, 3,
        3, 4, 4, 5, 5,
        2, 3, 4, 5, 1
    ],

    "previous_score": [
        90, 80, 80, 70, 70,
        60, 60, 50, 40, 30,
        65, 55, 45, 35, 95
    ],

    "available_hours": [
        1, 2, 2, 2, 3,
        3, 4, 4, 5, 5,
        3, 4, 5, 6, 2
    ],

    "priority": [
        "LOW",
        "LOW",
        "LOW",
        "MEDIUM",
        "MEDIUM",
        "MEDIUM",
        "HIGH",
        "HIGH",
        "HIGH",
        "HIGH",
        "MEDIUM",
        "HIGH",
        "HIGH",
        "HIGH",
        "LOW"
    ]
}


# ==========================================
# CREATE DATASET
# ==========================================

df = pd.DataFrame(data)


# Input features
X = df[
    [
        "difficulty",
        "previous_score",
        "available_hours"
    ]
]


# Target
y = df["priority"]


# ==========================================
# TRAIN MODEL
# ==========================================

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X, y)


# ==========================================
# SAVE MODEL
# ==========================================

joblib.dump(
    model,
    "study_model.pkl"
)

print("✅ EduBuddy AI model trained successfully!")
print("✅ Model saved as study_model.pkl")
