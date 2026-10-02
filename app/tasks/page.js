export default function TasksPage() {
  return (
    <div style={{
      margin: 0,
      padding: '20px',
      background: '#0f1115',
      color: '#e8e9ed',
      fontFamily: 'system-ui, sans-serif',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginTop: 0, fontSize: '2rem', fontWeight: 700 }}>📋 My Tasks</h1>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Task Title</label>
          <input id="taskTitle" type="text" placeholder="e.g., Finish assignment" style={{
            width: '100%',
            padding: '10px',
            background: '#1a1d24',
            border: '1px solid #333',
            color: '#e8e9ed',
            borderRadius: '6px',
            boxSizing: 'border-box'
          }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Description</label>
          <textarea id="taskNotes" placeholder="Details..." rows="3" style={{
            width: '100%',
            padding: '10px',
            background: '#1a1d24',
            border: '1px solid #333',
            color: '#e8e9ed',
            borderRadius: '6px',
            boxSizing: 'border-box'
          }}></textarea>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Deadline</label>
          <input id="taskDeadline" type="datetime-local" style={{
            width: '100%',
            padding: '10px',
            background: '#1a1d24',
            border: '1px solid #333',
            color: '#e8e9ed',
            borderRadius: '6px',
            boxSizing: 'border-box'
          }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Tag</label>
          <select id="taskTag" style={{
            width: '100%',
            padding: '10px',
            background: '#1a1d24',
            border: '1px solid #333',
            color: '#e8e9ed',
            borderRadius: '6px',
            boxSizing: 'border-box'
          }}>
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

        <button onClick={() => addTask()} style={{
          padding: '10px 20px',
          background: '#6c8cff',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 600,
          cursor: 'pointer'
        }}>Add Task</button>

        <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #333' }} />

        <h2 style={{ marginTop: 0 }}>Tasks</h2>
        <div id="tasksList" style={{ textAlign: 'center', padding: '40px', color: '#8b8f9a' }}>Loading...</div>
      </div>

      <script dangerouslySetInnerHTML={{__html: `
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
    list.innerHTML = '<p style="color: #8b8f9a; text-align: center; padding: 40px;">No tasks yet</p>';
    return;
  }
  
  list.innerHTML = tasks.map(task => {
    const tags = JSON.parse(task.tags || '[]');
    const deadline = new Date(task.deadline).toLocaleDateString('pl-PL', { year: 'numeric', month: 'short', day: 'numeric' });
    return \`
      <div style="background: #1a1d24; borderLeft: '4px solid #6c8cff'; padding: 15px; borderRadius: 6px; display: flex; justifyContent: space-between; alignItems: center; marginBottom: 12px; opacity: \${task.status === 'done' ? '0.6' : '1'};">
        <div style="flex: 1;">
          <div style="fontWeight: 600; marginBottom: 5px;">\${task.title}</div>
          <div style="fontSize: 0.85rem; color: #8b8f9a;">\${task.deadline ? deadline : 'No deadline'}</div>
          \${tags.length ? \`<div style="display: flex; gap: 6px; flexWrap: wrap; marginTop: 8px;">\${tags.map(t => \`<span style="display: inline-block; padding: '3px 8px'; background: 'rgba(108, 140, 255, 0.2)'; color: '#6c8cff'; borderRadius: 3px; fontSize: '0.75rem'; fontWeight: 600;">\${t}</span>\`).join('')}</div>\` : ''}
        </div>
        <div style="display: flex; gap: 10px; marginLeft: 15px;">
          <button onClick="toggleTask('\${task.id}', '\${task.status === 'done' ? 'todo' : 'done'}')" style="padding: '6px 12px'; background: '#6c8cff'; color: '#fff'; border: none; borderRadius: 6px; cursor: pointer; fontSize: '0.85rem';">
            \${task.status === 'done' ? '↩️ Undo' : '✓ Done'}
          </button>
          <button onClick="deleteTask('\${task.id}')" style="padding: '6px 12px'; background: '#ff5c5c'; color: '#fff'; border: none; borderRadius: 6px; cursor: pointer; fontSize: '0.85rem';">🗑️</button>
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
      `}} />
    </div>
  );
}
