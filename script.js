// ==== Data ====
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];
let editIndex = null;

// ==== Helpers ====
function saveTodos() { localStorage.setItem("todos", JSON.stringify(todos)); }
function saveHistory() { localStorage.setItem("history", JSON.stringify(history)); }

// Cleanup history >14 ngày
function cleanupHistory() {
  const now = new Date();
  history = history.filter(it => {
    const d = new Date(it.time);
    return !isNaN(d) && (now - d) / (1000*60*60*24) <= 14;
  });
  saveHistory();
}

// ==== Render ====
function renderTodos() {
  const todoList = document.getElementById("todo-list");
  const doneList = document.getElementById("completed-list");
  todoList.innerHTML = doneList.innerHTML = "";

  let filter = document.getElementById("filter-todo").value;
  let search = document.getElementById("search-todo").value.toLowerCase();

  todos.forEach((todo, idx) => {
    if ((filter === "pending" && todo.completed) || (filter === "completed" && !todo.completed)) return;
    if (search && !todo.text.toLowerCase().includes(search)) return;

    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center todo-item";
    li.dataset.index = idx;

    // Deadline badge
    let badge = "";
    if (todo.deadline) {
      const now = new Date(), d = new Date(todo.deadline);
      const diff = (d-now)/(1000*60*60*24);
      if (diff < 0) badge = `<span class="badge bg-danger ms-2">Quá hạn!</span>`;
      else if (diff <= 2) badge = `<span class="badge bg-warning ms-2">Sắp đến hạn</span>`;
      else badge = `<span class="badge bg-info ms-2">${todo.deadline}</span>`;
    }

    // Tag
    let tagClass = todo.tag || "default";

    li.innerHTML = `
      <span class="${todo.completed ? "completed" : ""}">
        ${todo.text} <span class="badge ${tagClass}">${todo.tag}</span> ${badge}
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
  updateProgress();
  saveTodos();
  initDragDrop();
}

// ==== History (log xoá) ====
function addHistory(action, text, data=null) {
  if (action === "Xoá") {
    history.unshift({ action, text, data, time: new Date().toISOString() });
    if (history.length>30) history.pop();
    saveHistory();
    renderHistory();
  }
}
function renderHistory() {
  const list = document.getElementById("history-list");
  list.innerHTML = "";
  history.forEach((item, idx)=>{
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
function restoreFromHistory(idx) {
  const it = history[idx];
  if(it && it.data){
    todos.push(it.data);
    renderTodos();
  }
}

// ==== CRUD ====
function addTodo(){
  const txt=document.getElementById("todo-input");
  const dl=document.getElementById("todo-deadline");
  const tg=document.getElementById("todo-tag");
  const v=txt.value.trim(), deadline=dl.value, tag=tg.value;
  if(!v) return;
  todos.push({text:v, completed:false, deadline, tag});
  txt.value=""; dl.value=""; tg.value="default";
  renderTodos();
}

function toggleComplete(i){
  todos[i].completed = !todos[i].completed;
  renderTodos();
}

function editTodo(i){
  editIndex=i;
  document.getElementById("edit-text").value=todos[i].text;
  document.getElementById("edit-deadline").value=todos[i].deadline||"";
  document.getElementById("edit-tag").value=todos[i].tag||"default";
  new bootstrap.Modal("#editModal").show();
}

function saveEdit(){
  if(editIndex===null) return;
  const t=document.getElementById("edit-text").value.trim();
  const d=document.getElementById("edit-deadline").value;
  const tg=document.getElementById("edit-tag").value;
  if(!t) return;
  todos[editIndex].text=t;
  todos[editIndex].deadline=d;
  todos[editIndex].tag=tg;
  renderTodos();
  bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
  editIndex=null;
}

function removeTodo(btn){
  const li=btn.closest("li");
  const idx=parseInt(li.dataset.index,10);
  li.classList.add("todo-remove");
  li.addEventListener("animationend", ()=>{
    addHistory("Xoá", todos[idx].text, todos[idx]);
    todos.splice(idx,1);
    renderTodos();
  }, {once:true});
}

function clearAll(){
  if(confirm("Bạn có chắc muốn xoá tất cả?")){
    todos=[];
    renderTodos();
  }
}

// ==== Misc ====
function updateCount(){
  const c = todos.filter(t=>!t.completed).length;
  document.getElementById("remaining-count").textContent = `Còn ${c} việc chưa làm`;
}
function updateProgress(){
  const total = todos.length;
  const completed = todos.filter(t=>t.completed).length;
  const percent = total ? Math.round((completed/total)*100) : 0;

  const bar = document.getElementById("progress-bar");
  bar.style.width = percent+"%";
  bar.textContent = percent+"%";

  const text = document.getElementById("progress-text");
  text.textContent = `Tiến độ: ${percent}% công việc`;
}


// ==== Theme ====
function setTheme(mode) {
  document.body.classList.remove("dark-mode", "glass-mode");

  if (mode === "light") {
    localStorage.setItem("theme", "light");
    document.getElementById("theme-toggle").textContent = "☀";
  } else if (mode === "dark") {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
    document.getElementById("theme-toggle").textContent = "🌙";
  } else if (mode === "clear") {
    let current = localStorage.getItem("theme") || "light";
    if (current.includes("dark")) {
      document.body.classList.add("dark-mode", "glass-mode");
      localStorage.setItem("theme", "dark-clear");
      document.getElementById("theme-toggle").textContent = "✨";
    } else {
      document.body.classList.add("glass-mode");
      localStorage.setItem("theme", "light-clear");
      document.getElementById("theme-toggle").textContent = "✨";
    }
  }
}
function applyTheme(savedTheme) {
  document.body.classList.remove("dark-mode", "glass-mode");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    document.getElementById("theme-toggle").textContent = "🌙";
  } else if (savedTheme === "dark-clear") {
    document.body.classList.add("dark-mode","glass-mode");
    document.getElementById("theme-toggle").textContent = "✨";
  } else if (savedTheme === "light-clear") {
    document.body.classList.add("glass-mode");
    document.getElementById("theme-toggle").textContent = "✨";
  } else {
    document.getElementById("theme-toggle").textContent = "☀";
  }
}

// ==== Toast + Deadline ====
function showToast(msg){
  const toastEl = document.getElementById("deadline-toast");
  document.getElementById("toast-message").textContent = msg;
  const bsToast = new bootstrap.Toast(toastEl);
  bsToast.show();
}
function checkDeadlines(){
  todos.forEach(todo=>{
    if(!todo.completed && todo.deadline){
      const diff = (new Date(todo.deadline)-new Date())/(1000*60*60*24);
      if(diff<=2 && diff>=0) showToast(`🕒 "${todo.text}" sắp đến hạn!`);
      if(diff<0) showToast(`⚠️ "${todo.text}" đã quá hạn!`);
    }
  });
}
setInterval(checkDeadlines, 60*1000);

// ==== DragDrop ====
function initDragDrop(){
  const lists = [document.getElementById("todo-list"), document.getElementById("completed-list")];
  lists.forEach(list=>{
    list.querySelectorAll("li").forEach(li=>{
      li.setAttribute("draggable", true);
      li.ondragstart = e => { e.dataTransfer.setData("text/plain", li.dataset.index); };
      li.ondragover = e => { e.preventDefault(); };
      li.ondrop = e => {
        e.preventDefault();
        const srcIdx = parseInt(e.dataTransfer.getData("text/plain"),10);
        const tgtIdx = parseInt(li.dataset.index,10);
        const temp = todos[srcIdx];
        todos.splice(srcIdx,1);
        todos.splice(tgtIdx,0,temp);
        renderTodos();
      };
    });
  });
}

// ==== Init ====
window.onload = ()=>{
  let savedTheme = localStorage.getItem("theme");
  if (!savedTheme) {
    const hour = new Date().getHours();
    savedTheme = (hour >= 18 || hour < 6) ? "dark" : "light";
    localStorage.setItem("theme", savedTheme);
  }
  applyTheme(savedTheme);

  setTimeout(()=>document.body.classList.remove("no-transition"),50);
  cleanupHistory();
  renderTodos();
  renderHistory();
  checkDeadlines();
};
// ==== Hotkey Enter để thêm nhanh ====
document.getElementById("todo-input").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    addTodo();
  }
});
