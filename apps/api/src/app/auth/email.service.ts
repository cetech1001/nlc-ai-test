import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() {}

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    this.logger.log(`Sending verification email to ${email} with code: ${code}`);

    console.log(`📧 Verification Code for ${email}: ${code}`);
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    this.logger.log(`Sending password reset email to ${email} with code: ${code}`);

    console.log(`🔐 Password Reset Code for ${email}: ${code}`);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    this.logger.log(`Sending welcome email to ${email}`);

    console.log(`👋 Welcome Email sent to ${name} (${email})`);
  }
}
