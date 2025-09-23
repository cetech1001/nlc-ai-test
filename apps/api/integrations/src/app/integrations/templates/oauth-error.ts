export const oauthError = (errorMessage: string, platform: string, nonce: string) => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Integration Failed</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'nonce-${nonce}'; object-src 'none';">

        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #2d1b20 50%, #3d1e1e 100%);
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
            border: 1px solid rgba(239, 68, 68, 0.3);
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
            opacity: 0.4;
            animation: float 6s ease-in-out infinite;
          }

          .orb-1 {
            width: 100px;
            height: 100px;
            background: linear-gradient(45deg, #ef4444, #dc2626);
            top: -20px;
            right: -20px;
          }

          .orb-2 {
            width: 80px;
            height: 80px;
            background: linear-gradient(45deg, #f97316, #ea580c);
            bottom: -10px;
            left: -10px;
            animation-delay: 2s;
          }

          .icon-container {
            width: 80px;
            height: 80px;
            margin: 0 auto 24px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: shake 0.5s ease-in-out;
          }

          .error-icon {
            font-size: 36px;
            color: white;
          }

          .error-title {
            color: #ef4444;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 12px;
            letter-spacing: -0.025em;
          }

          .platform-name {
            color: #e5e7eb;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 24px;
            text-transform: capitalize;
          }

          .error-message {
            color: #fca5a5;
            font-size: 14px;
            margin-bottom: 32px;
            line-height: 1.6;
            background: rgba(239, 68, 68, 0.1);
            padding: 16px;
            border-radius: 12px;
            border-left: 4px solid #ef4444;
          }

          .retry-btn {
            background: linear-gradient(135deg, #6b7280, #4b5563);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 16px;
            transition: all 0.2s;
          }

          .retry-btn:hover {
            background: linear-gradient(135deg, #4b5563, #374151);
            transform: translateY(-1px);
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
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
        </style>
      </head>
      <body>
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>

        <div class="container">
          <div class="icon-container">
            <div class="error-icon">✕</div>
          </div>

          <div class="error-title">Connection Failed</div>
          <div class="platform-name">${platform}</div>

          <div class="error-message">
            ${errorMessage}
          </div>

          <button class="retry-btn" onclick="window.close()">Close Window</button>
          <div class="auto-close">Or wait for auto-close in 5 seconds</div>
        </div>

        <script nonce="${nonce}">
          (function() {
            function notifyParentAndClose() {
            try {
              if (window.opener && !window.opener.closed) {
                console.log('Sending error message to parent window');
                window.opener.postMessage({
                  type: 'integration_error',
                  platform: '${platform}',
                  error: '${errorMessage.replace(/'/g, "\\'").replace(/\n/g, ' ')}'
                }, '*');

                setTimeout(() => {
                  try {
                    window.close();
                  } catch (e) {
                    console.log('Could not close window automatically');
                  }
                }, 500);
              } else if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                  type: 'integration_error',
                  platform: '${platform}',
                  error: '${errorMessage.replace(/'/g, "\\'").replace(/\n/g, ' ')}'
                }, '*');
              } else {
                setTimeout(() => window.close(), 3000);
              }
              } catch (error) {
                console.error('Error communicating with parent:', error);
                setTimeout(() => window.close(), 5000);
              }
            }

            notifyParentAndClose();
            setTimeout(notifyParentAndClose, 1000);
          })();
        </script>
      </body>
      </html>
    `;
}
