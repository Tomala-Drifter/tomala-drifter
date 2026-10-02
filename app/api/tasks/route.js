import { sql } from '@vercel/postgres';

// Helper: Initialize database on first use
async function initDb() {
  try {
    // Create tasks table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        notes TEXT DEFAULT '',
        deadline TEXT,
        status TEXT DEFAULT 'todo',
        tags TEXT DEFAULT '[]',
        reminded_7d INTEGER DEFAULT 0,
        reminded_6h INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `;
  } catch (error) {
    // Table might already exist, that's OK
    if (!error.message.includes('already exists')) {
      console.error('DB init error:', error);
    }
  }
}

export async function GET(request) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let result;
    if (status) {
      result = await sql`
        SELECT * FROM tasks 
        WHERE status = ${status}
        ORDER BY deadline IS NULL, deadline ASC
      `;
    } else {
      result = await sql`
        SELECT * FROM tasks 
        ORDER BY deadline IS NULL, deadline ASC
      `;
    }

    // Parse tags from JSON strings
    const tasks = result.rows.map(task => ({
      ...task,
      tags: typeof task.tags === 'string' ? JSON.parse(task.tags) : task.tags
    }));

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
    await initDb();
    const body = await request.json();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const result = await sql`
      INSERT INTO tasks (id, title, notes, deadline, status, tags, created_at, updated_at)
      VALUES (${id}, ${body.title}, ${body.notes || ''}, ${body.deadline || null}, 
              ${body.status || 'todo'}, ${JSON.stringify(body.tags || [])}, ${now}, ${now})
      RETURNING *
    `;

    const task = result.rows[0];
    return new Response(JSON.stringify({
      ...task,
      tags: body.tags || []
    }), {
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
    await initDb();
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();
    const body = await request.json();
    const now = new Date().toISOString();

    // Build update fields dynamically
    const updates = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.deadline !== undefined) updates.deadline = body.deadline;
    if (body.status !== undefined) updates.status = body.status;
    if (body.tags !== undefined) updates.tags = JSON.stringify(body.tags);
    updates.updated_at = now;

    // Create SQL dynamically
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    
    const setClause = keys.map((k, i) => {
      if (k === 'tags' || k === 'deadline') {
        return `${k} = $${i + 1}`;
      }
      return `${k} = $${i + 1}`;
    }).join(', ');

    const query = `UPDATE tasks SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    
    const result = await sql.query(query, [...values, id]);

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Task not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const task = result.rows[0];
    return new Response(JSON.stringify({
      ...task,
      tags: body.tags !== undefined ? body.tags : JSON.parse(task.tags)
    }), {
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
    await initDb();
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop();

    const result = await sql`
      DELETE FROM tasks WHERE id = ${id}
      RETURNING id
    `;

    if (result.rows.length === 0) {
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
