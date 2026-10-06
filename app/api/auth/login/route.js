import { cookies } from 'next/headers';
import { json } from '@/lib/http';
import { SESSION_COOKIE, createSessionToken, safeEqual, sessionCookieOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const expected = process.env.APP_PASSWORD;
  if (!expected || !process.env.SESSION_SECRET) return json({ error: 'auth is not configured on the server' }, 500);

  let password;
  try {
    ({ password } = await request.json());
  } catch {}

  if (!(await safeEqual(password, expected))) {
    await new Promise((r) => setTimeout(r, 500)); // slow down guessing
    return json({ error: 'invalid password' }, 401);
  }

  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions());
  return json({ ok: true });
}
