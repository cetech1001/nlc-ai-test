export const getClientWelcomeTemplate = (data: {
  clientName: string;
  coachName: string;
  coachBusinessName?: string;
  welcomeMessage?: string;
  nextSteps?: string[];
}): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Your Coaching Journey</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #000000; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
        .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 50%, #FEBEFA 100%); padding: 40px 20px; text-align: center; }
        .logo { color: white; font-size: 24px; font-weight: bold; margin: 0; }
        .content { padding: 40px 20px; color: #f5f5f4; }
        .welcome-message { background-color: #2a2a2a; border-left: 4px solid #7B21BA; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .next-steps { background-color: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .step { margin: 10px 0; color: #d6d3d1; }
        .step-number { color: #FEBEFA; font-weight: bold; margin-right: 8px; }
        .footer { padding: 20px; text-align: center; color: #a0a0a0; font-size: 14px; border-top: 1px solid #2a2a2a; }
        .button { display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">${data.coachBusinessName || `${data.coachName}'s Coaching`}</h1>
        </div>
        <div class="content">
          <h2 style="color: #FEBEFA;">Welcome to Your Coaching Journey, ${data.clientName}! 🎉</h2>
          <p>I'm thrilled to have you as a client and excited to support you on your path to achieving your goals.</p>

          ${data.welcomeMessage ? `
          <div class="welcome-message">
            <h3 style="color: #FEBEFA; margin-top: 0;">Personal Welcome from ${data.coachName}:</h3>
            <p style="margin-bottom: 0;">${data.welcomeMessage}</p>
          </div>
          ` : ''}

          ${data.nextSteps && data.nextSteps.length > 0 ? `
          <div class="next-steps">
            <h3 style="color: #FEBEFA; margin-top: 0;">Your Next Steps:</h3>
            ${data.nextSteps.map((step, index) => `
              <div class="step">
                <span class="step-number">${index + 1}.</span>${step}
              </div>
            `).join('')}
          </div>
          ` : ''}

          <p>I'm here to support you every step of the way. Don't hesitate to reach out if you have any questions or need guidance.</p>

          <p>Here's to your success!</p>
          <p><strong style="color: #FEBEFA;">${data.coachName}</strong><br>
          ${data.coachBusinessName || 'Your Personal Coach'}</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 ${data.coachBusinessName || `${data.coachName}'s Coaching`}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getClientCheckInTemplate = (data: {
  clientName: string;
  coachName: string;
  coachBusinessName?: string;
  checkInMessage: string;
  questions?: string[];
}): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Check-in from ${data.coachName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); padding: 24px; border-radius: 8px 8px 0 0; color: white; }
        .content { padding: 32px 24px; }
        .questions { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .question { margin: 12px 0; color: #495057; font-weight: 500; }
        .footer { padding: 20px 24px; text-align: center; color: #6c757d; font-size: 12px; border-top: 1px solid #e9ecef; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">Check-in Time!</h2>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">From ${data.coachName}</p>
        </div>
        <div class="content">
          <p>Hi ${data.clientName},</p>
          <p>${data.checkInMessage}</p>

          ${data.questions && data.questions.length > 0 ? `
          <div class="questions">
            <h3 style="color: #7B21BA; margin-top: 0;">I'd love to hear your thoughts on:</h3>
            ${data.questions.map(question => `
              <div class="question">• ${question}</div>
            `).join('')}
          </div>
          ` : ''}

          <p>Feel free to reply to this email with your updates. I'm always here to support you!</p>
          <p>Best regards,<br><strong>${data.coachName}</strong></p>
        </div>
        <div class="footer">
          <p>This is a personal message from your coach.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
