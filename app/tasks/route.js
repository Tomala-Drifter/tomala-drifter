/**
 * Reverse proxy for todo app running on Cloudflare Tunnel
 * Forwards requests to the local backend and returns the frontend
 */

export async function GET(request) {
  // This serves the todo app frontend (HTML)
  // The actual API calls are handled by the static HTML
  
  const html = `
<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Hermes Todo</title>
<style>
  :root {
    --bg: #0f1115;
    --card: #1a1d24;
    --accent: #6c8cff;
    --text: #e8e9ed;
    --muted: #8b8f9a;
    --danger: #ff5c5c;
    --done: #3ecf8e;
    --warn: #ffb347;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 20px;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .container {
    max-width: 800px;
    margin: 0 auto;
  }
  h1 {
    margin-top: 0;
    font-size: 2rem;
    font-weight: 700;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    gap: 10px;
  }
  label {
    font-weight: 600;
    font-size: 0.9rem;
  }
  input, textarea, select {
    padding: 10px;
    background: var(--card);
    border: 1px solid #333;
    color: var(--text);
    border-radius: 6px;
    font-family: inherit;
  }
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgba(108, 140, 255, 0.1);
  }
  button {
    padding: 10px 20px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  button:hover {
    background: #5a7fee;
  }
  .tasks-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .task-card {
    background: var(--card);
    border-left: 4px solid var(--accent);
    padding: 15px;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .task-card.done {
    opacity: 0.6;
    border-left-color: var(--done);
  }
  .task-info {
    flex: 1;
  }
  .task-title {
    font-weight: 600;
    margin-bottom: 5px;
  }
  .task-deadline {
    font-size: 0.85rem;
    color: var(--muted);
  }
  .task-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 8px;
  }
  .tag {
    display: inline-block;
    padding: 3px 8px;
    background: rgba(108, 140, 255, 0.2);
    color: var(--accent);
    border-radius: 3px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  .task-actions {
    display: flex;
    gap: 10px;
    margin-left: 15px;
  }
  button.small {
    padding: 6px 12px;
    font-size: 0.85rem;
  }
  .loading {
    text-align: center;
    padding: 40px;
    color: var(--muted);
  }
</style>
</head>
<body>
<div class="container">
  <h1>📋 My Tasks</h1>
  
  <div class="form-group">
    <label>Task Title</label>
    <input type="text" id="taskTitle" placeholder="e.g., Finish assignment">
  </div>
  
  <div class="form-group">
    <label>Description</label>
    <textarea id="taskNotes" placeholder="Details..." rows="3"></textarea>
  </div>
  
  <div class="form-group">
    <label>Deadline</label>
    <input type="datetime-local" id="taskDeadline">
  </div>
  
  <div class="form-group">
    <label>Tag</label>
    <select id="taskTag">
      <option value="">— Select tag —</option>
      <option value="studia">📚 Studia</option>
      <option value="rcc">🏢 RCC</option>
      <option value="prywatne">🔒 Prywatne</option>
      <option value="lambert">📰 Lambert</option>
      <option value="konsulting">💼 Konsulting</option>
      <option value="weegree">💳 Weegree</option>
      <option value="lightboys">💡 Lightboys</option>
      <option value="arkana">✨ Arkana</option>
      <option value="zdrowotne">🏃 Zdrowotne</option>
      <option value="angaż">⚡ Angaż</option>
      <option value="projekty">🛠️ Projekty</option>
      <option value="finanse">💰 Finanse</option>
    </select>
  </div>
  
  <button onclick="addTask()">Add Task</button>
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #333;">
  
  <h2 style="margin-top: 0;">Tasks</h2>
  <div id="tasksList" class="loading">Loading...</div>
</div>

<script>
const API_BASE = "/api/tasks";

async function loadTasks() {
  try {
    const response = await fetch(API_BASE);
    const tasks = await response.json();
    renderTasks(tasks);
  } catch (error) {
    document.getElementById("tasksList").innerHTML = '<p>Error loading tasks</p>';
  }
}

function renderTasks(tasks) {
  const list = document.getElementById("tasksList");
  if (!tasks.length) {
    list.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 40px;">No tasks yet</p>';
    return;
  }
  
  list.innerHTML = tasks.map(task => {
    const tags = JSON.parse(task.tags || '[]');
    const deadline = new Date(task.deadline).toLocaleDateString('pl-PL', { year: 'numeric', month: 'short', day: 'numeric' });
    return \`
      <div class="task-card \${task.status === 'done' ? 'done' : ''}">
        <div class="task-info">
          <div class="task-title">\${task.title}</div>
          <div class="task-deadline">\${task.deadline ? deadline : 'No deadline'}</div>
          \${tags.length ? \`<div class="task-tags">\${tags.map(t => \`<span class="tag">\${t}</span>\`).join('')}</div>\` : ''}
        </div>
        <div class="task-actions">
          <button class="small" onclick="toggleTask('\${task.id}', '\${task.status === 'done' ? 'todo' : 'done'}')">
            \${task.status === 'done' ? '↩️ Undo' : '✓ Done'}
          </button>
          <button class="small" style="background: var(--danger);" onclick="deleteTask('\${task.id}')">🗑️</button>
        </div>
      </div>
    \`;
  }).join('');
}

async function addTask() {
  const title = document.getElementById('taskTitle').value;
  const notes = document.getElementById('taskNotes').value;
  const deadline = document.getElementById('taskDeadline').value;
  const tag = document.getElementById('taskTag').value;
  
  if (!title) {
    alert('Please enter a task title');
    return;
  }
  
  const payload = {
    title,
    notes,
    deadline: deadline ? new Date(deadline).toISOString() : null,
    status: 'todo',
    tags: tag ? [tag] : []
  };
  
  try {
    await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskNotes').value = '';
    document.getElementById('taskDeadline').value = '';
    document.getElementById('taskTag').value = '';
    
    loadTasks();
  } catch (error) {
    alert('Error adding task');
  }
}

async function toggleTask(id, newStatus) {
  try {
    await fetch(\`\${API_BASE}/\${id}\`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    loadTasks();
  } catch (error) {
    alert('Error updating task');
  }
}

async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  
  try {
    await fetch(\`\${API_BASE}/\${id}\`, { method: 'DELETE' });
    loadTasks();
  } catch (error) {
    alert('Error deleting task');
  }
}

loadTasks();
</script>
</body>
</html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
