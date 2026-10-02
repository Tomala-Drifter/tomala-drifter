'use client';

import { useEffect, useState } from 'react';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const tagEmojis = {
    studia: '📚',
    rcc: '🏢',
    prywatne: '🔒',
    lambert: '📰',
    konsulting: '💼',
    weegree: '💳',
    lightboys: '💡',
    arkana: '✨',
    zdrowotne: '🏃',
    angaż: '⚡',
    projekty: '🛠️',
    finanse: '💰'
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Load error:', e);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const deadline = formData.get('deadline') ? new Date(formData.get('deadline')).toISOString() : null;
    const tag = formData.get('tag');

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          notes: formData.get('notes'),
          deadline,
          status: 'todo',
          tags: tag ? [tag] : []
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      e.target.reset();
      await loadTasks();
    } catch (e) {
      alert('Error adding task: ' + e.message);
    }
  };

  const saveEdit = async (taskId, data) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEditingId(null);
      await loadTasks();
    } catch (e) {
      alert('Error saving: ' + e.message);
    }
  };

  const toggleTask = async (id, status) => {
    await saveEdit(id, { status: status === 'done' ? 'todo' : 'done' });
  };

  const deleteTask = async (id) => {
    if (!confirm('Delete?')) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadTasks();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Headers
    dayNames.forEach(d => {
      days.push(
        <div key={`header-${d}`} style={{ padding: '8px', textAlign: 'center', fontWeight: 600, fontSize: '0.8rem', background: '#0f1115', color: '#8b8f9a' }}>
          {d}
        </div>
      );
    });

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ padding: '8px', background: '#0f1115', minHeight: '80px' }}></div>);
    }

    // Days with tasks
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month, day).toISOString().split('T')[0];
      const dayTasks = tasks.filter(t => {
        try {
          return t.deadline && t.deadline.split('T')[0] === dateStr && t.status !== 'done';
        } catch {
          return false;
        }
      });

      days.push(
        <div key={`day-${day}`} style={{ padding: '8px', background: '#1a1d24', minHeight: '80px', borderRadius: '4px', overflow: 'auto' }}>
          <div style={{ fontWeight: 600, marginBottom: '4px', paddingBottom: '4px', borderBottom: '1px solid #333', color: '#6c8cff', fontSize: '0.85rem' }}>
            {day}
          </div>
          {dayTasks.map(task => {
            try {
              const tags = JSON.parse(task.tags || '[]');
              const color = tags.length ? tagColors[tags[0]] : '#6c8cff';
              return (
                <div key={task.id} onClick={() => toggleTask(task.id, task.status)} style={{ marginBottom: '3px', padding: '3px 5px', background: color, borderRadius: '3px', fontSize: '0.7rem', cursor: 'pointer', color: '#fff', wordBreak: 'break-word' }} title={task.title}>
                  {task.title.substring(0, 15)}{task.title.length > 15 ? '...' : ''}
                </div>
              );
            } catch {
              return null;
            }
          })}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#8b8f9a' }}>Loading...</div>;
  }

  return (
    <div style={{ margin: 0, padding: '20px', background: '#0f1115', color: '#e8e9ed', fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ marginTop: 0, fontSize: '2rem', fontWeight: 700 }}>📋 My Tasks</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
          {/* Form */}
          <div>
            <h2 style={{ marginTop: 0, fontSize: '1.2rem' }}>Add Task</h2>
            <form onSubmit={addTask} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>Title</label>
                <input name="title" type="text" placeholder="Task name" required style={{ width: '100%', padding: '10px', background: '#1a1d24', border: '1px solid #333', color: '#e8e9ed', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>Notes</label>
                <textarea name="notes" placeholder="Details..." rows="3" style={{ width: '100%', padding: '10px', background: '#1a1d24', border: '1px solid #333', color: '#e8e9ed', borderRadius: '6px', boxSizing: 'border-box' }}></textarea>
              </div>
              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>Deadline</label>
                <input name="deadline" type="datetime-local" style={{ width: '100%', padding: '10px', background: '#1a1d24', border: '1px solid #333', color: '#e8e9ed', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>Tag</label>
                <select name="tag" style={{ width: '100%', padding: '10px', background: '#1a1d24', border: '1px solid #333', color: '#e8e9ed', borderRadius: '6px', boxSizing: 'border-box' }}>
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
              <button type="submit" style={{ padding: '12px', background: '#6c8cff', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>+ Add Task</button>
            </form>
          </div>

          {/* Calendar */}
          <div>
            <h2 style={{ marginTop: 0, fontSize: '1.2rem' }}>📅 Calendar</h2>
            <div style={{ background: '#1a1d24', borderRadius: '8px', padding: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} style={{ padding: '6px 10px', background: '#6c8cff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>← Prev</button>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} style={{ padding: '6px 10px', background: '#6c8cff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Next →</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', background: '#0f1115' }}>
                {renderCalendarDays()}
              </div>
            </div>
          </div>
        </div>

        <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #333' }} />

        <h2 style={{ marginTop: 0, fontSize: '1.2rem' }}>📋 All Tasks</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.length === 0 ? (
            <p style={{ color: '#8b8f9a', textAlign: 'center', padding: '40px' }}>No tasks yet</p>
          ) : (
            tasks.map(task => {
              try {
                const tags = JSON.parse(task.tags || '[]');
                const tagColor = tags.length ? tagColors[tags[0]] : '#6c8cff';
                const deadline = task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'No deadline';

                if (editingId === task.id) {
                  return (
                    <EditForm key={task.id} task={task} tagColors={tagColors} tagEmojis={tagEmojis} onSave={(data) => saveEdit(task.id, data)} onCancel={() => setEditingId(null)} />
                  );
                }

                return (
                  <div key={task.id} style={{ background: '#1a1d24', borderLeft: `4px solid ${tagColor}`, padding: '15px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: task.status === 'done' ? 0.6 : 1 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: '5px' }}>{task.title}</div>
                      <div style={{ fontSize: '0.85rem', color: '#8b8f9a' }}>{deadline}</div>
                      {tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {tags.map(t => (
                            <span key={t} style={{ display: 'inline-block', padding: '4px 10px', background: tagColors[t] || '#6c8cff', color: '#fff', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                              {tagEmojis[t]} {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '15px' }}>
                      <button onClick={() => setEditingId(task.id)} style={{ padding: '6px 12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>✏️ Edit</button>
                      <button onClick={() => toggleTask(task.id, task.status)} style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        {task.status === 'done' ? '↩️ Undo' : '✓ Done'}
                      </button>
                      <button onClick={() => deleteTask(task.id)} style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>🗑️</button>
                    </div>
                  </div>
                );
              } catch (err) {
                console.error('Task render error:', err);
                return null;
              }
            })
          )}
        </div>
      </div>
    </div>
  );
}

function EditForm({ task, tagColors, tagEmojis, onSave, onCancel }) {
  const [data, setData] = useState({
    title: task.title || '',
    notes: task.notes || '',
    deadline: task.deadline ? task.deadline.replace('Z', '') : '',
    tags: (() => {
      try {
        return JSON.parse(task.tags || '[]');
      } catch {
        return [];
      }
    })()
  });

  return (
    <div style={{ background: '#1a1d24', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #6c8cff' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <input type="text" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} style={{ padding: '10px', background: '#0f1115', border: '1px solid #333', color: '#e8e9ed', borderRadius: '4px' }} />
        <select value={data.tags[0] || ''} onChange={(e) => setData({ ...data, tags: e.target.value ? [e.target.value] : [] })} style={{ padding: '10px', background: '#0f1115', border: '1px solid #333', color: '#e8e9ed', borderRadius: '4px' }}>
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
      <textarea value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} rows="2" style={{ width: '100%', padding: '10px', background: '#0f1115', border: '1px solid #333', color: '#e8e9ed', borderRadius: '4px', marginTop: '10px', boxSizing: 'border-box' }} />
      <input type="datetime-local" value={data.deadline} onChange={(e) => setData({ ...data, deadline: e.target.value })} style={{ width: '100%', padding: '10px', background: '#0f1115', border: '1px solid #333', color: '#e8e9ed', borderRadius: '4px', marginTop: '10px', boxSizing: 'border-box' }} />
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
        <button onClick={() => onSave({ title: data.title, notes: data.notes, deadline: data.deadline ? new Date(data.deadline).toISOString() : null, tags: data.tags })} style={{ padding: '8px 16px', background: '#6c8cff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
      </div>
    </div>
  );
}
