/* =========================================================
   EduBuddy - AI Study Planner
   ========================================================= */


/* =========================================================
   AI DIFFICULTY CONVERTER
   ========================================================= */

function convertDifficulty(value) {

    const difficultyMap = {
        easy: 1,
        medium: 3,
        hard: 5
    };

    if (
        Object.prototype.hasOwnProperty.call(
            difficultyMap,
            value
        )
    ) {
        return difficultyMap[value];
    }


    const number =
        Number(value);


    if (
        Number.isFinite(number) &&
        number >= 1 &&
        number <= 5
    ) {
        return number;
    }


    return 3;

}


/* =========================================================
   GENERATE AI PLAN
   ========================================================= */

async function generateAIPlan() {

    const subjectInput =
        document.getElementById(
            "aiSubject"
        );

    const difficultyInput =
        document.getElementById(
            "aiDifficulty"
        );

    const scoreInput =
        document.getElementById(
            "aiScore"
        );

    const hoursInput =
        document.getElementById(
            "aiHours"
        );

    const resultBox =
        document.getElementById(
            "aiResult"
        );


    if (
        !subjectInput ||
        !difficultyInput ||
        !scoreInput ||
        !hoursInput
    ) {

        console.error(
            "AI Planner inputs not found."
        );

        return;

    }


    const subject =
        subjectInput.value.trim();


    const difficulty =
        convertDifficulty(
            difficultyInput.value
        );


    const score =
        Number(
            scoreInput.value
        );


    const hours =
        Number(
            hoursInput.value
        );


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!subject) {

        alert(
            "Please enter a subject."
        );

        subjectInput.focus();

        return;

    }


    if (
        !Number.isFinite(score) ||
        score < 0 ||
        score > 100
    ) {

        alert(
            "Please enter a valid previous score between 0 and 100."
        );

        scoreInput.focus();

        return;

    }


    if (
        !Number.isFinite(hours) ||
        hours <= 0
    ) {

        alert(
            "Please enter your available study hours."
        );

        hoursInput.focus();

        return;

    }


    /* =====================================================
       LOADING
    ===================================================== */

    if (resultBox) {

        resultBox.innerHTML = `

            <div class="ai-result-card">

                <h3>
                    Generating Study Plan...
                </h3>

                <p>
                    EduBuddy AI is calculating your
                    study priority.
                </p>

            </div>

        `;

    }


    /* =====================================================
       BACKEND AI
    ===================================================== */

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/ai/predict`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        difficulty:
                            difficulty,

                        previous_score:
                            score,

                        available_hours:
                            hours

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                `AI API returned ${response.status}`
            );

        }


        const data =
            await response.json();


        if (
            !data.priority ||
            data.recommended_hours === undefined
        ) {

            throw new Error(
                "Invalid AI response."
            );

        }


        const priority =
            String(
                data.priority
            ).toUpperCase();


        const recommendedHours =
            Number(
                data.recommended_hours
            );


        showAIResult(
            subject,
            priority,
            recommendedHours,
            false
        );


        saveAIHistory({

            subject:
                subject,

            difficulty:
                difficulty,

            score:
                score,

            available_hours:
                hours,

            priority:
                priority,

            recommended_hours:
                recommendedHours,

            created_at:
                new Date().toISOString()

        });


    } catch (error) {

        console.log(
            "Backend AI unavailable:",
            error
        );


        /*
           Backend unavailable:
           use the same calculation locally.
        */

        const result =
            calculateLocalAI(
                difficulty,
                score,
                hours
            );


        showAIResult(
            subject,
            result.priority,
            result.recommendedHours,
            true
        );


        saveAIHistory({

            subject:
                subject,

            difficulty:
                difficulty,

            score:
                score,

            available_hours:
                hours,

            priority:
                result.priority,

            recommended_hours:
                result.recommendedHours,

            created_at:
                new Date().toISOString()

        });

    }

}


/* =========================================================
   LOCAL AI FALLBACK
   ========================================================= */

function calculateLocalAI(
    difficulty,
    score,
    hours
) {

    /*
       Difficulty contribution:
       45%

       Previous score contribution:
       40%

       Available hours contribution:
       15%
    */

    const difficultyScore =
        difficulty / 5;


    const scoreScore =
        (100 - score) / 100;


    const hoursScore =
        Math.min(
            hours / 12,
            1
        );


    const finalScore =
        (
            difficultyScore * 0.45
        ) +
        (
            scoreScore * 0.40
        ) +
        (
            hoursScore * 0.15
        );


    let priority;


    if (
        finalScore >= 0.70
    ) {

        priority = "HIGH";

    } else if (
        finalScore >= 0.45
    ) {

        priority = "MEDIUM";

    } else {

        priority = "LOW";

    }


    let recommendedHours;


    if (
        priority === "HIGH"
    ) {

        recommendedHours =
            Math.max(
                2,
                hours * 0.60
            );

    } else if (
        priority === "MEDIUM"
    ) {

        recommendedHours =
            Math.max(
                1,
                hours * 0.40
            );

    } else {

        recommendedHours =
            Math.max(
                1,
                hours * 0.20
            );

    }


    recommendedHours =
        Math.round(
            recommendedHours * 10
        ) / 10;


    return {

        priority:
            priority,

        recommendedHours:
            recommendedHours

    };

}


/* =========================================================
   SHOW AI RESULT
   ========================================================= */

function showAIResult(
    subject,
    priority,
    recommendedHours,
    localMode = false
) {

    const resultBox =
        document.getElementById(
            "aiResult"
        );


    if (!resultBox) {
        return;
    }


    let priorityText;


    if (
        priority === "HIGH"
    ) {

        priorityText =
            "This subject needs more study attention.";

    } else if (
        priority === "MEDIUM"
    ) {

        priorityText =
            "This subject needs regular study and revision.";

    } else {

        priorityText =
            "This subject currently needs comparatively less study time.";

    }


    const modeText =
        localMode
            ? `
                <small>
                    Backend is not running, so EduBuddy
                    is using its local AI calculation.
                </small>
              `
            : `
                <small>
                    Recommendation generated using the
                    EduBuddy AI backend.
                </small>
              `;


    resultBox.innerHTML = `

        <div class="ai-result-card">

            <h3>
                🤖 AI Study Recommendation
            </h3>


            <p>
                <strong>
                    Subject:
                </strong>

                ${escapeHTML(subject)}
            </p>


            <p>
                <strong>
                    Priority:
                </strong>

                ${escapeHTML(priority)}
            </p>


            <p>
                <strong>
                    Recommended Study Time:
                </strong>

                ${recommendedHours} hours
            </p>


            <p>
                ${priorityText}
            </p>


            ${modeText}

        </div>

    `;


    /*
       Update dashboard count
    */

    if (
        typeof updateDashboardStats ===
        "function"
    ) {

        updateDashboardStats();

    }

}


/* =========================================================
   AI HISTORY - LOCAL STORAGE
   ========================================================= */

function getAIHistory() {

    try {

        const saved =
            localStorage.getItem(
                "edubuddy_ai_history"
            );


        if (!saved) {
            return [];
        }


        const parsed =
            JSON.parse(saved);


        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.log(
            "Could not read AI history."
        );

        return [];

    }

}


function saveAIHistory(item) {

    const history =
        getAIHistory();


    history.unshift(item);


    /*
       Keep the latest 30 records.
    */

    const limitedHistory =
        history.slice(
            0,
            30
        );


    localStorage.setItem(
        "edubuddy_ai_history",
        JSON.stringify(
            limitedHistory
        )
    );


    displayAIHistory(
        limitedHistory
    );


    if (
        typeof updateDashboardStats ===
        "function"
    ) {

        updateDashboardStats();

    }

}


/* =========================================================
   LOAD AI HISTORY
   ========================================================= */

async function loadAIHistory() {

    /*
       First show local history immediately.
    */

    let history =
        getAIHistory();


    displayAIHistory(
        history
    );


    /*
       Then try backend.
    */

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/ai/history`
            );


        if (!response.ok) {

            throw new Error(
                "AI history API error"
            );

        }


        const data =
            await response.json();


        if (
            Array.isArray(data) &&
            data.length > 0
        ) {

            history =
                data;


            localStorage.setItem(
                "edubuddy_ai_history",
                JSON.stringify(
                    history
                )
            );


            displayAIHistory(
                history
            );

        }

    } catch (error) {

        console.log(
            "Using local AI history."
        );

    }


    if (
        typeof updateDashboardStats ===
        "function"
    ) {

        updateDashboardStats();

    }

}


/* =========================================================
   DISPLAY AI HISTORY
   ========================================================= */

function displayAIHistory(
    history = getAIHistory()
) {

    const container =
        document.getElementById(
            "aiHistory"
        );


    if (!container) {
        return;
    }


    if (
        !Array.isArray(history) ||
        history.length === 0
    ) {

        container.innerHTML = `

            <p class="empty-state">
                No AI plans generated yet.
            </p>

        `;

        return;

    }


    container.innerHTML =
        history.map(item => {

            const subject =
                escapeHTML(
                    item.subject || "Unknown"
                );


            const priority =
                escapeHTML(
                    String(
                        item.priority ||
                        "MEDIUM"
                    )
                );


            const recommendedHours =
                Number(
                    item.recommended_hours ??
                    item.recommendedHours ??
                    0
                );


            const score =
                item.score ??
                item.previous_score ??
                "-";


            const date =
                item.created_at
                    ? formatDate(
                        item.created_at
                    )
                    : "Recently";


            return `

                <div class="ai-history-item">

                    <strong>
                        ${subject}
                    </strong>

                    <span>
                        Priority:
                        ${priority}
                    </span>

                    <span>
                        Score:
                        ${escapeHTML(
                            String(score)
                        )}
                    </span>

                    <span>
                        ${recommendedHours}
                        hour(s)
                    </span>

                </div>

                <small
                    style="
                        display:block;
                        margin:-5px 0 8px;
                        color:#9099aa;
                        font-size:10px;
                    "
                >
                    ${escapeHTML(date)}
                </small>

            `;

        }).join("");

}


/* =========================================================
   HTML BUTTON COMPATIBILITY
   ========================================================= */

function getAIRecommendation() {

    return generateAIPlan();

}


/* =========================================================
   INITIAL AI HISTORY LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        displayAIHistory();

    }
);
