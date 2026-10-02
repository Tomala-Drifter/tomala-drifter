const TODO_API = 'https://todo.tomala-drifter.com';

async function forwardRequest(method, path, body = null) {
  const url = `${TODO_API}/api${path}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
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

export async function GET(request, { params }) {
  const path = request.nextUrl.pathname.replace('/api/tasks', '');
  return forwardRequest('GET', '/tasks' + path);
}

export async function POST(request, { params }) {
  const body = await request.json();
  return forwardRequest('POST', '/tasks', body);
}

export async function PATCH(request, { params }) {
  const path = request.nextUrl.pathname.replace('/api/tasks', '');
  const body = await request.json();
  const response = await fetch(`${TODO_API}/api/tasks${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function DELETE(request, { params }) {
  const path = request.nextUrl.pathname.replace('/api/tasks', '');
  const response = await fetch(`${TODO_API}/api/tasks${path}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
