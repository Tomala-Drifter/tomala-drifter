import { NextResponse } from 'next/server';
import { hasValidSession, isAuthorized } from '@/lib/auth';

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const isApi = pathname.startsWith('/api/');

  if (pathname.startsWith('/api/auth/')) return NextResponse.next();

  let ok = false;
  try {
    // Pages accept only the session cookie; the API also accepts the Bearer key.
    ok = isApi ? await isAuthorized(request) : await hasValidSession(request);
  } catch (err) {
    console.error('auth misconfigured:', err.message);
    if (isApi) return NextResponse.json({ error: 'auth is not configured on the server' }, { status: 500 });
  }
  if (ok) return NextResponse.next();

  if (isApi) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.search = `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/tasks/:path*', '/api/:path*'],
};
