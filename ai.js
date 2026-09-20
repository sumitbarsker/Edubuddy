// ==========================================
// EduBuddy AI Study Planner
// Python AIML Backend Integration
// ==========================================

// Backend URL
const API_BASE_URL = "http://127.0.0.1:5000";


// ==========================================
// GENERATE AI RECOMMENDATION
// ==========================================

async function generateAIRecommendation() {

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


    // ==========================================
    // VALIDATION
    // ==========================================

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
            "⚠️ Previous score must be between 0 and 100.";

        return;
    }


    if (!hours || hours <= 0) {

        output.innerHTML =
            "⚠️ Please enter available study hours.";

        return;
    }


    // ==========================================
    // LOADING MESSAGE
    // ==========================================

    output.innerHTML = `
        <div class="ai-result">
            <h4>🤖 AI is analyzing...</h4>
            <p>Please wait...</p>
        </div>
    `;


    // ==========================================
    // SEND DATA TO PYTHON AI BACKEND
    // ==========================================

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/ai/predict`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    difficulty: difficulty,

                    previous_score: score,

                    available_hours: hours

                })
            }
        );


        const result = await response.json();


        // ==========================================
        // BACKEND ERROR
        // ==========================================

        if (!response.ok || !result.success) {

            output.innerHTML = `
                <div class="ai-result">
                    <h4>⚠️ AI Error</h4>
                    <p>${result.message || "AI prediction failed."}</p>
                </div>
            `;

            return;
        }


        // ==========================================
        // AI RESULT
        // ==========================================

        const priority =
            result.priority;

        const recommendedHours =
            result.recommended_hours;


        let message = "";


        if (priority === "HIGH") {

            message =
                "This subject needs strong attention and regular practice.";

        }

        else if (priority === "MEDIUM") {

            message =
                "This subject needs regular study and practice.";

        }

        else {

            message =
                "Basic revision and practice should be sufficient.";

        }


        // ==========================================
        // DISPLAY RESULT
        // ==========================================

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


        // ==========================================
        // SAVE AI HISTORY
        // ==========================================

        await saveAIHistory({

            subject: subject,

            difficulty: difficulty,

            score: score,

            availableHours: hours,

            priority: priority,

            recommendedHours: recommendedHours

        });


    }

    catch (error) {

        console.error(
            "AI Backend Error:",
            error
        );


        output.innerHTML = `

            <div class="ai-result">

                <h4>⚠️ Backend Connection Error</h4>

                <p>
                    Unable to connect to EduBuddy AI server.
                </p>

                <p>
                    Please make sure Flask backend is running.
                </p>

            </div>

        `;
    }
}



// ==========================================
// SAVE AI HISTORY
// ==========================================

async function saveAIHistory(data) {

    try {

        await fetch(
            `${API_BASE_URL}/api/ai/history`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );

    }

    catch (error) {

        console.error(
            "AI history save error:",
            error
        );
    }
}



// ==========================================
// SHOW AI HISTORY
// ==========================================

async function showAIHistory() {

    const output =
        document.getElementById("aiHistory");


    output.innerHTML = `
        <p>Loading AI history...</p>
    `;


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/ai/history`
        );


        const history =
            await response.json();


        if (!history || history.length === 0) {

            output.innerHTML =
                "<p>No AI recommendations yet.</p>";

            return;
        }


        output.innerHTML =
            "<h4>Previous AI Recommendations</h4>";


        history.forEach(item => {

            const div =
                document.createElement("div");


            div.className =
                "ai-history-item";


            div.innerHTML = `

                <strong>
                    ${item.subject}
                </strong>

                <br>

                Priority:
                ${item.priority}

                <br>

                Recommended:
                ${item.recommended_hours}
                hour(s)

                <br>

                <small>
                    ${item.created_at}
                </small>

            `;


            output.appendChild(div);

        });

    }

    catch (error) {

        console.error(
            "AI history error:",
            error
        );


        output.innerHTML =
            "<p>⚠️ Unable to load AI history.</p>";
    }
}
