/*
  Warnings:

  - You are about to drop the `conversation_participants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message_deliveries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."conversation_participants";

-- DropTable
DROP TABLE "public"."message_deliveries";

-- Migration: Add Message Notification Email Templates
-- Description: Adds email templates for admin and user message notifications

-- 1. Admin New Message Notification Template
INSERT INTO email_templates (
  id,
  "templateType",
  name,
  category,
  "subjectTemplate",
  "bodyTemplate",
  "systemKey",
  variables,
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
           gen_random_uuid(),
           'system',
           'Admin New Message Notification',
           'notification',
           'New Message from {{senderName}}',
           '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Message Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); min-height: 100vh;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Glow Orb Effects -->
    <div style="position: relative;">
      <div style="position: absolute; top: -100px; left: -100px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, rgba(236, 72, 153, 0) 70%); filter: blur(40px); pointer-events: none;"></div>
      <div style="position: absolute; bottom: -100px; right: -100px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0) 70%); filter: blur(50px); pointer-events: none;"></div>
    </div>

    <!-- Email Content Card -->
    <div style="position: relative; background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); overflow: hidden;">
      <!-- Header with Gradient -->
      <div style="background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); padding: 40px 30px; text-align: center;">
        <div style="margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <img style="width: 166px" src="https://d159ubt2zvt6ob.cloudfront.net/nlc-ai/brands/logo-large.png" alt="Logo"/>
        </div>
        <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">New Message Received</h1>
        <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">You have a new message from {{senderName}}</p>
      </div>

      <!-- Message Content -->
      <div style="padding: 40px 30px;">
        <!-- Sender Info -->
        <div style="background: linear-gradient(135deg, rgba(123, 33, 186, 0.08) 0%, rgba(179, 57, 212, 0.08) 100%); border-left: 4px solid #7B21BA; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 18px; margin-right: 12px;">
              {{senderInitial}}
            </div>
            <div>
              <p style="margin: 0; font-weight: 600; font-size: 16px; color: #1f2937;">{{senderName}}</p>
              <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">{{senderType}}</p>
            </div>
          </div>
          <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
            <strong>Email:</strong> {{senderEmail}}
          </p>
        </div>

        <!-- Message Preview -->
        <div style="margin-bottom: 30px;">
          <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Message Preview</p>
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">{{messagePreview}}</p>
          </div>
        </div>

        <!-- Conversation Context -->
        <div style="margin-bottom: 30px;">
          <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Conversation Details</p>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <span style="background: linear-gradient(135deg, rgba(123, 33, 186, 0.1) 0%, rgba(179, 57, 212, 0.1) 100%); color: #7B21BA; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500;">
              Conversation: {{conversationType}}
            </span>
            <span style="background: linear-gradient(135deg, rgba(123, 33, 186, 0.1) 0%, rgba(179, 57, 212, 0.1) 100%); color: #7B21BA; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500;">
              Time: {{messageTime}}
            </span>
          </div>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center;">
          <a href="{{viewMessageUrl}}" style="display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(123, 33, 186, 0.3); transition: all 0.3s ease;">
            View & Reply to Message
          </a>
        </div>

        <!-- Quick Actions -->
        <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 12px; font-size: 13px; color: #6b7280; text-align: center;">Quick Actions</p>
          <div style="text-align: center;">
            <a href="{{viewAllMessagesUrl}}" style="color: #7B21BA; text-decoration: none; font-size: 14px; font-weight: 500; margin: 0 12px;">View All Messages</a>
            <span style="color: #d1d5db;">|</span>
            <a href="{{notificationSettingsUrl}}" style="color: #7B21BA; text-decoration: none; font-size: 14px; font-weight: 500; margin: 0 12px;">Notification Settings</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 30px; padding: 0 20px;">
      <p style="margin: 0 0 8px; color: rgba(255, 255, 255, 0.8); font-size: 13px;">
        This email was sent to {{adminEmail}}
      </p>
      <p style="margin: 0; color: rgba(255, 255, 255, 0.6); font-size: 12px;">
        © {{currentYear}} {{appName}}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>',
           'admin_new_message',
           ARRAY[
             'senderName',
           'senderType',
           'senderEmail',
           'senderInitial',
           'messagePreview',
           'conversationType',
           'messageTime',
           'viewMessageUrl',
           'viewAllMessagesUrl',
           'notificationSettingsUrl',
           'adminEmail',
           'appName',
           'currentYear'
             ]::text[],
           true,
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
         );

-- 2. User (Coach/Client) New Message Notification Template
INSERT INTO email_templates (
  id,
  "templateType",
  name,
  category,
  "subjectTemplate",
  "bodyTemplate",
  "systemKey",
  variables,
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
           gen_random_uuid(),
           'system',
           'User New Message Notification',
           'notification',
           'New Message from {{senderName}}',
           '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Message from {{appName}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); min-height: 100vh;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Glow Orb Effects -->
    <div style="position: relative;">
      <div style="position: absolute; top: -100px; left: -100px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, rgba(236, 72, 153, 0) 70%); filter: blur(40px); pointer-events: none;"></div>
      <div style="position: absolute; bottom: -100px; right: -100px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0) 70%); filter: blur(50px); pointer-events: none;"></div>
    </div>

    <!-- Email Content Card -->
    <div style="position: relative; background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); overflow: hidden;">
      <!-- Header with Gradient -->
      <div style="background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); padding: 40px 30px; text-align: center;">
        <div style="margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <img style="width: 166px" src="https://d159ubt2zvt6ob.cloudfront.net/nlc-ai/brands/logo-large.png" alt="Logo"/>
        </div>
        <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">You Have a New Message</h1>
        <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">{{senderName}} sent you a message</p>
      </div>

      <!-- Message Content -->
      <div style="padding: 40px 30px;">
        <!-- Greeting -->
        <p style="margin: 0 0 24px; color: #1f2937; font-size: 16px; line-height: 1.6;">
          Hi {{recipientName}},
        </p>

        <!-- Message Preview -->
        <div style="margin-bottom: 30px;">
          <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
          <div style="background: linear-gradient(135deg, rgba(123, 33, 186, 0.05) 0%, rgba(179, 57, 212, 0.05) 100%); border-left: 4px solid #7B21BA; border-radius: 8px; padding: 20px;">
            <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.7;">{{messagePreview}}</p>
          </div>
        </div>

        <!-- Message Info -->
        <div style="margin-bottom: 30px;">
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <span style="background: linear-gradient(135deg, rgba(123, 33, 186, 0.1) 0%, rgba(179, 57, 212, 0.1) 100%); color: #7B21BA; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500;">
              From: {{senderName}}
            </span>
            <span style="background: linear-gradient(135deg, rgba(123, 33, 186, 0.1) 0%, rgba(179, 57, 212, 0.1) 100%); color: #7B21BA; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500;">
              {{messageTime}}
            </span>
          </div>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="{{viewMessageUrl}}" style="display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(123, 33, 186, 0.3); transition: all 0.3s ease;">
            View & Reply to Message
          </a>
        </div>

        <!-- Additional Info -->
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
            💬 Reply directly in the app to continue your conversation with {{senderName}}
          </p>
        </div>

        <!-- Quick Actions -->
        <div style="padding-top: 30px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 12px; font-size: 13px; color: #6b7280; text-align: center;">Need Help?</p>
          <div style="text-align: center;">
            <a href="{{viewAllMessagesUrl}}" style="color: #7B21BA; text-decoration: none; font-size: 14px; font-weight: 500; margin: 0 12px;">View All Messages</a>
            <span style="color: #d1d5db;">|</span>
            <a href="{{notificationSettingsUrl}}" style="color: #7B21BA; text-decoration: none; font-size: 14px; font-weight: 500; margin: 0 12px;">Notification Settings</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 30px; padding: 0 20px;">
      <p style="margin: 0 0 8px; color: rgba(255, 255, 255, 0.8); font-size: 13px;">
        This email was sent to {{recipientEmail}}
      </p>
      <p style="margin: 0; color: rgba(255, 255, 255, 0.6); font-size: 12px;">
        © {{currentYear}} {{appName}}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>',
           'user_new_message',
           ARRAY[
             'recipientName',
           'senderName',
           'messagePreview',
           'messageTime',
           'viewMessageUrl',
           'viewAllMessagesUrl',
           'notificationSettingsUrl',
           'recipientEmail',
           'appName',
           'currentYear'
             ]::text[],
           true,
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
         );
