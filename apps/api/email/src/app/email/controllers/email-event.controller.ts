import {Body, Controller, Logger, Post} from "@nestjs/common";
import {ApiOperation} from "@nestjs/swagger";
import {EmailService} from "../services/email.service";

@Controller('internal/email-events')
export class EmailEventController {
  private readonly logger = new Logger(EmailEventController.name);

  constructor(private readonly emailService: EmailService) {}

  @Post('test-webhook')
  @ApiOperation({ summary: 'Test webhook endpoint for development' })
  async testWebhook(@Body() body: any) {
    this.logger.log('Test webhook received:', body);

    // Simulate different event types for testing
    const testEvents = {
      opened: () => this.emailService.trackEmailOpen('test-message-id', {
        opened: true,
        openedAt: new Date(),
        userAgent: 'Test User Agent',
        ipAddress: '127.0.0.1',
      }),
      clicked: () => this.emailService.trackEmailClick('test-message-id', 'https://example.com', {
        clicked: true,
        clickedAt: new Date(),
        userAgent: 'Test User Agent',
        ipAddress: '127.0.0.1',
      }),
      bounced: () => this.emailService.trackEmailBounce('test-message-id', 'Test bounce reason'),
      complained: () => this.emailService.trackEmailComplaint('test-message-id'),
      unsubscribed: () => this.emailService.trackEmailUnsubscribe('test-message-id', 'test@example.com'),
    };

    const eventType = body.eventType as keyof typeof testEvents;
    if (testEvents[eventType]) {
      await testEvents[eventType]();
      return { status: 'ok', message: `Test ${eventType} event processed` };
    }

    return { status: 'error', message: 'Unknown event type' };
  }
}
