import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Use temp storage in Vercel or local file
const TASKS_FILE = process.env.VERCEL 
  ? '/tmp/tasks.json' 
  : join(process.cwd(), 'data/tasks.json');

async function getTasks(status = null) {
  try {
    const data = await readFile(TASKS_FILE, 'utf-8');
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
    const data = JSON.stringify(tasks, null, 2);
    await writeFile(TASKS_FILE, data, 'utf-8');
  } catch (error) {
    console.error('saveTasks error:', error);
  }
}

// Initialize file if it doesn't exist
async function ensureTasksFile() {
  try {
    await readFile(TASKS_FILE, 'utf-8');
  } catch {
    await writeFile(TASKS_FILE, '[]', 'utf-8');
  }
}

// List all tasks (GET /api/tasks and GET /api/tasks/[id])
export async function GET(request) {
  try {
    await ensureTasksFile();
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
    await ensureTasksFile();
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

// Update or Delete task
export async function PATCH(request) {
  try {
    await ensureTasksFile();
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
    await ensureTasksFile();
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
