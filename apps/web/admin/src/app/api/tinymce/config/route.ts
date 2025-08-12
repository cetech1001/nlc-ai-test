import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.TINYMCE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'TinyMCE not configured' }, { status: 500 });
  }

  return NextResponse.json({
    apiKey,
  });
}
