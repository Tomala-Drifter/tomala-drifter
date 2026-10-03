import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';

const TASKS_KEY = 'tasks:list';

async function getTasks(status = null) {
  try {
    const data = await kv.get(TASKS_KEY);
    let tasks = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

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
    return [];
  }
}

async function saveTasks(tasks) {
  try {
    await kv.set(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('saveTasks error:', error);
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tasks = await getTasks(status);

    return new Response(JSON.stringify(tasks), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
