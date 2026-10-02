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
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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

        <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #333' }} />

        <h2 style={{ marginTop: 0 }}>📅 Calendar</h2>
        <div id="calendar" style={{ background: '#1a1d24', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button id="prevMonth" style={{
              padding: '8px 12px',
              background: '#6c8cff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>← Prev</button>
            <h3 id="monthTitle" style={{ margin: 0, fontSize: '1.2rem' }}>October 2026</h3>
            <button id="nextMonth" style={{
              padding: '8px 12px',
              background: '#6c8cff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>Next →</button>
          </div>
          
          <div id="calendarGrid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '1px',
            background: '#333'
          }}></div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{__html: `
const API_BASE = "/api/tasks";
let allTasks = [];
let currentMonth = new Date();

const tagColors = {
  studia: '#6366f1',
  rcc: '#ec4899',
  prywatne: '#8b5cf6',
  lambert: '#06b6d4',
  konsulting: '#f59e0b',
  weegree: '#10b981',
  lightboys: '#3b82f6',
  arkana: '#d946ef',
  zdrowotne: '#ef4444',
  angaż: '#f97316',
  projekty: '#6d28d9',
  finanse: '#059669'
};

async function loadTasks() {
  try {
    const response = await fetch(API_BASE);
    allTasks = await response.json();
    renderTasks(allTasks);
    renderCalendar();
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
    const deadline = task.deadline ? new Date(task.deadline).toLocaleDateString('pl-PL', { year: 'numeric', month: 'short', day: 'numeric' }) : 'No deadline';
    return \`
      <div style="background: #1a1d24; borderLeft: '4px solid #6c8cff'; padding: 15px; borderRadius: 6px; display: flex; justifyContent: space-between; alignItems: center; marginBottom: 12px; opacity: \${task.status === 'done' ? '0.6' : '1'};">
        <div style="flex: 1;">
          <div style="fontWeight: 600; marginBottom: 5px;">\${task.title}</div>
          <div style="fontSize: 0.85rem; color: #8b8f9a;">\${deadline}</div>
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

function renderCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // Update title
  document.getElementById('monthTitle').textContent = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Create calendar grid
  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';
  
  // Day headers
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(day => {
    const header = document.createElement('div');
    header.style.cssText = 'padding: 8px; textAlign: center; fontWeight: 600; fontSize: 0.9rem; background: #0f1115; color: #8b8f9a;';
    header.textContent = day;
    grid.appendChild(header);
  });
  
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding: 10px; background: #0f1115; minHeight: 100px;';
    grid.appendChild(empty);
  }
  
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    
    // Find tasks for this day
    const tasksForDay = allTasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = task.deadline.split('T')[0];
      return taskDate === dateStr && task.status !== 'done';
    });
    
    const cell = document.createElement('div');
    cell.style.cssText = 'padding: 10px; background: #1a1d24; minHeight: 100px; borderRadius: 4px; fontSize: 0.85rem; overflow-y: auto;';
    
    // Day number
    const dayNum = document.createElement('div');
    dayNum.style.cssText = 'fontWeight: 600; marginBottom: 8px; paddingBottom: 8px; borderBottom: 1px solid #333; color: #6c8cff;';
    dayNum.textContent = day;
    cell.appendChild(dayNum);
    
    // Tasks
    tasksForDay.forEach(task => {
      const tags = JSON.parse(task.tags || '[]');
      const taskEl = document.createElement('div');
      taskEl.style.cssText = 'marginBottom: 6px; padding: 4px 6px; background: rgba(108, 140, 255, 0.1); borderRadius: 3px; fontSize: 0.75rem; cursor: pointer; wordBreak: break-word; border-left: 3px solid ' + (tagColors[tags[0]] || '#6c8cff');
      taskEl.textContent = '• ' + task.title.substring(0, 20) + (task.title.length > 20 ? '...' : '');
      taskEl.title = task.title;
      taskEl.onclick = () => toggleTask(task.id, 'done');
      cell.appendChild(taskEl);
    });
    
    grid.appendChild(cell);
  }
}

document.getElementById('prevMonth').addEventListener('click', () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
  renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
  renderCalendar();
});

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
