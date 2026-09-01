const STORAGE_KEY = "todo-app-items";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const countEl = document.getElementById("count");
const emptyEl = document.getElementById("empty-state");
const clearBtn = document.getElementById("clear-completed");
const filterBtns = document.querySelectorAll(".filter");

let todos = loadTodos();
let filter = "all";

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  todos.unshift({
    id: crypto.randomUUID(),
    text,
    done: false,
  });
  input.value = "";
  persistAndRender();
});

list.addEventListener("change", (event) => {
  const checkbox = event.target.closest('input[type="checkbox"]');
  if (!checkbox) return;
  const item = todos.find((todo) => todo.id === checkbox.dataset.id);
  if (!item) return;
  item.done = checkbox.checked;
  persistAndRender();
});

list.addEventListener("click", (event) => {
  const button = event.target.closest(".btn-delete");
  if (!button) return;
  todos = todos.filter((todo) => todo.id !== button.dataset.id);
  persistAndRender();
});

filterBtns.forEach((button) => {
  button.addEventListener("click", () => {
    filter = button.dataset.filter;
    filterBtns.forEach((btn) => btn.classList.toggle("is-active", btn === button));
    render();
  });
});

clearBtn.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.done);
  persistAndRender();
});

function persistAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  render();
}

function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function visibleTodos() {
  if (filter === "active") return todos.filter((todo) => !todo.done);
  if (filter === "completed") return todos.filter((todo) => todo.done);
  return todos;
}

function render() {
  const items = visibleTodos();
  const remaining = todos.filter((todo) => !todo.done).length;

  countEl.textContent = `${remaining} 项未完成`;
  emptyEl.hidden = items.length > 0;

  list.innerHTML = items
    .map(
      (todo) => `
      <li class="todo-item${todo.done ? " is-done" : ""}">
        <input type="checkbox" data-id="${todo.id}" ${todo.done ? "checked" : ""} aria-label="完成任务" />
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button type="button" class="btn-delete" data-id="${todo.id}" aria-label="删除任务">×</button>
      </li>
    `
    )
    .join("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

render();
