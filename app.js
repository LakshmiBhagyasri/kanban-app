const columns = [
  { id: "todo", title: "To Do" },
  { id: "progress", title: "In Progress" },
  { id: "testing", title: "Testing" },
  { id: "done", title: "Done" }
];

let tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || [
  {
    id: 1,
    title: "Create Login Page",
    description: "Design the login screen.",
    column: "todo"
  },
  {
    id: 2,
    title: "Build Dashboard",
    description: "Create the main dashboard layout.",
    column: "progress"
  },
  {
    id: 3,
    title: "Test Task Cards",
    description: "Check task card actions.",
    column: "testing"
  }
];

const loginPage = document.getElementById("loginPage");
const appPage = document.getElementById("appPage");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const welcomeUser = document.getElementById("welcomeUser");
const board = document.getElementById("board");
const taskModal = document.getElementById("taskModal");

document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("logoutBtn").addEventListener("click", logout);
document.getElementById("addTaskBtn").addEventListener("click", openModal);
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("saveTaskBtn").addEventListener("click", addTask);

function login() {
  const name = userName.value.trim();
  const email = userEmail.value.trim();

  if (!name || !email) {
    alert("Please enter your name and email.");
    return;
  }

  localStorage.setItem("kanbanUser", JSON.stringify({ name, email }));
  showApp();
}

function logout() {
  localStorage.removeItem("kanbanUser");
  appPage.classList.add("hidden");
  loginPage.classList.remove("hidden");
}

function showApp() {
  const user = JSON.parse(localStorage.getItem("kanbanUser"));

  if (!user) {
    loginPage.classList.remove("hidden");
    appPage.classList.add("hidden");
    return;
  }

  welcomeUser.textContent = `Welcome, ${user.name}`;
  loginPage.classList.add("hidden");
  appPage.classList.remove("hidden");
  renderBoard();
}

function renderBoard() {
  board.innerHTML = "";

  columns.forEach((column) => {
    const columnTasks = tasks.filter((task) => task.column === column.id);

    const columnElement = document.createElement("div");
    columnElement.className = "column";

    columnElement.innerHTML = `
      <div class="column-header">
        <h3>${column.title}</h3>
        <span class="count">${columnTasks.length}</span>
      </div>
      <div class="tasks-list">
        ${columnTasks.map(createTaskHtml).join("")}
      </div>
    `;

    board.appendChild(columnElement);
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", handleTaskAction);
  });
}

function createTaskHtml(task) {
  return `
    <div class="task">
      <h4>${escapeHtml(task.title)}</h4>
      <p>${escapeHtml(task.description || "No description")}</p>
      <div class="task-actions">
        ${getMoveButtons(task)}
        <button class="delete-btn" data-action="delete" data-id="${task.id}">Delete</button>
      </div>
    </div>
  `;
}

function getMoveButtons(task) {
  const index = columns.findIndex((column) => column.id === task.column);
  let html = "";

  if (index > 0) {
    html += `<button data-action="move" data-direction="-1" data-id="${task.id}">←</button>`;
  }

  if (index < columns.length - 1) {
    html += `<button data-action="move" data-direction="1" data-id="${task.id}">→</button>`;
  }

  return html;
}

function handleTaskAction(event) {
  const button = event.currentTarget;
  const id = Number(button.dataset.id);

  if (button.dataset.action === "delete") {
    tasks = tasks.filter((task) => task.id !== id);
  }

  if (button.dataset.action === "move") {
    moveTask(id, Number(button.dataset.direction));
  }

  saveTasks();
  renderBoard();
}

function moveTask(id, direction) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;

  const currentIndex = columns.findIndex((column) => column.id === task.column);
  const nextIndex = currentIndex + direction;

  if (nextIndex >= 0 && nextIndex < columns.length) {
    task.column = columns[nextIndex].id;
  }
}

function openModal() {
  taskModal.classList.remove("hidden");
  document.getElementById("taskTitle").focus();
}

function closeModal() {
  taskModal.classList.add("hidden");
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDescription").value = "";
  document.getElementById("taskColumn").value = "todo";
}

function addTask() {
  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const column = document.getElementById("taskColumn").value;

  if (!title) {
    alert("Please enter a task title.");
    return;
  }

  tasks.push({
    id: Date.now(),
    title,
    description,
    column
  });

  saveTasks();
  closeModal();
  renderBoard();
}

function saveTasks() {
  localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

showApp();
