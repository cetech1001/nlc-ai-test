import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendPaymentRequestEmail(data: {
    to: string;
    payerName: string;
    itemName: string;
    itemDescription?: string | null;
    amount: number;
    paymentLink: string;
    description?: string;
  }): Promise<void> {
    // Minimal stub for Billing extraction: log-only behavior
    this.logger.log(`sendPaymentRequestEmail -> to: ${data.to}, coach: ${data.payerName}, plan: ${data.itemName}, amount: $${data.amount}`);
    this.logger.log(`Payment link: ${data.paymentLink}`);
  }
}
