import { NextResponse } from 'next/server';

// This route proxies lead submissions to the external API and signs the request server-side.
// Environment variables expected (do NOT expose these on the client):
// - LEADS_API_BASE: e.g. https://api.nextlevelcoach.ai
// - LEADS_PUBLIC_TOKEN: shared token used for HMAC signature

function hmacSha256Hex(key: string, message: string) {
  const crypto = require('crypto') as typeof import('crypto');
  return crypto.createHmac('sha256', Buffer.from(key, 'utf8'))
    .update(Buffer.from(message, 'utf8'))
    .digest('hex');
}

export async function POST(request: Request) {
  try {
    const apiBase = process.env.LEADS_API_BASE;
    const token = process.env.LEADS_PUBLIC_TOKEN;

    if (!apiBase || !token) {
      return NextResponse.json(
        { message: 'Server is not configured. Missing LEADS_API_BASE or LEADS_PUBLIC_TOKEN.' },
        { status: 500 }
      );
    }

    // Read raw body to ensure the signature matches exactly what we forward
    const rawBody = await request.text();

    // Basic guard against empty body
    if (!rawBody) {
      return NextResponse.json({ message: 'Empty request body' }, { status: 400 });
    }

    // We forward to the external '/api/leads' path, as per the integration guide
    const method = 'POST';
    const path = '/api/leads/landing';
    const timestamp = Date.now();
    const dataToSign = `${method}|${path}|${rawBody}|${timestamp}`;
    const signature = hmacSha256Hex(token, dataToSign);

    const url = apiBase.replace(/\/$/, '') + path;

    const upstreamRes = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Landing-Token': token,
        'X-Landing-Timestamp': String(timestamp),
        'X-Landing-Signature': signature,
      },
      body: rawBody,
      // No redirect of credentials or cookies to external API
    });

    const contentType = upstreamRes.headers.get('content-type') || '';
    const status = upstreamRes.status;

    // Pass through body from external API
    if (contentType.includes('application/json')) {
      const json = await upstreamRes.json().catch(() => ({}));
      return NextResponse.json(json, { status });
    } else {
      const text = await upstreamRes.text().catch(() => '');
      return new NextResponse(text, {
        status,
        headers: { 'Content-Type': contentType || 'text/plain' },
      });
    }
  } catch (err: any) {
    // Avoid leaking secrets; only a generic error message
    const message = err?.message || 'Unexpected server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
