import { Redis } from '@upstash/redis';
import { v4 as uuidv4 } from 'uuid';

// Initialize Redis client (uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Helper functions
async function getTasks(status = null) {
  try {
    const tasks = await redis.lrange('tasks', 0, -1);
    let parsed = tasks.map(t => {
      try {
        return JSON.parse(typeof t === 'string' ? t : JSON.stringify(t));
      } catch {
        return null;
      }
    }).filter(t => t !== null);

    if (status) {
      parsed = parsed.filter(t => t.status === status);
    }

    return parsed.sort((a, b) => {
      // Sort by deadline
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

async function saveTask(task) {
  try {
    const tasks = await getTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    
    if (index !== -1) {
      tasks[index] = task;
    } else {
      tasks.push(task);
    }

    await redis.del('tasks');
    for (const t of tasks) {
      await redis.rpush('tasks', JSON.stringify(t));
    }
  } catch (error) {
    console.error('saveTask error:', error);
  }
}

async function deleteTaskById(id) {
  try {
    const tasks = await getTasks();
    const filtered = tasks.filter(t => t.id !== id);
    
    await redis.del('tasks');
    for (const t of filtered) {
      await redis.rpush('tasks', JSON.stringify(t));
    }
    
    return filtered.find(t => t.id === id) !== undefined;
  } catch (error) {
    console.error('deleteTaskById error:', error);
    return false;
  }
}

// API Handlers
export async function GET(request) {
  try {
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

    await redis.del('tasks');
    for (const t of tasks) {
      await redis.rpush('tasks', JSON.stringify(t));
    }

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

export async function PATCH(request) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();
    const body = await request.json();
    const now = new Date().toISOString();

    const tasks = await getTasks();
    const task = tasks.find(t => t.id === id);

    if (!task) {
      return new Response(JSON.stringify({ error: 'Task not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update fields
    if (body.title !== undefined) task.title = body.title;
    if (body.notes !== undefined) task.notes = body.notes;
    if (body.deadline !== undefined) task.deadline = body.deadline;
    if (body.status !== undefined) task.status = body.status;
    if (body.tags !== undefined) task.tags = body.tags;
    task.updated_at = now;

    await saveTask(task);

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

export async function DELETE(request) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    const deleted = await deleteTaskById(id);

    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Task not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
