import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only handle public chat API routes
  if (!request.nextUrl.pathname.startsWith('/api/agents/public/chat')) {
    return NextResponse.next();
  }

  // Get the backend API URL from environment
  const backendURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  // Build the backend URL with the same path
  const backendPath = request.nextUrl.pathname.slice(4);
  const backendFullURL = `${backendURL}${backendPath}${request.nextUrl.search}`;
  console.log(`Backend URL: ${backendURL}`);
  console.log(`Backend Path: ${backendPath}`);
  console.log(`Next URL Search: ${request.nextUrl.search}`);

  console.log('Proxying request:', {
    from: request.nextUrl.pathname,
    to: backendFullURL,
    method: request.method
  });

  try {
    // Handle preflight OPTIONS request
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

    // Forward the request to backend
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Copy authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    // Add body for POST/PUT requests
    if (request.method === 'POST' || request.method === 'PUT') {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    // Make request to backend
    const backendResponse = await fetch(backendFullURL, fetchOptions);

    // Get response data
    const data = await backendResponse.text();

    // Create response with CORS headers
    const response = new NextResponse(data, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

    return response;

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
  matcher: '/api/agents/public/chat/:path*',
};
