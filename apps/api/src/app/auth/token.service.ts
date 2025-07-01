import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

interface StoredToken {
  email: string;
  code: string;
  type: 'verification' | 'reset';
  expiresAt: Date;
}

@Injectable()
export class TokenService {
  private tokens = new Map<string, StoredToken>();

  constructor() {}

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async storeVerificationToken(email: string, code: string, type: 'verification' | 'reset' = 'verification'): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    const tokenKey = `${email}-${type}`;
    this.tokens.set(tokenKey, {
      email,
      code,
      type,
      expiresAt,
    });

    // Clean up expired tokens
    this.cleanupExpiredTokens();
  }

  async verifyToken(email: string, code: string, type: 'verification' | 'reset' = 'verification'): Promise<boolean> {
    const tokenKey = `${email}-${type}`;
    const storedToken = this.tokens.get(tokenKey);

    if (!storedToken) {
      return false;
    }

    if (storedToken.expiresAt < new Date()) {
      this.tokens.delete(tokenKey);
      return false;
    }

    if (storedToken.code !== code) {
      return false;
    }

    // Valid token - remove it after verification
    this.tokens.delete(tokenKey);
    return true;
  }

  async generateResetToken(email: string): Promise<string> {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    const tokenKey = `reset-${resetToken}`;
    this.tokens.set(tokenKey, {
      email,
      code: resetToken,
      type: 'reset',
      expiresAt,
    });

    return resetToken;
  }

  async validateResetToken(token: string): Promise<string | null> {
    const tokenKey = `reset-${token}`;
    const storedToken = this.tokens.get(tokenKey);

    if (!storedToken) {
      return null;
    }

    if (storedToken.expiresAt < new Date()) {
      this.tokens.delete(tokenKey);
      return null;
    }

    return storedToken.email;
  }

  async invalidateTokens(email: string): Promise<void> {
    const keysToDelete = [];
    for (const [key, token] of this.tokens.entries()) {
      if (token.email === email) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.tokens.delete(key));
  }

  private cleanupExpiredTokens(): void {
    const now = new Date();
    const keysToDelete = [];

    for (const [key, token] of this.tokens.entries()) {
      if (token.expiresAt < now) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.tokens.delete(key));
  }
}
