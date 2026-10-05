// Imports the old FastAPI export (tasks-backup.json) into Postgres.
// Usage: node --env-file=.env.local scripts/import-backup.mjs [--dry-run] [--no-dedupe] [file]
// Idempotent: rows keep their original ids; existing rows are left alone, except that a deadline
// still holding the raw (shifted) backup value is corrected — see wallClockDeadline().
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';
import { APP_TIMEZONE, zonedTimeToDate } from '../lib/time.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const dedupe = !args.includes('--no-dedupe');
const file = args.find((a) => !a.startsWith('--')) || 'tasks-backup.json';

// Test entries from the old backend that should not be migrated.
const SKIP_TITLES = new Set(['Task dodany przez API']);

// Tasks that only existed in the old localStorage seed, not in the backend export.
const EXTRA_TASKS = [
  {
    id: '73c88d23-53a4-4f14-a1f5-56ce714b27aa',
    title: 'Wysłać wiadomość na FBN do Taguj To',
    notes: '',
    deadline: '2026-10-07T12:00:00Z',
    status: 'todo',
    tags: ['prywatne'],
    reminded_7d: 0,
    reminded_6h: 0,
    created_at: '2026-10-03T19:15:11.103874+00:00',
    updated_at: '2026-10-03T19:15:11.103884+00:00',
  },
];

function parseTags(v) {
  if (Array.isArray(v)) return v;
  if (!v) return [];
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(v).split(',');
  }
}

// The old backend stored local wall-clock times with a "Z" suffix (notes say "8 Oct 2026 at 23:59"
// while the field holds 2026-10-08T23:59:00Z). Re-read them as APP_TIMEZONE wall-clock time.
function wallClockDeadline(v) {
  if (!v) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(v);
  if (!m) return new Date(v).toISOString();
  const [, y, mo, d, h, min] = m.map(Number);
  return zonedTimeToDate(y, mo, d, h, min).toISOString();
}

function normalize(t) {
  return {
    id: t.id,
    title: String(t.title).trim(),
    notes: t.notes ?? '',
    deadline: wallClockDeadline(t.deadline),
    raw_deadline: t.deadline || null,
    status: t.status === 'done' ? 'done' : 'todo',
    tags: [...new Set(parseTags(t.tags).map((s) => String(s).trim().toLowerCase()).filter(Boolean))],
    source: t.source ?? null,
    reminded_7d: Boolean(t.reminded_7d),
    reminded_6h: Boolean(t.reminded_6h),
    created_at: t.created_at,
    updated_at: t.updated_at || t.created_at,
  };
}

const raw = JSON.parse(readFileSync(file, 'utf8'));
const all = [...raw, ...EXTRA_TASKS].map(normalize);

const skipped = [];
let tasks = all.filter((t) => {
  if (SKIP_TITLES.has(t.title)) return skipped.push(`${t.title} (test entry)`), false;
  return true;
});

if (dedupe) {
  const byKey = new Map();
  for (const t of [...tasks].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))) {
    const key = `${t.title}|${t.deadline ? new Date(t.deadline).toISOString() : ''}`;
    const kept = byKey.get(key);
    if (!kept) byKey.set(key, t);
    else {
      // Keep the oldest row but don't lose reminder state set on a duplicate.
      kept.reminded_7d ||= t.reminded_7d;
      kept.reminded_6h ||= t.reminded_6h;
      skipped.push(`${t.title} (duplicate of ${kept.id})`);
    }
  }
  tasks = [...byKey.values()];
}

console.log(`deadlines read as ${APP_TIMEZONE} wall-clock time`);
console.log(`${raw.length} rows in ${file} + ${EXTRA_TASKS.length} extra -> ${tasks.length} to import, ${skipped.length} skipped`);
for (const s of skipped) console.log(`  skip: ${s}`);
for (const t of tasks) console.log(`  ok:   ${t.title} [${t.tags.join(', ')}] ${t.deadline ?? '(no deadline)'}`);

if (dryRun) {
  console.log('dry run — nothing written');
  process.exit(0);
}

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL_UNPOOLED / DATABASE_URL is not set');
const sql = neon(url);

let inserted = 0, fixed = 0;
for (const t of tasks) {
  const [row] = await sql`
    insert into tasks (id, title, notes, deadline, status, tags, source, reminded_7d, reminded_6h, created_at, updated_at)
    values (${t.id}, ${t.title}, ${t.notes}, ${t.deadline}, ${t.status}, ${t.tags}, ${t.source},
            ${t.reminded_7d}, ${t.reminded_6h}, ${t.created_at}, ${t.updated_at})
    on conflict (id) do update set deadline = excluded.deadline
      where tasks.deadline is not distinct from ${t.raw_deadline}::timestamptz
        and tasks.deadline is distinct from excluded.deadline
    returning (xmax = 0) as inserted`;
  if (row?.inserted) inserted++;
  else if (row) fixed++;
}
const [{ count }] = await sql`select count(*)::int as count from tasks`;
console.log(`inserted ${inserted}, deadline corrected ${fixed}, untouched ${tasks.length - inserted - fixed}; tasks in db: ${count}`);
