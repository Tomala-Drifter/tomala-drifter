/**
 * API proxy: forwards requests to the todo backend on Cloudflare Tunnel
 */

const TODO_API = process.env.TODO_API || 'https://todo.tomala-drifter.com';

export async function GET(request, { params }) {
  const path = request.nextUrl.pathname.replace('/api', '');
  
  try {
    const response = await fetch(`${TODO_API}/api${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
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

export async function POST(request) {
  const path = request.nextUrl.pathname.replace('/api', '');
  
  try {
    const body = await request.json();
    
    const response = await fetch(`${TODO_API}/api${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
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

export async function PATCH(request, { params }) {
  const path = request.nextUrl.pathname.replace('/api', '');
  
  try {
    const body = await request.json();
    
    const response = await fetch(`${TODO_API}/api${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
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

export async function DELETE(request, { params }) {
  const path = request.nextUrl.pathname.replace('/api', '');
  
  try {
    const response = await fetch(`${TODO_API}/api${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
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
