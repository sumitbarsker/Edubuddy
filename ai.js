// =====================================================
// EDUBUDDY - AI STUDY PLANNER
// =====================================================

async function generateAIPlan(){

    const subject = document.getElementById("aiSubject")?.value.trim();
    const difficulty = document.getElementById("aiDifficulty")?.value || "Medium";
    const score = Number(document.getElementById("aiScore")?.value || 0);
    const hours = Number(document.getElementById("aiHours")?.value || 0);
    const output = document.getElementById("aiRecommendation");

    if(!subject || !hours){
        alert("Please enter subject and available study hours.");
        return;
    }

    try{
        const response = await fetch(`${API_BASE_URL}/api/ai/predict`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
                subject,
                difficulty,
                score,
                hours
            })
        });

        const result = await response.json();

        if(!response.ok){
            throw new Error(result.message || "AI request failed.");
        }

        const recommendation =
            result.recommendation ||
            result.prediction ||
            result.message ||
            "Focus on the subject and divide your available time into focused sessions.";

        output.innerHTML = `
            <div class="ai-result">
                <h3>✦ Your Study Plan</h3>
                <p>${escapeHTML(recommendation)}</p>
            </div>
        `;

        loadAIHistory();

    }catch(error){

        // Local fallback so the frontend still works if Flask is not running.
        let focus = "balanced revision";

        if(score < 50) focus = "concept building and fundamentals";
        else if(score < 70) focus = "concept revision and practice";
        else focus = "problem solving and exam revision";

        const plan = `
            For ${subject}, focus on ${focus}.
            With ${hours} hour(s) available, use short focused sessions,
            revise important concepts first, then solve questions or practice problems.
            Difficulty level: ${difficulty}.
        `;

        if(output){
            output.innerHTML = `
                <div class="ai-result">
                    <h3>✦ Recommended Plan</h3>
                    <p>${escapeHTML(plan)}</p>
                </div>
            `;
        }

        console.warn("AI backend unavailable:",error);
    }
}


async function loadAIHistory(){

    const history = document.getElementById("aiHistory");
    if(!history) return;

    try{
        const response = await fetch(`${API_BASE_URL}/api/ai/history`);

        if(!response.ok) throw new Error();

        const data = await response.json();

        history.innerHTML = "";

        if(!Array.isArray(data) || data.length === 0){
            history.innerHTML = `<div class="empty-state"><p>No AI history yet.</p></div>`;
            return;
        }

        data.slice().reverse().forEach(item=>{
            const row = document.createElement("div");
            row.className = "history-item";

            row.textContent =
                `${item.subject || "Study"} • ${item.difficulty || "Medium"} • ${item.hours || "-"} hour(s)`;

            history.appendChild(row);
        });

    }catch(error){
        history.innerHTML = `<div class="empty-state"><p>AI history will appear when the backend is connected.</p></div>`;
    }
}

