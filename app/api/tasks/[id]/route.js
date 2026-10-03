import { kv } from '@vercel/kv';

const TASKS_KEY = 'tasks:list';

async function getTasks() {
  try {
    const data = await kv.get(TASKS_KEY);
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];
  } catch (error) {
    return [];
  }
}

async function saveTasks(tasks) {
  await kv.set(TASKS_KEY, JSON.stringify(tasks));
}

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

    return new Response(JSON.stringify(task), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const now = new Date().toISOString();

    const tasks = await getTasks();
    const idx = tasks.findIndex(t => t.id === id);

    if (idx === -1) {
      return new Response(JSON.stringify({ error: 'Task not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const task = tasks[idx];
    if (body.title) task.title = body.title;
    if (body.notes !== undefined) task.notes = body.notes;
    if (body.deadline !== undefined) task.deadline = body.deadline;
    if (body.status) task.status = body.status;
    if (body.tags) task.tags = body.tags;
    task.updated_at = now;

    tasks[idx] = task;
    await saveTasks(tasks);

    return new Response(JSON.stringify(task), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const tasks = await getTasks();
    const task = tasks.find(t => t.id === id);

    if (!task) {
      return new Response(JSON.stringify({ error: 'Task not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const filtered = tasks.filter(t => t.id !== id);
    await saveTasks(filtered);

    return new Response(JSON.stringify({ status: 'deleted', id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
