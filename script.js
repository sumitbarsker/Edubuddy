function setReminder() {
    const subject = document.getElementById("subject").value;
    const time = document.getElementById("time").value;

    if (!subject || !time) {
        alert("Please enter subject and time");
        return;
    }

    const now = new Date();
    const reminderTime = new Date();

    const [hours, minutes] = time.split(":"); 
    reminderTime.setHours(hours, minutes, 0, 0);

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
// NOTES SYSTEM
function saveNote() {
    const noteInput = document.getElementById("noteInput");
    const noteText = noteInput.value.trim();

    if (!noteText) {
        alert("Please type a note!");
        return;
    }

    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.push(noteText);
    localStorage.setItem("notes", JSON.stringify(notes));

    noteInput.value = "";
    displayNotes();
}

function displayNotes() {
    const notesList = document.getElementById("notesList");
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notesList.innerHTML = "";

    notes.forEach((note, index) => {
        const li = document.createElement("li");
        li.textContent = note;

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.onclick = () => deleteNote(index);

        li.appendChild(delBtn);
        notesList.appendChild(li);
    });
}

function deleteNote(index) {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    displayNotes();
}

// Display notes when page loads
displayNotes();
// ROUTINE / TIMETABLE SYSTEM
function addTask() {
    const taskInput = document.getElementById("taskInput").value.trim();
    const taskTime = document.getElementById("taskTime").value;

    if (!taskInput || !taskTime) {
        alert("Please enter both task and time!");
        return;
    }

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push({ task: taskInput, time: taskTime });
    localStorage.setItem("tasks", JSON.stringify(tasks));

    document.getElementById("taskInput").value = "";
    document.getElementById("taskTime").value = "";
    displayTasks();
}

function displayTasks() {
    const taskList = document.getElementById("taskList");
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    taskList.innerHTML = "";

    tasks.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = `${item.time} - ${item.task}`;

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.onclick = () => deleteTask(index);

        li.appendChild(delBtn);
        taskList.appendChild(li);
    });
}

function deleteTask(index) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.splice(index, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    displayTasks();
}

// Display tasks when page loads
displayTasks();
// SUMMARY MAKER
function generateSummary() {
    const input = document.getElementById("summaryInput").value.trim();
    const output = document.getElementById("summaryOutput");

    if (!input) {
        alert("Please enter some notes to summarize!");
        return;
    }

    // Simple JS summary: take first 3 sentences
    const sentences = input.split(". ");
    const summary = sentences.slice(0, 3).join(". ") + (sentences.length > 3 ? "..." : "");

    output.textContent = summary;
}
// RESUME BUILDER
function generateResume() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const education = document.getElementById("education").value.trim();
    const skills = document.getElementById("skills").value.trim();
    const experience = document.getElementById("experience").value.trim();
    const output = document.getElementById("resumeOutput");

    if (!name || !email) {
        alert("Please enter at least name and email!");
        return;
    }

    const skillsList = skills.split(",").map(s => s.trim()).filter(s => s);

    output.innerHTML = `
        <h3>${name}</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Education:</strong> ${education}</p>
        <p><strong>Skills:</strong> ${skillsList.join(", ")}</p>
        <p><strong>Experience:</strong> ${experience}</p>
    `;
}
// STUDY CHAT BOARD
function sendMessage() {
    const user = document.getElementById("chatUser").value.trim();
    const message = document.getElementById("chatMessage").value.trim();

    if (!user || !message) {
        alert("Please enter your name and message!");
        return;
    }

    let chat = JSON.parse(localStorage.getItem("chat")) || [];
    chat.push({ user, message });
    localStorage.setItem("chat", JSON.stringify(chat));

    document.getElementById("chatMessage").value = "";
    displayChat();
}

function displayChat() {
    const chatList = document.getElementById("chatList");
    let chat = JSON.parse(localStorage.getItem("chat")) || [];
    chatList.innerHTML = "";

    chat.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.user}: ${item.message}`;
        chatList.appendChild(li);
    });
}

// Display chat when page loads
displayChat();
function startDashboard() {
    // Scroll to dashboard section
    document.querySelector('.dashboard').scrollIntoView({ behavior: 'smooth' });
}
// Scroll to dashboard on click
function startDashboard() {
    document.querySelector('.dashboard').scrollIntoView({ behavior: 'smooth' });
}

// Random Quote of the Day
const quotes = [
    "Believe you can and you're halfway there.",
    "Don’t watch the clock; do what it does. Keep going.",
    "Study hard, dream big.",
    "Success is the sum of small efforts repeated daily.",
    "Your future is created by what you do today, not tomorrow."
];

document.getElementById("quoteBox").innerText = 
    quotes[Math.floor(Math.random() * quotes.length)];
