import {Controller, Get, Param, Query, Res} from '@nestjs/common';
import type { Response } from 'express';
import { IntegrationsService } from '../integrations/integrations.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('OAuth Callbacks')
@Controller('oauth')
@Public()
export class OAuthController {
  constructor(
    private readonly socialIntegrationsService: IntegrationsService,
  ) {}

  @Get(':platform/callback')
  @ApiOperation({ summary: 'Handle {platform}\'s OAuth callback' })
  async calendlyCallback(
    @Res() res: Response,
    @Param('platform') platform: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error?: string,
    @Query('error_description') errorDescription?: string,
  ) {
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

      this.sendOAuthSuccess(res, platform, integration);
    } catch (error: any) {
      this.sendOAuthError(res, platform, error.message);
    }
  }

  /**
   * Send successful OAuth response to the popup window
   */
  private sendOAuthSuccess(res: Response, platform: string, integration: any) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Success</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .container {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .success {
            color: #22c55e;
            font-size: 18px;
            margin-bottom: 10px;
          }
          .platform {
            color: #6b7280;
            text-transform: capitalize;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✓ Successfully connected!</div>
          <div class="platform">${platform}</div>
          <div style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            You can close this window.
          </div>
        </div>
        <script>
          try {
            // Send success message to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth_success',
                platform: '${platform}',
                integration: ${JSON.stringify(integration)}
              }, '*');
            }

            // Auto-close after 2 seconds
            setTimeout(() => {
              window.close();
            }, 2000);
          } catch (error) {
            console.error('OAuth callback error:', error);
            // Fallback: just close the window
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
   * Send error OAuth response to the popup window
   */
  private sendOAuthError(res: Response, platform: string, errorMessage: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .container {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 400px;
          }
          .error {
            color: #ef4444;
            font-size: 18px;
            margin-bottom: 10px;
          }
          .platform {
            color: #6b7280;
            text-transform: capitalize;
            margin-bottom: 15px;
          }
          .message {
            color: #374151;
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 20px;
          }
          .close-btn {
            background: #6b7280;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          }
          .close-btn:hover {
            background: #4b5563;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error">✗ Connection failed</div>
          <div class="platform">${platform}</div>
          <div class="message">${errorMessage}</div>
          <button class="close-btn" onclick="window.close()">Close Window</button>
        </div>
        <script>
          try {
            // Send error message to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth_error',
                platform: '${platform}',
                error: '${errorMessage.replace(/'/g, "\\'")}'
              }, '*');
            }

            // Auto-close after 5 seconds if user doesn't click
            setTimeout(() => {
              window.close();
            }, 5000);
          } catch (error) {
            console.error('OAuth error callback failed:', error);
            // Fallback: just close the window
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
