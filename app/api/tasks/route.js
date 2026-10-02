import { put, get, del } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

const BLOB_KEY = 'tasks.json';

async function getTasks(status = null) {
  try {
    const blob = await get(BLOB_KEY);
    if (!blob) return [];
    
    const data = await blob.text();
    let tasks = JSON.parse(data);

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
    await put(BLOB_KEY, JSON.stringify(tasks, null, 2), {
      access: 'public',
      contentType: 'application/json',
    });
  } catch (error) {
    console.error('saveTasks error:', error);
  }
}

// List all tasks or get single task
export async function GET(request) {
  try {
    const { pathname } = new URL(request.url);
    const isDetailRoute = pathname.includes('/api/tasks/') && pathname !== '/api/tasks';
    
    if (isDetailRoute) {
      // GET /api/tasks/[id]
      const id = pathname.split('/').pop();
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
    }

    // GET /api/tasks (list all)
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tasks = await getTasks(status);

    return new Response(JSON.stringify(tasks), {
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

// Create task
export async function POST(request) {
  try {
    const body = await request.json();
    const id = uuidv4();
    const now = new Date().toISOString();

    const task = {
      id,
      title: body.title,
      notes: body.notes || '',
      deadline: body.deadline || null,
      status: body.status || 'todo',
      tags: body.tags || [],
      reminded_7d: 0,
      reminded_6h: 0,
      created_at: now,
      updated_at: now,
    };

    const tasks = await getTasks();
    tasks.push(task);
    await saveTasks(tasks);

    return new Response(JSON.stringify(task), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Update task
export async function PATCH(request) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();
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
export async function DELETE(request) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

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
