// API Proxy with health check & fallback
const TUNNEL_API = 'https://todo.tomala-drifter.com';
const LOCAL_API = 'http://127.0.0.1:8420';
let lastHealthCheck = 0;
let tunnelHealthy = true;

async function checkTunnelHealth() {
  const now = Date.now();
  if (now - lastHealthCheck < 300000) return tunnelHealthy;

  lastHealthCheck = now;
  try {
    const response = await fetch(`${TUNNEL_API}/api/tasks?status=todo`, {
      signal: AbortSignal.timeout(5000),
    });
    tunnelHealthy = response.ok;
  } catch (error) {
    tunnelHealthy = false;
  }
  return tunnelHealthy;
}

async function forwardRequest(method, path, body = null) {
  const isHealthy = await checkTunnelHealth();
  const apiUrl = isHealthy ? TUNNEL_API : LOCAL_API;
  const url = `${apiUrl}/api${path}`;

  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(15000),
  };

  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'API unavailable' }), {
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
