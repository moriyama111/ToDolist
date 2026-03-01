const prioritySelect = document.getElementById('todo-priority');
const taskInput = document.getElementById('todo-input');
const dateInput = document.getElementById('todo-date');
const addBtn = document.getElementById('add-btn');
const clearBtn = document.getElementById('clear-btn');
const todoList = document.getElementById('todo-list');

// 初期読み込み
let todos = JSON.parse(localStorage.getItem('todoData')) || [];

window.addEventListener('load', () => {
    renderTodos();
    const draft = JSON.parse(localStorage.getItem('todoDraft'));
    if (draft) {
        prioritySelect.value = draft.priority || "";
        taskInput.value = draft.text || "";
        dateInput.value = draft.date || "";
    }
});

function saveToLocalStorage() {
    localStorage.setItem('todoData', JSON.stringify(todos));
}

function saveDraft() {
    const draft = {
        priority: prioritySelect.value,
        text: taskInput.value,
        date: dateInput.value
    };
    localStorage.setItem('todoDraft', JSON.stringify(draft));
}

[prioritySelect, taskInput, dateInput].forEach(el => {
    el.addEventListener('input', saveDraft);
});

// --- 新規追加：過去日付チェック関数 ---
function isPastDate(dateStr) {
    if (!dateStr) return false;
    const selectedDate = new Date(dateStr);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today;
}

function renderTodos() {
    todos.sort((a, b) => {
        const pA = a.priority === "" ? 999 : parseInt(a.priority);
        const pB = b.priority === "" ? 999 : parseInt(b.priority);
        if (pA !== pB) return pA - pB;
        const dA = a.date === "" ? "9999-12-31" : a.date;
        const dB = b.date === "" ? "9999-12-31" : b.date;
        return dA.localeCompare(dB);
    });

    todoList.innerHTML = "";
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        if (todo.completed) li.classList.add('completed');

        const priorityEl = document.createElement('div');
        priorityEl.className = 'priority-display';
        priorityEl.innerText = todo.priority ? `${todo.priority}.` : "-";
        priorityEl.onclick = (e) => { e.stopPropagation(); editPriority(index); };

        const contentWrap = document.createElement('div');
        contentWrap.className = 'todo-content';
        contentWrap.onclick = () => toggleComplete(index);

        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        textSpan.innerText = todo.text;

        const dateSpan = document.createElement('span');
        dateSpan.className = 'todo-date';
        dateSpan.innerText = todo.date ? `期限: ${todo.date}` : "期限なし";
        dateSpan.onclick = (e) => { e.stopPropagation(); editDate(index); };

        contentWrap.appendChild(textSpan);
        contentWrap.appendChild(dateSpan);

        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.innerText = '削除';
        delBtn.onclick = (e) => { e.stopPropagation(); deleteTask(index); };

        li.appendChild(priorityEl);
        li.appendChild(contentWrap);
        li.appendChild(delBtn);
        todoList.appendChild(li);
    });

    saveToLocalStorage();
}

function addTask() {
    const text = taskInput.value.trim();
    const dateValue = dateInput.value;
    
    if (text === "") { alert("「やること」を入力してください。"); return; }
    
    // 過去日付チェック
    if (isPastDate(dateValue)) {
        if (!confirm("期限が過去の日付に設定されています。このまま追加しますか？")) {
            return;
        }
    }
    
    todos.push({
        priority: prioritySelect.value,
        text: text,
        date: dateValue,
        completed: false
    });

    renderTodos();
    taskInput.value = ""; 
    dateInput.value = ""; 
    prioritySelect.value = "";
    localStorage.removeItem('todoDraft');
    taskInput.focus();
}

function editPriority(index) {
    const newPriority = prompt("優先度を入力してください (1-9、空欄で解除)", todos[index].priority);
    if (newPriority === null) return;
    if (newPriority === "" || (newPriority >= 1 && newPriority <= 9)) {
        todos[index].priority = newPriority;
        renderTodos();
    } else {
        alert("1から9の数字を入力してください。");
    }
}

function editDate(index) {
    const newDate = prompt("期限をYYYY-MM-DD形式で入力してください (空欄で解除)", todos[index].date);
    if (newDate === null) return;
    
    // 編集時も過去日付チェック
    if (isPastDate(newDate)) {
        if (!confirm("期限が過去の日付です。よろしいですか？")) {
            return;
        }
    }
    
    todos[index].date = newDate;
    renderTodos();
}

function toggleComplete(index) { todos[index].completed = !todos[index].completed; renderTodos(); }
function deleteTask(index) { todos.splice(index, 1); renderTodos(); }

clearBtn.onclick = () => {
    if (todos.length > 0 && confirm("すべて削除しますか？")) { todos = []; renderTodos(); }
};

addBtn.onclick = addTask;
taskInput.onkeypress = (e) => { if (e.key === 'Enter') addTask(); };