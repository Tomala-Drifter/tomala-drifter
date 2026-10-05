// Usage: node --env-file=.env.local scripts/migrate.mjs
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';
import { DEFAULT_TAGS } from '../lib/default-tags.mjs';

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL_UNPOOLED / DATABASE_URL is not set');
const sql = neon(url);

const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');
for (const stmt of schema.split(';').map((s) => s.trim()).filter(Boolean)) {
  await sql.query(stmt);
}
console.log('schema applied');

let added = 0;
for (const [i, t] of DEFAULT_TAGS.entries()) {
  const rows = await sql`
    insert into tags (name, color, emoji, sort) values (${t.name}, ${t.color}, ${t.emoji}, ${i})
    on conflict (name) do nothing returning name`;
  added += rows.length;
}
const [{ count }] = await sql`select count(*)::int as count from tags`;
console.log(`tags: ${added} added, ${count} total`);
