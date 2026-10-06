import { cookies } from 'next/headers';
import { json } from '@/lib/http';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';

export async function POST() {
  (await cookies()).set(SESSION_COOKIE, '', sessionCookieOptions(0));
  return json({ ok: true });
}
