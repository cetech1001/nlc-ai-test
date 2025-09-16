export const getPaymentRequestEmailTemplate = (data: {
  coachName: string;
  planName: string;
  planDescription?: string;
  amount: number;
  paymentLink: string;
  description?: string;
}): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Request - ${data.planName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #000000; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
        .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 50%, #FEBEFA 100%); padding: 40px 20px; text-align: center; }
        .logo { color: white; font-size: 24px; font-weight: bold; margin: 0; }
        .content { padding: 40px 20px; color: #f5f5f4; }
        .payment-card { background-color: #2a2a2a; border: 2px solid #7B21BA; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
        .amount { font-size: 36px; font-weight: bold; color: #FEBEFA; margin: 16px 0; }
        .plan-name { font-size: 24px; font-weight: 600; color: #ffffff; margin: 8px 0; }
        .plan-description { color: #d6d3d1; margin: 12px 0; font-size: 14px; }
        .payment-button { display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .security-note { background-color: #2a2a2a; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px; }
        .footer { padding: 20px; text-align: center; color: #a0a0a0; font-size: 14px; border-top: 1px solid #2a2a2a; }
        .features { background-color: #2a2a2a; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .feature { margin: 8px 0; color: #d6d3d1; display: flex; align-items: center; }
        .checkmark { color: #10b981; margin-right: 8px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">Next Level Coach AI</h1>
        </div>
        <div class="content">
          <h2 style="color: #f5f5f4; margin-top: 0;">Payment Request</h2>
          <p>Hello ${data.coachName},</p>
          <p>You have received a payment request for your coaching plan subscription. Please review the details below and complete your payment to activate your subscription.</p>

          <div class="payment-card">
            <div class="plan-name">${data.planName}</div>
            ${data.planDescription ? `<div class="plan-description">${data.planDescription}</div>` : ''}
            <div class="amount">$${data.amount}</div>
            ${data.description ? `<p style="color: #d6d3d1; margin: 16px 0;">${data.description}</p>` : ''}

            <a href="${data.paymentLink}" class="payment-button">Complete Payment Securely</a>
          </div>

          <div class="security-note">
            <h4 style="color: #10b981; margin-top: 0;">🔒 Secure Payment Process</h4>
            <p style="margin: 0; color: #d6d3d1; font-size: 14px;">
              This payment link takes you to Stripe's secure payment page. Your payment information is encrypted and never stored on our servers.
            </p>
          </div>

          <div class="features">
            <h4 style="color: #FEBEFA; margin-top: 0;">What happens next?</h4>
            <div class="feature">
              <span class="checkmark">✓</span>
              <span>Immediate subscription activation</span>
            </div>
            <div class="feature">
              <span class="checkmark">✓</span>
              <span>Email receipt and confirmation</span>
            </div>
            <div class="feature">
              <span class="checkmark">✓</span>
              <span>Full access to your coaching platform</span>
            </div>
            <div class="feature">
              <span class="checkmark">✓</span>
              <span>24/7 customer support</span>
            </div>
          </div>

          <p><strong>Need help?</strong> If you have any questions about this payment request or need assistance, please contact our support team.</p>

          <p>Best regards,<br>The Next Level Coach AI Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Next Level Coach AI. All rights reserved.</p>
          <p style="font-size: 12px; color: #666;">This payment link is secure and expires in 30 days.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export const getPaymentRequestText = (data: {
  coachName: string;
  planName: string;
  amount: number;
  paymentLink: string;
  description?: string;
}): string => {
  return `
Hello ${data.coachName},

You have received a payment request for the ${data.planName} plan subscription.

Amount: $${data.amount}
Plan: ${data.planName}
${data.description ? `Description: ${data.description}` : ''}

To complete your payment, please click the link below:
${data.paymentLink}

This secure payment link will take you to Stripe's payment page where you can safely enter your payment details.

If you have any questions, please contact our support team.

Best regards,
The Next Level Coach AI Team
    `.trim();
}
