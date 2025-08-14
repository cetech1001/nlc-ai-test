Landing Page → API Leads Submission Integration Guide

This guide shows how to call POST /api/leads (simple body) or POST /api/leads/landing (structured landing body) from your landing page (hosted on a different origin) using the replay-safe headers required by the API.

Summary of required headers
- X-Landing-Token: Your shared secret configured in the API as LEADS_PUBLIC_TOKEN.
- X-Landing-Timestamp: Current Unix epoch time in milliseconds (e.g., Date.now()).
- X-Landing-Signature: HMAC-SHA256 signature in hex of the string:
  ${method}|${path}|${rawBody}|${timestamp}
  where:
  - method is uppercase HTTP method (e.g., POST)
  - path is the request path including the global prefix: /api/leads or /api/leads/landing (match the one you call)
  - rawBody is canonical JSON string of the body object using JSON.stringify
  - timestamp is the same value used in X-Landing-Timestamp

Important validation rules enforced by the API
- Token must equal LEADS_PUBLIC_TOKEN on the server.
- Timestamp must be within a time window (default 5 minutes). Clock skew matters; consider NTP or syncing server and client time.
- Signature must match exactly.
- Replay protection prevents reusing the same signature within a short TTL (default 10 minutes). Each unique signature can be used only once.

Security note
- Best practice: compute the signature on your own backend (proxy) so the token is not exposed in the browser.
- If you are purely static and must run entirely in the browser, you can compute the signature client-side; the replay and timestamp window reduce abuse if the token leaks, but the token is still extractable by an attacker.

Option A: Static browser (no backend) using Web Crypto API
Use this if your landing page is static and you accept exposing the token in the page.

Example form submit handler (vanilla JS):

```html
<script>
  async function hmacSha256Hex(keyUtf8, msgUtf8) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(keyUtf8),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msgUtf8));
    // Convert ArrayBuffer to hex
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function submitLead(e) {
    e.preventDefault();

    const apiBase = 'https://your-api-domain.com'; // e.g., https://api.nextlevelcoach.ai
    const path = '/api/leads'; // or '/api/leads/landing' when sending the structured payload
    const url = apiBase + path;

    const bodyObj = {
      name: document.querySelector('#name').value,
      email: document.querySelector('#email').value,
      phone: document.querySelector('#phone').value || undefined,
      source: 'website',
      notes: document.querySelector('#notes').value || undefined,
    };

    const rawBody = JSON.stringify(bodyObj);
    const method = 'POST';
    const timestamp = Date.now();

    const token = 'LEADS_PUBLIC_TOKEN_VALUE'; // WARNING: exposes token in client
    const dataToSign = `${method}|${path}|${rawBody}|${timestamp}`;
    const signature = await hmacSha256Hex(token, dataToSign);

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Landing-Token': token,
        'X-Landing-Timestamp': String(timestamp),
        'X-Landing-Signature': signature,
      },
      body: rawBody,
    });

    if (!res.ok) {
      const err = await res.text();
      alert(`Lead submit failed: ${res.status} ${err}`);
      return;
    }

    alert('Lead submitted successfully');
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#lead-form').addEventListener('submit', submitLead);
  });
</script>
```

Notes for browser approach
- The path must be exactly '/api/leads' (includes the Nest global prefix). If you add query strings, include them as part of path exactly as requested.
- rawBody must be the exact JSON you send in the body. We recommend building the object and then using JSON.stringify once to both sign and send.

Option B: Preferred secure approach via a lightweight proxy (e.g., Next.js API route)
This keeps the token private on your server.

Next.js (app router) route example at app/api/lead-proxy/route.ts:

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const bodyObj = await req.json();

    const apiBase = process.env.API_BASE_URL; // e.g., https://api.nextlevelcoach.ai
    const path = '/api/leads';
    const url = apiBase + path;

    const rawBody = JSON.stringify(bodyObj);
    const method = 'POST';
    const timestamp = Date.now();

    const token = process.env.LEADS_PUBLIC_TOKEN!;
    const dataToSign = `${method}|${path}|${rawBody}|${timestamp}`;
    const signature = crypto.createHmac('sha256', token).update(dataToSign).digest('hex');

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Landing-Token': token,
        'X-Landing-Timestamp': String(timestamp),
        'X-Landing-Signature': signature,
      },
      body: rawBody,
    });

    const text = await res.text();
    return new NextResponse(text, { status: res.status });
  } catch (e) {
    console.error(e);
    return new NextResponse('Proxy error', { status: 500 });
  }
}

In your landing page, post to your proxy (same origin) instead of the API directly:

await fetch('/api/lead-proxy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });

Node.js standalone example (for servers or build scripts)

const crypto = require('crypto');
const fetch = require('node-fetch');

(async () => {
  const apiBase = process.env.API_BASE_URL; // e.g., https://api.nextlevelcoach.ai
  const path = '/api/leads'; // or '/api/leads/landing'
  const url = apiBase + path;

  const bodyObj = { name: 'John Doe', email: 'john@example.com', source: 'website' }; // use structured body for '/api/leads/landing'
  const rawBody = JSON.stringify(bodyObj);
  const method = 'POST';
  const timestamp = Date.now();

  const token = process.env.LEADS_PUBLIC_TOKEN;
  const dataToSign = `${method}|${path}|${rawBody}|${timestamp}`;
  const signature = crypto.createHmac('sha256', token).update(dataToSign).digest('hex');

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Landing-Token': token,
      'X-Landing-Timestamp': String(timestamp),
      'X-Landing-Signature': signature,
    },
    body: rawBody,
  });
  console.log(res.status, await res.text());
})();

curl testing example
Use a small Node one-liner to compute the signature, or precompute values:

TOKEN='your-token'
BODY='{"name":"John Doe","email":"john@example.com","source":"website"}'
METHOD='POST'
PATH='/api/leads'
TS=$(node -e 'console.log(Date.now())')
SIG=$(node -e "const c=require('crypto');const t=process.env.TOKEN;const d=process.env.DATA;console.log(c.createHmac('sha256', t).update(d).digest('hex'));" TOKEN="$TOKEN" DATA="$METHOD|$PATH|$BODY|$TS")

curl -i -X POST "https://your-api-domain.com$PATH" \
  -H "Content-Type: application/json" \
  -H "X-Landing-Token: $TOKEN" \
  -H "X-Landing-Timestamp: $TS" \
  -H "X-Landing-Signature: $SIG" \
  --data "$BODY"

Environment variables on API server
- LEADS_PUBLIC_TOKEN: required shared secret value.
- LEADS_TOKEN_WINDOW_MS: optional time window in ms (default 300000 = 5 minutes).
- LEADS_REPLAY_TTL_MS: optional replay cache TTL in ms (default 600000 = 10 minutes).
- CORS_ORIGINS: must include your landing page origin so the browser can call the API (already supported with X-Landing-* headers).

Common pitfalls and tips
- Method must be uppercase and match the actual request (POST).
- Path must match exactly what the API sees (includes '/api' global prefix). Include query string if present.
- Body must be JSON and rawBody in signature must exactly match the body sent. Build the body object and JSON.stringify once, reuse for signature and fetch body.
- Time window: ensure client clock is correct; if you get 401 with timestamp error, check drift.
- Replay detected (403): signatures are single-use for a short TTL. Recompute with a fresh timestamp for each submission.
- Horizontal scaling: The replay cache in the API is in-memory; if you run multiple instances, use a shared store (e.g., Redis) implementation.

Landing Page → API Leads Submission Integration Guide

This guide shows how to call POST /api/leads (simple body) or POST /api/leads/landing (structured landing body) from your landing page (hosted on a different origin) using the replay-safe headers required by the API.

Summary of required headers
- X-Landing-Token: Your shared secret configured in the API as LEADS_PUBLIC_TOKEN.
- X-Landing-Timestamp: Current Unix epoch time in milliseconds (e.g., Date.now()).
- X-Landing-Signature: HMAC-SHA256 signature in hex of the string:
  ${method}|${path}|${rawBody}|${timestamp}
  where:
  - method is uppercase HTTP method (e.g., POST)
  - path is the request path including the global prefix: /api/leads or /api/leads/landing (match the one you call)
  - rawBody is canonical JSON string of the body object using JSON.stringify
  - timestamp is the same value used in X-Landing-Timestamp

Structured landing payload (for /api/leads/landing)
Example body:
{
  "lead": { "name": "Okwudili Ezeoke", "email": "alexemerie7@gmail.com", "phone": "+447535887415" },
  "answers": { "1":"under10","2":"teachable","3":"50k-100k","4":"sole_decision","5":["email_behind","lose_track","no_followup"],"6":"scale_revenue","7":["client_email","lead_followup"],"8":"very" },
  "qualified": true,
  "submittedAt": "2025-08-11T13:50:04.994Z"
}

Important validation rules enforced by the API
- Token must equal LEADS_PUBLIC_TOKEN on the server.
- Timestamp must be within a time window (default 5 minutes). Clock skew matters; consider NTP or syncing server and client time.
- Signature must match exactly.
- Replay protection prevents reusing the same signature within a short TTL (default 10 minutes). Each unique signature can be used only once.

Security note
- Best practice: compute the signature on your own backend (proxy) so the token is not exposed in the browser.
- If you are purely static and must run entirely in the browser, you can compute the signature client-side; the replay and timestamp window reduce abuse if the token leaks, but the token is still extractable by an attacker.

Option A: Static browser (no backend) using Web Crypto API
Use this if your landing page is static and you accept exposing the token in the page.

Example form submit handler (vanilla JS):

```html
<script>
  async function hmacSha256Hex(keyUtf8, msgUtf8) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(keyUtf8),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msgUtf8));
    // Convert ArrayBuffer to hex
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function submitLead(e) {
    e.preventDefault();

    const apiBase = 'https://your-api-domain.com'; // e.g., https://api.nextlevelcoach.ai
    const path = '/api/leads'; // or '/api/leads/landing' when sending the structured payload
    const url = apiBase + path;

    // For '/api/leads' use the simple shape;
    // For '/api/leads/landing' use the structured payload shown above.
    const bodyObj = {
      name: document.querySelector('#name').value,
      email: document.querySelector('#email').value,
      phone: document.querySelector('#phone').value || undefined,
      source: 'website',
      notes: document.querySelector('#notes').value || undefined,
    };

    const rawBody = JSON.stringify(bodyObj);
    const method = 'POST';
    const timestamp = Date.now();

    const token = 'LEADS_PUBLIC_TOKEN_VALUE'; // WARNING: exposes token in client
    const dataToSign = `${method}|${path}|${rawBody}|${timestamp}`;
    const signature = await hmacSha256Hex(token, dataToSign);

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Landing-Token': token,
        'X-Landing-Timestamp': String(timestamp),
        'X-Landing-Signature': signature,
      },
      body: rawBody,
    });

    if (!res.ok) {
      const err = await res.text();
      alert(`Lead submit failed: ${res.status} ${err}`);
      return;
    }

    alert('Lead submitted successfully');
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#lead-form').addEventListener('submit', submitLead);
  });
</script>
```

Notes for browser approach
- The path must be exactly '/api/leads' (includes the Nest global prefix). If you add query strings, include them as part of path exactly as requested.
- rawBody must be the exact JSON you send in the body. We recommend building the object and then using JSON.stringify once to both sign and send.

Option B: Preferred secure approach via a lightweight proxy (e.g., Next.js API route)
This keeps the token private on your server.

Next.js (app router) route example at app/api/lead-proxy/route.ts:

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const bodyObj = await req.json();

    const apiBase = process.env.API_BASE_URL; // e.g., https://api.nextlevelcoach.ai
    const path = '/api/leads'; // or '/api/leads/landing'
    const url = apiBase + path;

    const rawBody = JSON.stringify(bodyObj);
    const method = 'POST';
    const timestamp = Date.now();

    const token = process.env.LEADS_PUBLIC_TOKEN!;
    const dataToSign = `${method}|${path}|${rawBody}|${timestamp}`;
    const signature = crypto.createHmac('sha256', token).update(dataToSign).digest('hex');

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Landing-Token': token,
        'X-Landing-Timestamp': String(timestamp),
        'X-Landing-Signature': signature,
      },
      body: rawBody,
    });

    const text = await res.text();
    return new NextResponse(text, { status: res.status });
  } catch (e) {
    console.error(e);
    return new NextResponse('Proxy error', { status: 500 });
  }
}

In your landing page, post to your proxy (same origin) instead of the API directly:

await fetch('/api/lead-proxy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });

Node.js standalone example (for servers or build scripts)

const crypto = require('crypto');
const fetch = require('node-fetch');

(async () => {
  const apiBase = process.env.API_BASE_URL; // e.g., https://api.nextlevelcoach.ai
  const path = '/api/leads'; // or '/api/leads/landing'
  const url = apiBase + path;

  const bodyObj = { name: 'John Doe', email: 'john@example.com', source: 'website' }; // use structured body for '/api/leads/landing'
  const rawBody = JSON.stringify(bodyObj);
  const method = 'POST';
  const timestamp = Date.now();

  const token = process.env.LEADS_PUBLIC_TOKEN;
  const dataToSign = `${method}|${path}|${rawBody}|${timestamp}`;
  const signature = crypto.createHmac('sha256', token).update(dataToSign).digest('hex');

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Landing-Token': token,
      'X-Landing-Timestamp': String(timestamp),
      'X-Landing-Signature': signature,
    },
    body: rawBody,
  });
  console.log(res.status, await res.text());
})();

curl testing example
Use a small Node one-liner to compute the signature, or precompute values:

TOKEN='your-token'
BODY='{"name":"John Doe","email":"john@example.com","source":"website"}'
METHOD='POST'
PATH='/api/leads'
TS=$(node -e 'console.log(Date.now())')
SIG=$(node -e "const c=require('crypto');const t=process.env.TOKEN;const d=process.env.DATA;console.log(c.createHmac('sha256', t).update(d).digest('hex'));" TOKEN="$TOKEN" DATA="$METHOD|$PATH|$BODY|$TS")

curl -i -X POST "https://your-api-domain.com$PATH" \
  -H "Content-Type: application/json" \
  -H "X-Landing-Token: $TOKEN" \
  -H "X-Landing-Timestamp: $TS" \
  -H "X-Landing-Signature: $SIG" \
  --data "$BODY"

Environment variables on API server
- LEADS_PUBLIC_TOKEN: required shared secret value.
- LEADS_TOKEN_WINDOW_MS: optional time window in ms (default 300000 = 5 minutes).
- LEADS_REPLAY_TTL_MS: optional replay cache TTL in ms (default 600000 = 10 minutes).
- CORS_ORIGINS: must include your landing page origin so the browser can call the API (already supported with X-Landing-* headers).

Common pitfalls and tips
- Method must be uppercase and match the actual request (POST).
- Path must match exactly what the API sees (includes '/api' global prefix). Include query string if present.
- Body must be JSON and rawBody in signature must exactly match the body sent. Build the body object and JSON.stringify once, reuse for signature and fetch body.
- Time window: ensure client clock is correct; if you get 401 with timestamp error, check drift.
- Replay detected (403): signatures are single-use for a short TTL. Recompute with a fresh timestamp for each submission.
- Horizontal scaling: The replay cache in the API is in-memory; if you run multiple instances, use a shared store (e.g., Redis) implementation.
