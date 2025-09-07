let todos = JSON.parse(localStorage.getItem("todos")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];
let editIndex = null;

// Render danh sách
function renderTodos() {
  const todoList = document.getElementById("todo-list");
  const completedList = document.getElementById("completed-list");

  todoList.innerHTML = "";
  completedList.innerHTML = "";

  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    // deadline
    let deadlineHTML = "";
    if (todo.deadline) {
      const now = new Date();
      const deadlineDate = new Date(todo.deadline);
      const diff = (deadlineDate - now) / (1000 * 60 * 60 * 24);

      if (diff < 0) {
        deadlineHTML = `<span class="badge bg-danger ms-2">Quá hạn!</span>`;
      } else if (diff <= 2) {
        deadlineHTML = `<span class="badge bg-warning ms-2">Sắp đến hạn</span>`;
      } else {
        deadlineHTML = `<span class="badge bg-info ms-2">${todo.deadline}</span>`;
      }
    }

    li.innerHTML = `
      <span class="${todo.completed ? 'completed' : ''}">
        ${todo.text} ${deadlineHTML}
      </span>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-primary" onclick="editTodo(${index})">✏️</button>
        <button class="btn btn-sm btn-outline-success" onclick="toggleComplete(${index})">✔️</button>
        <button class="btn btn-sm btn-outline-danger" onclick="removeTodo(${index})">🗑️</button>
      </div>
    `;

    if (todo.completed) {
      completedList.appendChild(li);
    } else {
      todoList.appendChild(li);
    }
  });

  updateCount();
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Render lịch sử
function renderHistory() {
  const historyList = document.getElementById("history-list");
  if (!historyList) return;
  historyList.innerHTML = "";

  history.forEach((item, index) => {
    // chỉ giữ Thêm và Xoá
    if (item.action === "Thêm" || item.action === "Xoá") {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";

      li.innerHTML = `
        <div>
          <strong>[${item.action}]</strong> ${item.text} 
          <br><small>${item.time}</small>
        </div>
        ${item.action === "Xoá" && item.data 
          ? `<button class="btn btn-sm btn-outline-secondary" onclick="restoreFromHistory(${index})">↩️</button>` 
          : ""}
      `;

      historyList.appendChild(li);
    }
  });
}

// Ghi lịch sử
function addHistory(action, text, data = null) {
  const time = new Date().toLocaleString("vi-VN");
  history.unshift({ action, text, data, time });
  if (history.length > 20) history.pop();
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

// Khôi phục từ lịch sử
function restoreFromHistory(index) {
  const item = history[index];
  if (item && item.data) {
    todos.push(item.data);
    renderTodos();
    addHistory("Khôi phục", item.text);
  }
}

// Thêm việc
function addTodo() {
  const input = document.getElementById("todo-input");
  const deadlineInput = document.getElementById("todo-deadline");
  const value = input.value.trim();
  const deadline = deadlineInput ? deadlineInput.value : "";

  if (value === "") return;

  const newTodo = { text: value, completed: false, deadline: deadline };
  todos.push(newTodo);
  addHistory("Thêm", value, newTodo);

  input.value = "";
  if (deadlineInput) deadlineInput.value = "";
  renderTodos();
}

// Hoàn thành
function toggleComplete(index) {
  todos[index].completed = !todos[index].completed;
  renderTodos();
}

// Sửa (mở modal)
function editTodo(index) {
  editIndex = index;
  const todo = todos[index];

  document.getElementById("edit-text").value = todo.text;
  document.getElementById("edit-deadline").value = todo.deadline || "";

  const modal = new bootstrap.Modal(document.getElementById("editModal"));
  modal.show();
}

// Lưu chỉnh sửa
function saveEdit() {
  if (editIndex === null) return;

  const newText = document.getElementById("edit-text").value.trim();
  const newDeadline = document.getElementById("edit-deadline").value;

  if (newText === "") return;

  todos[editIndex].text = newText;
  todos[editIndex].deadline = newDeadline;

  addHistory("Sửa", `${newText}`, { ...todos[editIndex] });
  renderTodos();

  const modalEl = document.getElementById("editModal");
  const modal = bootstrap.Modal.getInstance(modalEl);
  modal.hide();

  editIndex = null;
}

// Xóa 1 việc
function removeTodo(index) {
  addHistory("Xoá", todos[index].text, todos[index]);
  todos.splice(index, 1);
  renderTodos();
}

// Xóa hết
function clearAll() {
  if (confirm("Bạn có chắc muốn xoá tất cả?")) {
    todos.forEach(t => addHistory("Xoá tất cả", t.text, t));
    todos = [];
    renderTodos();
  }
}

// Đếm việc còn lại
function updateCount() {
  const count = todos.filter(t => !t.completed).length;
  document.getElementById("remaining-count").innerText = `Còn ${count} việc chưa làm`;
}

// Đổi theme
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const btn = document.getElementById("theme-toggle");

  if (document.body.classList.contains("dark-mode")) {
    btn.textContent = "☀";
    localStorage.setItem("theme", "dark");
  } else {
    btn.textContent = "🌙";
    localStorage.setItem("theme", "light");
  }
}

// Load
window.onload = function() {
  const savedTheme = localStorage.getItem("theme");
  const btn = document.getElementById("theme-toggle");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    btn.textContent = "☀";
  } else {
    btn.textContent = "🌙";
  }

  setTimeout(() => {
    document.body.classList.remove("no-transition");
  }, 50);

  renderTodos();
  renderHistory();
};

// Enter để thêm
document.getElementById("todo-input").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTodo();
  }
});
