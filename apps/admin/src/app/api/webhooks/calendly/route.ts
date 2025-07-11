import { NextRequest, NextResponse } from 'next/server';
import {calendlyAPI} from "@nlc-ai/api-client";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Verify the webhook signature (implement based on Calendly's documentation)
    const signature = request.headers.get('calendly-webhook-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Process the webhook
    await calendlyAPI.handleWebhook(payload);

    // Broadcast the update to connected clients (you can use WebSockets, Server-Sent Events, etc.)
    await broadcastCalendarUpdate(payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function broadcastCalendarUpdate(payload: any) {
  // This is where you'd implement real-time updates
  // You could use WebSockets, Server-Sent Events, or a service like Pusher

  // For now, we'll just log the event
  console.log('Broadcasting calendar update:', {
    event: payload.event,
    timestamp: new Date().toISOString(),
    data: payload
  });

  // Example: If using Server-Sent Events
  // await notifyClients('calendar-update', payload);

  // Example: If using WebSockets
  // websocketServer.broadcast('calendar-update', payload);

  // Example: If using Pusher
  // pusher.trigger('calendar-channel', 'update', payload);
}
