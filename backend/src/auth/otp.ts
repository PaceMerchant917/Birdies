/**
 * OTP (One-Time Password) in-memory storage
 *
 * TODO: For production, move to database and hash codes
 * This in-memory implementation is for hackathon demo only
 */

interface OTPRecord {
  code: string;
  expiresAt: Date;
  attempts: number;
}

// In-memory storage: email -> OTPRecord
// TODO: Replace with database storage in production
const otpStore = new Map<string, OTPRecord>();

// Cleanup expired codes every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [email, record] of otpStore.entries()) {
    if (record.expiresAt < now) {
      otpStore.delete(email);
    }
  }
}, 5 * 60 * 1000);

/**
 * Generate a 4-digit verification code (1000-9999)
 */
export function generateOTPCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Store OTP code for an email
 * @param email - User email
 * @param code - 4-digit code
 * @param expiryMinutes - Expiry time in minutes (default: 10)
 */
export function storeOTP(
  email: string,
  code: string,
  expiryMinutes: number = 10
): void {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

  otpStore.set(email.toLowerCase(), {
    code,
    expiresAt,
    attempts: 0,
  });
}

/**
 * Verify OTP code
 * @param email - User email
 * @param code - Code to verify
 * @returns true if valid, false otherwise
 */
export function verifyOTP(email: string, code: string): {
  valid: boolean;
  reason?: 'not_found' | 'expired' | 'max_attempts' | 'invalid_code';
} {
  const record = otpStore.get(email.toLowerCase());

  if (!record) {
    return { valid: false, reason: 'not_found' };
  }

  // Check if expired
  if (record.expiresAt < new Date()) {
    otpStore.delete(email.toLowerCase());
    return { valid: false, reason: 'expired' };
  }

  // Check max attempts (5)
  if (record.attempts >= 5) {
    return { valid: false, reason: 'max_attempts' };
  }

  // Increment attempts
  record.attempts++;

  // Check if code matches
  if (record.code !== code) {
    return { valid: false, reason: 'invalid_code' };
  }

  // Valid code - delete it (one-time use)
  otpStore.delete(email.toLowerCase());
  return { valid: true };
}

/**
 * Delete OTP record (used after successful verification)
 */
export function deleteOTP(email: string): void {
  otpStore.delete(email.toLowerCase());
}

/**
 * Check if email has a valid (non-expired) OTP
 */
export function hasValidOTP(email: string): boolean {
  const record = otpStore.get(email.toLowerCase());
  if (!record) return false;
  if (record.expiresAt < new Date()) {
    otpStore.delete(email.toLowerCase());
    return false;
  }
  return true;
}
