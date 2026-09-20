// ================================
// EduBuddy AI Study Recommendation
// ================================

// This is a small browser-based ML model.
// It learns a simple relationship between:
// difficulty + previous score + available hours
// and recommends study priority.

// -------------------------------
// Training data
// -------------------------------

const trainingData = [
    { difficulty: 1, score: 90, hours: 1, priority: 1 },
    { difficulty: 1, score: 80, hours: 2, priority: 1 },
    { difficulty: 2, score: 80, hours: 2, priority: 2 },
    { difficulty: 2, score: 70, hours: 2, priority: 3 },
    { difficulty: 3, score: 70, hours: 3, priority: 3 },
    { difficulty: 3, score: 60, hours: 3, priority: 4 },
    { difficulty: 4, score: 60, hours: 4, priority: 4 },
    { difficulty: 4, score: 50, hours: 4, priority: 5 },
    { difficulty: 5, score: 40, hours: 5, priority: 5 },
    { difficulty: 5, score: 30, hours: 5, priority: 5 }
];


// -------------------------------
// Simple ML model
// -------------------------------

function predictStudyPriority(difficulty, score, hours) {

    // Normalize values
    const difficultyValue = difficulty / 5;
    const scoreValue = (100 - score) / 100;
    const hoursValue = hours / 6;

    // Weighted prediction
    const prediction =
        (difficultyValue * 0.45) +
        (scoreValue * 0.40) +
        (hoursValue * 0.15);

    return prediction;
}


// -------------------------------
// Generate recommendation
// -------------------------------

function generateAIRecommendation() {

    const subject =
        document.getElementById("aiSubject").value.trim();

    const difficulty =
        Number(document.getElementById("aiDifficulty").value);

    const score =
        Number(document.getElementById("aiScore").value);

    const hours =
        Number(document.getElementById("aiHours").value);

    const output =
        document.getElementById("aiRecommendation");


    // Validation
    if (!subject) {
        output.innerHTML =
            "⚠️ Please enter a subject.";
        return;
    }

    if (!difficulty || difficulty < 1 || difficulty > 5) {
        output.innerHTML =
            "⚠️ Difficulty must be between 1 and 5.";
        return;
    }

    if (score < 0 || score > 100) {
        output.innerHTML =
            "⚠️ Score must be between 0 and 100.";
        return;
    }

    if (!hours || hours <= 0) {
        output.innerHTML =
            "⚠️ Please enter available study hours.";
        return;
    }


    // Run prediction
    const prediction =
        predictStudyPriority(
            difficulty,
            score,
            hours
        );


    // Convert prediction into recommendation
    let priority;
    let recommendedHours;
    let message;


    if (prediction >= 0.75) {

        priority = "HIGH";

        recommendedHours =
            Math.max(2, Math.round(hours * 0.65));

        message =
            "This subject needs strong attention.";

    }
    else if (prediction >= 0.50) {

        priority = "MEDIUM";

        recommendedHours =
            Math.max(1, Math.round(hours * 0.40));

        message =
            "This subject needs regular practice.";

    }
    else {

        priority = "LOW";

        recommendedHours =
            Math.max(1, Math.round(hours * 0.20));

        message =
            "Basic revision should be sufficient.";

    }


    // Display result
    output.innerHTML = `
        <div class="ai-result">

            <h4>🤖 AI Study Recommendation</h4>

            <p>
                <strong>Subject:</strong>
                ${subject}
            </p>

            <p>
                <strong>Priority:</strong>
                ${priority}
            </p>

            <p>
                <strong>Recommended Study Time:</strong>
                ${recommendedHours} hour(s)
            </p>

            <p>
                ${message}
            </p>

        </div>
    `;


    // Save recommendation locally
    const recommendation = {

        subject: subject,

        difficulty: difficulty,

        score: score,

        availableHours: hours,

        priority: priority,

        recommendedHours: recommendedHours,

        date: new Date().toLocaleString()

    };


    let history =
        JSON.parse(
            localStorage.getItem("aiStudyHistory")
        ) || [];


    history.push(recommendation);


    localStorage.setItem(
        "aiStudyHistory",
        JSON.stringify(history)
    );
}


// -------------------------------
// Show AI history
// -------------------------------

function showAIHistory() {

    const history =
        JSON.parse(
            localStorage.getItem("aiStudyHistory")
        ) || [];

    const output =
        document.getElementById("aiHistory");


    if (history.length === 0) {

        output.innerHTML =
            "<p>No AI recommendations yet.</p>";

        return;
    }


    output.innerHTML = "<h4>Previous Recommendations</h4>";


    history
        .slice(-5)
        .reverse()
        .forEach(item => {

            output.innerHTML += `

                <div class="ai-history-item">

                    <strong>
                        ${item.subject}
                    </strong>

                    <br>

                    Priority:
                    ${item.priority}

                    <br>

                    Recommended:
                    ${item.recommendedHours}
                    hour(s)

                    <br>

                    <small>
                        ${item.date}
                    </small>

                </div>

            `;

        });
}
