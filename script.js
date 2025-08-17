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
} //add to do



function removeTodo(index) {
  todos.splice(index, 1);
  renderTodos();
} //xóa todo

function clearAll() {
  if (confirm("Bạn có chắc muốn xoá tất cả?")) {
    todos = [];
    renderTodos();
  }
} // xóa hết

function updateCount() {
  const count = todos.filter(t => !t.completed).length;
  document.getElementById("remaining-count").innerText = `Còn ${count} việc chưa làm`;
}

function toggleDarkMode() {
    // Fade out trước
    document.body.classList.add('fade-transition');
    
    setTimeout(() => {
        document.body.classList.toggle('dark-mode');

        const btn = document.getElementById('theme-toggle');
        if (document.body.classList.contains('dark-mode')) {
            btn.textContent = '☀';
            localStorage.setItem('theme', 'dark');
        } else {
            btn.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        }

        // Fade in lại
        requestAnimationFrame(() => {
            document.body.classList.remove('fade-transition');
        });
    }, 200); // thời gian fade out
}

window.onload = function() {
    const savedTheme = localStorage.getItem('theme');
    const btn = document.getElementById('theme-toggle');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        btn.textContent = '☀';
    } else {
        btn.textContent = '🌙';
    }

    // Sau khi trang load xong 50ms, bật lại transition
    setTimeout(() => {
        document.body.classList.remove('no-transition');
    }, 50);
}; //đổi màu

// Khi đổi theme
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');

    const btn = document.getElementById('theme-toggle');
    if (document.body.classList.contains('dark-mode')) {
        btn.textContent = '☀';
        localStorage.setItem('theme', 'dark');
    } else {
        btn.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}// đổi theme


document.getElementById("todo-input").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTodo();
  }
});
// Tắt transition khi load lại (F5)
document.documentElement.classList.add("no-transition");

window.addEventListener("load", () => {
  setTimeout(() => {
    document.documentElement.classList.remove("no-transition");
  }, 50);
});

// Nút toggle theme
function toggleTheme() {
  document.documentElement.classList.toggle("dark-mode");
  if (document.documentElement.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}


  // Áp theme từ localStorage ngay khi load
  (function() {
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark-mode");
    }
  })();

  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark-mode");
  }


renderTodos();
