import { db, rowToTask } from './db';
import { HttpError } from './http';
import { parseDeadline } from './time.mjs';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUSES = ['todo', 'done'];

export function assertId(id) {
  if (typeof id !== 'string' || !UUID_RE.test(id)) throw new HttpError(400, 'invalid or missing id');
  return id;
}

// Validates and normalizes the writable fields present in `body`.
function parseFields(body, { partial }) {
  const out = {};
  const has = (k) => Object.prototype.hasOwnProperty.call(body, k);

  if (has('title') || !partial) {
    if (typeof body.title !== 'string' || !body.title.trim()) throw new HttpError(400, 'title is required');
    out.title = body.title.trim().slice(0, 500);
  }
  if (has('notes')) {
    if (body.notes != null && typeof body.notes !== 'string') throw new HttpError(400, 'notes must be a string');
    out.notes = body.notes ?? '';
  }
  if (has('deadline')) {
    if (body.deadline == null || body.deadline === '') out.deadline = null;
    else {
      const d = typeof body.deadline === 'string' ? parseDeadline(body.deadline) : new Date(NaN);
      if (isNaN(d)) throw new HttpError(400, 'deadline must be an ISO date (with Z/offset, or local Europe time) or null');
      out.deadline = d.toISOString();
    }
  }
  if (has('status')) {
    if (!STATUSES.includes(body.status)) throw new HttpError(400, `status must be one of: ${STATUSES.join(', ')}`);
    out.status = body.status;
  }
  if (has('tags')) {
    if (!Array.isArray(body.tags) || body.tags.some((t) => typeof t !== 'string' || !t.trim()))
      throw new HttpError(400, 'tags must be an array of non-empty strings');
    out.tags = [...new Set(body.tags.map((t) => t.trim().toLowerCase()))];
  }
  if (has('source')) {
    if (body.source != null && typeof body.source !== 'string') throw new HttpError(400, 'source must be a string or null');
    out.source = body.source?.trim() || null;
  }
  for (const k of ['reminded_7d', 'reminded_6h']) {
    if (has(k)) {
      if (![true, false, 0, 1].includes(body[k])) throw new HttpError(400, `${k} must be a boolean`);
      out[k] = Boolean(body[k]);
    }
  }
  return out;
}

export async function listTasks({ status, tag, from, to } = {}) {
  if (status && !STATUSES.includes(status)) throw new HttpError(400, 'invalid status filter');
  const rows = await db()`
    select * from tasks
    where (${status ?? null}::text is null or status = ${status ?? null})
      and (${tag ?? null}::text is null or ${tag ?? null} = any(tags))
      and (${from ?? null}::timestamptz is null or deadline >= ${from ?? null})
      and (${to ?? null}::timestamptz is null or deadline < ${to ?? null})
    order by deadline asc nulls last, created_at asc`;
  return rows.map(rowToTask);
}

export async function getTask(id) {
  const [row] = await db()`select * from tasks where id = ${assertId(id)}`;
  if (!row) throw new HttpError(404, 'task not found');
  return rowToTask(row);
}

export async function createTask(body) {
  const f = parseFields(body, { partial: false });
  const [row] = await db()`
    insert into tasks (title, notes, deadline, status, tags, source, reminded_7d, reminded_6h, completed_at)
    values (${f.title}, ${f.notes ?? ''}, ${f.deadline ?? null}, ${f.status ?? 'todo'},
            ${f.tags ?? []}, ${f.source ?? null}, ${f.reminded_7d ?? false}, ${f.reminded_6h ?? false},
            ${f.status === 'done' ? new Date().toISOString() : null})
    returning *`;
  return rowToTask(row);
}

export async function updateTask(id, body) {
  assertId(id);
  const f = parseFields(body, { partial: true });
  const keys = Object.keys(f);
  if (!keys.length) throw new HttpError(400, 'no updatable fields in body');
  // Column names come from parseFields' fixed whitelist, values are parameterized.
  let sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  // completed_at records when a task was checked off (kept if it was already done).
  if (f.status === 'done') sets += ', completed_at = coalesce(completed_at, now())';
  if (f.status === 'todo') sets += ', completed_at = null';
  const rows = await db().query(
    `update tasks set ${sets}, updated_at = now() where id = $1 returning *`,
    [id, ...keys.map((k) => f[k])]
  );
  if (!rows.length) throw new HttpError(404, 'task not found');
  return rowToTask(rows[0]);
}

export async function deleteTask(id) {
  const rows = await db()`delete from tasks where id = ${assertId(id)} returning id`;
  if (!rows.length) throw new HttpError(404, 'task not found');
  return { status: 'deleted', id };
}
