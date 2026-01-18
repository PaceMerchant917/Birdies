/**
 * Email sending using Resend
 */

import { Resend } from 'resend';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Email from address - must be from verified domain in Resend
// Format: "Display Name <email@domain.com>" or "email@domain.com"
// Read from environment variable (required)
const EMAIL_FROM = process.env.EMAIL_FROM;

/**
 * Send OTP verification code email
 */
export async function sendOTPEmail(email: string, code: string): Promise<void> {
  if (!resend) {
    console.error('❌ Resend API key not configured');
    throw new Error('Email service not configured');
  }

  if (!EMAIL_FROM) {
    console.error('❌ EMAIL_FROM environment variable not set');
    throw new Error('EMAIL_FROM environment variable is required');
  }

  const subject = 'Your Campus Connect verification code';
  const text = `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Campus Connect - Verification Code</h2>
      <p>Your verification code is:</p>
      <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 8px;">
        ${code}
      </div>
      <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
      <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject,
      text,
      html,
    });

    if (result.error) {
      console.error('❌ Resend API error:', result.error);
      throw new Error(`Failed to send email: ${result.error.message}`);
    }

    console.log(`✅ OTP email sent to ${email} (ID: ${result.data?.id})`);
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw error;
  }
}
