// =====================================================
// EDUBUDDY - MAIN SCRIPT
// =====================================================

const API_BASE_URL = "http://127.0.0.1:5000";

function el(id){ return document.getElementById(id); }

function escapeHTML(value){
    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}


// ================= HOME =================

function startDashboard(){
    const home = el("homeScreen");
    const app = el("app");

    if(home) home.style.display = "none";
    if(app) app.style.display = "flex";

    showPage("dashboardPage");
    window.scrollTo({top:0,behavior:"smooth"});
}

function goToWelcome(){
    const home = el("homeScreen");
    const app = el("app");

    if(app) app.style.display = "none";
    if(home) home.style.display = "flex";

    window.scrollTo({top:0,behavior:"smooth"});
}

function showHomeFeatures(){
    const target = el("about");
    if(target) target.scrollIntoView({behavior:"smooth",block:"center"});
}


// ================= NAVIGATION =================

const pageTitles = {
    dashboardPage:"Dashboard",
    notesPage:"Smart Notes",
    routinePage:"Study Routine",
    chatPage:"Study Chat",
    aiPage:"AI Study Planner",
    resumePage:"Resume Maker",
    summaryPage:"Summary Maker"
};

function showPage(pageId, clickedButton=null){
    document.querySelectorAll(".page").forEach(page=>{
        page.classList.remove("active-page");
        page.style.display = "none";
    });

    const page = el(pageId);
    if(!page) return;

    page.classList.add("active-page");
    page.style.display = "block";

    document.querySelectorAll(".nav-item").forEach(item=>{
        item.classList.remove("active");
    });

    if(clickedButton){
        clickedButton.classList.add("active");
    }else{
        const button = document.querySelector(`.nav-item[onclick*="'${pageId}'"]`);
        if(button) button.classList.add("active");
    }

    const title = el("pageTitle");
    if(title) title.textContent = pageTitles[pageId] || "EduBuddy";

    if(pageId === "notesPage") displayNotes();
    if(pageId === "routinePage") displayTasks();
    if(pageId === "chatPage") displayChat();
    if(pageId === "dashboardPage") updateDashboardStats();
    if(pageId === "aiPage" && typeof loadAIHistory === "function") loadAIHistory();

    window.scrollTo({top:0,behavior:"smooth"});
}


// ================= DATE =================

function setCurrentDate(){
    const box = el("currentDate");
    if(!box) return;

    box.textContent = new Date().toLocaleDateString("en-IN",{
        weekday:"long",
        day:"numeric",
        month:"long",
        year:"numeric"
    });
}


// ================= REMINDER =================

function setReminder(){
    const subject = el("subject")?.value.trim();
    const time = el("time")?.value;

    if(!subject || !time){
        alert("Please enter subject and time.");
        return;
    }

    const now = new Date();
    const target = new Date();
    const [h,m] = time.split(":").map(Number);

    target.setHours(h,m,0,0);

    const delay = target - now;

    if(delay <= 0){
        alert("Please select a future time.");
        return;
    }

    alert(`Reminder set for ${subject} at ${time}.`);

    setTimeout(()=>{
        alert(`⏰ Time to study: ${subject}`);
    },delay);
}


// ================= NOTES =================

async function saveNote(){
    const input = el("noteInput");
    if(!input) return;

    const note = input.value.trim();

    if(!note){
        alert("Please type a note.");
        return;
    }

    try{
        const response = await fetch(`${API_BASE_URL}/api/notes`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({note})
        });

        const result = await response.json();

        if(!response.ok || !result.success){
            throw new Error(result.message || "Unable to save note.");
        }

        input.value = "";
        await displayNotes();
        updateDashboardStats();

    }catch(error){
        console.error(error);
        alert("Backend connection failed. Start your Flask server first.");
    }
}

async function displayNotes(){
    const list = el("notesList");
    if(!list) return;

    try{
        const response = await fetch(`${API_BASE_URL}/api/notes`);
        if(!response.ok) throw new Error();

        const notes = await response.json();
        list.innerHTML = "";

        if(!Array.isArray(notes) || notes.length === 0){
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <h3>No notes yet</h3>
                    <p>Add your first study note.</p>
                </div>`;
            return;
        }

        notes.forEach(note=>{
            const item = document.createElement("div");
            item.className = "note-item";

            item.innerHTML = `
                <div class="note-content">${escapeHTML(note.note)}</div>
                <button class="delete-btn">Delete</button>
            `;

            item.querySelector("button").onclick = ()=>deleteNote(note.id);
            list.appendChild(item);
        });

    }catch(error){
        console.error("Notes:",error);
        list.innerHTML = `<div class="empty-state"><p>⚠️ Unable to load notes.</p></div>`;
    }
}

async function deleteNote(id){
    if(!confirm("Delete this note?")) return;

    try{
        const response = await fetch(`${API_BASE_URL}/api/notes/${id}`,{
            method:"DELETE"
        });

        const result = await response.json();

        if(!response.ok || !result.success) throw new Error();

        await displayNotes();
        updateDashboardStats();

    }catch(error){
        alert("Unable to delete note.");
    }
}


// ================= ROUTINE =================

async function addTask(){
    const task = el("taskInput")?.value.trim();
    const time = el("taskTime")?.value;

    if(!task || !time){
        alert("Please enter both task and time.");
        return;
    }

    try{
        const response = await fetch(`${API_BASE_URL}/api/tasks`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({task,time})
        });

        const result = await response.json();

        if(!response.ok || !result.success){
            throw new Error(result.message || "Unable to add task.");
        }

        el("taskInput").value = "";
        el("taskTime").value = "";

        await displayTasks();
        updateDashboardStats();

    }catch(error){
        console.error(error);
        alert("Backend connection failed. Start your Flask server first.");
    }
}

async function displayTasks(){
    const list = el("taskList");
    if(!list) return;

    try{
        const response = await fetch(`${API_BASE_URL}/api/tasks`);
        if(!response.ok) throw new Error();

        const tasks = await response.json();
        list.innerHTML = "";

        if(!Array.isArray(tasks) || tasks.length === 0){
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <h3>No tasks yet</h3>
                    <p>Create your study routine.</p>
                </div>`;
            return;
        }

        tasks.forEach(task=>{
            const item = document.createElement("div");
            item.className = "task-item";

            item.innerHTML = `
                <div class="task-info">
                    <strong>${escapeHTML(task.task)}</strong>
                    <span>${escapeHTML(task.time)}</span>
                </div>
                <button class="delete-btn">Delete</button>
            `;

            item.querySelector("button").onclick = ()=>deleteTask(task.id);
            list.appendChild(item);
        });

    }catch(error){
        console.error("Tasks:",error);
        list.innerHTML = `<div class="empty-state"><p>⚠️ Unable to load routine.</p></div>`;
    }
}

async function deleteTask(id){
    if(!confirm("Delete this task?")) return;

    try{
        const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`,{
            method:"DELETE"
        });

        const result = await response.json();

        if(!response.ok || !result.success) throw new Error();

        await displayTasks();
        updateDashboardStats();

    }catch(error){
        alert("Unable to delete task.");
    }
}


// ================= SUMMARY =================

function generateSummary(){
    const input = el("summaryInput")?.value.trim();
    const output = el("summaryOutput");

    if(!input || !output){
        alert("Please enter some notes to summarize.");
        return;
    }

    const sentences = input
        .split(/(?<=[.!?])\s+/)
        .filter(Boolean);

    const summary = sentences.length <= 3
        ? sentences.join(" ")
        : sentences.slice(0,3).join(" ") + "...";

    output.innerHTML = `
        <div class="summary-result-title">✦ Summary</div>
        <p>${escapeHTML(summary)}</p>
    `;
}


// ================= RESUME =================

function generateResume(){
    const name = el("name")?.value.trim();
    const email = el("email")?.value.trim();
    const phone = el("phone")?.value.trim();
    const education = el("education")?.value.trim();
    const skills = el("skills")?.value.trim();
    const experience = el("experience")?.value.trim();
    const output = el("resumeOutput");

    if(!name || !email){
        alert("Please enter at least your name and email.");
        return;
    }

    const skillArray = skills
        ? skills.split(",").map(x=>x.trim()).filter(Boolean)
        : [];

    output.innerHTML = `
        <div class="resume-preview">
            <div class="resume-header">
                <h1>${escapeHTML(name)}</h1>
                <p>${escapeHTML(email)}${phone ? " • " + escapeHTML(phone) : ""}</p>
            </div>

            ${education ? `
                <div class="resume-section">
                    <h3>Education</h3>
                    <p>${escapeHTML(education)}</p>
                </div>` : ""}

            ${skillArray.length ? `
                <div class="resume-section">
                    <h3>Skills</h3>
                    <div class="resume-skills">
                        ${skillArray.map(s=>`<span>${escapeHTML(s)}</span>`).join("")}
                    </div>
                </div>` : ""}

            ${experience ? `
                <div class="resume-section">
                    <h3>Experience / Projects</h3>
                    <p>${escapeHTML(experience)}</p>
                </div>` : ""}
        </div>
    `;
}


// ================= CHAT =================

async function sendMessage(){
    const username = el("chatUser")?.value.trim();
    const message = el("chatMessage")?.value.trim();

    if(!username || !message){
        alert("Please enter your name and message.");
        return;
    }

    try{
        const response = await fetch(`${API_BASE_URL}/api/chat`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({username,message})
        });

        const result = await response.json();

        if(!response.ok || !result.success){
            throw new Error(result.message || "Unable to send message.");
        }

        el("chatMessage").value = "";
        await displayChat();

    }catch(error){
        console.error(error);
        alert("Backend connection failed. Start your Flask server first.");
    }
}

async function displayChat(){
    const list = el("chatList");
    if(!list) return;

    try{
        const response = await fetch(`${API_BASE_URL}/api/chat`);
        if(!response.ok) throw new Error();

        const chat = await response.json();
        list.innerHTML = "";

        if(!Array.isArray(chat) || chat.length === 0){
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💬</div>
                    <h3>No messages yet</h3>
                    <p>Start the study conversation.</p>
                </div>`;
            return;
        }

        chat.forEach(item=>{
            const row = document.createElement("div");
            row.className = "chat-message";

            const first = String(item.username || "S").charAt(0).toUpperCase();

            row.innerHTML = `
                <div class="chat-avatar">${escapeHTML(first)}</div>
                <div class="chat-message-content">
                    <strong>${escapeHTML(item.username || "Student")}</strong>
                    <p>${escapeHTML(item.message || "")}</p>
                </div>
            `;

            list.appendChild(row);
        });

    }catch(error){
        console.error("Chat:",error);
        list.innerHTML = `<div class="empty-state"><p>⚠️ Unable to load chat.</p></div>`;
    }
}


// ================= DASHBOARD =================

async function updateDashboardStats(){
    try{
        const [notesRes,tasksRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/notes`),
            fetch(`${API_BASE_URL}/api/tasks`)
        ]);

        if(!notesRes.ok || !tasksRes.ok) return;

        const notes = await notesRes.json();
        const tasks = await tasksRes.json();

        const n = Array.isArray(notes) ? notes.length : 0;
        const t = Array.isArray(tasks) ? tasks.length : 0;

        if(el("notesCount")) el("notesCount").textContent = n;
        if(el("tasksCount")) el("tasksCount").textContent = t;
    }catch(error){
        console.warn("Dashboard stats unavailable.");
    }
}


// ================= QUOTE =================

const quotes = [
    "Small progress every day leads to big results.",
    "Study hard, dream big.",
    "Focus on progress, not perfection.",
    "Your future is created by what you do today.",
    "Consistency beats last-minute pressure."
];

function loadQuote(){
    const box = el("quoteBox");
    if(box){
        box.textContent = quotes[Math.floor(Math.random()*quotes.length)];
    }
}


// ================= INIT =================

document.addEventListener("DOMContentLoaded",()=>{
    // Home first
    const home = el("homeScreen");
    const app = el("app");

    if(home) home.style.display = "flex";
    if(app) app.style.display = "none";

    document.querySelectorAll(".page").forEach((page,i)=>{
        page.style.display = i === 0 ? "block" : "none";
    });

    setCurrentDate();
    loadQuote();

    // Do not block the Home page if backend is offline.
    displayNotes();
    displayTasks();
    displayChat();
    updateDashboardStats();

    // Enter to save note
    el("noteInput")?.addEventListener("keydown",e=>{
        if(e.key === "Enter" && !e.shiftKey){
            e.preventDefault();
            saveNote();
        }
    });

    // Enter to send chat
    el("chatMessage")?.addEventListener("keydown",e=>{
        if(e.key === "Enter"){
            e.preventDefault();
            sendMessage();
        }
    });

    console.log("EduBuddy loaded successfully.");
});

