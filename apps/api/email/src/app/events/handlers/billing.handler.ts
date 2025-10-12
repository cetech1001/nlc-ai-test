import {Injectable, Logger} from "@nestjs/common";
import {EventBusService} from "@nlc-ai/api-messaging";
import {PrismaService} from "@nlc-ai/api-database";

@Injectable()
export class BillingHandler {
  private readonly logger = new Logger(BillingHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly prisma: PrismaService,
  ) {
    this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      'email.billing-events',
      [
        'billing.payment.completed',
        'billing.payment.failed',
        'billing.subscription.activated',
        'billing.subscription.cancelled',
        'billing.invoice.issued'
      ],
      this.handleBillingEvents.bind(this)
    );
  }

  private async handleBillingEvents(event: any) {
    try {
      const { eventType, payload } = event;

      switch (eventType) {
        case 'billing.payment.completed':
          await this.handlePaymentCompleted(payload);
          break;
        case 'billing.payment.failed':
          await this.handlePaymentFailed(payload);
          break;
        case 'billing.subscription.activated':
          await this.handleSubscriptionActivated(payload);
          break;
        case 'billing.subscription.cancelled':
          await this.handleSubscriptionCancelled(payload);
          break;
        case 'billing.invoice.issued':
          await this.handleInvoiceIssued(payload);
          break;
      }
    } catch (error) {
      this.logger.error('Failed to handle billing event:', error);
    }
  }

  private async handlePaymentCompleted(payload: any) {
    const { coachID, amount, planName, transactionID } = payload;

    // Send payment confirmation email
    await this.sendPaymentConfirmationEmail(coachID, amount, planName, transactionID);
    this.logger.log(`Payment confirmation sent for transaction ${transactionID}`);
  }

  private async handlePaymentFailed(payload: any) {
    const { coachID, amount, reason, retryUrl } = payload;

    // Send payment failure notifications
    await this.sendPaymentFailureEmail(coachID, amount, reason, retryUrl);
    this.logger.log(`Payment failure notification sent to coach ${coachID}`);
  }

  private async handleSubscriptionActivated(payload: any) {
    const { coachID, planName, billingCycle } = payload;

    // Send subscription activation email
    await this.sendSubscriptionActivationEmail(coachID, planName, billingCycle);
    this.logger.log(`Subscription activation email sent to coach ${coachID}`);
  }

  private async handleSubscriptionCancelled(payload: any) {
    const { coachID, planName, cancelReason } = payload;

    // Send subscription cancellation confirmation
    await this.sendSubscriptionCancellationEmail(coachID, planName, cancelReason);
    this.logger.log(`Subscription cancellation email sent to coach ${coachID}`);
  }

  private async handleInvoiceIssued(payload: any) {
    const { coachID, invoiceNumber, amount, dueDate } = payload;

    // Send invoice notifications
    await this.sendInvoiceEmail(coachID, invoiceNumber, amount, new Date(dueDate));
    this.logger.log(`Invoice email sent to coach ${coachID} for invoice ${invoiceNumber}`);
  }

  private async sendPaymentConfirmationEmail(
    coachID: string,
    amount: number,
    planName: string,
    transactionID: string
  ) {
    // Get coach details
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!coach) return;

    /*const subject = 'Payment Confirmation - Next Level Coach AI';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
          .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .success-icon { font-size: 48px; color: #10b981; text-align: center; margin: 20px 0; }
          .amount { font-size: 32px; font-weight: bold; color: #FEBEFA; text-align: center; margin: 20px 0; }
          .details { background-color: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmed!</h1>
          </div>
          <div class="content">
            <div class="success-icon">✅</div>
            <h2 style="color: #FEBEFA; text-align: center;">Thank you for your payment</h2>

            <div class="amount">${(amount / 100).toFixed(2)}</div>

            <div class="details">
              <h3 style="color: #FEBEFA; margin-top: 0;">Payment Details</h3>
              <p><strong>Plan:</strong> ${planName}</p>
              <p><strong>Transaction ID:</strong> ${transactionID}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> Card ending in ****</p>
            </div>

            <p>Your subscription is now active and you have full access to all features.</p>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>

            <p>Best regards,<br>The Next Level Coach AI Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.emailService.sendEmail({
      to: coach.email,
      subject,
      html,
      templateID: 'payment-confirmation',
      metadata: { coachID, transactionID, amount, planName },
    });*/
  }

  private async sendPaymentFailureEmail(
    coachID: string,
    amount: number,
    reason: string,
    retryUrl: string
  ) {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!coach) return;

    /*const subject = 'Payment Issue - Action Required';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Issue</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .warning-icon { font-size: 48px; color: #ef4444; text-align: center; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .details { background-color: #2a2a2a; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Issue</h1>
          </div>
          <div class="content">
            <div class="warning-icon">⚠️</div>
            <h2 style="color: #ef4444; text-align: center;">Payment Could Not Be Processed</h2>

            <div class="details">
              <h3 style="color: #ef4444; margin-top: 0;">Payment Details</h3>
              <p><strong>Amount:</strong> ${(amount / 100).toFixed(2)}</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <p>We were unable to process your payment. To continue enjoying uninterrupted access to Next Level Coach AI, please update your payment method.</p>

            <p style="text-align: center;">
              <a href="${retryUrl}" class="button">Update Payment Method</a>
            </p>

            <p>If you continue to experience issues, please contact our support team for assistance.</p>

            <p>Best regards,<br>The Next Level Coach AI Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.emailService.sendEmail({
      to: coach.email,
      subject,
      html,
      templateID: 'payment-failure',
      metadata: { coachID, amount, reason },
    });*/
  }

  private async sendSubscriptionActivationEmail(
    coachID: string,
    planName: string,
    billingCycle: string
  ) {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!coach) return;

    /*const subject = `Welcome to ${planName} - Your Subscription is Active!`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Subscription Activated</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
          .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .success-icon { font-size: 48px; color: #10b981; text-align: center; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .features { background-color: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature { margin: 10px 0; color: #d6d3d1; }
          .checkmark { color: #10b981; margin-right: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Subscription Activated!</h1>
          </div>
          <div class="content">
            <div class="success-icon">✅</div>
            <h2 style="color: #FEBEFA; text-align: center;">Welcome to ${planName}</h2>

            <p>Congratulations! Your ${planName} subscription is now active with ${billingCycle} billing.</p>

            <div class="features">
              <h3 style="color: #FEBEFA; margin-top: 0;">What's included in your plan:</h3>
              <div class="feature"><span class="checkmark">✓</span> Unlimited email sequences</div>
              <div class="feature"><span class="checkmark">✓</span> AI-powered response generation</div>
              <div class="feature"><span class="checkmark">✓</span> Advanced analytics and insights</div>
              <div class="feature"><span class="checkmark">✓</span> Priority customer support</div>
              <div class="feature"><span class="checkmark">✓</span> Custom email templates</div>
            </div>

            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Access Your Dashboard</a>
            </p>

            <p>Ready to take your coaching business to the next level? Start by setting up your first email sequence!</p>

            <p>Best regards,<br>The Next Level Coach AI Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.emailService.sendEmail({
      to: coach.email,
      subject,
      html,
      templateID: 'subscription-activation',
      metadata: { coachID, planName, billingCycle },
    });*/
  }

  private async sendSubscriptionCancellationEmail(
    coachID: string,
    planName: string,
    cancelReason?: string
  ) {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!coach) return;

    /*const subject = 'Subscription Cancelled - We\'re Sorry to See You Go';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Subscription Cancelled</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
          .header { background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%); padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Cancelled</h1>
          </div>
          <div class="content">
            <h2 style="color: #FEBEFA;">We're sorry to see you go</h2>

            <p>Your ${planName} subscription has been cancelled as requested.</p>

            ${cancelReason ? `<p><strong>Cancellation reason:</strong> ${cancelReason}</p>` : ''}

            <p>Your account will remain active until the end of your current billing period. You'll continue to have access to all features until then.</p>

            <p>We'd love to have you back anytime! If you change your mind, you can reactivate your subscription at any time.</p>

            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/billing" class="button">Reactivate Subscription</a>
            </p>

            <p>If you have any feedback on how we can improve, please don't hesitate to reach out.</p>

            <p>Best regards,<br>The Next Level Coach AI Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.emailService.sendEmail({
      to: coach.email,
      subject,
      html,
      templateID: 'subscription-cancellation',
      metadata: { coachID, planName, cancelReason },
    });*/
  }

  private async sendInvoiceEmail(
    coachID: string,
    invoiceNumber: string,
    amount: number,
    dueDate: Date
  ) {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachID },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!coach) return;

    /*const subject = `Invoice ${invoiceNumber} - Next Level Coach AI`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
          .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); padding: 40px 20px; text-align: center; }
          .content { padding: 40px 20px; }
          .invoice-details { background-color: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #FEBEFA; }
          .button { display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Invoice</h1>
          </div>
          <div class="content">
            <h2 style="color: #FEBEFA;">Invoice ${invoiceNumber}</h2>

            <div class="invoice-details">
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount Due:</strong> <span class="amount">${(amount / 100).toFixed(2)}</span></p>
              <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
              <p><strong>Issued:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <p>Your invoice for Next Level Coach AI services is ready. Please review and complete payment by the due date to avoid any service interruption.</p>

            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/billing/invoices/${invoiceNumber}" class="button">View & Pay Invoice</a>
            </p>

            <p>If you have any questions about this invoice, please contact our billing team.</p>

            <p>Best regards,<br>The Next Level Coach AI Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.emailService.sendEmail({
      to: coach.email,
      subject,
      html,
      templateID: 'invoice',
      metadata: { coachID, invoiceNumber, amount, dueDate: dueDate.toISOString() },
    });*/
  }
}
