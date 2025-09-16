export const getBillingReminderTemplate = (data: {
  coachName: string;
  amount: number;
  dueDate: Date;
  planName: string;
  paymentLink: string;
}): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Reminder</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #000000; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
        .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 50%, #FEBEFA 100%); padding: 40px 20px; text-align: center; }
        .content { padding: 40px 20px; color: #f5f5f4; }
        .payment-box { background-color: #2a2a2a; border: 2px solid #7B21BA; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .amount { font-size: 24px; font-weight: bold; color: #FEBEFA; }
        .button { display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin: 16px 0; }
        .footer { padding: 20px; text-align: center; color: #a0a0a0; font-size: 14px; border-top: 1px solid #2a2a2a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: white; margin: 0;">Payment Reminder</h1>
        </div>
        <div class="content">
          <h2 style="color: #FEBEFA;">Hi ${data.coachName},</h2>
          <p>This is a friendly reminder that your payment for the ${data.planName} plan is due soon.</p>

          <div class="payment-box">
            <h3 style="color: #FEBEFA; margin-top: 0;">Payment Details</h3>
            <div class="amount">$${(data.amount / 100).toFixed(2)}</div>
            <p style="color: #d6d3d1;">Due: ${data.dueDate.toLocaleDateString()}</p>
            <p style="color: #d6d3d1;">Plan: ${data.planName}</p>

            <a href="${data.paymentLink}" class="button">Make Payment</a>
          </div>

          <p>To avoid any interruption to your service, please complete your payment by the due date.</p>
          <p>If you have any questions about your billing, please don't hesitate to contact our support team.</p>

          <p>Thank you for being a valued customer!</p>
          <p>Best regards,<br>The Next Level Coach AI Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Next Level Coach AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getSubscriptionExpiryTemplate = (data: {
  coachName: string;
  planName: string;
  expiryDate: Date;
  renewalLink: string;
}): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Subscription Expiring Soon</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #000000; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 20px; text-align: center; }
        .content { padding: 40px 20px; color: #f5f5f4; }
        .warning-box { background-color: #2a1a1a; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .button { display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #a0a0a0; font-size: 14px; border-top: 1px solid #2a2a2a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: white; margin: 0;">⚠️ Subscription Expiring</h1>
        </div>
        <div class="content">
          <h2 style="color: #FEBEFA;">Hi ${data.coachName},</h2>
          <p>Your ${data.planName} subscription is set to expire soon.</p>

          <div class="warning-box">
            <h3 style="color: #dc2626; margin-top: 0;">Expiry Date</h3>
            <p style="font-size: 18px; font-weight: bold; color: #fca5a5;">${data.expiryDate.toLocaleDateString()}</p>
            <p style="color: #d6d3d1;">Don't lose access to your coaching tools!</p>
          </div>

          <p>To continue enjoying uninterrupted access to Next Level Coach AI, please renew your subscription before the expiry date.</p>

          <p style="text-align: center;">
            <a href="${data.renewalLink}" class="button">Renew Subscription</a>
          </p>

          <p>If you have any questions or need assistance, our support team is here to help.</p>

          <p>Best regards,<br>The Next Level Coach AI Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Next Level Coach AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
