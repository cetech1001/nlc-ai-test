import {BaseClient, ServiceClientConfig} from "@nlc-ai/sdk-core";
import { AccountsClient } from "./accounts.client";
import { ThreadsClient } from "./threads.client";
import { SyncClient } from "./sync.client";
import {SequencesClient} from "./sequences.client";

export class EmailClient extends BaseClient {
  public accounts: AccountsClient;
  public threads: ThreadsClient;
  public sequences: SequencesClient;
  public sync: SyncClient;

  constructor(props: ServiceClientConfig) {
    super(props);

    this.accounts = new AccountsClient({
      ...props,
      baseURL: `${props.baseURL}/accounts`,
    });

    this.threads = new ThreadsClient({
      ...props,
      baseURL: `${props.baseURL}/threads`,
    });

    this.sync = new SyncClient({
      ...props,
      baseURL: `${props.baseURL}/sync`,
    });

    this.sequences = new SequencesClient({
      ...props,
      baseURL: `${props.baseURL}/sequences`,
    });
  }

  /**
   * Send a custom email
   */
  async sendEmail(body: {
    to: string;
    subject: string;
    message: string;
    name?: string;
    appName?: string;
    scheduleFor?: string;
  }): Promise<{ success: boolean; messageID?: string }> {
    if (!body.to || !body.subject || !body.message) {
      throw new Error('Missing required fields: to, subject, or message');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.to)) {
      throw new Error('Invalid email address');
    }

    // const appName = body.appName || 'NLC AI';

    // Construct HTML email
    /*const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${body.subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
      background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
      padding: 30px;
      text-align: center;
    }
    .header-icon {
      margin-bottom: 10px;
    }
    .logo-img {
      max-width: 192px;
      height: auto;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 600;
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
      white-space: pre-wrap;
      color: #6b7280;
      line-height: 1.8;
      margin-bottom: 30px;
    }
    .signature {
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
      margin-top: 30px;
    }
    .signature p {
      margin: 5px 0;
      color: #6b7280;
    }
    .signature .name {
      font-weight: 600;
      color: #111827;
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
      <div class="header-icon">
        <img src="https://d159ubt2zvt6ob.cloudfront.net/nlc-ai/brands/logo-large.png" alt="${appName} Logo" class="logo-img">
      </div>
    </div>

    <div class="content">
      <p class="greeting">Hi ${body.name || 'there'},</p>
      <div class="message">${body.message}</div>

      <div class="signature">
        <p>Best regards,</p>
        <p class="name">${appName} Team</p>
      </div>
    </div>

    <div class="footer">
      <p>This email was sent to ${body.to}</p>
      <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;*/

    const response = await this.request<{ success: boolean; messageID?: string }>(
      'POST',
      '/send',
      {
        body: {
          to: body.to,
          subject: body.subject,
          scheduleFor: body.scheduleFor,
          templateID: 'custom_email',
          // html: htmlContent,
          metadata: {
            subject: body.subject,
            message: body.message,
            name: body.name,
            // email: body.email,
          }
        }
      }
    );
    return response.data!;
  }

  override updateApiKey(apiKey: string | null) {
    super.updateApiKey(apiKey);

    const services = [this.accounts, this.threads, this.sync];
    services.forEach(service => {
      service.updateApiKey(apiKey);
    });
  }
}
