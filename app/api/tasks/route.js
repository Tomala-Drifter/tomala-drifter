const TUNNEL_API = 'https://todo.tomala-drifter.com';

async function forwardRequest(method, path, body = null) {
  // Add cache buster to URL
  const separator = path.includes('?') ? '&' : '?';
  const url = `${TUNNEL_API}/api${path}${separator}cb=${Date.now()}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  };

  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(request) {
  const path = request.nextUrl.pathname.replace('/api/tasks', '') + request.nextUrl.search;
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
