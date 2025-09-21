let todos = JSON.parse(localStorage.getItem("todos")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];
let editIndex = null;

/* ==== Helpers ==== */
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}
function saveHistory() {
  localStorage.setItem("history", JSON.stringify(history));
}

/* ==== Cleanup history >14 ngày ==== */
function cleanupHistory() {
  const now = new Date();
  history = history.filter(item => {
    const d = new Date(item.time);
    return !isNaN(d) && (now - d) / (1000 * 60 * 60 * 24) <= 14;
  });
  saveHistory();
}

/* ==== Render Todos ==== */
function renderTodos() {
  const todoList = document.getElementById("todo-list");
  const completedList = document.getElementById("completed-list");
  todoList.innerHTML = completedList.innerHTML = "";

  todos.forEach((todo, i) => {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center todo-item";

    let deadlineHTML = "";
    if (todo.deadline) {
      const now = new Date(),
        d = new Date(todo.deadline);
      const diff = (d - now) / (1000 * 60 * 60 * 24);
      if (diff < 0)
        deadlineHTML = `<span class="badge bg-danger ms-2">Quá hạn!</span>`;
      else if (diff <= 2)
        deadlineHTML = `<span class="badge bg-warning ms-2">Sắp đến hạn</span>`;
      else
        deadlineHTML = `<span class="badge bg-info ms-2">${todo.deadline}</span>`;
    }

    li.innerHTML = `
      <span class="${todo.completed ? "completed" : ""}">
        ${todo.text} ${deadlineHTML}
      </span>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-primary" onclick="editTodo(${i})">✏️</button>
        <button class="btn btn-sm btn-outline-success" onclick="toggleComplete(${i})">
          ${todo.completed ? "❎" : "✔️"}
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="removeTodo(${i})">🗑️</button>
      </div>`;

    (todo.completed ? completedList : todoList).appendChild(li);
  });

  updateCount();
  saveTodos();
}

/* ==== History ==== */
function addHistory(action, text, data = null) {
  // chỉ lưu lịch sử khi action = "Xoá"
  if (action === "Xoá") {
    const time = new Date().toISOString(); // dùng ISO để cleanup đúng
    history.unshift({ action, text, data, time });
    if (history.length > 30) history.pop();
    saveHistory();
    renderHistory();
  }
}

function renderHistory() {
  const list = document.getElementById("history-list");
  if (!list) return;
  list.innerHTML = "";

  history.forEach((item, idx) => {
    if (item.action === "Xoá") {
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <div>
          <strong>[${item.action}]</strong> ${item.text}<br>
          <small>${new Date(item.time).toLocaleString("vi-VN")}</small>
        </div>
        ${
          item.data
            ? `<button class="btn btn-sm btn-outline-secondary" onclick="restoreFromHistory(${idx})">↩️</button>`
            : ""
        }
      `;
      list.appendChild(li);
    }
  });
}

function restoreFromHistory(idx) {
  const it = history[idx];
  if (it && it.data) {
    todos.push(it.data);
    renderTodos();
    // Không ghi "Khôi phục" vào history vì chỉ lưu Xoá
  }
}

/* ==== CRUD ==== */
function addTodo() {
  const txt = document.getElementById("todo-input");
  const dl = document.getElementById("todo-deadline");
  const v = txt.value.trim(),
    deadline = dl.value;
  if (!v) return;
  const todo = { text: v, completed: false, deadline };
  todos.push(todo);
  txt.value = "";
  dl.value = "";
  renderTodos();
}

function toggleComplete(i) {
  todos[i].completed = !todos[i].completed;
  renderTodos();
}

function editTodo(i) {
  editIndex = i;
  document.getElementById("edit-text").value = todos[i].text;
  document.getElementById("edit-deadline").value = todos[i].deadline || "";
  new bootstrap.Modal("#editModal").show();
}

function saveEdit() {
  if (editIndex === null) return;
  const t = document.getElementById("edit-text").value.trim();
  const d = document.getElementById("edit-deadline").value;
  if (!t) return;
  todos[editIndex].text = t;
  todos[editIndex].deadline = d;
  renderTodos();
  bootstrap.Modal.getInstance(
    document.getElementById("editModal")
  ).hide();
  editIndex = null;
}

function removeTodo(index) {
  const li = document.querySelectorAll("#todo-list li, #completed-list li")[index];
  if (li) {
    li.classList.add("todo-remove");
    li.addEventListener("animationend", () => {
      addHistory("Xoá", todos[index].text, todos[index]);
      todos.splice(index, 1);
      renderTodos();
    });
  }
}

function clearAll() {
  if (confirm("Bạn có chắc muốn xoá tất cả?")) {
    todos = [];
    renderTodos();
    // không ghi "Xoá tất cả" vào history vì chỉ lưu Xoá từng item
  }
}

/* ==== Misc ==== */
function updateCount() {
  const c = todos.filter(t => !t.completed).length;
  document.getElementById(
    "remaining-count"
  ).textContent = `Còn ${c} việc chưa làm`;
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const b = document.getElementById("theme-toggle");
  b.textContent = document.body.classList.contains("dark-mode") ? "☀" : "🌙";
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark-mode") ? "dark" : "light"
  );
}

/* ==== Init ==== */
window.onload = () => {
  const th = localStorage.getItem("theme");
  if (th === "dark") {
    document.body.classList.add("dark-mode");
    document.getElementById("theme-toggle").textContent = "☀";
  }
  setTimeout(() => document.body.classList.remove("no-transition"), 50);
  cleanupHistory();
  renderTodos();
  renderHistory();
};

document
  .getElementById("todo-input")
  .addEventListener("keydown", e => {
    if (e.key === "Enter") addTodo();
  });
