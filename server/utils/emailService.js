const nodemailer = require('nodemailer');

// Create Gmail transporter
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createGmailTransporter();

    // Create reset URL
    const resetURL = process.env.NODE_ENV === 'production' 
      ? `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
      : `http://localhost:3000/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🔐 Reset Your SkillExchange Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 30px; background-color: #f9fafb; border: 1px solid #e5e7eb; }
            .button { 
              background-color: #4f46e5; 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 8px; 
              display: inline-block;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; background-color: #f3f4f6; border-radius: 0 0 10px 10px; }
            .warning { 
              background-color: #fef3c7; 
              border: 1px solid #f59e0b; 
              color: #92400e; 
              padding: 15px; 
              border-radius: 8px; 
              margin: 20px 0; 
            }
            .token-box { 
              background-color: #f3f4f6; 
              padding: 15px; 
              border-radius: 8px; 
              font-family: monospace; 
              word-break: break-all; 
              margin: 15px 0; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              <p>We received a request to reset your password for your SkillExchange account.</p>
              
              <p>Click the button below to reset your password:</p>
              <a href="${resetURL}" class="button">Reset My Password</a>
              
              <p>Or copy and paste this link in your browser:</p>
              <div class="token-box">${resetURL}</div>
              
              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <ul style="margin: 10px 0;">
                  <li>This link will expire in <strong>10 minutes</strong></li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              
              <p>If you have any questions or concerns, please contact our support team.</p>
              <p>Best regards,<br><strong>The SkillExchange Security Team</strong></p>
            </div>
            <div class="footer">
              <p>This email was sent to <strong>${email}</strong></p>
              <p>© 2025 SkillExchange. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request - SkillExchange
        
        Hello!
        
        We received a request to reset your password for your SkillExchange account.
        
        Please click on the following link to reset your password:
        ${resetURL}
        
        This link will expire in 10 minutes.
        
        If you didn't request this password reset, please ignore this email.
        
        Best regards,
        The SkillExchange Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createGmailTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🎉 Welcome to SkillExchange!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 30px; background-color: #f0fdf4; border: 1px solid #bbf7d0; }
            .button { 
              background-color: #10b981; 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 8px; 
              display: inline-block;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; background-color: #f3f4f6; border-radius: 0 0 10px 10px; }
            .features { background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { margin: 10px 0; padding: 10px; border-left: 4px solid #10b981; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to SkillExchange!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Welcome to SkillExchange! We're thrilled to have you join our community of learners and skill sharers.</p>
              
              <div class="features">
                <h3>🚀 Here's what you can do:</h3>
                <div class="feature-item">📚 <strong>Learn New Skills:</strong> Browse and connect with experts in various fields</div>
                <div class="feature-item">🎯 <strong>Share Your Expertise:</strong> Teach others and build your reputation</div>
                <div class="feature-item">🤝 <strong>Network:</strong> Connect with like-minded learners in your area</div>
                <div class="feature-item">⭐ <strong>Grow:</strong> Build your profile through successful skill exchanges</div>
              </div>
              
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="button">Start Your Journey</a>
              
              <p>If you have any questions, our support team is here to help!</p>
              <p>Happy learning and sharing!<br><strong>The SkillExchange Team</strong></p>
            </div>
            <div class="footer">
              <p>This email was sent to <strong>${email}</strong></p>
              <p>© 2025 SkillExchange. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail
};