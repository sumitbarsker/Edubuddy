/* =========================================================
   EduBuddy - Main JavaScript
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const API_BASE_URL = "http://127.0.0.1:5000";


/* =========================================================
   GLOBAL DATA
   ========================================================= */

let notes = [];
let tasks = [];
let chatMessages = [];

let reminderTimer = null;


/* =========================================================
   PAGE INFORMATION
   ========================================================= */

const pageInfo = {

    dashboardPage: {
        title: "Dashboard",
        subtitle: "Welcome back! Let's make today productive."
    },

    notesPage: {
        title: "My Notes",
        subtitle: "Store and manage your important study notes."
    },

    routinePage: {
        title: "Study Routine",
        subtitle: "Plan your daily study tasks."
    },

    chatPage: {
        title: "Study Chat",
        subtitle: "Ask EduBuddy about your studies."
    },

    aiPage: {
        title: "AI Study Planner",
        subtitle: "Create a personalized study recommendation."
    },

    resumePage: {
        title: "Resume Maker",
        subtitle: "Create a simple student resume."
    },

    summaryPage: {
        title: "Summary Maker",
        subtitle: "Create a quick summary from your study material."
    }

};


/* =========================================================
   START DASHBOARD
   ========================================================= */

function startDashboard() {

    const welcomeScreen =
        document.getElementById("welcomeScreen");

    const app =
        document.getElementById("app");

    if (welcomeScreen) {
        welcomeScreen.style.display = "none";
    }

    if (app) {
        app.style.display = "flex";
    }

    showPage("dashboardPage");

    setCurrentDate();

    loadAllData();

    updateDashboardStats();

    startQuoteRotation();

}


/* =========================================================
   GO BACK TO WELCOME
   ========================================================= */

function goToWelcome() {

    const welcomeScreen =
        document.getElementById("welcomeScreen");

    const app =
        document.getElementById("app");

    if (app) {
        app.style.display = "none";
    }

    if (welcomeScreen) {
        welcomeScreen.style.display = "flex";
    }

}


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function showPage(pageId, clickedButton = null) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {

        page.classList.remove("active-page");

    });


    const selectedPage =
        document.getElementById(pageId);

    if (!selectedPage) {

        console.error(
            "Page not found:",
            pageId
        );

        return;
    }


    selectedPage.classList.add("active-page");


    /* Update sidebar */

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(item => {

        item.classList.remove("active");

    });


    if (clickedButton) {

        clickedButton.classList.add("active");

    } else {

        navItems.forEach(item => {

            const onclickValue =
                item.getAttribute("onclick");

            if (
                onclickValue &&
                onclickValue.includes(
                    `'${pageId}'`
                )
            ) {

                item.classList.add("active");

            }

        });

    }


    /* Update page title */

    const title =
        document.getElementById("pageTitle");

    const subtitle =
        document.getElementById("pageSubtitle");


    if (pageInfo[pageId]) {

        if (title) {
            title.textContent =
                pageInfo[pageId].title;
        }

        if (subtitle) {
            subtitle.textContent =
                pageInfo[pageId].subtitle;
        }

    }


    /* Load page-specific data */

    if (pageId === "notesPage") {

        displayNotes();

    }

    if (pageId === "routinePage") {

        displayTasks();

    }

    if (pageId === "chatPage") {

        displayChat();

    }

    if (pageId === "aiPage") {

        if (
            typeof loadAIHistory ===
            "function"
        ) {

            loadAIHistory();

        }

    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   CURRENT DATE
   ========================================================= */

function setCurrentDate() {

    const dateElement =
        document.getElementById("currentDate");

    if (!dateElement) {
        return;
    }


    const now = new Date();


    const formatted =
        now.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );


    dateElement.textContent =
        formatted;

}


/* =========================================================
   REMINDER
   ========================================================= */

function setReminder() {

    const subjectInput =
        document.getElementById("subject");

    const timeInput =
        document.getElementById("reminderTime");


    const subject =
        subjectInput
            ? subjectInput.value.trim()
            : "";

    const time =
        timeInput
            ? timeInput.value
            : "";


    if (!subject) {

        alert("Please enter a subject or task.");

        return;
    }


    if (!time) {

        alert("Please select a reminder time.");

        return;
    }


    const [hours, minutes] =
        time.split(":").map(Number);


    const now =
        new Date();


    const reminder =
        new Date();


    reminder.setHours(
        hours,
        minutes,
        0,
        0
    );


    /* If selected time has already passed,
       schedule it for tomorrow. */

    if (reminder <= now) {

        reminder.setDate(
            reminder.getDate() + 1
        );

    }


    const delay =
        reminder.getTime() -
        now.getTime();


    if (reminderTimer) {

        clearTimeout(reminderTimer);

    }


    reminderTimer =
        setTimeout(() => {

            alert(
                `Study Reminder: ${subject}`
            );

        }, delay);


    alert(
        `Reminder set for ${time} for "${subject}".`
    );

}


/* =========================================================
   NOTES
   ========================================================= */


/* Compatibility function for index.html */

function addNote() {

    return saveNote();

}


async function saveNote() {

    const input =
        document.getElementById("noteInput");

    if (!input) {
        return;
    }


    const note =
        input.value.trim();


    if (!note) {

        alert("Please write a note first.");

        return;
    }


    const noteObject = {

        id: Date.now(),

        note: note,

        created_at:
            new Date().toISOString()

    };


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/notes`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        note: note
                    })
                }
            );


        if (response.ok) {

            const saved =
                await response.json();


            if (saved.id) {

                noteObject.id =
                    saved.id;

            }

        } else {

            throw new Error(
                "Backend error"
            );

        }

    } catch (error) {

        console.log(
            "Backend unavailable. Saving note locally."
        );

    }


    notes.unshift(noteObject);

    saveNotesLocally();

    input.value = "";

    displayNotes();

    updateDashboardStats();

    alert("Note saved successfully.");

}


async function loadNotes() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/notes`
            );


        if (!response.ok) {

            throw new Error(
                "Could not load notes"
            );

        }


        const data =
            await response.json();


        if (Array.isArray(data)) {

            notes = data;

            saveNotesLocally();

        }

    } catch (error) {

        loadNotesLocally();

    }


    displayNotes();

    updateDashboardStats();

}


function saveNotesLocally() {

    localStorage.setItem(
        "edubuddy_notes",
        JSON.stringify(notes)
    );

}


function loadNotesLocally() {

    try {

        const saved =
            localStorage.getItem(
                "edubuddy_notes"
            );


        notes =
            saved
                ? JSON.parse(saved)
                : [];

    } catch (error) {

        notes = [];

    }

}


function displayNotes() {

    const list =
        document.getElementById("notesList");

    const count =
        document.getElementById("notesPageCount");


    if (!list) {
        return;
    }


    if (count) {

        count.textContent =
            `${notes.length} note${notes.length === 1 ? "" : "s"}`;

    }


    if (notes.length === 0) {

        list.innerHTML = `
            <p class="empty-state">
                No notes saved yet.
            </p>
        `;

        return;

    }


    list.innerHTML =
        notes.map(note => {

            const noteText =
                escapeHTML(
                    note.note || ""
                );


            const date =
                formatDate(
                    note.created_at
                );


            return `
                <div class="note-item">

                    <button
                        class="delete-btn"
                        onclick="deleteNote(${note.id})"
                        title="Delete note"
                    >
                        ×
                    </button>

                    ${noteText}

                    <small>
                        ${date}
                    </small>

                </div>
            `;

        }).join("");

}


async function deleteNote(id) {

    const confirmed =
        confirm(
            "Delete this note?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await fetch(
            `${API_BASE_URL}/api/notes/${id}`,
            {
                method: "DELETE"
            }
        );

    } catch (error) {

        console.log(
            "Deleting local note."
        );

    }


    notes =
        notes.filter(
            note =>
                Number(note.id) !==
                Number(id)
        );


    saveNotesLocally();

    displayNotes();

    updateDashboardStats();

}


function clearNoteInput() {

    const input =
        document.getElementById("noteInput");

    if (input) {
        input.value = "";
    }

}


/* =========================================================
   DASHBOARD QUICK NOTE
   ========================================================= */

function saveDashboardNote() {

    const dashboardInput =
        document.getElementById(
            "dashboardNote"
        );


    if (!dashboardInput) {
        return;
    }


    const note =
        dashboardInput.value.trim();


    if (!note) {

        alert("Please write a note.");

        return;
    }


    notes.unshift({

        id: Date.now(),

        note: note,

        created_at:
            new Date().toISOString()

    });


    saveNotesLocally();

    dashboardInput.value = "";

    displayNotes();

    updateDashboardStats();

    alert("Quick note saved.");

}


/* =========================================================
   ROUTINE / TASKS
   ========================================================= */

async function addTask() {

    const taskInput =
        document.getElementById(
            "taskInput"
        );

    const timeInput =
        document.getElementById(
            "taskTime"
        );


    if (!taskInput) {
        return;
    }


    const task =
        taskInput.value.trim();


    const time =
        timeInput
            ? timeInput.value
            : "";


    if (!task) {

        alert("Please enter a task.");

        return;
    }


    const taskObject = {

        id: Date.now(),

        task: task,

        time: time,

        created_at:
            new Date().toISOString()

    };


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/tasks`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        task: task,
                        time: time
                    })
                }
            );


        if (response.ok) {

            const saved =
                await response.json();


            if (saved.id) {

                taskObject.id =
                    saved.id;

            }

        } else {

            throw new Error(
                "Backend error"
            );

        }

    } catch (error) {

        console.log(
            "Backend unavailable. Saving task locally."
        );

    }


    tasks.push(taskObject);

    saveTasksLocally();

    taskInput.value = "";

    if (timeInput) {
        timeInput.value = "";
    }

    displayTasks();

    updateDashboardStats();

    alert("Task added successfully.");

}


async function loadTasks() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/tasks`
            );


        if (!response.ok) {

            throw new Error(
                "Could not load tasks"
            );

        }


        const data =
            await response.json();


        if (Array.isArray(data)) {

            tasks = data;

            saveTasksLocally();

        }

    } catch (error) {

        loadTasksLocally();

    }


    displayTasks();

    updateDashboardStats();

}


function saveTasksLocally() {

    localStorage.setItem(
        "edubuddy_tasks",
        JSON.stringify(tasks)
    );

}


function loadTasksLocally() {

    try {

        const saved =
            localStorage.getItem(
                "edubuddy_tasks"
            );


        tasks =
            saved
                ? JSON.parse(saved)
                : [];

    } catch (error) {

        tasks = [];

    }

}


function displayTasks() {

    const list =
        document.getElementById(
            "tasksList"
        );

    const count =
        document.getElementById(
            "taskPageCount"
        );


    if (!list) {
        return;
    }


    if (count) {

        count.textContent =
            `${tasks.length} task${tasks.length === 1 ? "" : "s"}`;

    }


    if (tasks.length === 0) {

        list.innerHTML = `
            <p class="empty-state">
                No tasks added yet.
            </p>
        `;

        return;

    }


    list.innerHTML =
        tasks.map(task => {

            return `
                <div class="task-item">

                    <div class="task-info">

                        <strong>
                            ${escapeHTML(
                                task.task || ""
                            )}
                        </strong>

                        <span>
                            ${
                                task.time
                                    ? "⏰ " + escapeHTML(task.time)
                                    : "No time selected"
                            }
                        </span>

                    </div>

                    <button
                        class="delete-btn"
                        onclick="deleteTask(${task.id})"
                        title="Delete task"
                    >
                        ×
                    </button>

                </div>
            `;

        }).join("");

}


async function deleteTask(id) {

    const confirmed =
        confirm(
            "Delete this task?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await fetch(
            `${API_BASE_URL}/api/tasks/${id}`,
            {
                method: "DELETE"
            }
        );

    } catch (error) {

        console.log(
            "Deleting local task."
        );

    }


    tasks =
        tasks.filter(
            task =>
                Number(task.id) !==
                Number(id)
        );


    saveTasksLocally();

    displayTasks();

    updateDashboardStats();

}


/* =========================================================
   STUDY CHAT
   ========================================================= */


/* Compatibility function */

function sendChat() {

    return sendMessage();

}


function handleChatEnter(event) {

    if (
        event.key === "Enter"
    ) {

        event.preventDefault();

        sendMessage();

    }

}


async function sendMessage() {

    const userInput =
        document.getElementById(
            "chatUser"
        );

    const messageInput =
        document.getElementById(
            "chatMessage"
        );


    if (!messageInput) {
        return;
    }


    const username =
        userInput
            ? userInput.value.trim() || "Student"
            : "Student";


    const message =
        messageInput.value.trim();


    if (!message) {

        alert(
            "Please type a message."
        );

        return;
    }


    const userMessage = {

        username: username,

        message: message,

        type: "user",

        created_at:
            new Date().toISOString()

    };


    chatMessages.push(
        userMessage
    );


    displayChat();


    messageInput.value = "";


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        username: username,
                        message: message
                    })
                }
            );


        if (response.ok) {

            const data =
                await response.json();


            if (data.reply) {

                chatMessages.push({

                    username: "EduBuddy",

                    message: data.reply,

                    type: "bot",

                    created_at:
                        new Date().toISOString()

                });

            } else {

                addLocalChatReply(
                    message
                );

            }

        } else {

            addLocalChatReply(
                message
            );

        }

    } catch (error) {

        addLocalChatReply(
            message
        );

    }


    saveChatLocally();

    displayChat();

    updateDashboardStats();

}


function addLocalChatReply(message) {

    const lower =
        message.toLowerCase();


    let reply =
        "Keep studying consistently. Break your topic into small parts and revise them regularly.";


    if (
        lower.includes("python")
    ) {

        reply =
            "For Python, start with variables, data types, conditions, loops, functions and lists. Then move to NumPy and Pandas.";

    } else if (
        lower.includes("machine learning") ||
        lower.includes("ml")
    ) {

        reply =
            "For Machine Learning, first understand data preprocessing, regression, classification, clustering and model evaluation.";

    } else if (
        lower.includes("exam")
    ) {

        reply =
            "For exams, focus first on important theory, definitions, diagrams and formulas. Then practice numerical questions.";

    } else if (
        lower.includes("study")
    ) {

        reply =
            "Try a focused study session of 45–60 minutes followed by a short break. Keep one clear topic as your target.";

    }


    chatMessages.push({

        username: "EduBuddy",

        message: reply,

        type: "bot",

        created_at:
            new Date().toISOString()

    });

}


function displayChat() {

    const container =
        document.getElementById(
            "chatMessages"
        );


    if (!container) {
        return;
    }


    if (chatMessages.length === 0) {

        container.innerHTML = `
            <div class="bot-message">

                <strong>EduBuddy</strong>

                <p>
                    Hi! I'm EduBuddy.
                    Ask me something about your studies.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        chatMessages.map(item => {

            const message =
                escapeHTML(
                    item.message || ""
                );


            if (
                item.type === "bot" ||
                item.username === "EduBuddy"
            ) {

                return `
                    <div class="bot-message">

                        <strong>
                            EduBuddy
                        </strong>

                        <p>
                            ${message}
                        </p>

                    </div>
                `;

            }


            return `
                <div class="user-message">

                    <strong>
                        ${escapeHTML(
                            item.username || "Student"
                        )}
                    </strong>

                    <p>
                        ${message}
                    </p>

                </div>
            `;

        }).join("");


    container.scrollTop =
        container.scrollHeight;

}


function saveChatLocally() {

    localStorage.setItem(
        "edubuddy_chat",
        JSON.stringify(chatMessages)
    );

}


function loadChatLocally() {

    try {

        const saved =
            localStorage.getItem(
                "edubuddy_chat"
            );


        chatMessages =
            saved
                ? JSON.parse(saved)
                : [];

    } catch (error) {

        chatMessages = [];

    }

}


/* =========================================================
   RESUME MAKER
   ========================================================= */

function generateResume() {

    const name =
        getInputValue("name");

    const email =
        getInputValue("email");

    const phone =
        getInputValue("phone");

    const education =
        getInputValue("education");

    const skills =
        getInputValue("skills");

    const experience =
        getInputValue("experience");


    if (!name) {

        alert(
            "Please enter your name."
        );

        return;
    }


    const output =
        document.getElementById(
            "resumeOutput"
        );


    if (!output) {
        return;
    }


    output.innerHTML = `

        <div class="resume-paper">

            <h1>
                ${escapeHTML(name)}
            </h1>

            <div class="resume-contact">

                ${
                    email
                        ? escapeHTML(email)
                        : ""
                }

                ${
                    email && phone
                        ? " | "
                        : ""
                }

                ${
                    phone
                        ? escapeHTML(phone)
                        : ""
                }

            </div>


            ${
                education
                    ? `
                        <div class="resume-section">

                            <h3>
                                Education
                            </h3>

                            <p>
                                ${escapeHTML(
                                    education
                                )}
                            </p>

                        </div>
                    `
                    : ""
            }


            ${
                skills
                    ? `
                        <div class="resume-section">

                            <h3>
                                Skills
                            </h3>

                            <p>
                                ${escapeHTML(
                                    skills
                                )}
                            </p>

                        </div>
                    `
                    : ""
            }


            ${
                experience
                    ? `
                        <div class="resume-section">

                            <h3>
                                Projects / Experience
                            </h3>

                            <p>
                                ${escapeHTML(
                                    experience
                                )}
                            </p>

                        </div>
                    `
                    : ""
            }

        </div>

    `;

}


/* =========================================================
   SUMMARY MAKER
   ========================================================= */

function generateSummary() {

    const input =
        document.getElementById(
            "summaryInput"
        );

    const output =
        document.getElementById(
            "summaryOutput"
        );


    if (!input || !output) {
        return;
    }


    const text =
        input.value.trim();


    if (!text) {

        alert(
            "Please enter study material."
        );

        return;
    }


    /*
       Simple local summary maker.

       This does not require the backend.
    */


    const sentences =
        text
            .split(
                /(?<=[.!?])\s+/
            )
            .filter(
                sentence =>
                    sentence.trim()
            );


    let summary;


    if (sentences.length <= 3) {

        summary =
            sentences.join(" ");

    } else {

        const numberToTake =
            Math.max(
                2,
                Math.ceil(
                    sentences.length * 0.35
                )
            );


        summary =
            sentences
                .slice(
                    0,
                    numberToTake
                )
                .join(" ");

    }


    output.innerHTML =
        escapeHTML(summary);


}


/* =========================================================
   DASHBOARD STATISTICS
   ========================================================= */

function updateDashboardStats() {

    const notesCount =
        document.getElementById(
            "notesCount"
        );

    const tasksCount =
        document.getElementById(
            "tasksCount"
        );

    const chatCount =
        document.getElementById(
            "chatCount"
        );


    if (notesCount) {

        notesCount.textContent =
            notes.length;

    }


    if (tasksCount) {

        tasksCount.textContent =
            tasks.length;

    }


    if (chatCount) {

        chatCount.textContent =
            chatMessages.length;

    }


    const aiPlansCount =
        document.getElementById(
            "aiPlansCount"
        );


    if (aiPlansCount) {

        const savedHistory =
            localStorage.getItem(
                "edubuddy_ai_history"
            );


        let history = [];


        try {

            history =
                savedHistory
                    ? JSON.parse(
                        savedHistory
                    )
                    : [];

        } catch (error) {

            history = [];

        }


        aiPlansCount.textContent =
            history.length;

    }

}


/* =========================================================
   LOAD ALL DATA
========================================================= */

function loadAllData() {

    loadNotes();

    loadTasks();

    loadChatLocally();

    displayChat();

    updateDashboardStats();

}


/* =========================================================
   MOTIVATIONAL QUOTES
========================================================= */

const quotes = [

    "Small progress every day becomes big progress over time.",

    "Focus on one topic at a time.",

    "Consistency is more important than studying perfectly.",

    "Your future self will thank you for studying today.",

    "Understand first, memorize later.",

    "Keep learning. Keep building. Keep improving."

];


let currentQuote =
    0;


function startQuoteRotation() {

    const quoteBox =
        document.getElementById(
            "quoteBox"
        );


    if (!quoteBox) {
        return;
    }


    quoteBox.textContent =
        quotes[currentQuote];


    setInterval(() => {

        currentQuote =
            (
                currentQuote + 1
            ) % quotes.length;


        quoteBox.style.opacity =
            "0";


        setTimeout(() => {

            quoteBox.textContent =
                quotes[currentQuote];

            quoteBox.style.opacity =
                "1";

        }, 200);

    }, 5000);

}


/* =========================================================
   UTILITY FUNCTIONS
   ========================================================= */

function getInputValue(id) {

    const element =
        document.getElementById(id);


    if (!element) {
        return "";
    }


    return element.value.trim();

}


function formatDate(dateValue) {

    if (!dateValue) {
        return "Recently";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Recently";

    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/*
   Prevent HTML entered by a user from being
   interpreted as actual HTML.
*/

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   COMPATIBILITY
   ========================================================= */

/*
   ai.js also defines this function.
   Keeping this fallback prevents the button
   from breaking if ai.js is temporarily unavailable.
*/

function getAIRecommendation() {

    if (
        typeof generateAIPlan ===
        "function"
    ) {

        return generateAIPlan();

    }


    alert(
        "AI Planner file is not loaded."
    );

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setCurrentDate();

        loadNotesLocally();

        loadTasksLocally();

        loadChatLocally();

        displayNotes();

        displayTasks();

        displayChat();

        updateDashboardStats();

    }
);
