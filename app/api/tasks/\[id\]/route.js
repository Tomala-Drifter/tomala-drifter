import { kv } from '@vercel/kv';

// Helper function - shared with main route.js
async function getTasks(status = null) {
  try {
    const tasksJson = await kv.get('tasks_list') || '[]';
    let tasks = typeof tasksJson === 'string' ? JSON.parse(tasksJson) : tasksJson;

    if (status) {
      tasks = tasks.filter(t => t.status === status);
    }

    return tasks.sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  } catch (error) {
    console.error('getTasks error:', error);
    return [];
  }
}

async function saveTasks(tasks) {
  try {
    await kv.set('tasks_list', JSON.stringify(tasks));
  } catch (error) {
    console.error('saveTasks error:', error);
  }
}

// Get single task
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const tasks = await getTasks();
    const task = tasks.find(t => t.id === id);

    if (!task) {
      return new Response(JSON.stringify({ error: 'Task not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(task), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Update task
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const now = new Date().toISOString();

    const tasks = await getTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return new Response(JSON.stringify({ error: 'Task not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const task = tasks[taskIndex];
    
    // Update fields
    if (body.title !== undefined) task.title = body.title;
    if (body.notes !== undefined) task.notes = body.notes;
    if (body.deadline !== undefined) task.deadline = body.deadline;
    if (body.status !== undefined) task.status = body.status;
    if (body.tags !== undefined) task.tags = body.tags;
    task.updated_at = now;

    tasks[taskIndex] = task;
    await saveTasks(tasks);

    return new Response(JSON.stringify(task), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('PATCH error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Delete task
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const tasks = await getTasks();
    const task = tasks.find(t => t.id === id);

    if (!task) {
      return new Response(JSON.stringify({ error: 'Task not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const filtered = tasks.filter(t => t.id !== id);
    await saveTasks(filtered);

    return new Response(JSON.stringify({ status: 'deleted', id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
