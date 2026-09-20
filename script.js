// ==========================================
// EDU BUDDY BACKEND
// ==========================================

const API_BASE_URL = "http://127.0.0.1:5000";


// ==========================================
// REMINDER SYSTEM
// ==========================================

function setReminder() {

    const subject =
        document.getElementById("subject").value.trim();

    const time =
        document.getElementById("time").value;

    if (!subject || !time) {

        alert("Please enter subject and time");

        return;
    }

    const now = new Date();

    const reminderTime = new Date();

    const [hours, minutes] = time.split(":");

    reminderTime.setHours(
        Number(hours),
        Number(minutes),
        0,
        0
    );

    const delay = reminderTime - now;

    if (delay <= 0) {

        alert("Please select a future time");

        return;
    }

    alert("Reminder set successfully!");

    setTimeout(() => {

        alert(`⏰ Time to study: ${subject}`);

    }, delay);
}


// ==========================================
// NOTES SYSTEM - BACKEND
// ==========================================

async function saveNote() {

    const noteInput =
        document.getElementById("noteInput");

    const noteText =
        noteInput.value.trim();

    if (!noteText) {

        alert("Please type a note!");

        return;
    }

    try {

        const response = await fetch(
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

            alert(
                result.message ||
                "Unable to save note"
            );

            return;
        }

        noteInput.value = "";

        displayNotes();

    } catch (error) {

        console.error(
            "Save note error:",
            error
        );

        alert(
            "Backend connection failed."
        );
    }
}


async function displayNotes() {

    const notesList =
        document.getElementById("notesList");

    if (!notesList) return;

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/notes`
        );

        const notes =
            await response.json();

        notesList.innerHTML = "";

        notes.forEach(note => {

            const li =
                document.createElement("li");

            li.textContent =
                note.note;

            const delBtn =
                document.createElement("button");

            delBtn.textContent =
                "Delete";

            delBtn.onclick = () =>
                deleteNote(note.id);

            li.appendChild(delBtn);

            notesList.appendChild(li);

        });

    } catch (error) {

        console.error(
            "Display notes error:",
            error
        );

        notesList.innerHTML =
            "<li>⚠️ Unable to load notes.</li>";
    }
}


async function deleteNote(noteId) {

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/notes/${noteId}`,
            {
                method: "DELETE"
            }
        );

        const result =
            await response.json();

        if (!response.ok || !result.success) {

            alert(
                result.message ||
                "Unable to delete note"
            );

            return;
        }

        displayNotes();

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


// ==========================================
// ROUTINE / TIMETABLE SYSTEM - BACKEND
// ==========================================

async function addTask() {

    const taskInput =
        document.getElementById("taskInput");

    const taskTime =
        document.getElementById("taskTime");

    const task =
        taskInput.value.trim();

    const time =
        taskTime.value;

    if (!task || !time) {

        alert(
            "Please enter both task and time!"
        );

        return;
    }

    try {

        const response = await fetch(
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

            alert(
                result.message ||
                "Unable to add task"
            );

            return;
        }

        taskInput.value = "";

        taskTime.value = "";

        displayTasks();

    } catch (error) {

        console.error(
            "Add task error:",
            error
        );

        alert(
            "Backend connection failed."
        );
    }
}


async function displayTasks() {

    const taskList =
        document.getElementById("taskList");

    if (!taskList) return;

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/tasks`
        );

        const tasks =
            await response.json();

        taskList.innerHTML = "";

        tasks.forEach(item => {

            const li =
                document.createElement("li");

            li.textContent =
                `${item.time} - ${item.task}`;

            const delBtn =
                document.createElement("button");

            delBtn.textContent =
                "Delete";

            delBtn.onclick = () =>
                deleteTask(item.id);

            li.appendChild(delBtn);

            taskList.appendChild(li);

        });

    } catch (error) {

        console.error(
            "Display tasks error:",
            error
        );

        taskList.innerHTML =
            "<li>⚠️ Unable to load tasks.</li>";
    }
}


async function deleteTask(taskId) {

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/tasks/${taskId}`,
            {
                method: "DELETE"
            }
        );

        const result =
            await response.json();

        if (!response.ok || !result.success) {

            alert(
                result.message ||
                "Unable to delete task"
            );

            return;
        }

        displayTasks();

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


// ==========================================
// SUMMARY MAKER
// ==========================================

function generateSummary() {

    const input =
        document.getElementById("summaryInput")
            .value
            .trim();

    const output =
        document.getElementById("summaryOutput");

    if (!input) {

        alert(
            "Please enter some notes to summarize!"
        );

        return;
    }

    // Simple JavaScript summary
    // Takes first 3 sentences

    const sentences =
        input.split(". ");

    const summary =
        sentences
            .slice(0, 3)
            .join(". ")
            +
            (sentences.length > 3 ? "..." : "");

    output.textContent =
        summary;
}


// ==========================================
// RESUME BUILDER
// ==========================================

function generateResume() {

    const name =
        document.getElementById("name")
            .value
            .trim();

    const email =
        document.getElementById("email")
            .value
            .trim();

    const phone =
        document.getElementById("phone")
            .value
            .trim();

    const education =
        document.getElementById("education")
            .value
            .trim();

    const skills =
        document.getElementById("skills")
            .value
            .trim();

    const experience =
        document.getElementById("experience")
            .value
            .trim();

    const output =
        document.getElementById("resumeOutput");


    if (!name || !email) {

        alert(
            "Please enter at least name and email!"
        );

        return;
    }


    const skillsList =
        skills
            .split(",")
            .map(s => s.trim())
            .filter(s => s);


    output.innerHTML = `

        <h3>${name}</h3>

        <p>
            <strong>Email:</strong>
            ${email}
        </p>

        <p>
            <strong>Phone:</strong>
            ${phone}
        </p>

        <p>
            <strong>Education:</strong>
            ${education}
        </p>

        <p>
            <strong>Skills:</strong>
            ${skillsList.join(", ")}
        </p>

        <p>
            <strong>Experience:</strong>
            ${experience}
        </p>

    `;
}


// ==========================================
// STUDY CHAT BOARD - BACKEND
// ==========================================

async function sendMessage() {

    const user =
        document.getElementById("chatUser")
            .value
            .trim();

    const messageInput =
        document.getElementById("chatMessage");

    const message =
        messageInput.value.trim();


    if (!user || !message) {

        alert(
            "Please enter your name and message!"
        );

        return;
    }


    try {

        const response = await fetch(
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

            alert(
                result.message ||
                "Unable to send message"
            );

            return;
        }


        messageInput.value = "";

        displayChat();

    } catch (error) {

        console.error(
            "Send message error:",
            error
        );

        alert(
            "Backend connection failed."
        );
    }
}


async function displayChat() {

    const chatList =
        document.getElementById("chatList");

    if (!chatList) return;


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/chat`
        );


        const chat =
            await response.json();


        chatList.innerHTML = "";


        chat.forEach(item => {

            const li =
                document.createElement("li");


            li.textContent =
                `${item.username}: ${item.message}`;


            chatList.appendChild(li);

        });


    } catch (error) {

        console.error(
            "Display chat error:",
            error
        );

        chatList.innerHTML =
            "<li>⚠️ Unable to load chat.</li>";
    }
}


// ==========================================
// START DASHBOARD
// ==========================================

function startDashboard() {

    const dashboard =
        document.querySelector(".dashboard");

    if (dashboard) {

        dashboard.scrollIntoView({
            behavior: "smooth"
        });

    }
}


// ==========================================
// RANDOM QUOTE OF THE DAY
// ==========================================

const quotes = [

    "Believe you can and you're halfway there.",

    "Don’t watch the clock; do what it does. Keep going.",

    "Study hard, dream big.",

    "Success is the sum of small efforts repeated daily.",

    "Your future is created by what you do today, not tomorrow."

];


const quoteBox =
    document.getElementById("quoteBox");


if (quoteBox) {

    quoteBox.innerText =
        quotes[
            Math.floor(
                Math.random() * quotes.length
            )
        ];
}


// ==========================================
// LOAD DATA WHEN PAGE OPENS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        displayNotes();

        displayTasks();

        displayChat();

    }
);
