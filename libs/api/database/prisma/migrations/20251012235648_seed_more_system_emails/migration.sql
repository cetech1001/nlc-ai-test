-- Insert Billing Reminder Template
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
) VALUES (
  'b8c9d0e1-f2a3-4567-1234-678901234567'::uuid,
  NULL,
  NULL,
  'system',
  'Billing Reminder Template',
  'billing',
  'Payment Reminder - {{planName}}',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Reminder</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%);
      padding: 30px;
      text-align: center;
    }
    .logo-img {
      max-width: 192px;
      height: auto;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 20px;
    }
    .message {
      color: #6b7280;
      line-height: 1.8;
      margin-bottom: 20px;
    }
    .payment-box {
      background-color: #f9fafb;
      border: 2px solid #7B21BA;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .payment-box h3 {
      color: #7B21BA;
      margin-top: 0;
      font-size: 16px;
    }
    .amount {
      font-size: 24px;
      font-weight: bold;
      color: #7B21BA;
      margin: 15px 0;
    }
    .payment-detail {
      color: #6b7280;
      margin: 8px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 500;
      margin: 16px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px 30px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }
    .footer p {
      margin: 5px 0;
      font-size: 12px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="https://d159ubt2zvt6ob.cloudfront.net/nlc-ai/brands/logo-large.png" alt="{{appName}} Logo" class="logo-img">
    </div>

    <div class="content">
      <p class="greeting">Hi {{coachName}},</p>
      <p class="message">This is a friendly reminder that your payment for the {{planName}} plan is due soon.</p>

      <div class="payment-box">
        <h3>Payment Details</h3>
        <div class="amount">{{amount}}</div>
        <p class="payment-detail">Due: {{dueDate}}</p>
        <p class="payment-detail">Plan: {{planName}}</p>
        <a href="{{paymentLink}}" class="button">Make Payment</a>
      </div>

      <p class="message">To avoid any interruption to your service, please complete your payment by the due date.</p>
      <p class="message">If you have any questions about your billing, please don''t hesitate to contact our support team.</p>
      <p class="message">Thank you for being a valued customer!</p>

      <p class="message" style="margin-top: 30px;">Best regards,<br><strong style="color: #111827;">The {{appName}} Team</strong></p>
    </div>

    <div class="footer">
      <p>&copy; {{currentYear}} {{appName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>',
  'billing_reminder',
  false,
  NULL,
  0,
  NULL,
  true,
  false,
  NULL,
  ARRAY['appName', 'coachName', 'planName', 'amount', 'dueDate', 'paymentLink', 'currentYear']::text[],
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Insert Email Sequence Complete Template
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
) VALUES (
           'a7b8c9d0-e1f2-3456-0123-567890123456'::uuid,
           NULL,
           NULL,
           'system',
           'Email Sequence Complete Template',
           'lead_followup',
           'Thank you for your time, {{leadName}}',
           '<!DOCTYPE html>
         <html lang="en">
         <head>
           <meta charset="utf-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>Thank you for your time</title>
           <style>
             body {
               font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif;
               line-height: 1.6;
               color: #374151;
               margin: 0;
               padding: 0;
               background-color: #f3f4f6;
             }
             .email-container {
               max-width: 600px;
               margin: 0 auto;
               background-color: #ffffff;
             }
             .header {
               background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%);
               padding: 30px;
               text-align: center;
             }
             .logo-img {
               max-width: 192px;
               height: auto;
             }
             .header-title {
               color: #ffffff;
               font-size: 20px;
               font-weight: 600;
               margin: 15px 0 0 0;
             }
             .content {
               padding: 40px 30px;
               text-align: center;
             }
             .greeting {
               font-size: 18px;
               font-weight: 600;
               color: #111827;
               margin-bottom: 20px;
             }
             .message {
               color: #6b7280;
               line-height: 1.8;
               margin-bottom: 20px;
             }
             .summary-box {
               background-color: #f9fafb;
               border: 1px solid #7B21BA;
               border-radius: 8px;
               padding: 24px;
               margin: 24px 0;
             }
             .summary-box h3 {
               color: #7B21BA;
               margin-top: 0;
               font-size: 16px;
             }
             .summary-box p {
               color: #6b7280;
               margin: 10px 0;
             }
             .cta-button {
               display: inline-block;
               background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%);
               color: #ffffff;
               text-decoration: none;
               padding: 16px 32px;
               border-radius: 8px;
               font-weight: 600;
               margin: 24px 0;
             }
             .footer {
               background-color: #f9fafb;
               padding: 20px 30px;
               border-top: 1px solid #e5e7eb;
               text-align: center;
             }
             .footer p {
               margin: 5px 0;
               font-size: 12px;
               color: #9ca3af;
             }
           </style>
         </head>
         <body>
           <div class="email-container">
             <div class="header">
               <img src="https://d159ubt2zvt6ob.cloudfront.net/nlc-ai/brands/logo-large.png" alt="{{appName}} Logo" class="logo-img">
               <h1 class="header-title">{{coachBusinessName}}</h1>
             </div>

             <div class="content">
               <p class="greeting">Thank you for your time, {{leadName}}</p>

               <div class="summary-box">
                 <h3>Our Journey Together</h3>
                 <p>Over the past few weeks, I''ve shared {{totalEmailsSent}} messages with valuable insights and strategies to help you on your journey.</p>
                 <p>I hope you''ve found them helpful and actionable.</p>
               </div>

               <p class="message">While this email sequence has come to an end, my door is always open if you''d like to take the next step in your development.</p>

               {{#if ctaText}}
               <a href="{{ctaLink}}" class="cta-button">{{ctaText}}</a>
               {{/if}}

               <p class="message" style="margin-top: 32px;">Thank you for allowing me to be part of your journey.</p>

               <p class="message" style="margin-top: 24px;">
                 <strong style="color: #111827;">{{coachName}}</strong><br>
                 <span style="color: #6b7280;">{{coachBusinessName}}</span>
               </p>
             </div>

             <div class="footer">
               <p>&copy; {{currentYear}} {{appName}}. All rights reserved.</p>
             </div>
           </div>
         </body>
         </html>',
           'email_sequence_complete',
           false,
           NULL,
           0,
           NULL,
           true,
           false,
           NULL,
           ARRAY['appName', 'leadName', 'coachName', 'coachBusinessName', 'totalEmailsSent', 'ctaText', 'ctaLink', 'currentYear']::text[],
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
         ) ON CONFLICT (id) DO NOTHING;

-- Insert Payment Request Template
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
) VALUES (
           'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
           NULL,
           NULL,
           'system',
           'Payment Request Template',
           'billing',
           'Payment Request - {{planName}}',
           '<!DOCTYPE html>
         <html lang="en">
         <head>
           <meta charset="utf-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>Payment Request - {{planName}}</title>
           <style>
             body {
               font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif;
               line-height: 1.6;
               color: #374151;
               margin: 0;
               padding: 0;
               background-color: #f3f4f6;
             }
             .email-container {
               max-width: 600px;
               margin: 0 auto;
               background-color: #ffffff;
             }
             .header {
               background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%);
               padding: 30px;
               text-align: center;
             }
             .logo-img {
               max-width: 192px;
               height: auto;
             }
             .content {
               padding: 40px 30px;
             }
             .greeting {
               font-size: 18px;
               font-weight: 600;
               color: #111827;
               margin-bottom: 20px;
             }
             .message {
               color: #6b7280;
               line-height: 1.8;
               margin-bottom: 20px;
             }
             .payment-card {
               background-color: #f9fafb;
               border: 2px solid #7B21BA;
               border-radius: 12px;
               padding: 24px;
               margin: 24px 0;
               text-align: center;
             }
             .plan-name {
               font-size: 24px;
               font-weight: 600;
               color: #111827;
               margin: 8px 0;
             }
             .plan-description {
               color: #6b7280;
               margin: 12px 0;
               font-size: 14px;
             }
             .amount {
               font-size: 36px;
               font-weight: bold;
               color: #7B21BA;
               margin: 16px 0;
             }
             .payment-button {
               display: inline-block;
               background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%);
               color: #ffffff;
               text-decoration: none;
               padding: 16px 32px;
               border-radius: 8px;
               font-weight: 600;
               font-size: 16px;
               margin: 20px 0;
             }
             .security-note {
               background-color: #f0fdf4;
               border-left: 4px solid #10b981;
               padding: 16px;
               margin: 20px 0;
               border-radius: 4px;
             }
             .security-note h4 {
               color: #10b981;
               margin-top: 0;
               font-size: 14px;
             }
             .security-note p {
               margin: 0;
               color: #166534;
               font-size: 14px;
             }
             .features {
               background-color: #f9fafb;
               border-radius: 8px;
               padding: 20px;
               margin: 20px 0;
             }
             .features h4 {
               color: #7B21BA;
               margin-top: 0;
               font-size: 16px;
             }
             .feature {
               margin: 8px 0;
               color: #6b7280;
               display: flex;
               align-items: center;
             }
             .checkmark {
               color: #10b981;
               margin-right: 8px;
               font-weight: bold;
             }
             .footer {
               background-color: #f9fafb;
               padding: 20px 30px;
               border-top: 1px solid #e5e7eb;
               text-align: center;
             }
             .footer p {
               margin: 5px 0;
               font-size: 12px;
               color: #9ca3af;
             }
           </style>
         </head>
         <body>
           <div class="email-container">
             <div class="header">
               <img src="https://d159ubt2zvt6ob.cloudfront.net/nlc-ai/brands/logo-large.png" alt="{{appName}} Logo" class="logo-img">
             </div>

             <div class="content">
               <p class="greeting">Payment Request</p>
               <p class="message">Hello {{coachName}},</p>
               <p class="message">You have received a payment request for your coaching plan subscription. Please review the details below and complete your payment to activate your subscription.</p>

               <div class="payment-card">
                 <div class="plan-name">{{planName}}</div>
                 {{#if planDescription}}
                 <div class="plan-description">{{planDescription}}</div>
                 {{/if}}
                 <div class="amount">{{amount}}</div>
                 {{#if description}}
                 <p style="color: #6b7280; margin: 16px 0;">{{description}}</p>
                 {{/if}}
                 <a href="{{paymentLink}}" class="payment-button">Complete Payment Securely</a>
               </div>

               <div class="security-note">
                 <h4>🔒 Secure Payment Process</h4>
                 <p>This payment link takes you to Stripe''s secure payment page. Your payment information is encrypted and never stored on our servers.</p>
               </div>

               <div class="features">
                 <h4>What happens next?</h4>
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

               <p class="message"><strong style="color: #111827;">Need help?</strong> If you have any questions about this payment request or need assistance, please contact our support team.</p>

               <p class="message" style="margin-top: 30px;">Best regards,<br><strong style="color: #111827;">The {{appName}} Team</strong></p>
             </div>

             <div class="footer">
               <p>&copy; {{currentYear}} {{appName}}. All rights reserved.</p>
               <p style="font-size: 12px; color: #9ca3af;">This payment link is secure and expires in 30 days.</p>
             </div>
           </div>
         </body>
         </html>',
           'payment_request',
           false,
           NULL,
           0,
           NULL,
           true,
           false,
           NULL,
           ARRAY['appName', 'coachName', 'planName', 'planDescription', 'amount', 'paymentLink', 'description', 'currentYear']::text[],
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
         ) ON CONFLICT (id) DO NOTHING;

-- Insert System Maintenance Template
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
) VALUES (
           'c9d0e1f2-a3b4-5678-2345-789012345678'::uuid,
           NULL,
           NULL,
           'system',
           'System Maintenance Template',
           'system',
           'Scheduled Maintenance Notice',
           '<!DOCTYPE html>
         <html lang="en">
         <head>
           <meta charset="utf-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>Scheduled Maintenance Notice</title>
           <style>
             body {
               font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif;
               line-height: 1.6;
               color: #374151;
               margin: 0;
               padding: 0;
               background-color: #f3f4f6;
             }
             .email-container {
               max-width: 600px;
               margin: 0 auto;
               background-color: #ffffff;
             }
             .header {
               background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%);
               padding: 30px;
               text-align: center;
             }
             .logo-img {
               max-width: 192px;
               height: auto;
             }
             .header-title {
               color: #ffffff;
               font-size: 24px;
               font-weight: 600;
               margin: 15px 0 0 0;
             }
             .content {
               padding: 40px 30px;
             }
             .greeting {
               font-size: 18px;
               font-weight: 600;
               color: #111827;
               margin-bottom: 20px;
             }
             .message {
               color: #6b7280;
               line-height: 1.8;
               margin-bottom: 20px;
             }
             .maintenance-box {
               background-color: #fffbeb;
               border: 2px solid #f59e0b;
               border-radius: 8px;
               padding: 20px;
               margin: 20px 0;
             }
             .maintenance-box h3 {
               color: #f59e0b;
               margin-top: 0;
               font-size: 16px;
             }
             .maintenance-box p {
               color: #92400e;
               margin: 8px 0;
             }
             .maintenance-box h4 {
               color: #f59e0b;
               font-size: 14px;
               margin: 12px 0 8px 0;
             }
             .service-list {
               background-color: #fef3c7;
               padding: 15px;
               border-radius: 6px;
               margin: 15px 0;
             }
             .service {
               margin: 5px 0;
               color: #92400e;
             }
             .footer {
               background-color: #f9fafb;
               padding: 20px 30px;
               border-top: 1px solid #e5e7eb;
               text-align: center;
             }
             .footer p {
               margin: 5px 0;
               font-size: 12px;
               color: #9ca3af;
             }
           </style>
         </head>
         <body>
           <div class="email-container">
             <div class="header">
               <img src="https://d159ubt2zvt6ob.cloudfront.net/nlc-ai/brands/logo-large.png" alt="{{appName}} Logo" class="logo-img">
               <h1 class="header-title">🔧 Scheduled Maintenance</h1>
             </div>

             <div class="content">
               <p class="greeting">System Maintenance Notice</p>
               <p class="message">We wanted to inform you about upcoming scheduled maintenance to improve our services.</p>

               <div class="maintenance-box">
                 <h3>Maintenance Details</h3>
                 <p><strong>Date & Time:</strong> {{maintenanceDate}}</p>
                 <p><strong>Expected Duration:</strong> {{duration}}</p>

                 <h4>Affected Services:</h4>
                 <div class="service-list">
                   {{#each affectedServices}}
                   <div class="service">• {{this}}</div>
                   {{/each}}
                 </div>
               </div>

               {{#if alternativeActions}}
               <p class="message" style="font-weight: 600; color: #111827;">What You Can Do:</p>
               <div class="service-list">
                 {{#each alternativeActions}}
                 <div class="service">• {{this}}</div>
                 {{/each}}
               </div>
               {{/if}}

               <p class="message">We apologize for any inconvenience and appreciate your patience as we work to improve your experience.</p>
               <p class="message">If you have any questions, please contact our support team.</p>

               <p class="message" style="margin-top: 30px;">Best regards,<br><strong style="color: #111827;">The {{appName}} Team</strong></p>
             </div>

             <div class="footer">
               <p>&copy; {{currentYear}} {{appName}}. All rights reserved.</p>
             </div>
           </div>
         </body>
         </html>',
           'system_maintenance',
           false,
           NULL,
           0,
           NULL,
           true,
           false,
           NULL,
           ARRAY['appName', 'maintenanceDate', 'duration', 'affectedServices', 'alternativeActions', 'currentYear']::text[],
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
         ) ON CONFLICT (id) DO NOTHING;

-- Insert System Alert Template
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
) VALUES (
           'd0e1f2a3-b4c5-6789-3456-890123456789'::uuid,
           NULL,
           NULL,
           'system',
           'System Alert Template',
           'system',
           'System Alert: {{title}}',
           '<!DOCTYPE html>
         <html lang="en">
         <head>
           <meta charset="utf-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>System Alert: {{title}}</title>
           <style>
             body {
               font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif;
               line-height: 1.6;
               color: #374151;
               margin: 0;
               padding: 0;
               background-color: #f3f4f6;
             }
             .email-container {
               max-width: 600px;
               margin: 0 auto;
               background-color: #ffffff;
             }
             .header {
               background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%);
               padding: 30px;
               text-align: center;
             }
             .logo-img {
               max-width: 192px;
               height: auto;
             }
             .header-title {
               color: #ffffff;
               font-size: 24px;
               font-weight: 600;
               margin: 15px 0 0 0;
             }
             .content {
               padding: 40px 30px;
             }
             .message {
               color: #6b7280;
               line-height: 1.8;
               margin-bottom: 20px;
             }
             .alert-box {
               background-color: #f9fafb;
               border: 2px solid #7B21BA;
               border-radius: 8px;
               padding: 20px;
               margin: 20px 0;
             }
             .alert-box p {
               margin: 0;
               font-size: 16px;
               line-height: 1.6;
               color: #374151;
             }
             .button {
               display: inline-block;
               background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%);
               color: #ffffff;
               text-decoration: none;
               padding: 12px 24px;
               border-radius: 6px;
               font-weight: 500;
               margin: 16px 0;
             }
             .button-container {
               text-align: center;
             }
             .footer {
               background-color: #f9fafb;
               padding: 20px 30px;
               border-top: 1px solid #e5e7eb;
               text-align: center;
             }
             .footer p {
               margin: 5px 0;
               font-size: 12px;
               color: #9ca3af;
             }
           </style>
         </head>
         <body>
           <div class="email-container">
             <div class="header">
               <img src="https://d159ubt2zvt6ob.cloudfront.net/nlc-ai/brands/logo-large.png" alt="{{appName}} Logo" class="logo-img">
               <h1 class="header-title">{{alertIcon}} {{title}}</h1>
             </div>

             <div class="content">
               <div class="alert-box">
                 <p>{{message}}</p>
               </div>

               {{#if actionRequired}}
               <div class="button-container">
                 <a href="{{actionLink}}" class="button">{{actionText}}</a>
               </div>
               {{/if}}

               <p class="message">If you have any questions or concerns, please don''t hesitate to contact our support team.</p>

               <p class="message" style="margin-top: 30px;">Best regards,<br><strong style="color: #111827;">The {{appName}} Team</strong></p>
             </div>

             <div class="footer">
               <p>&copy; {{currentYear}} {{appName}}. All rights reserved.</p>
             </div>
           </div>
         </body>
         </html>',
           'system_alert',
           false,
           NULL,
           0,
           NULL,
           true,
           false,
           NULL,
           ARRAY['appName', 'alertType', 'alertIcon', 'title', 'message', 'actionRequired', 'actionLink', 'actionText', 'currentYear']::text[],
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
         ) ON CONFLICT (id) DO NOTHING;

-- Insert Subscription Expiry Template
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
) VALUES (
           'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
  NULL,
  NULL,
  'system',
  'Subscription Expiry Template',
  'billing',
  'Subscription Expiring Soon - {{planName}}',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Expiring Soon</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
}
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
}
    .header {
      background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%);
      padding: 30px;
      text-align: center;
}
    .logo-img {
      max-width: 192px;
      height: auto;
}
    .content {
      padding: 40px 30px;
}
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 20px;
}
    .message {
      color: #6b7280;
      line-height: 1.8;
      margin-bottom: 20px;
}
    .warning-box {
      background-color: #fef2f2;
      border: 2px solid #dc2626;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
}
    .warning-box h3 {
      color: #dc2626;
      margin-top: 0;
      font-size: 16px;
}
    .expiry-date {
      font-size: 18px;
      font-weight: bold;
      color: #dc2626;
      margin: 12px 0;
}
    .warning-note {
      color: #991b1b;
      font-size: 14px;
}
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
}
    .button-container {
      text-align: center;
}
    .footer {
      background-color: #f9fafb;
      padding: 20px 30px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
}
    .footer p {
      margin: 5px 0;
      font-size: 12px;
      color: #9ca3af;
}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="https://d159ubt2zvt6ob.cloudfront.net/nlc-ai/brands/logo-large.png" alt="{{appName}} Logo" class="logo-img">
    </div>

    <div class="content">
      <p class="greeting">⚠️ Subscription Expiring</p>
      <p class="message">Hi {{coachName}},</p>
      <p class="message">Your {{planName}} subscription is set to expire soon.</p>

      <div class="warning-box">
        <h3>Expiry Date</h3>
        <p class="expiry-date">{{expiryDate}}</p>
        <p class="warning-note">Don''t lose access to your coaching tools!</p>
      </div>

      <p class="message">To continue enjoying uninterrupted access to {{appName}}, please renew your subscription before the expiry date.</p>

      <div class="button-container">
        <a href="{{renewalLink}}" class="button">Renew Subscription</a>
      </div>

      <p class="message">If you have any questions or need assistance, our support team is here to help.</p>

      <p class="message" style="margin-top: 30px;">Best regards,<br><strong style="color: #111827;">The {{appName}} Team</strong></p>
    </div>

    <div class="footer">
      <p>&copy; {{currentYear}} {{appName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>',
  'subscription_expiry',
  false,
  NULL,
  0,
  NULL,
  true,
  false,
  NULL,
  ARRAY['appName', 'coachName', 'planName', 'expiryDate', 'renewalLink', 'currentYear']::text[],
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Insert Client Welcome Template
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
) VALUES (
           'c3d4e5f6-a7b8-9012-cdef-123456789012'::uuid,
  NULL,
  NULL,
  'system',
  'Client Welcome Template',
  'auth',
  'Welcome to Your Coaching Journey with {{coachName}}',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Your Coaching Journey</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
}
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
}
    .header {
      background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%);
      padding: 30px;
      text-align: center;
}
    .logo-img {
      max-width: 192px;
      height: auto;
}
    .header-title {
      color: #ffffff;
      font-size: 20px;
      font-weight: 600;
      margin: 15px 0 0 0;
}
    .content {
      padding: 40px 30px;
}
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 20px;
}
    .message {
      color: #6b7280;
      line-height: 1.8;
      margin-bottom: 20px;
}
    .welcome-message {
      background-color: #f9fafb;
      border-left: 4px solid #7B21BA;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
}
    .welcome-message h3 {
      color: #7B21BA;
      margin: 0 0 10px 0;
      font-size: 16px;
}
    .welcome-message p {
      margin: 0;
      color: #6b7280;
}
    .next-steps {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
}
    .next-steps h3 {
      color: #7B21BA;
      margin-top: 0;
      font-size: 16px;
}
    .step {
      margin: 10px 0;
      color: #6b7280;
}
    .step-number {
      color: #7B21BA;
      font-weight: bold;
      margin-right: 8px;
}
    .footer {
      background-color: #f9fafb;
      padding: 20px 30px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
}
    .footer p {
      margin: 5px 0;
      font-size: 12px;
      color: #9ca3af;
}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="https://d159ubt2zvt6ob.cloudfront.net/nlc-ai/brands/logo-large.png" alt="{{appName}} Logo" class="logo-img">
      <h1 class="header-title">{{coachBusinessName}}</h1>
    </div>

    <div class="content">
      <p class="greeting">Welcome to Your Coaching Journey, {{clientName}}! 🎉</p>
      <p class="message">I''m thrilled to have you as a client and excited to support you on your path to achieving your goals.</p>

      {{#if welcomeMessage}}
      <div class="welcome-message">
        <h3>Personal Welcome from {{coachName}}:</h3>
        <p>{{welcomeMessage}}</p>
      </div>
      {{/if}}

      {{#if nextSteps}}
      <div class="next-steps">
        <h3>Your Next Steps:</h3>
        {{#each nextSteps}}
        <div class="step">
          <span class="step-number">{{@index}}.</span>{{this}}
        </div>
        {{/each}}
      </div>
      {{/if}}

      <p class="message">I''m here to support you every step of the way. Don''t hesitate to reach out if you have any questions or need guidance.</p>
      <p class="message">Here''s to your success!</p>

      <p class="message" style="margin-top: 30px;">
        <strong style="color: #111827;">{{coachName}}</strong><br>
        <span style="color: #6b7280;">{{coachBusinessName}}</span>
      </p>
    </div>

    <div class="footer">
      <p>&copy; {{currentYear}} {{coachBusinessName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>',
  'client_welcome',
  false,
  NULL,
  0,
  NULL,
  true,
  false,
  NULL,
  ARRAY['appName', 'clientName', 'coachName', 'coachBusinessName', 'welcomeMessage', 'nextSteps', 'currentYear']::text[],
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Insert Client Check-in Template
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
) VALUES (
           'd4e5f6a7-b8c9-0123-def0-234567890123'::uuid,
  NULL,
  NULL,
  'system',
  'Client Check-in Template',
  'client_response',
  'Check-in from {{coachName}}',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Check-in from {{coachName}}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
}
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
}
    .header {
      background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%);
      padding: 30px;
      text-align: center;
}
    .logo-img {
      max-width: 192px;
      height: auto;
}
    .header-title {
      color: #ffffff;
      font-size: 24px;
      font-weight: 600;
      margin: 15px 0 5px 0;
}
    .header-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      margin: 0;
}
    .content {
      padding: 40px 30px;
}
    .message {
      color: #6b7280;
      line-height: 1.8;
      margin-bottom: 20px;
}
    .questions {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
}
    .questions h3 {
      color: #7B21BA;
      margin-top: 0;
      font-size: 16px;
}
    .question {
      margin: 12px 0;
      color: #6b7280;
      font-weight: 500;
}
    .footer {
      background-color: #f9fafb;
      padding: 20px 30px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
}
    .footer p {
      margin: 5px 0;
      font-size: 12px;
      color: #9ca3af;
}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="https://d159ubt2zvt6ob.cloudfront.net/nlc-ai/brands/logo-large.png" alt="{{appName}} Logo" class="logo-img">
      <h2 class="header-title">Check-in Time!</h2>
      <p class="header-subtitle">From {{coachName}}</p>
    </div>

    <div class="content">
      <p class="message">Hi {{clientName}},</p>
      <p class="message">{{checkInMessage}}</p>

      {{#if questions}}
      <div class="questions">
        <h3>I''d love to hear your thoughts on:</h3>
        {{#each questions}}
        <div class="question">• {{this}}</div>
        {{/each}}
      </div>
      {{/if}}

      <p class="message">Feel free to reply to this email with your updates. I''m always here to support you!</p>

      <p class="message" style="margin-top: 30px;">Best regards,<br><strong style="color: #111827;">{{coachName}}</strong></p>
    </div>

    <div class="footer">
      <p>This is a personal message from your coach.</p>
    </div>
  </div>
</body>
</html>',
  'client_checkin',
  false,
  NULL,
  0,
  NULL,
  true,
  false,
  NULL,
  ARRAY['appName', 'clientName', 'coachName', 'checkInMessage', 'questions']::text[],
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Insert Lead Followup Template
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
) VALUES (
           'e5f6a7b8-c9d0-1234-ef01-345678901234'::uuid,
  NULL,
  NULL,
  'system',
  'Lead Followup Template',
  'lead_followup',
  'Follow-up from {{coachName}}',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Follow-up from {{coachName}}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
}
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
}
    .header {
      background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%);
      padding: 30px;
      text-align: center;
}
    .logo-img {
      max-width: 192px;
      height: auto;
}
    .header-title {
      color: #ffffff;
      font-size: 20px;
      font-weight: 600;
      margin: 15px 0 5px 0;
}
    .header-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      margin: 0;
}
    .content {
      padding: 40px 30px;
}
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 20px;
}
    .message {
      color: #6b7280;
      line-height: 1.8;
      margin-bottom: 20px;
      white-space: pre-wrap;
}
    .signature {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
}
    .coach-signature {
      font-weight: 600;
      color: #111827;
}
    .business-name {
      color: #6b7280;
      font-size: 14px;
      margin-top: 4px;
}
    .email-meta {
      background-color: #f9fafb;
      padding: 12px 16px;
      border-radius: 6px;
      margin: 20px 0;
      font-size: 12px;
      color: #6b7280;
}
    .unsubscribe {
      margin-top: 16px;
}
    .unsubscribe a {
      color: #6b7280;
      text-decoration: underline;
}
    .footer {
      background-color: #f9fafb;
      padding: 20px 30px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
}
    .footer p {
      margin: 5px 0;
      font-size: 12px;
      color: #9ca3af;
}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="https://d159ubt2zvt6ob.cloudfront.net/nlc-ai/brands/logo-large.png" alt="{{appName}} Logo" class="logo-img">
      <h1 class="header-title">{{coachBusinessName}}</h1>
      <p class="header-subtitle">Personal message from {{coachName}}</p>
    </div>

    <div class="content">
      <p class="greeting">Hi {{leadName}},</p>
      <div class="message">{{emailContent}}</div>

      <div class="signature">
        <div class="coach-signature">{{coachName}}</div>
        {{#if coachBusinessName}}
        <div class="business-name">{{coachBusinessName}}</div>
        {{/if}}
      </div>

      {{#if emailNumber}}
      <div class="email-meta">
        This is email {{emailNumber}} of {{totalEmails}} in your follow-up sequence.
      </div>
      {{/if}}
    </div>

    <div class="footer">
      <p>You''re receiving this email because you expressed interest in coaching services.</p>
      {{#if unsubscribeLink}}
      <div class="unsubscribe">
        <a href="{{unsubscribeLink}}">Unsubscribe from future emails</a>
      </div>
      {{/if}}
      <p>&copy; {{currentYear}} {{appName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>',
  'lead_followup',
  false,
  NULL,
  0,
  NULL,
  true,
  false,
  NULL,
  ARRAY['appName', 'leadName', 'coachName', 'coachBusinessName', 'emailContent', 'emailNumber', 'totalEmails', 'unsubscribeLink', 'currentYear']::text[],
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Insert Client Response Template
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
) VALUES (
           'f6a7b8c9-d0e1-2345-f012-456789012345'::uuid,
  NULL,
  NULL,
  'system',
  'Client Response Template',
  'client_response',
  '{{#if isReply}}Re: {{/if}}{{originalSubject}}',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{originalSubject}}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
}
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
}
    .header {
      background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%);
      padding: 30px;
      text-align: center;
}
    .logo-img {
      max-width: 192px;
      height: auto;
}
    .coach-info {
      margin-top: 15px;
}
    .coach-name {
      color: #ffffff;
      font-size: 20px;
      font-weight: 600;
      margin: 0;
}
    .business-name {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      margin: 4px 0 0 0;
}
    .content {
      padding: 40px 30px;
}
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
      color: #111827;
}
    .message {
      color: #6b7280;
      line-height: 1.8;
      margin-bottom: 20px;
      white-space: pre-wrap;
}
    .signature {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
}
    .coach-signature {
      font-weight: 600;
      color: #111827;
      margin-bottom: 4px;
}
    .footer {
      background-color: #f9fafb;
      padding: 20px 30px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
}
    .footer p {
      margin: 5px 0;
      font-size: 12px;
      color: #9ca3af;
}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="https://d159ubt2zvt6ob.cloudfront.net/nlc-ai/brands/logo-large.png" alt="{{appName}} Logo" class="logo-img">
      <div class="coach-info">
        <p class="coach-name">{{coachName}}</p>
        {{#if coachBusinessName}}
        <p class="business-name">{{coachBusinessName}}</p>
        {{/if}}
      </div>
    </div>

    <div class="content">
      <p class="greeting">Hi {{clientName}},</p>
      <div class="message">{{emailContent}}</div>

      <div class="signature">
        <div class="coach-signature">{{coachName}}</div>
        {{#if coachBusinessName}}
        <div style="color: #6b7280; font-size: 14px;">{{coachBusinessName}}</div>
        {{/if}}
      </div>
    </div>

    <div class="footer">
      <p>This is a personal message from your coach. Please reply if you have any questions.</p>
    </div>
  </div>
</body>
</html>',
  'client_response',
  false,
  NULL,
  0,
  NULL,
  true,
  false,
  NULL,
  ARRAY['appName', 'clientName', 'coachName', 'coachBusinessName', 'emailContent', 'originalSubject', 'isReply']::text[],
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;
