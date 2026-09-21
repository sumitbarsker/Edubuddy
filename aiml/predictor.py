# =========================================================
# EduBuddy - AI Study Predictor
# =========================================================

import os
import joblib


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
# LOAD MODEL
# =========================================================

model = None

try:

    if os.path.exists(MODEL_PATH):

        model = joblib.load(
            MODEL_PATH
        )

        print(
            "EduBuddy AI model loaded."
        )

    else:

        print(
            "study_model.pkl not found."
        )

except Exception as error:

    print(
        "Error loading AI model:"
    )

    print(error)

    model = None


# =========================================================
# PREDICT PRIORITY
# =========================================================

def predict_priority(
    difficulty,
    previous_score,
    available_hours
):

    """
    Predict study priority.

    difficulty:
        1 = Easy
        5 = Hard

    previous_score:
        0 to 100

    available_hours:
        Available study time
    """


    difficulty = float(
        difficulty
    )

    previous_score = float(
        previous_score
    )

    available_hours = float(
        available_hours
    )


    # -----------------------------------------
    # Try trained ML model first
    # -----------------------------------------

    if model is not None:

        try:

            prediction = model.predict(
                [[
                    difficulty,
                    previous_score,
                    available_hours
                ]]
            )[0]


            priority = str(
                prediction
            ).upper()


            if priority in [
                "HIGH",
                "MEDIUM",
                "LOW"
            ]:

                return priority

        except Exception as error:

            print(
                "Model prediction failed:"
            )

            print(error)


    # -----------------------------------------
    # Fallback calculation
    # -----------------------------------------

    difficulty_score = (
        difficulty / 5
    )


    score_risk = (
        (100 - previous_score) / 100
    )


    # More available hours means
    # slightly more study capacity,
    # but it should not dominate priority.

    hours_factor = min(
        available_hours / 12,
        1
    )


    priority_score = (

        difficulty_score * 0.45

        +

        score_risk * 0.40

        +

        hours_factor * 0.15

    )


    if priority_score >= 0.70:

        return "HIGH"


    elif priority_score >= 0.45:

        return "MEDIUM"


    return "LOW"


# =========================================================
# RECOMMENDED STUDY HOURS
# =========================================================

def recommended_hours(
    priority,
    available_hours
):

    """
    Calculate recommended study hours
    according to predicted priority.
    """


    priority = str(
        priority
    ).upper()


    available_hours = float(
        available_hours
    )


    if available_hours <= 0:

        return 0


    if priority == "HIGH":

        hours = max(
            available_hours * 0.60,
            2
        )


    elif priority == "MEDIUM":

        hours = max(
            available_hours * 0.40,
            1
        )


    else:

        hours = max(
            available_hours * 0.20,
            1
        )


    # Never recommend more than
    # the student's available time.

    hours = min(
        hours,
        available_hours
    )


    return round(
        hours,
        1
    )


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    difficulty = 4

    previous_score = 55

    available_hours = 5


    priority = predict_priority(
        difficulty,
        previous_score,
        available_hours
    )


    hours = recommended_hours(
        priority,
        available_hours
    )


    print()
    print(
        "EduBuddy AI Test"
    )
    print(
        "----------------"
    )
    print(
        "Difficulty:",
        difficulty
    )
    print(
        "Previous Score:",
        previous_score
    )
    print(
        "Available Hours:",
        available_hours
    )
    print(
        "Priority:",
        priority
    )
    print(
        "Recommended Hours:",
        hours
    )
