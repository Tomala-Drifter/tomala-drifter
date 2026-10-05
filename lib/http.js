import { isAuthorized } from './auth';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

// Wraps a route handler: auth check + uniform error responses.
export function handler(fn) {
  return async (request, ctx) => {
    try {
      if (!(await isAuthorized(request))) return json({ error: 'unauthorized' }, 401);
      return await fn(request, ctx);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      console.error(err);
      return json({ error: 'internal error' }, 500);
    }
  };
}

export async function readJson(request) {
  try {
    const body = await request.json();
    if (body && typeof body === 'object' && !Array.isArray(body)) return body;
  } catch {}
  throw new HttpError(400, 'body must be a JSON object');
}
