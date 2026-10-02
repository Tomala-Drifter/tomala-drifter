// Simple proxy without health check (health check cache causes issues)
const TUNNEL_API = 'https://todo.tomala-drifter.com';

async function forwardRequest(method, path, body = null) {
  const url = `${TUNNEL_API}/api${path}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const text = await response.text();
      return new Response(JSON.stringify({ error: `HTTP ${response.status}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'API unavailable: ' + error.message }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(request) {
  const path = request.nextUrl.pathname.replace('/api/tasks', '');
  return forwardRequest('GET', '/tasks' + path);
}

export async function POST(request) {
  const body = await request.json();
  return forwardRequest('POST', '/tasks', body);
}

export async function PATCH(request) {
  const path = request.nextUrl.pathname.replace('/api/tasks', '');
  const body = await request.json();
  return forwardRequest('PATCH', '/tasks' + path, body);
}

export async function DELETE(request) {
  const path = request.nextUrl.pathname.replace('/api/tasks', '');
  return forwardRequest('DELETE', '/tasks' + path);
}
