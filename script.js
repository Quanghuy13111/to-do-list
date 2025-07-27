function addTodo() {
  const input = document.getElementById('todo-input');
  const value = input.value.trim();
  if (value === '') return;

  const li = document.createElement('li');
  li.className = 'list-group-item d-flex justify-content-between align-items-center';

  li.innerHTML = `
    <span onclick="toggleComplete(this)" style="cursor:pointer;">
      <i class="bi bi-check-circle me-2 text-success"></i>${value}
    </span>
    <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="removeTodo(this)">
      <i class="bi bi-trash"></i>
    </button>
  `;

  document.getElementById('todo-list').appendChild(li);
  input.value = '';
}

function toggleComplete(span) {
  span.classList.toggle('completed');
}

function removeTodo(btn) {
  btn.parentElement.remove();
}

document.getElementById("todo-input").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      addTodo();
    }
  });