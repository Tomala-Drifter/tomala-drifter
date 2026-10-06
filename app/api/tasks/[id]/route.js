import { handler, json, readJson } from '@/lib/http';
import { getTask, updateTask, deleteTask } from '@/lib/tasks';

export const dynamic = 'force-dynamic';

export const GET = handler(async (_request, { params }) => json(await getTask((await params).id)));

export const PATCH = handler(async (request, { params }) => json(await updateTask((await params).id, await readJson(request))));

export const DELETE = handler(async (_request, { params }) => json(await deleteTask((await params).id)));
