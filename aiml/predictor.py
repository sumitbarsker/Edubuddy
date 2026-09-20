import os
import joblib


# ==========================================
# MODEL PATH
# ==========================================

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "study_model.pkl"
)


# ==========================================
# LOAD TRAINED MODEL
# ==========================================

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Trained model not found: {MODEL_PATH}\n"
        "Please run train_model.py first."
    )

model = joblib.load(MODEL_PATH)


# ==========================================
# PREDICT STUDY PRIORITY
# ==========================================

def predict_priority(
    difficulty,
    previous_score,
    available_hours
):

    prediction = model.predict([
        [
            difficulty,
            previous_score,
            available_hours
        ]
    ])

    return prediction[0]


# ==========================================
# RECOMMENDED STUDY HOURS
# ==========================================

def recommended_hours(
    priority,
    available_hours
):

    if priority == "HIGH":

        return max(
            2,
            round(available_hours * 0.60)
        )

    elif priority == "MEDIUM":

        return max(
            1,
            round(available_hours * 0.40)
        )

    else:

        return max(
            1,
            round(available_hours * 0.20)
        )
