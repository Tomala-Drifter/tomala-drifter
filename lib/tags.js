import { db } from './db';
import { HttpError } from './http';

const COLOR_RE = /^#[0-9a-f]{6}$/i;

function parseName(v, field = 'name') {
  if (typeof v !== 'string' || !v.trim()) throw new HttpError(400, `${field} is required`);
  return v.trim().toLowerCase().slice(0, 50);
}

function parseColor(v) {
  if (typeof v !== 'string' || !COLOR_RE.test(v)) throw new HttpError(400, 'color must be a hex color like #6366f1');
  return v.toLowerCase();
}

function parseEmoji(v) {
  if (v != null && typeof v !== 'string') throw new HttpError(400, 'emoji must be a string');
  return (v ?? '').trim().slice(0, 16);
}

export async function listTags() {
  return db()`select name, color, emoji, sort from tags order by sort, name`;
}

export async function createTag(body) {
  const name = parseName(body.name);
  const rows = await db()`
    insert into tags (name, color, emoji, sort)
    values (${name}, ${parseColor(body.color)}, ${parseEmoji(body.emoji)},
            (select coalesce(max(sort), -1) + 1 from tags))
    on conflict (name) do nothing
    returning name, color, emoji, sort`;
  if (!rows.length) throw new HttpError(409, 'tag already exists');
  return rows[0];
}

// body: { name, new_name?, color?, emoji? } — renaming also rewrites tasks.tags.
export async function updateTag(body) {
  const name = parseName(body.name);
  const sql = db();
  const [current] = await sql`select * from tags where name = ${name}`;
  if (!current) throw new HttpError(404, 'tag not found');
  const next = {
    name: body.new_name !== undefined ? parseName(body.new_name, 'new_name') : name,
    color: body.color !== undefined ? parseColor(body.color) : current.color,
    emoji: body.emoji !== undefined ? parseEmoji(body.emoji) : current.emoji,
  };
  if (next.name !== name) {
    const [clash] = await sql`select 1 from tags where name = ${next.name}`;
    if (clash) throw new HttpError(409, 'a tag with new_name already exists');
  }
  const [, [row]] = await sql.transaction([
    sql`update tasks set tags = array_replace(tags, ${name}, ${next.name}) where ${name} = any(tags)`,
    sql`update tags set name = ${next.name}, color = ${next.color}, emoji = ${next.emoji}
        where name = ${name} returning name, color, emoji, sort`,
  ]);
  return row;
}

export async function deleteTag(nameRaw) {
  const name = parseName(nameRaw);
  const sql = db();
  const [, deleted] = await sql.transaction([
    sql`update tasks set tags = array_remove(tags, ${name}) where ${name} = any(tags)`,
    sql`delete from tags where name = ${name} returning name`,
  ]);
  if (!deleted.length) throw new HttpError(404, 'tag not found');
  return { status: 'deleted', name };
}
