let todos = JSON.parse(localStorage.getItem("todos")) || [];

function renderTodos() {
  const todoList = document.getElementById("todo-list");
  const completedList = document.getElementById("completed-list");

  todoList.innerHTML = "";
  completedList.innerHTML = "";

  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    li.innerHTML = `
      <span class="${todo.completed ? 'completed' : ''}">
        ${todo.text}
      </span>
      <div>
        <button class="btn btn-sm btn-outline-success me-1" onclick="toggleComplete(${index})">✔️</button>
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


function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  
  const icon = document.getElementById("theme-toggle");
  const isDark = document.body.classList.contains("dark-mode");
  icon.innerText = isDark ? "☀️" : "🌙";
}


function addTodo() {
  const input = document.getElementById("todo-input");
  const value = input.value.trim();
  if (value === "") return;
  todos.push({ text: value, completed: false });
  input.value = "";
  renderTodos();
}

function toggleComplete(index) {
  todos[index].completed = !todos[index].completed;
  renderTodos();
}



function removeTodo(index) {
  todos.splice(index, 1);
  renderTodos();
}

function clearAll() {
  if (confirm("Bạn có chắc muốn xoá tất cả?")) {
    todos = [];
    renderTodos();
  }
}

function updateCount() {
  const count = todos.filter(t => !t.completed).length;
  document.getElementById("remaining-count").innerText = `Còn ${count} việc chưa làm`;
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

document.getElementById("todo-input").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTodo();
  }
});

renderTodos();
