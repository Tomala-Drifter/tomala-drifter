import { handler, json, readJson } from '@/lib/http';
import { listTasks, createTask, updateTask, deleteTask } from '@/lib/tasks';

export const dynamic = 'force-dynamic';

export const GET = handler(async (request) => {
  const p = new URL(request.url).searchParams;
  const tasks = await listTasks({
    status: p.get('status') || undefined,
    tag: p.get('tag') || undefined,
    from: p.get('from') || undefined,
    to: p.get('to') || undefined,
  });
  return json(tasks);
});

export const POST = handler(async (request) => json(await createTask(await readJson(request)), 201));

// PATCH/DELETE accept the id in the body ({ id }) or as ?id=
export const PATCH = handler(async (request) => {
  const body = await readJson(request);
  const id = body.id ?? new URL(request.url).searchParams.get('id');
  return json(await updateTask(id, body));
});

export const DELETE = handler(async (request) => {
  let id = new URL(request.url).searchParams.get('id');
  if (!id) id = (await readJson(request)).id;
  return json(await deleteTask(id));
});
