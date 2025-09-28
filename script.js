// ==== Data ====
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];
let editIndex = null;

// Helpers
function saveTodos(){ localStorage.setItem("todos", JSON.stringify(todos)); }
function saveHistory(){ localStorage.setItem("history", JSON.stringify(history)); }

// Create id for each todo (safe)
function generateId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function ensureIds(){
  let changed = false;
  todos.forEach(t => { if(!t.id){ t.id = generateId(); changed = true; } });
  if(changed) saveTodos();
}

// Cleanup history >14 ngày
function cleanupHistory(){
  const now = new Date();
  history = history.filter(it => (now - new Date(it.time))/(1000*60*60*24) <= 14);
  saveHistory();
}

// Render
function renderTodos(){
  const todoList = document.getElementById("todo-list");
  const doneList = document.getElementById("completed-list");
  todoList.innerHTML = doneList.innerHTML = "";

  const filter = document.getElementById("filter-todo") ? document.getElementById("filter-todo").value : "all";
  const search = document.getElementById("search-todo") ? document.getElementById("search-todo").value.toLowerCase() : "";

  todos.forEach((todo, idx) => {
    if (filter === "pending" && todo.completed) return;
    if (filter === "completed" && !todo.completed) return;
    if (search && !todo.text.toLowerCase().includes(search)) return;

    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center todo-item";
    li.dataset.id = todo.id;

    // tag + deadline small
    const tagHtml = todo.tag ? `<span class="badge ${todo.tag} ms-2">${todo.tag}</span>` : "";
    const deadlineHtml = todo.deadline ? `<small class="text-muted ms-2">${todo.deadline}</small>` : "";

    li.innerHTML = `
      <div>
        <span class="${todo.completed ? "text-decoration-line-through" : ""}">${escapeHtml(todo.text)}</span>
        ${tagHtml}
        ${deadlineHtml}
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-primary" onclick="editTodo(${idx})">✏️</button>
        <button class="btn btn-sm btn-outline-success" onclick="toggleComplete(${idx})">${todo.completed ? "❎" : "✔️"}</button>
        <button class="btn btn-sm btn-outline-danger" onclick="removeTodo(this)">🗑️</button>
      </div>
    `;

    (todo.completed ? doneList : todoList).appendChild(li);
  });

  updateCount();
  updateProgress();
  saveTodos();
  // renderHistory intentionally separate
}

function escapeHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// History
function addHistory(action, text, data=null){
  history.unshift({ action, text, data, time: new Date().toISOString() });
  if(history.length>30) history.pop();
  saveHistory();
}
function renderHistory(){
  const list = document.getElementById("history-list");
  if(!list) return;
  list.innerHTML = "";
  history.forEach((item, idx)=>{
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <div><strong>[${item.action}]</strong> ${escapeHtml(item.text)}<br><small>${new Date(item.time).toLocaleString()}</small></div>
      ${item.data ? `<button class="btn btn-sm btn-outline-secondary" onclick="restoreFromHistory(${idx})">↩️</button>` : ""}
    `;
    list.appendChild(li);
  });
}
function restoreFromHistory(idx){
  const it = history[idx];
  if(it && it.data){
    const restored = Object.assign({}, it.data, { id: generateId() });
    todos.push(restored);
    saveTodos();
    renderTodos();
  }
}

// CRUD
function addTodo(){
  const txt = document.getElementById("todo-input");
  const dl = document.getElementById("todo-deadline");
  const tg = document.getElementById("todo-tag");
  const v = txt.value.trim();
  if(!v) return;
  const newTodo = {
    id: generateId(),
    text: v,
    completed: false,
    deadline: dl ? dl.value : "",
    tag: tg ? tg.value : "default"
  };
  todos.push(newTodo);
  txt.value = "";
  if(dl) dl.value = "";
  if(tg) tg.value = "default";
  renderTodos();
  showToast("Đã thêm công việc");
}

function toggleComplete(i){
  if(typeof todos[i] === "undefined") return;
  todos[i].completed = !todos[i].completed;
  renderTodos();
}

function editTodo(i){
  if(typeof todos[i] === "undefined") return;
  editIndex = i;
  document.getElementById("edit-text").value = todos[i].text || "";
  if(document.getElementById("edit-deadline")) document.getElementById("edit-deadline").value = todos[i].deadline || "";
  if(document.getElementById("edit-tag")) document.getElementById("edit-tag").value = todos[i].tag || "default";
  new bootstrap.Modal(document.getElementById("editModal")).show();
}

function saveEdit(){
  if(editIndex === null) return;
  const t = document.getElementById("edit-text").value.trim();
  if(!t) return;
  const d = document.getElementById("edit-deadline") ? document.getElementById("edit-deadline").value : "";
  const tg = document.getElementById("edit-tag") ? document.getElementById("edit-tag").value : "default";
  todos[editIndex].text = t;
  todos[editIndex].deadline = d;
  todos[editIndex].tag = tg;
  saveTodos();
  renderTodos();
  const modal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
  if(modal) modal.hide();
  showToast("Đã lưu thay đổi");
  editIndex = null;
}

// ===== FIXED removeTodo: xóa ngay, không dùng animation =====
function removeTodo(btn){
  const li = btn.closest("li");
  if(!li) return;
  const id = li.dataset.id;
  const idx = todos.findIndex(t => String(t.id) === String(id));
  if(idx === -1) return;
  // add to history before removing
  addHistory("Xoá", todos[idx].text, Object.assign({}, todos[idx]));
  todos.splice(idx,1);
  saveTodos();
  renderTodos();
  showToast("Đã xoá");
}

// Clear all
function clearAll(){
  if(confirm("Bạn có chắc muốn xoá tất cả?")){
    todos = [];
    saveTodos();
    renderTodos();
    showToast("Đã xoá tất cả");
  }
}

// Misc
function updateCount(){
  const c = todos.filter(t => !t.completed).length;
  const el = document.getElementById("remaining-count");
  if(el) el.textContent = `Còn ${c} việc chưa làm`;
}
function updateProgress(){
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const percent = total ? Math.round((completed/total)*100) : 0;
  const bar = document.getElementById("progress-bar");
  const txt = document.getElementById("progress-text");
  if(bar){ bar.style.width = percent + "%"; bar.textContent = percent + "%"; }
  if(txt) txt.textContent = `Tiến độ: ${completed}/${total} công việc (${percent}%)`;
}

// Toast helper
function showToast(msg){
  const toastEl = document.getElementById("liveToast");
  if(!toastEl) return;
  document.getElementById("toast-msg").textContent = msg;
  const bs = new bootstrap.Toast(toastEl);
  bs.show();
}

// Theme: setTheme + applyTheme
function setTheme(mode){
  // mode: 'light' | 'clear' | 'dark'
  document.body.classList.remove("light-mode","clear-mode","dark-mode");
  if(mode === "light"){ document.body.classList.add("light-mode"); localStorage.setItem("theme","light"); }
  else if(mode === "clear"){ document.body.classList.add("clear-mode"); localStorage.setItem("theme","clear"); }
  else if(mode === "dark"){ document.body.classList.add("dark-mode"); localStorage.setItem("theme","dark"); }
  // update modal backdrop (Bootstrap handles backdrop color but modal-content styles are in CSS)
  showToast(`Theme: ${mode}`);
}
function applyTheme(saved){
  if(!saved) saved = localStorage.getItem("theme") || "light";
  setTheme(saved);
}

// Deadlines (optional)
function checkDeadlines(){
  todos.forEach(todo=>{
    if(!todo.completed && todo.deadline){
      const diff = (new Date(todo.deadline) - new Date())/(1000*60*60*24);
      if(diff <= 2 && diff >= 0) showToast(`🕒 "${todo.text}" sắp đến hạn!`);
      else if(diff < 0) showToast(`⚠️ "${todo.text}" đã quá hạn!`);
    }
  });
}

// Drag & drop (optional): left out to keep simple

// Init
window.addEventListener("load", ()=> {
  ensureIds();
  cleanupHistory();
  const saved = localStorage.getItem("theme") || "light";
  applyTheme(saved);
  setTimeout(()=>document.body.classList.remove("no-transition"),50);
  renderTodos();
  renderHistory();
  checkDeadlines();
});

// Hotkey Enter on todo-input
document.addEventListener("keydown", (e)=>{
  const active = document.activeElement;
  if(!active) return;
  if(e.key === "Enter" && active.id === "todo-input"){
    e.preventDefault();
    addTodo();
  }
});
