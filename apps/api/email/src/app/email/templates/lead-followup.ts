export const getLeadFollowupEmailTemplate = (data: {
  leadName: string;
  coachName: string;
  coachBusinessName?: string;
  emailContent: string;
  emailNumber?: number;
  totalEmails?: number;
  unsubscribeLink?: string;
}): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Follow-up from ${data.coachName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #000000;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #1a1a1a;
        }
        .header {
          background: linear-gradient(135deg, #7B21BA 0%, #B339D4 50%, #FEBEFA 100%);
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }
        .coach-info {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          margin-top: 8px;
        }
        .content {
          padding: 40px 20px;
          color: #f5f5f4;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
          color: #FEBEFA;
        }
        .email-body {
          margin: 20px 0;
          white-space: pre-wrap;
        }
        .email-body p {
          margin-bottom: 16px;
        }
        .signature {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #2a2a2a;
        }
        .coach-signature {
          font-weight: 600;
          color: #FEBEFA;
        }
        .business-name {
          color: #d6d3d1;
          font-size: 14px;
          margin-top: 4px;
        }
        .footer {
          padding: 20px;
          text-align: center;
          color: #a0a0a0;
          font-size: 14px;
          border-top: 1px solid #2a2a2a;
        }
        .email-meta {
          background-color: #2a2a2a;
          padding: 12px 16px;
          border-radius: 6px;
          margin: 20px 0;
          font-size: 12px;
          color: #a0a0a0;
        }
        .unsubscribe {
          margin-top: 16px;
        }
        .unsubscribe a {
          color: #a0a0a0;
          text-decoration: underline;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%);
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 500;
          margin: 16px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">${data.coachBusinessName || `${data.coachName}'s Coaching`}</h1>
          <div class="coach-info">Personal message from ${data.coachName}</div>
        </div>

        <div class="content">
          <div class="greeting">
            Hi ${data.leadName},
          </div>

          <div class="email-body">
            ${data.emailContent.split('\n').map(paragraph =>
    paragraph.trim() ? `<p>${paragraph}</p>` : ''
  ).join('')}
          </div>

          <div class="signature">
            <div class="coach-signature">${data.coachName}</div>
            ${data.coachBusinessName ? `<div class="business-name">${data.coachBusinessName}</div>` : ''}
          </div>

          ${data.emailNumber && data.totalEmails ? `
          <div class="email-meta">
            This is email ${data.emailNumber} of ${data.totalEmails} in your follow-up sequence.
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <p>You're receiving this email because you expressed interest in coaching services.</p>
          ${data.unsubscribeLink ? `
          <div class="unsubscribe">
            <a href="${data.unsubscribeLink}">Unsubscribe from future emails</a>
          </div>
          ` : ''}
          <p>&copy; 2025 Next Level Coach AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getClientResponseEmailTemplate = (data: {
  clientName: string;
  coachName: string;
  coachBusinessName?: string;
  emailContent: string;
  originalSubject?: string;
  isReply?: boolean;
}): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.isReply ? 'Re: ' : ''}${data.originalSubject || 'Message from your coach'}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f8f9fa;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%);
          padding: 24px;
          border-radius: 8px 8px 0 0;
        }
        .coach-info {
          color: white;
          margin: 0;
        }
        .coach-name {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .business-name {
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 32px 24px;
        }
        .greeting {
          font-size: 16px;
          margin-bottom: 20px;
          color: #333;
        }
        .email-body {
          margin: 20px 0;
          white-space: pre-wrap;
          color: #444;
        }
        .email-body p {
          margin-bottom: 16px;
        }
        .signature {
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }
        .coach-signature {
          font-weight: 600;
          color: #7B21BA;
          margin-bottom: 4px;
        }
        .footer {
          padding: 20px 24px;
          text-align: center;
          color: #6c757d;
          font-size: 12px;
          border-top: 1px solid #e9ecef;
          background-color: #f8f9fa;
          border-radius: 0 0 8px 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="coach-info">
            <div class="coach-name">${data.coachName}</div>
            ${data.coachBusinessName ? `<div class="business-name">${data.coachBusinessName}</div>` : ''}
          </div>
        </div>

        <div class="content">
          <div class="greeting">
            Hi ${data.clientName},
          </div>

          <div class="email-body">
            ${data.emailContent.split('\n').map(paragraph =>
    paragraph.trim() ? `<p>${paragraph}</p>` : ''
  ).join('')}
          </div>

          <div class="signature">
            <div class="coach-signature">${data.coachName}</div>
            ${data.coachBusinessName ? `<div style="color: #6c757d; font-size: 14px;">${data.coachBusinessName}</div>` : ''}
          </div>
        </div>

        <div class="footer">
          <p>This is a personal message from your coach. Please reply if you have any questions.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getEmailSequenceCompleteTemplate = (data: {
  leadName: string;
  coachName: string;
  coachBusinessName?: string;
  totalEmailsSent: number;
  ctaText?: string;
  ctaLink?: string;
}): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank you for your time, ${data.leadName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #000000;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #1a1a1a;
        }
        .header {
          background: linear-gradient(135deg, #7B21BA 0%, #B339D4 50%, #FEBEFA 100%);
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }
        .content {
          padding: 40px 20px;
          color: #f5f5f4;
          text-align: center;
        }
        .summary-box {
          background-color: #2a2a2a;
          border: 1px solid #7B21BA;
          border-radius: 8px;
          padding: 24px;
          margin: 24px 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%);
          color: white;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-weight: 600;
          margin: 24px 0;
        }
        .footer {
          padding: 20px;
          text-align: center;
          color: #a0a0a0;
          font-size: 14px;
          border-top: 1px solid #2a2a2a;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">${data.coachBusinessName || `${data.coachName}'s Coaching`}</h1>
        </div>

        <div class="content">
          <h2 style="color: #FEBEFA;">Thank you for your time, ${data.leadName}</h2>

          <div class="summary-box">
            <h3 style="color: #FEBEFA; margin-top: 0;">Our Journey Together</h3>
            <p>Over the past few weeks, I've shared ${data.totalEmailsSent} messages with valuable insights and strategies to help you on your journey.</p>
            <p>I hope you've found them helpful and actionable.</p>
          </div>

          <p>While this email sequence has come to an end, my door is always open if you'd like to take the next step in your development.</p>

          ${data.ctaText && data.ctaLink ? `
          <a href="${data.ctaLink}" class="cta-button">${data.ctaText}</a>
          ` : ''}

          <p style="margin-top: 32px;">Thank you for allowing me to be part of your journey.</p>

          <p style="margin-top: 24px;">
            <strong style="color: #FEBEFA;">${data.coachName}</strong><br>
            ${data.coachBusinessName || ''}
          </p>
        </div>

        <div class="footer">
          <p>&copy; 2025 Next Level Coach AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
