-- Seed system email templates
INSERT INTO email_templates (
  id,
  "userID",
  "userType",
  "templateType",
  name,
  category,
  "subjectTemplate",
  "bodyTemplate",
  "systemKey",
  "isAiGenerated",
  "generationPrompt",
  "usageCount",
  "lastUsedAt",
  "isActive",
  "isDefault",
  description,
  variables,
  "createdAt",
  "updatedAt"
) VALUES
    (
      'b965e2cd-6706-475d-8ace-8cd186878f1f'::uuid,
      NULL,
      NULL,
      'system',
      'Reset Password Template',
      'auth',
      'Reset Your {{appName}} Password',
      '<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; margin: 0; padding: 0; background-color: #000000; }
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
                <h1 class="logo">{{appName}}</h1>
              </div>
              <div class="content">
                <h2 style="color: #f5f5f4; margin-top: 0;">Reset Your Password</h2>
                <p>We received a request to reset your password. Use the verification code below to proceed:</p>

                <div class="code-box">
                  <div class="code">{{verificationCode}}</div>
                </div>

                <div class="button-container">
                  <a href="{{baseUrl}}/account-verification?email={{email}}&type=password_reset" class="verify-button">
                    Verify & Reset Password
                  </a>
                </div>

                <p style="color: #a0a0a0; font-size: 14px; text-align: center;">Or copy and paste this link into your browser:<br>
                <span style="color: #B339D4; word-break: break-all;">{{baseUrl}}/account-verification?email={{email}}&type=password_reset</span></p>

                <div class="warning">
                  <p style="margin: 0; color: #fca5a5;"><strong>Security Notice:</strong> This code expires in 10 minutes. If you didn''t request a password reset, please ignore this email and consider changing your password.</p>
                </div>

                <p>Best regards,<br>The {{appName}} Team</p>
              </div>
              <div class="footer">
                <p>&copy; {{currentYear}} {{appName}}. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>',
      'password_reset',
      false,
      NULL,
      0,
      NULL,
      true,
      false,
      NULL,
      ARRAY['appName', 'currentYear', 'verificationCode', 'baseUrl', 'email']::text[],
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    ),
    (
      '1ba90acb-fb97-473a-9f80-fb4b038da96b'::uuid,
      NULL,
      NULL,
      'system',
      'Email Verification Template',
      'auth',
      'Verify Your {{appName}} Account',
      '<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Account</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; margin: 0; padding: 0; background-color: #000000; }
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
                <h1 class="logo">{{appName}}</h1>
              </div>
              <div class="content">
                <h2 style="color: #f5f5f4; margin-top: 0;">Verify Your Account</h2>
                <p>Thank you for signing up for {{appName}}! To complete your registration, please use the verification code below:</p>

                <div class="code-box">
                  <div class="code">{{verificationCode}}</div>
                </div>

                <p><strong>This code expires in 10 minutes.</strong></p>
                <p>If you didn''t request this verification, please ignore this email.</p>

                <p>Best regards,<br>The {{appName}} Team</p>
              </div>
              <div class="footer">
                <p>&copy; {{currentYear}} {{appName}}. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>',
      'email_verification',
      false,
      NULL,
      0,
      NULL,
      true,
      false,
      NULL,
      ARRAY['appName', 'currentYear', 'verificationCode']::text[],
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    ),
    (
      '562a4b9a-22d2-458b-8e7a-3665ca971c3d'::uuid,
      NULL,
      NULL,
      'system',
      'Coach Welcome Template',
      'auth',
      'Welcome to {{appName}}',
      '<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to {{appName}}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; margin: 0; padding: 0; background-color: #000000; }
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
                <h1 class="logo">{{appName}}</h1>
              </div>
              <div class="content">
                <h2 style="color: #f5f5f4; margin-top: 0;">Welcome, {{name}}! 🎉</h2>
                <p>Your {{appName}} account has been successfully created. You''re now part of a revolutionary platform that will transform how you connect with and serve your clients.</p>

                <div class="feature-list">
                  <h3 style="color: #FEBEFA; margin-top: 0;">What you can do now:</h3>
                  <div class="feature">🤖 AI-powered email management and responses</div>
                  <div class="feature">📊 Client engagement tracking and analytics</div>
                  <div class="feature">💡 AI-generated content suggestions</div>
                  <div class="feature">🔄 Automated client follow-ups and check-ins</div>
                  <div class="feature">📅 Calendar integration and scheduling</div>
                </div>

                <p style="text-align: center;">
                  <a href="{{baseUrl}}/login" class="button">Access Your Dashboard</a>
                </p>

                <p>If you have any questions or need assistance, our support team is here to help!</p>

                <p>Best regards,<br>The {{appName}} Team</p>
              </div>
              <div class="footer">
                <p>&copy; {{currentYear}} {{appName}}. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>',
      'welcome_coach',
      false,
      NULL,
      0,
      NULL,
      true,
      false,
      NULL,
      ARRAY['appName', 'currentYear', 'baseUrl', 'name']::text[],
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    ),
    (
      'f9e2544a-b510-48eb-b5bc-25454f00aff8'::uuid,
      NULL,
      NULL,
      'system',
      'Client Invitation Template',
      'auth',
      'You''ve been invited to join {{businessName}}',
      $$<!doctype html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <meta name="x-apple-disable-message-reformatting">
        <title>Coaching Invitation</title>
        <!--[if mso]>
          <noscript>
            <xml>
              <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
          </noscript>
        <![endif]-->
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .p-40 { padding: 24px !important; }
            .btn { padding: 14px 20px !important; font-size: 16px !important; }
            h1 { font-size: 28px !important; }
            h2 { font-size: 20px !important; }
          }
        </style>
      </head>
      <body style="margin:0; padding:0; background:#000000;">
        <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:#000000; opacity:0;">
          You're invited to join {{businessName}} — accept your coaching invitation from {{coachName}}.
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#000000">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px; max-width:600px;">
            <tr>
              <td bgcolor="#7B21BA" style="background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); padding: 40px 20px; text-align:center; color:#FFFFFF; font-family: Arial, Helvetica, sans-serif;">
                <!--[if mso]>
                  <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;height:auto;">
                    <v:fill type="gradient" color="#7B21BA" color2="#B339D4" angle="135"/>
                    <v:textbox inset="0,0,0,0">
                <![endif]-->
                <div style="background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); padding: 0; margin:0;">
                  <h1 style="margin:0; font-size:32px; line-height:1.25;">You're Invited!</h1>
                  <p style="margin:8px 0 0; opacity:0.9; font-size:16px;">Join {{businessName}}</p>
                </div>
                <!--[if mso]></v:textbox></v:rect><![endif]-->
              </td>
            </tr>

            <tr>
              <td bgcolor="#1A1A1A" class="p-40" style="padding:40px 20px; color:#FFFFFF; font-family: Arial, Helvetica, sans-serif; line-height:1.6;">
                <h2 style="margin:0 0 16px; color:#FEBEFA; font-size:22px; line-height:1.4;">Welcome to Your Coaching Journey</h2>
                <p style="margin:0 0 12px;">Hi there!</p>
                <p style="margin:0 0 16px;">{{coachName}} has invited you to join their coaching program. This is the beginning of an exciting journey toward achieving your goals!</p>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;">
                  <tr>
                    <td bgcolor="#2A2A2A" style="border-left:4px solid #7B21BA; padding:20px; color:#FFFFFF;">
                      <h3 style="margin:0 0 8px; color:#FEBEFA; font-size:18px;">Personal Message from {{coachName}}:</h3>
                      <p style="margin:0;">{{message}}</p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 20px auto;">
                  <tr>
                    <td align="center">
                      <!--[if mso]>
                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{inviteUrl}}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="12%" strokecolor="#7B21BA" fillcolor="#7B21BA">
                          <w:anchorlock/>
                          <center style="color:#FFFFFF;font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:bold;">Accept Invitation</center>
                        </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-- -->
                      <a class="btn" href="{{inviteUrl}}" target="_blank" style="background:#7B21BA; background-image: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); border-radius:8px; color:#FFFFFF; display:inline-block; font-family: Arial, Helvetica, sans-serif; font-size:16px; font-weight:700; line-height:48px; text-align:center; text-decoration:none; width:260px; -webkit-text-size-adjust:none; mso-hide:all;">Accept Invitation</a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 12px; font-size:14px; color:#CFCFCF;">{{expiryText}}</p>
                <p style="margin:0 0 12px;">If you have any questions, feel free to reply to this email.</p>
                <p style="margin:0 0 0;">Looking forward to working with you!</p>

                <p style="margin:16px 0 0; font-weight:bold;">{{coachName}}<br>
                  <span style="font-weight:normal; color:#CFCFCF;">{{businessNameTagline}}</span>
                </p>

                <p style="margin:20px 0 0; font-size:12px; color:#8E8E8E;">If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="{{inviteUrl}}" style="color:#B339D4; text-decoration:underline; word-break:break-all;">{{inviteUrl}}</a>
                </p>
              </td>
            </tr>

            <tr>
              <td bgcolor="#0E0E0E" style="padding:20px; text-align:center; color:#9A9A9A; font-family: Arial, Helvetica, sans-serif; font-size:12px;">
                <p style="margin:0;">© {{currentYear}} {{appName}}. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>$$,
  'client_invite',
  false,
  NULL,
  0,
  NULL,
  true,
  false,
  NULL,
  ARRAY['appName', 'businessName', 'coachName', 'businessNameTagline', 'inviteUrl', 'message', 'expiryText', 'currentYear']::text[],
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  '05d5a158-8def-4d9c-97c4-36dc9867d904'::uuid,
  NULL,
  NULL,
  'system',
  'Password Reset Confirmation Template',
  'auth',
  'Password Reset Successful',
  '<!DOCTYPE html>
      <html>
      <head>
        <title>Password Reset Successful</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #000; color: #fff; }
          .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 20px; }
          .header { background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Successful</h1>
          </div>
          <div style="padding: 20px;">
            <p>Your password has been successfully reset.</p>
            <p>If you did not request this change, please contact our support team immediately.</p>
            <p>Best regards,<br>The {{appName}} Team</p>
          </div>
        </div>
      </body>
      </html>',
  'password_reset_success',
  false,
  NULL,
  0,
  NULL,
  true,
  false,
  NULL,
  ARRAY['appName']::text[],
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;
