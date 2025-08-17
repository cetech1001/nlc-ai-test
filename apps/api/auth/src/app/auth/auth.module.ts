import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleAuthService } from './services/google-auth.service';
import { TokenService } from './services/token.service';
import { AdminAuthService } from './services/admin-auth.service';
import { CoachAuthService } from './services/coach-auth.service';
import { ClientAuthService } from './services/client-auth.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import {AuthLibModule} from "@nlc-ai/api-auth";

@Module({
  imports: [
    AuthLibModule,
    CloudinaryModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleAuthService,
    TokenService,
    AdminAuthService,
    CoachAuthService,
    ClientAuthService,
  ],
  exports: [
    AuthService,
    GoogleAuthService,
    TokenService,
    AdminAuthService,
    CoachAuthService,
    ClientAuthService,
  ],
})
export class AuthModule {}
