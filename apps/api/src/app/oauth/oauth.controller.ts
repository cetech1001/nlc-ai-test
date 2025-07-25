// Update the existing oauth.controller.ts to handle email callbacks

import {Controller, Get, Param, Query, Res} from '@nestjs/common';
import type { Response } from 'express';
import { IntegrationsService } from '../integrations/integrations.service';
import { EmailAccountsService } from '../email-accounts/email-accounts.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('OAuth Callbacks')
@Controller('oauth')
@Public()
export class OAuthController {
  constructor(
    private readonly socialIntegrationsService: IntegrationsService,
    private readonly emailAccountsService: EmailAccountsService,
  ) {}

  @Get(':platform/callback')
  @ApiOperation({ summary: 'Handle social platform OAuth callback' })
  async socialPlatformCallback(
    @Res() res: Response,
    @Param('platform') platform: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error?: string,
    @Query('error_description') errorDescription?: string,
  ) {
    console.log("Came into social");
    if (error) {
      return this.sendOAuthError(res, platform, errorDescription || error);
    }

    if (!code || !state) {
      return this.sendOAuthError(res, platform, 'Missing authorization code or state parameter');
    }

    try {
      const coachID = state.split('$')[0];

      const integration = await this.socialIntegrationsService.handleOAuthCallback(
        coachID,
        platform,
        code,
        state,
      );

      this.sendOAuthSuccess(res, platform, integration, 'social');
    } catch (error: any) {
      this.sendOAuthError(res, platform, error.message);
    }
  }

  @Get('email/:provider/callback')
  @ApiOperation({ summary: 'Handle email provider OAuth callback' })
  async emailProviderCallback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
    @Query('error') error?: string,
    @Query('error_description') errorDescription?: string,
  ) {
    console.log(code, state, error, provider);
    if (error) {
      return this.sendEmailOAuthError(res, provider, errorDescription || error);
    }

    if (!code || !state) {
      return this.sendEmailOAuthError(res, provider, 'Missing authorization code or state parameter');
    }

    try {
      const coachID = state.split('$')[0];

      const emailAccount = await this.emailAccountsService.handleEmailOAuthCallback(
        coachID,
        provider,
        code,
        state,
      );

      this.sendEmailOAuthSuccess(res, provider, emailAccount);
    } catch (error: any) {
      this.sendEmailOAuthError(res, provider, error.message);
    }
  }

  /**
   * Send successful OAuth response for social platforms
   */
  private sendOAuthSuccess(res: Response, platform: string, integration: any, type: 'social' | 'email' = 'social') {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Success</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            color: white;
          }
          .container {
            text-align: center;
            background: linear-gradient(135deg, rgba(123, 33, 186, 0.1) 0%, rgba(179, 57, 212, 0.1) 100%);
            border: 1px solid rgba(123, 33, 186, 0.3);
            padding: 40px;
            border-radius: 16px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            max-width: 400px;
          }
          .success {
            color: #10b981;
            font-size: 18px;
            margin-bottom: 10px;
            font-weight: 600;
          }
          .platform {
            color: #e5e7eb;
            text-transform: capitalize;
            font-size: 16px;
            margin-bottom: 16px;
          }
          .message {
            color: #9ca3af;
            font-size: 14px;
          }
          .checkmark {
            font-size: 48px;
            margin-bottom: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="checkmark">✅</div>
          <div class="success">Successfully connected!</div>
          <div class="platform">${platform} ${type}</div>
          <div class="message">You can close this window.</div>
        </div>
        <script>
          try {
            if (window.opener) {
              window.opener.postMessage({
                type: '${type}_oauth_success',
                platform: '${platform}',
                data: ${JSON.stringify(integration)}
              }, '*');
            }

            setTimeout(() => {
              window.close();
            }, 2000);
          } catch (error) {
            console.error('OAuth callback error:', error);
            setTimeout(() => {
              window.close();
            }, 3000);
          }
        </script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  /**
   * Send successful email OAuth response
   */
  private sendEmailOAuthSuccess(res: Response, provider: string, emailAccount: any) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Account Connected</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            color: white;
          }
          .container {
            text-align: center;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%);
            border: 1px solid rgba(16, 185, 129, 0.3);
            padding: 40px;
            border-radius: 16px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            max-width: 400px;
          }
          .success {
            color: #10b981;
            font-size: 18px;
            margin-bottom: 10px;
            font-weight: 600;
          }
          .provider {
            color: #e5e7eb;
            text-transform: capitalize;
            font-size: 16px;
            margin-bottom: 8px;
          }
          .email {
            color: #9ca3af;
            font-size: 14px;
            margin-bottom: 16px;
          }
          .message {
            color: #9ca3af;
            font-size: 14px;
          }
          .envelope {
            font-size: 48px;
            margin-bottom: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="envelope">📧</div>
          <div class="success">Email account connected!</div>
          <div class="provider">${provider}</div>
          <div class="email">${emailAccount.emailAddress}</div>
          <div class="message">You can close this window.</div>
        </div>
        <script>
          try {
            if (window.opener) {
              window.opener.postMessage({
                type: 'email_oauth_success',
                provider: '${provider}',
                emailAccount: ${JSON.stringify(emailAccount)}
              }, '*');
            }

            setTimeout(() => {
              window.close();
            }, 2000);
          } catch (error) {
            console.error('Email OAuth callback error:', error);
            setTimeout(() => {
              window.close();
            }, 3000);
          }
        </script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  /**
   * Send error OAuth response
   */
  private sendOAuthError(res: Response, platform: string, errorMessage: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Error</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            color: white;
          }
          .container {
            text-align: center;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
            border: 1px solid rgba(239, 68, 68, 0.3);
            padding: 40px;
            border-radius: 16px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            max-width: 400px;
          }
          .error {
            color: #ef4444;
            font-size: 18px;
            margin-bottom: 10px;
            font-weight: 600;
          }
          .platform {
            color: #e5e7eb;
            text-transform: capitalize;
            margin-bottom: 15px;
          }
          .message {
            color: #d1d5db;
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 20px;
          }
          .close-btn {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
          }
          .close-btn:hover {
            background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
          }
          .cross {
            font-size: 48px;
            margin-bottom: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="cross">❌</div>
          <div class="error">Connection failed</div>
          <div class="platform">${platform}</div>
          <div class="message">${errorMessage}</div>
          <button class="close-btn" onclick="window.close()">Close Window</button>
        </div>
        <script>
          try {
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth_error',
                platform: '${platform}',
                error: '${errorMessage.replace(/'/g, "\\'")}'
              }, '*');
            }

            setTimeout(() => {
              window.close();
            }, 5000);
          } catch (error) {
            console.error('OAuth error callback failed:', error);
            setTimeout(() => {
              window.close();
            }, 3000);
          }
        </script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  /**
   * Send error email OAuth response
   */
  private sendEmailOAuthError(res: Response, provider: string, errorMessage: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Connection Error</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            color: white;
          }
          .container {
            text-align: center;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
            border: 1px solid rgba(239, 68, 68, 0.3);
            padding: 40px;
            border-radius: 16px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            max-width: 400px;
          }
          .error {
            color: #ef4444;
            font-size: 18px;
            margin-bottom: 10px;
            font-weight: 600;
          }
          .provider {
            color: #e5e7eb;
            text-transform: capitalize;
            margin-bottom: 15px;
          }
          .message {
            color: #d1d5db;
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 20px;
          }
          .close-btn {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
          }
          .close-btn:hover {
            background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
          }
          .envelope {
            font-size: 48px;
            margin-bottom: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="envelope">📧❌</div>
          <div class="error">Email connection failed</div>
          <div class="provider">${provider}</div>
          <div class="message">${errorMessage}</div>
          <button class="close-btn" onclick="window.close()">Close Window</button>
        </div>
        <script>
          try {
            if (window.opener) {
              window.opener.postMessage({
                type: 'email_oauth_error',
                provider: '${provider}',
                error: '${errorMessage.replace(/'/g, "\\'")}'
              }, '*');
            }

            setTimeout(() => {
              window.close();
            }, 5000);
          } catch (error) {
            console.error('Email OAuth error callback failed:', error);
            setTimeout(() => {
              window.close();
            }, 3000);
          }
        </script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
