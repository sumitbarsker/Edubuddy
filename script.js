// ======================================================
// EDU BUDDY - MAIN JAVASCRIPT
// ======================================================

const API_BASE_URL = "http://127.0.0.1:5000";


// ======================================================
// HELPER FUNCTIONS
// ======================================================

function getElement(id) {
    return document.getElementById(id);
}

function showElement(element) {
    if (element) {
        element.style.display = "";
    }
}

function hideElement(element) {
    if (element) {
        element.style.display = "none";
    }
}


// ======================================================
// HOME / DASHBOARD NAVIGATION
// ======================================================

function startDashboard() {

    const welcome = document.querySelector(".welcome-screen");
    const app = getElement("app");

    if (welcome) {
        welcome.style.display = "none";
    }

    if (app) {
        app.style.display = "flex";
    }

    showPage("dashboardPage");

    updateDashboardStats();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function goToWelcome() {

    const welcome = document.querySelector(".welcome-screen");
    const app = getElement("app");

    if (app) {
        app.style.display = "none";
    }

    if (welcome) {
        welcome.style.display = "flex";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ======================================================
// PAGE / SIDEBAR NAVIGATION
// ======================================================

function showPage(pageId) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active-page");

        page.style.display = "none";
    });


    const selectedPage = getElement(pageId);

    if (selectedPage) {

        selectedPage.classList.add("active-page");

        selectedPage.style.display = "block";
    }


    // Update sidebar active item
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {
        item.classList.remove("active");
    });


    const matchingNav = document.querySelector(
        `.nav-item[onclick*="${pageId}"]`
    );

    if (matchingNav) {
        matchingNav.classList.add("active");
    }


    // Load data when opening pages
    if (pageId === "dashboardPage") {
        updateDashboardStats();
    }

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
        loadAIHistory();
    }
}


// ======================================================
// CURRENT DATE
// ======================================================

function setCurrentDate() {

    const dateElement =
        document.getElementById("currentDate");

    if (!dateElement) return;


    const today = new Date();

    const options = {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    };


    dateElement.textContent =
        today.toLocaleDateString("en-IN", options);
}


// ======================================================
// REMINDER SYSTEM
// ======================================================

function setReminder() {

    const subjectElement = getElement("subject");
    const timeElement = getElement("time");

    if (!subjectElement || !timeElement) return;


    const subject =
        subjectElement.value.trim();

    const time =
        timeElement.value;


    if (!subject || !time) {

        alert("Please enter subject and time.");

        return;
    }


    const now = new Date();

    const reminderTime = new Date();

    const [hours, minutes] =
        time.split(":");


    reminderTime.setHours(
        Number(hours),
        Number(minutes),
        0,
        0
    );


    const delay =
        reminderTime.getTime() - now.getTime();


    if (delay <= 0) {

        alert("Please select a future time.");

        return;
    }


    alert(
        `Reminder set for ${subject} at ${time}.`
    );


    setTimeout(() => {

        alert(
            `⏰ Time to study: ${subject}`
        );

    }, delay);
}


// ======================================================
// NOTES SYSTEM
// ======================================================

async function saveNote() {

    const noteInput =
        getElement("noteInput");


    if (!noteInput) return;


    const noteText =
        noteInput.value.trim();


    if (!noteText) {

        alert("Please type a note.");

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/notes`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        note: noteText
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Unable to save note."
            );
        }


        noteInput.value = "";

        await displayNotes();

        updateDashboardStats();


    } catch (error) {

        console.error(
            "Save note error:",
            error
        );


        alert(
            "Backend connection failed. Make sure Flask is running."
        );
    }
}


// ------------------------------------------------------
// DISPLAY NOTES
// ------------------------------------------------------

async function displayNotes() {

    const notesList =
        getElement("notesList");


    if (!notesList) return;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/notes`
            );


        if (!response.ok) {
            throw new Error("Unable to fetch notes.");
        }


        const notes =
            await response.json();


        notesList.innerHTML = "";


        if (!Array.isArray(notes) || notes.length === 0) {

            notesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <h3>No notes yet</h3>
                    <p>Add your first study note above.</p>
                </div>
            `;

            return;
        }


        notes.forEach(note => {

            const item =
                document.createElement("div");

            item.className = "note-item";


            const content =
                document.createElement("div");

            content.className =
                "note-content";


            content.textContent =
                note.note;


            const deleteButton =
                document.createElement("button");

            deleteButton.className =
                "delete-btn";

            deleteButton.textContent =
                "Delete";


            deleteButton.onclick = () =>
                deleteNote(note.id);


            item.appendChild(content);

            item.appendChild(deleteButton);

            notesList.appendChild(item);

        });


    } catch (error) {

        console.error(
            "Display notes error:",
            error
        );


        notesList.innerHTML = `
            <div class="empty-state">
                <p>⚠️ Unable to load notes.</p>
            </div>
        `;
    }
}


// ------------------------------------------------------
// DELETE NOTE
// ------------------------------------------------------

async function deleteNote(noteId) {

    if (!confirm("Delete this note?")) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/notes/${noteId}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Unable to delete note."
            );
        }


        await displayNotes();

        updateDashboardStats();


    } catch (error) {

        console.error(
            "Delete note error:",
            error
        );


        alert(
            "Backend connection failed."
        );
    }
}


// ======================================================
// ROUTINE / TASK SYSTEM
// ======================================================

async function addTask() {

    const taskInput =
        getElement("taskInput");

    const taskTime =
        getElement("taskTime");


    if (!taskInput || !taskTime) return;


    const task =
        taskInput.value.trim();

    const time =
        taskTime.value;


    if (!task || !time) {

        alert(
            "Please enter both task and time."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/tasks`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        task: task,
                        time: time
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Unable to add task."
            );
        }


        taskInput.value = "";

        taskTime.value = "";


        await displayTasks();

        updateDashboardStats();


    } catch (error) {

        console.error(
            "Add task error:",
            error
        );


        alert(
            "Backend connection failed. Make sure Flask is running."
        );
    }
}


// ------------------------------------------------------
// DISPLAY TASKS
// ------------------------------------------------------

async function displayTasks() {

    const taskList =
        getElement("taskList");


    if (!taskList) return;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/tasks`
            );


        if (!response.ok) {
            throw new Error("Unable to fetch tasks.");
        }


        const tasks =
            await response.json();


        taskList.innerHTML = "";


        if (!Array.isArray(tasks) || tasks.length === 0) {

            taskList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <h3>No tasks yet</h3>
                    <p>Create your study routine to get started.</p>
                </div>
            `;

            return;
        }


        tasks.forEach(item => {

            const taskItem =
                document.createElement("div");

            taskItem.className =
                "task-item";


            const taskInfo =
                document.createElement("div");

            taskInfo.className =
                "task-info";


            const taskTitle =
                document.createElement("strong");

            taskTitle.textContent =
                item.task;


            const taskTimeText =
                document.createElement("span");

            taskTimeText.textContent =
                item.time;


            taskInfo.appendChild(taskTitle);

            taskInfo.appendChild(taskTimeText);


            const deleteButton =
                document.createElement("button");

            deleteButton.className =
                "delete-btn";

            deleteButton.textContent =
                "Delete";


            deleteButton.onclick = () =>
                deleteTask(item.id);


            taskItem.appendChild(taskInfo);

            taskItem.appendChild(deleteButton);

            taskList.appendChild(taskItem);

        });


    } catch (error) {

        console.error(
            "Display tasks error:",
            error
        );


        taskList.innerHTML = `
            <div class="empty-state">
                <p>⚠️ Unable to load routine.</p>
            </div>
        `;
    }
}


// ------------------------------------------------------
// DELETE TASK
// ------------------------------------------------------

async function deleteTask(taskId) {

    if (!confirm("Delete this task?")) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/tasks/${taskId}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Unable to delete task."
            );
        }


        await displayTasks();

        updateDashboardStats();


    } catch (error) {

        console.error(
            "Delete task error:",
            error
        );


        alert(
            "Backend connection failed."
        );
    }
}


// ======================================================
// SUMMARY MAKER
// ======================================================

function generateSummary() {

    const inputElement =
        getElement("summaryInput");

    const output =
        getElement("summaryOutput");


    if (!inputElement || !output) return;


    const input =
        inputElement.value.trim();


    if (!input) {

        alert(
            "Please enter some notes to summarize."
        );

        return;
    }


    // Split text into sentences
    const sentences =
        input
            .split(/(?<=[.!?])\s+/)
            .filter(sentence => sentence.trim());


    let summary;


    if (sentences.length <= 3) {

        summary =
            sentences.join(" ");

    } else {

        summary =
            sentences
                .slice(0, 3)
                .join(" ") +
            "...";
    }


    output.innerHTML = `
        <div class="summary-result">
            <div class="summary-result-title">
                ✨ Summary
            </div>

            <p>${escapeHTML(summary)}</p>
        </div>
    `;
}


// ======================================================
// RESUME BUILDER
// ======================================================

function generateResume() {

    const name =
        getElement("name")?.value.trim() || "";

    const email =
        getElement("email")?.value.trim() || "";

    const phone =
        getElement("phone")?.value.trim() || "";

    const education =
        getElement("education")?.value.trim() || "";

    const skills =
        getElement("skills")?.value.trim() || "";

    const experience =
        getElement("experience")?.value.trim() || "";

    const output =
        getElement("resumeOutput");


    if (!output) return;


    if (!name || !email) {

        alert(
            "Please enter at least your name and email."
        );

        return;
    }


    const skillsList =
        skills
            .split(",")
            .map(skill => skill.trim())
            .filter(skill => skill);


    output.innerHTML = `

        <div class="resume-preview">

            <div class="resume-header">

                <h1>
                    ${escapeHTML(name)}
                </h1>

                <p>
                    ${escapeHTML(email)}
                    ${phone ? " • " + escapeHTML(phone) : ""}
                </p>

            </div>


            ${
                education
                    ? `
                    <div class="resume-section">
                        <h3>Education</h3>
                        <p>${escapeHTML(education)}</p>
                    </div>
                    `
                    : ""
            }


            ${
                skillsList.length
                    ? `
                    <div class="resume-section">
                        <h3>Skills</h3>

                        <div class="resume-skills">
                            ${skillsList
                                .map(
                                    skill =>
                                        `<span>${escapeHTML(skill)}</span>`
                                )
                                .join("")}
                        </div>
                    </div>
                    `
                    : ""
            }


            ${
                experience
                    ? `
                    <div class="resume-section">
                        <h3>Experience</h3>
                        <p>${escapeHTML(experience)}</p>
                    </div>
                    `
                    : ""
            }

        </div>
    `;
}


// ======================================================
// STUDY CHAT
// ======================================================

async function sendMessage() {

    const userInput =
        getElement("chatUser");

    const messageInput =
        getElement("chatMessage");

    if (!userInput || !messageInput) return;


    const user =
        userInput.value.trim();

    const message =
        messageInput.value.trim();


    if (!user || !message) {

        alert(
            "Please enter your name and message."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username: user,
                        message: message
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Unable to send message."
            );
        }


        messageInput.value = "";

        await displayChat();


    } catch (error) {

        console.error(
            "Send message error:",
            error
        );


        alert(
            "Backend connection failed. Make sure Flask is running."
        );
    }
}


// ------------------------------------------------------
// DISPLAY CHAT
// ------------------------------------------------------

async function displayChat() {

    const chatList =
        getElement("chatList");


    if (!chatList) return;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/chat`
            );


        if (!response.ok) {
            throw new Error("Unable to load chat.");
        }


        const chat =
            await response.json();


        chatList.innerHTML = "";


        if (!Array.isArray(chat) || chat.length === 0) {

            chatList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💬</div>
                    <h3>No messages yet</h3>
                    <p>Start the study conversation.</p>
                </div>
            `;

            return;
        }


        chat.forEach(item => {

            const messageItem =
                document.createElement("div");

            messageItem.className =
                "chat-message";


            messageItem.innerHTML = `
                <div class="chat-avatar">
                    ${escapeHTML(
                        String(item.username || "?")
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>

                <div class="chat-message-content">

                    <strong>
                        ${escapeHTML(item.username || "Student")}
                    </strong>

                    <p>
                        ${escapeHTML(item.message || "")}
                    </p>

                </div>
            `;


            chatList.appendChild(messageItem);

        });


    } catch (error) {

        console.error(
            "Display chat error:",
            error
        );


        chatList.innerHTML = `
            <div class="empty-state">
                <p>⚠️ Unable to load chat.</p>
            </div>
        `;
    }
}


// ======================================================
// DASHBOARD STATS
// ======================================================

async function updateDashboardStats() {

    try {

        const [notesResponse, tasksResponse] =
            await Promise.all([
                fetch(`${API_BASE_URL}/api/notes`),
                fetch(`${API_BASE_URL}/api/tasks`)
            ]);


        if (!notesResponse.ok ||
            !tasksResponse.ok) {

            return;
        }


        const notes =
            await notesResponse.json();

        const tasks =
            await tasksResponse.json();


        const noteCount =
            Array.isArray(notes)
                ? notes.length
                : 0;

        const taskCount =
            Array.isArray(tasks)
                ? tasks.length
                : 0;


        // Common possible IDs
        const notesCountElement =
            getElement("notesCount");

        const tasksCountElement =
            getElement("tasksCount");

        const totalNotesElement =
            getElement("totalNotes");

        const totalTasksElement =
            getElement("totalTasks");


        if (notesCountElement) {
            notesCountElement.textContent =
                noteCount;
        }

        if (tasksCountElement) {
            tasksCountElement.textContent =
                taskCount;
        }

        if (totalNotesElement) {
            totalNotesElement.textContent =
                noteCount;
        }

        if (totalTasksElement) {
            totalTasksElement.textContent =
                taskCount;
        }

    } catch (error) {

        console.warn(
            "Dashboard stats unavailable:",
            error
        );
    }
}


// ======================================================
// RANDOM QUOTE
// ======================================================

const quotes = [

    "Believe you can and you're halfway there.",

    "Don't watch the clock; do what it does. Keep going.",

    "Study hard, dream big.",

    "Success is the sum of small efforts repeated daily.",

    "Your future is created by what you do today, not tomorrow.",

    "Small progress every day leads to big results.",

    "Focus on progress, not perfection."

];


function loadRandomQuote() {

    const quoteBox =
        getElement("quoteBox");


    if (!quoteBox) return;


    const randomIndex =
        Math.floor(
            Math.random() * quotes.length
        );


    quoteBox.textContent =
        quotes[randomIndex];
}


// ======================================================
// HTML SECURITY HELPER
// ======================================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// KEYBOARD SHORTCUTS
// ======================================================

document.addEventListener(
    "keydown",
    function (event) {

        // Ctrl + Enter = send chat
        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            const chatPage =
                getElement("chatPage");

            if (
                chatPage &&
                chatPage.classList.contains("active-page")
            ) {

                sendMessage();
            }
        }

    }
);


// ======================================================
// INITIALIZE APP
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "EduBuddy JavaScript loaded successfully."
        );


        setCurrentDate();

        loadRandomQuote();

        displayNotes();

        displayTasks();

        displayChat();

        updateDashboardStats();


        // ----------------------------------------------
        // Make sure Home is visible when site opens
        // ----------------------------------------------

        const welcome =
            document.querySelector(".welcome-screen");

        const app =
            getElement("app");


        if (welcome && app) {

            welcome.style.display = "flex";

            app.style.display = "none";
        }


        // ----------------------------------------------
        // Enter key for note
        // ----------------------------------------------

        const noteInput =
            getElement("noteInput");


        if (noteInput) {

            noteInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter" &&
                        !event.shiftKey
                    ) {

                        event.preventDefault();

                        saveNote();
                    }
                }
            );
        }


        // ----------------------------------------------
        // Enter key for chat
        // ----------------------------------------------

        const chatMessage =
            getElement("chatMessage");


        if (chatMessage) {

            chatMessage.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter" &&
                        !event.shiftKey
                    ) {

                        event.preventDefault();

                        sendMessage();
                    }
                }
            );
        }

    }
);
