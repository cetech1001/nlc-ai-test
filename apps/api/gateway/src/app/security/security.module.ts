import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { RateLimitService } from './rate-limit.service';
import { RequestValidationService } from './request-validation.service';

@Module({
  providers: [SecurityService, RateLimitService, RequestValidationService],
  exports: [SecurityService, RateLimitService, RequestValidationService],
})
export class SecurityModule {}
