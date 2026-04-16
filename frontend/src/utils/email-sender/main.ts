import nodemailer from 'nodemailer';

interface EmailOptions {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: 'selina.weissnat@ethereal.email',
    pass: '8nmdv9GM9GnWBEEbR1'
  }
});

/**
 * Send password reset email to user with reset code
 * @param email - User's email address
 * @param resetCode - Generated reset code
 * @param userName - User's name for personalization
 */
export async function sendPasswordResetEmail(email: string, resetCode: string, userName: string): Promise<boolean> {
  try {
    const resetLink = `${window.location.origin}/reset-password/${resetCode}`;
    
    const info = await transporter.sendMail({
      from: '"CouponHub Support" <support@couponhub.com>',
      to: email,
      subject: "Reset Your CouponHub Password",
      text: `Hi ${userName},\n\nYou requested a password reset. Use this code to reset your password:\n\nCode: ${resetCode}\n\nOr click here: ${resetLink}\n\nThis code expires in 1 hour.\n\nIf you didn't request this, ignore this email.\n\nBest regards,\nCouponHub Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi ${userName},</p>
          <p>You requested a password reset for your CouponHub account. Use the code below to reset your password:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 0;">${resetCode}</p>
          </div>
          <p><a href="${resetLink}" style="background: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a></p>
          <p style="color: #666; font-size: 14px;">This code expires in 1 hour.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
          <p style="color: #999; font-size: 12px; text-align: center;">Best regards,<br>CouponHub Team</p>
        </div>
      `
    });

    console.log("Password reset email sent: %s", info.messageId);
    return true;
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    return false;
  }
}

/**
 * Generic email sender function
 * @param options - Email configuration options
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: options.from || '"CouponHub" <noreply@couponhub.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    return false;
  }
}

// Demo/testing utilities
export function logPasswordResetDemo(email: string, resetCode: string, userName: string): void {
  const resetLink = `${window.location.origin}/reset-password/${resetCode}`;
  console.log(`
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📧 PASSWORD RESET EMAIL (DEMO MODE)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  To: ${email}
  Subject: Reset Your CouponHub Password
  
  Hi ${userName},
  
  Reset Code: ${resetCode} 
  Reset Link: ${resetLink}
  
  This code expires in 1 hour.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}