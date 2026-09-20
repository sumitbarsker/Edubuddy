import joblib


# ==========================================
# LOAD TRAINED MODEL
# ==========================================

model = joblib.load("study_model.pkl")


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
