export const forgotPasswordEmailTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .reset-link {
              display: inline-block;
              margin: 20px 0;
              font-size: 18px;
              color: #ffffff !important;
              background: #4CAF50;
              padding: 10px 20px;
              text-align: center;
              border-radius: 5px;
              text-decoration: none;
              font-weight: bold;
          }
          .reset-link:hover {
              background: #45a049;
          }
          .url-text {
              word-break: break-all;
              color: #4CAF50;
              font-size: 14px;
              margin: 10px 0;
              color: white;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
        
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Password Reset Request</div>
          <div class="content">
              <p>Dear {name},</p>
              <p>We received a request to reset your password for your Library Management System account. Click the button below to reset your password:</p>
              <a  href="{message}" class="reset-link">Reset Password</a>
              <p>This link will expire in 10 minutes. If you did not request a password reset, please ignore this email or contact our support team.</p>
          </div>
    
          <div class="footer">
              <p>Thank you for using Library Management System</p>
              <p>© ${new Date().getFullYear()} Library Management System. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;
