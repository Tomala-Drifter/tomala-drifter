import { neon } from '@neondatabase/serverless';

let client;

export function db() {
  if (!client) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
    client = neon(process.env.DATABASE_URL);
  }
  return client;
}

const iso = (v) => (v == null ? null : new Date(v).toISOString());

export function rowToTask(r) {
  return {
    id: r.id,
    title: r.title,
    notes: r.notes,
    deadline: iso(r.deadline),
    status: r.status,
    tags: r.tags || [],
    source: r.source,
    reminded_7d: r.reminded_7d,
    reminded_6h: r.reminded_6h,
    completed_at: iso(r.completed_at),
    created_at: iso(r.created_at),
    updated_at: iso(r.updated_at),
  };
}
