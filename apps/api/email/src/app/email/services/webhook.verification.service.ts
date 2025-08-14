import {createHmac} from "crypto";

export class WebhookVerificationService {
  static verifyMailgunWebhook(token: string, timestamp: string, signature: string, signingKey: string): boolean {
    const value = timestamp + token;
    const hash = createHmac('sha256', signingKey).update(value).digest('hex');
    return hash === signature;
  }

  static verifySendGridWebhook(payload: string, signature: string, publicKey: string): boolean {
    // Implementation for SendGrid webhook verification
    // This would use the SendGrid EventWebhook verification library
    // For now, returning true as placeholder
    return true;
  }

  static verifyPostmarkWebhook(payload: string, signature: string, secret: string): boolean {
    const hash = createHmac('sha256', secret).update(payload).digest('base64');
    return hash === signature;
  }
}
