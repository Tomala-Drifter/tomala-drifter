import { handler, json, readJson } from '@/lib/http';
import { listTags, createTag, updateTag, deleteTag } from '@/lib/tags';

export const dynamic = 'force-dynamic';

export const GET = handler(async () => json(await listTags()));

export const POST = handler(async (request) => json(await createTag(await readJson(request)), 201));

export const PATCH = handler(async (request) => json(await updateTag(await readJson(request))));

export const DELETE = handler(async (request) => {
  let name = new URL(request.url).searchParams.get('name');
  if (!name) name = (await readJson(request)).name;
  return json(await deleteTag(name));
});
