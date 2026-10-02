const TUNNEL_API = 'https://todo.tomala-drifter.com';

async function forwardRequest(method, id, body = null) {
  const url = `${TUNNEL_API}/api/tasks/${id}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
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
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(request, { params }) {
  const { id } = params;
  return forwardRequest('GET', id);
}

export async function PATCH(request, { params }) {
  const { id } = params;
  const body = await request.json();
  return forwardRequest('PATCH', id, body);
}

export async function DELETE(request, { params }) {
  const { id } = params;
  return forwardRequest('DELETE', id);
}
