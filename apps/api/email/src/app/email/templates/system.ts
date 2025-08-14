export const getSystemMaintenanceTemplate = (data: {
  maintenanceDate: Date;
  duration: string;
  affectedServices: string[];
  alternativeActions?: string[];
}): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Scheduled Maintenance Notice</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #000000; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center; }
        .content { padding: 40px 20px; color: #f5f5f4; }
        .maintenance-box { background-color: #2a2a2a; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .service-list { background-color: #2a2a2a; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .service { margin: 5px 0; color: #d6d3d1; }
        .footer { padding: 20px; text-align: center; color: #a0a0a0; font-size: 14px; border-top: 1px solid #2a2a2a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: white; margin: 0;">🔧 Scheduled Maintenance</h1>
        </div>
        <div class="content">
          <h2 style="color: #FEBEFA;">System Maintenance Notice</h2>
          <p>We wanted to inform you about upcoming scheduled maintenance to improve our services.</p>

          <div class="maintenance-box">
            <h3 style="color: #f59e0b; margin-top: 0;">Maintenance Details</h3>
            <p><strong>Date & Time:</strong> ${data.maintenanceDate.toLocaleString()}</p>
            <p><strong>Expected Duration:</strong> ${data.duration}</p>

            <h4 style="color: #f59e0b;">Affected Services:</h4>
            <div class="service-list">
              ${data.affectedServices.map(service => `
                <div class="service">• ${service}</div>
              `).join('')}
            </div>
          </div>

          ${data.alternativeActions && data.alternativeActions.length > 0 ? `
          <h3 style="color: #FEBEFA;">What You Can Do:</h3>
          <div class="service-list">
            ${data.alternativeActions.map(action => `
              <div class="service">• ${action}</div>
            `).join('')}
          </div>
          ` : ''}

          <p>We apologize for any inconvenience and appreciate your patience as we work to improve your experience.</p>
          <p>If you have any questions, please contact our support team.</p>

          <p>Best regards,<br>The Next Level Coach AI Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Next Level Coach AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getSystemAlertTemplate = (data: {
  alertType: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  actionRequired?: boolean;
  actionLink?: string;
  actionText?: string;
}): string => {
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return '#dc2626';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>System Alert: ${data.title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #000000; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
        .header { background: linear-gradient(135deg, ${getAlertColor(data.alertType)} 0%, ${getAlertColor(data.alertType)}aa 100%); padding: 40px 20px; text-align: center; }
        .content { padding: 40px 20px; color: #f5f5f4; }
        .alert-box { background-color: #2a2a2a; border: 2px solid ${getAlertColor(data.alertType)}; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #7B21BA 0%, #B339D4 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin: 16px 0; }
        .footer { padding: 20px; text-align: center; color: #a0a0a0; font-size: 14px; border-top: 1px solid #2a2a2a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: white; margin: 0;">${getAlertIcon(data.alertType)} ${data.title}</h1>
        </div>
        <div class="content">
          <div class="alert-box">
            <p style="margin: 0; font-size: 16px; line-height: 1.6;">${data.message}</p>
          </div>

          ${data.actionRequired && data.actionLink && data.actionText ? `
          <p style="text-align: center;">
            <a href="${data.actionLink}" class="button">${data.actionText}</a>
          </p>
          ` : ''}

          <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>

          <p>Best regards,<br>The Next Level Coach AI Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Next Level Coach AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
