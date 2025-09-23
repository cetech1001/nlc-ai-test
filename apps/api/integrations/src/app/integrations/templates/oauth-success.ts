import {Integration} from "@nlc-ai/types";

export const oauthSuccess = (platform: string, integration: Integration, nonce: string) => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Integration Success</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
            background: linear-gradient(135deg, #FEBEFA, 0%, #7B21BA 50%, #7B26F0 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(123, 33, 186, 0.3);
            padding: 60px 40px;
            border-radius: 24px;
            backdrop-filter: blur(20px);
            box-shadow:
              0 20px 60px rgba(0,0,0,0.4),
              inset 0 1px 0 rgba(255,255,255,0.1);
            max-width: 480px;
            width: 90%;
            position: relative;
            animation: slideIn 0.8s ease-out;
          }

          .glow-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(40px);
            opacity: 0.6;
            animation: float 6s ease-in-out infinite;
          }

          .orb-1 {
            width: 100px;
            height: 100px;
            background: linear-gradient(45deg, #7b21ba, #b339d4);
            top: -20px;
            right: -20px;
            animation-delay: 0s;
          }

          .orb-2 {
            width: 80px;
            height: 80px;
            background: linear-gradient(45deg, #7B21BA, #8b5cf6);
            bottom: -10px;
            left: -10px;
            animation-delay: 2s;
          }

          .icon-container {
            width: 80px;
            height: 80px;
            margin: 0 auto 24px;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            animation: pulse 2s ease-in-out infinite;
          }

          .checkmark {
            font-size: 36px;
            color: white;
            animation: checkPop 0.6s ease-out 0.3s both;
          }

          .success-title {
            color: #10b981;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 12px;
            letter-spacing: -0.025em;
          }

          .platform-name {
            color: #e5e7eb;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
            text-transform: capitalize;
          }

          .integration-id {
            color: #9ca3af;
            font-size: 12px;
            font-family: 'SF Mono', Monaco, monospace;
            margin-bottom: 24px;
            opacity: 0.7;
          }

          .message {
            color: #d1d5db;
            font-size: 14px;
            margin-bottom: 32px;
            line-height: 1.6;
          }

          .progress-bar {
            width: 100%;
            height: 4px;
            background: rgba(255,255,255,0.1);
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 16px;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #059669);
            width: 0;
            border-radius: 2px;
            animation: fillProgress 3s ease-out;
          }

          .auto-close {
            color: #9ca3af;
            font-size: 12px;
            opacity: 0.8;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          @keyframes checkPop {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }

          @keyframes fillProgress {
            from { width: 0; }
            to { width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>

        <div class="container">
          <div class="icon-container">
            <div class="checkmark">✓</div>
          </div>

          <div class="success-title">Successfully Connected!</div>
          <div class="platform-name">${platform}</div>
          <div class="integration-id">ID: ${integration.id?.slice(0, 8) || 'xxx'}...</div>

          <div class="message">
            Your ${platform} account has been successfully integrated.<br>
            You can now sync data and manage your content.
          </div>

          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>

          <div class="auto-close">This window will close automatically</div>
        </div>

        <script nonce="${nonce}">
          (function() {
            function notifyParentAndClose() {
            try {
              // Try different methods to communicate with parent
              if (window.opener && !window.opener.closed) {
                console.log('Sending success message to parent window');
                window.opener.postMessage({
                  type: 'integration_success',
                  platform: '${platform}',
                  integration: ${JSON.stringify({
                    id: integration.id,
                    platformName: integration.platformName,
                    isActive: integration.isActive,
                    createdAt: integration.createdAt
                  })}
                }, '*');

                // Small delay to ensure message is received
                setTimeout(() => {
                  try {
                    window.close();
                  } catch (e) {
                    console.log('Could not close window automatically');
                  }
                }, 500);
              } else if (window.parent && window.parent !== window) {
                // Fallback for iframe scenarios
                window.parent.postMessage({
                  type: 'integration_success',
                  platform: '${platform}',
                  integration: ${JSON.stringify({
                    id: integration.id,
                    platformName: integration.platformName,
                    isActive: integration.isActive,
                    createdAt: integration.createdAt
                  })}
                }, '*');
              } else {
                console.log('No parent window found, closing automatically');
                setTimeout(() => window.close(), 2000);
              }
            } catch (error) {
              console.error('Error communicating with parent:', error);
              setTimeout(() => window.close(), 3000);
            }
          }

          // Call immediately and also set backup timeout
          notifyParentAndClose();
          setTimeout(notifyParentAndClose, 1000); // Backup call
          })();
        </script>
      </body>
      </html>
    `;
}
