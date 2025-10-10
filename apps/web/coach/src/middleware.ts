import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';

export async function middleware(request: NextRequest) {
  const routes = [
    '/api/agents/public/chat',
    '/api/users/chatbot-customization/public',
    '/api/leads/chatbot'
  ]
  const shouldProcess =
    request.nextUrl.pathname.startsWith(routes[0]) ||
    request.nextUrl.pathname.startsWith(routes[1]) ||
    request.nextUrl.pathname.startsWith(routes[2]);

  if (!shouldProcess) {
    return NextResponse.next();
  }

  const backendURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  const backendPath = request.nextUrl.pathname.slice(4);
  const backendFullURL = `${backendURL}${backendPath}${request.nextUrl.search}`;

  try {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method === 'POST' || request.method === 'PUT') {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    const backendResponse = await fetch(backendFullURL, fetchOptions);

    const data = await backendResponse.text();

    return new NextResponse(data, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);

    return NextResponse.json(
      {
        error: 'Proxy request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export const config = {
  matcher: [
    '/api/agents/public/chat/:path*',
    '/api/users/chatbot-customization/public/:path*',
    '/api/leads/chatbot'
  ],
};
