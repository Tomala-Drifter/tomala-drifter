create table if not exists tags (
  name text primary key,
  color text not null,
  emoji text not null default '',
  sort int not null default 0
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text not null default '',
  deadline timestamptz,
  status text not null default 'todo' check (status in ('todo', 'done')),
  tags text[] not null default '{}',
  source text,
  reminded_7d boolean not null default false,
  reminded_6h boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_deadline_idx on tasks (deadline);
create index if not exists tasks_tags_idx on tasks using gin (tags);

alter table tasks add column if not exists completed_at timestamptz;

-- backfill for tasks completed before completed_at existed
update tasks set completed_at = updated_at where status = 'done' and completed_at is null;
