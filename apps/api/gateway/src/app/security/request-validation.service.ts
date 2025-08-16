import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class RequestValidationService {
  validateRequest(req: any): void {
    // Validate request size
    this.validateRequestSize(req);

    // Validate headers
    this.validateHeaders(req.headers);

    // Validate URL
    this.validateUrl(req.url);
  }

  private validateRequestSize(req: any): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const contentLength = parseInt(req.headers['content-length'] || '0');

    if (contentLength > maxSize) {
      throw new BadRequestException('Request entity too large');
    }
  }

  private validateHeaders(headers: Record<string, string>): void {
    // Check for malicious headers
    const suspiciousHeaders = ['x-forwarded-host', 'x-real-ip'];

    for (const header of suspiciousHeaders) {
      if (headers[header]) {
        // Additional validation can be added here
      }
    }
  }

  private validateUrl(url: string): void {
    // Check for path traversal attempts
    if (url.includes('..') || url.includes('//')) {
      throw new BadRequestException('Invalid URL path');
    }

    // Check URL length
    if (url.length > 2048) {
      throw new BadRequestException('URL too long');
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /[<>'"]/,
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        throw new BadRequestException('Invalid URL format');
      }
    }
  }
}
