let todos = JSON.parse(localStorage.getItem("todos")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];
let editIndex = null;

/* ==== Helpers ==== */
function saveTodos() { localStorage.setItem("todos", JSON.stringify(todos)); }
function saveHistory() { localStorage.setItem("history", JSON.stringify(history)); }

/* ==== Cleanup history >14 ngày ==== */
function cleanupHistory() {
  const now = new Date();
  history = history.filter(it => {
    const d = new Date(it.time);
    return !isNaN(d) && (now - d) / (1000*60*60*24) <= 14;
  });
  saveHistory();
}

/* ==== Render todos ==== */
function renderTodos() {
  const todoList = document.getElementById("todo-list");
  const doneList = document.getElementById("completed-list");
  todoList.innerHTML = doneList.innerHTML = "";

  todos.forEach((todo, idx) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center todo-item";
    li.dataset.index = idx;

    let badge = "";
    if (todo.deadline) {
      const now = new Date(), d = new Date(todo.deadline);
      const diff = (d - now) / (1000*60*60*24);
      if (diff < 0) badge = `<span class="badge bg-danger ms-2">Quá hạn!</span>`;
      else if (diff <= 2) badge = `<span class="badge bg-warning ms-2">Sắp đến hạn</span>`;
      else badge = `<span class="badge bg-info ms-2">${todo.deadline}</span>`;
    }

    li.innerHTML = `
      <span class="${todo.completed ? "completed" : ""}">
        ${todo.text} ${badge}
      </span>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-primary" onclick="editTodo(${idx})">✏️</button>
        <button class="btn btn-sm btn-outline-success" onclick="toggleComplete(${idx})">
          ${todo.completed ? "❎" : "✔️"}
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="removeTodo(this)">🗑️</button>
      </div>
    `;
    (todo.completed ? doneList : todoList).appendChild(li);
  });

  updateCount();
  saveTodos();
}

/* ==== History ==== */
function addHistory(action, text, data = null) {
  if(action === "Xoá"){
    history.unshift({action, text, data, time:new Date().toISOString()});
    if(history.length>30) history.pop();
    saveHistory();
    renderHistory();
  }
}
function renderHistory() {
  const list = document.getElementById("history-list");
  list.innerHTML = "";
  history.forEach((item, idx) => {
    if(item.action==="Xoá"){
      const li = document.createElement("li");
      li.className="list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <div>
          <strong>[${item.action}]</strong> ${item.text}<br>
          <small>${new Date(item.time).toLocaleString("vi-VN")}</small>
        </div>
        ${item.data ? `<button class="btn btn-sm btn-outline-secondary" onclick="restoreFromHistory(${idx})">↩️</button>` : ""}
      `;
      list.appendChild(li);
    }
  });
}
function restoreFromHistory(idx){
  const it = history[idx];
  if(it && it.data){
    todos.push(it.data);
    renderTodos();
  }
}

/* ==== CRUD ==== */
function addTodo() {
  const txt = document.getElementById("todo-input");
  const dl = document.getElementById("todo-deadline");
  const v = txt.value.trim(), deadline = dl.value;
  if(!v) return;
  todos.push({text:v, completed:false, deadline});
  txt.value=""; dl.value="";
  renderTodos();
}

function toggleComplete(i){
  todos[i].completed = !todos[i].completed;
  renderTodos();
}

function editTodo(i){
  editIndex = i;
  document.getElementById("edit-text").value = todos[i].text;
  document.getElementById("edit-deadline").value = todos[i].deadline || "";
  new bootstrap.Modal(document.getElementById("editModal")).show();
}

function saveEdit(){
  if(editIndex===null) return;
  const t = document.getElementById("edit-text").value.trim();
  const d = document.getElementById("edit-deadline").value;
  if(!t) return;
  todos[editIndex].text = t;
  todos[editIndex].deadline = d;
  renderTodos();
  bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
  editIndex = null;
}

function removeTodo(btn){
  const li = btn.closest("li");
  const idx = parseInt(li.dataset.index,10);
  li.classList.add("todo-remove");
  li.addEventListener("animationend", ()=>{
    addHistory("Xoá", todos[idx].text, todos[idx]);
    todos.splice(idx,1);
    renderTodos();
  }, {once:true});
}

function clearAll(){
  if(confirm("Bạn có chắc muốn xoá tất cả?")){
    todos = [];
    renderTodos();
  }
}

/* ==== Misc ==== */
function updateCount(){
  const c = todos.filter(t=>!t.completed).length;
  document.getElementById("remaining-count").textContent = `Còn ${c} việc chưa làm`;
}

function toggleDarkMode(){
  document.body.classList.toggle("dark-mode");
  document.getElementById("theme-toggle").textContent =
    document.body.classList.contains("dark-mode")?"☀":"🌙";
  localStorage.setItem("theme",document.body.classList.contains("dark-mode")?"dark":"light");
}

/* ==== Init ==== */
window.onload = ()=>{
  if(localStorage.getItem("theme")==="dark"){
    document.body.classList.add("dark-mode");
    document.getElementById("theme-toggle").textContent="☀";
  }
  setTimeout(()=>document.body.classList.remove("no-transition"),50);
  cleanupHistory();
  renderTodos();
  renderHistory();
};

document.getElementById("todo-input").addEventListener("keydown",(e)=>{
  if(e.key==="Enter") addTodo();
});
