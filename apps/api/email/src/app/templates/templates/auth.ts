export const getVerificationEmailTemplate = (code: string): string => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Account</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #000000; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
          .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 50%, #FEBEFA 100%); padding: 40px 20px; text-align: center; }
          .logo { color: white; font-size: 24px; font-weight: bold; margin: 0; }
          .content { padding: 40px 20px; color: #f5f5f4; }
          .code-box { background-color: #2a2a2a; border: 2px solid #7B21BA; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
          .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #FEBEFA; font-family: monospace; }
          .footer { padding: 20px; text-align: center; color: #a0a0a0; font-size: 14px; border-top: 1px solid #2a2a2a; }
          .button { display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">Next Level Coach AI</h1>
          </div>
          <div class="content">
            <h2 style="color: #f5f5f4; margin-top: 0;">Verify Your Account</h2>
            <p>Thank you for signing up for Next Level Coach AI! To complete your registration, please use the verification code below:</p>

            <div class="code-box">
              <div class="code">${code}</div>
            </div>

            <p><strong>This code expires in 10 minutes.</strong></p>
            <p>If you didn't request this verification, please ignore this email.</p>

            <p>Best regards,<br>The Next Level Coach AI Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Next Level Coach AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
}

export const getPasswordResetEmailTemplate = (code: string, coachDashboardUrl: string, email: string): string => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #000000; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
          .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 50%, #FEBEFA 100%); padding: 40px 20px; text-align: center; }
          .logo { color: white; font-size: 24px; font-weight: bold; margin: 0; }
          .content { padding: 40px 20px; color: #f5f5f4; }
          .code-box { background-color: #2a2a2a; border: 2px solid #7B21BA; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
          .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #FEBEFA; font-family: monospace; }
          .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #7B21BA 0%, #B339D4 50%, #FEBEFA 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(123, 33, 186, 0.3);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(123, 33, 186, 0.4);
          }
          .button-container { text-align: center; margin: 30px 0; }
          .footer { padding: 20px; text-align: center; color: #a0a0a0; font-size: 14px; border-top: 1px solid #2a2a2a; }
          .warning { background-color: #2a1a1a; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">Next Level Coach AI</h1>
          </div>
          <div class="content">
            <h2 style="color: #f5f5f4; margin-top: 0;">Reset Your Password</h2>
            <p>We received a request to reset your password. Use the verification code below to proceed:</p>

            <div class="code-box">
              <div class="code">${code}</div>
            </div>

            <div class="button-container">
              <a href="${coachDashboardUrl}/account-verification?email=${email}&type=password_reset" class="verify-button">
                Verify & Reset Password
              </a>
            </div>

            <p style="color: #a0a0a0; font-size: 14px; text-align: center;">Or copy and paste this link into your browser:<br>
            <span style="color: #B339D4; word-break: break-all;">${coachDashboardUrl}/account-verification?email=${email}&type=password_reset</span></p>

            <div class="warning">
              <p style="margin: 0; color: #fca5a5;"><strong>Security Notice:</strong> This code expires in 10 minutes. If you didn't request a password reset, please ignore this email and consider changing your password.</p>
            </div>

            <p>Best regards,<br>The Next Level Coach AI Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Next Level Coach AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
}

export const getWelcomeEmailTemplate = (name: string, frontendURL: string): string => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Next Level Coach AI</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #000000; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
          .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 50%, #FEBEFA 100%); padding: 40px 20px; text-align: center; }
          .logo { color: white; font-size: 24px; font-weight: bold; margin: 0; }
          .content { padding: 40px 20px; color: #f5f5f4; }
          .button { display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin: 20px 0; }
          .feature-list { background-color: #2a2a2a; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .feature { margin: 10px 0; color: #d6d3d1; }
          .footer { padding: 20px; text-align: center; color: #a0a0a0; font-size: 14px; border-top: 1px solid #2a2a2a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">Next Level Coach AI</h1>
          </div>
          <div class="content">
            <h2 style="color: #f5f5f4; margin-top: 0;">Welcome, ${name}! 🎉</h2>
            <p>Your Next Level Coach AI account has been successfully created. You're now part of a revolutionary platform that will transform how you connect with and serve your clients.</p>

            <div class="feature-list">
              <h3 style="color: #FEBEFA; margin-top: 0;">What you can do now:</h3>
              <div class="feature">🤖 AI-powered email management and responses</div>
              <div class="feature">📊 Client engagement tracking and analytics</div>
              <div class="feature">💡 AI-generated content suggestions</div>
              <div class="feature">🔄 Automated client follow-ups and check-ins</div>
              <div class="feature">📅 Calendar integration and scheduling</div>
            </div>

            <p style="text-align: center;">
              <a href="${frontendURL}/login" class="button">Access Your Dashboard</a>
            </p>

            <p>If you have any questions or need assistance, our support team is here to help!</p>

            <p>Best regards,<br>The Next Level Coach AI Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Next Level Coach AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
}
