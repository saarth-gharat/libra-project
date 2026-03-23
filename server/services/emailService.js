const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(email, name, token) {
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3001'}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    
    const mailOptions = {
      from: `"LIBRA.ONE" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your LIBRA.ONE account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">LIBRA.ONE</h1>
                      <p style="color: #e0e7ff; margin: 10px 0 0; font-size: 16px;">Digital Library Platform</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px;">Welcome, ${name}!</h2>
                      
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Thank you for registering with LIBRA.ONE. To complete your registration and activate your account, 
                        please verify your email address by clicking the button below:
                      </p>
                      
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" 
                           style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
                                  color: #ffffff; text-decoration: none; padding: 15px 30px; 
                                  border-radius: 6px; font-weight: bold; font-size: 16px;">
                          Verify Email Address
                        </a>
                      </div>
                      
                      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                        <strong>Or copy and paste this link in your browser:</strong><br>
                        <span style="word-break: break-all; color: #4f46e5;">${verificationUrl}</span>
                      </p>
                      
                      <div style="background-color: #f9fafb; border-left: 4px solid #4f46e5; padding: 20px; margin: 30px 0;">
                        <p style="color: #4b5563; font-size: 14px; margin: 0;">
                          <strong>Important:</strong> This verification link will expire in 24 hours. 
                          If you didn't create this account, you can safely ignore this email.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">
                        © ${new Date().getFullYear()} LIBRA.ONE. All rights reserved.
                      </p>
                      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        This is an automated message, please do not reply to this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email, name, resetCode) {
    const mailOptions = {
      from: `"LIBRA.ONE" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your LIBRA.ONE Password Reset Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">LIBRA.ONE</h1>
                      <p style="color: #e0e7ff; margin: 10px 0 0; font-size: 16px;">Digital Library Platform</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px;">Password Reset Code</h2>
                      
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Hello ${name},
                      </p>
                      
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        We received a request to reset your password. Use the verification code below:
                      </p>
                      
                      <div style="text-align: center; margin: 30px 0;">
                        <div style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
                               color: #ffffff; padding: 20px 40px; border-radius: 8px; font-size: 32px; 
                               font-weight: bold; letter-spacing: 8px; font-family: monospace;">
                          ${resetCode}
                        </div>
                      </div>
                      
                      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                        <strong>This code will expire in 15 minutes.</strong>
                      </p>
                      
                      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 30px 0;">
                        <p style="color: #4b5563; font-size: 14px; margin: 0;">
                          <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email. 
                          Your password remains unchanged.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">
                        © ${new Date().getFullYear()} LIBRA.ONE. All rights reserved.
                      </p>
                      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        This is an automated message, please do not reply to this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();