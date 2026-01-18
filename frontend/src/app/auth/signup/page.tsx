'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup, completeSignup, ApiError } from '../../../lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    return email.endsWith('@mail.mcgill.ca');
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email must be a McGill email (@mail.mcgill.ca)');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await signup({ email, password });
      setStep('otp');
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError?.error?.message || 'Failed to send verification code. Please try again.';
      setError(errorMessage);
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (otpCode.length !== 4 || !/^\d{4}$/.test(otpCode)) {
      setError('Verification code must be exactly 4 digits');
      return;
    }

    setIsLoading(true);

    try {
      await completeSignup({ email, password, code: otpCode });
      setSuccess(true);
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError?.error?.message || 'Verification failed. Please try again.';
      setError(errorMessage);
      console.error('OTP verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep('form');
    setOtpCode('');
    setError(null);
  };

  return (
    <div className="mobile-container placeholder-page">
      <h1>Sign Up</h1>
      <p>Create your McGill Dating account</p>

      {success ? (
        <div style={{ color: 'green', marginTop: '20px' }}>
          <p>✅ Account created successfully!</p>
          <p>Email: {email}</p>
          <p>Redirecting to login...</p>
        </div>
      ) : step === 'form' ? (
        // Step 1: Account Details Form
        <form onSubmit={handleInitialSubmit} style={{ width: '100%', maxWidth: '400px', marginTop: '20px' }}>
          {error && (
            <div style={{
              color: 'red',
              marginBottom: '16px',
              padding: '12px',
              background: '#fee',
              borderRadius: '8px'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              McGill Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.name@mail.mcgill.ca"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              background: isLoading ? '#ccc' : '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Sending Code...' : 'Send Verification Code'}
          </button>
        </form>
      ) : (
        // Step 2: OTP Verification Form
        <form onSubmit={handleOtpSubmit} style={{ width: '100%', maxWidth: '400px', marginTop: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📧</div>
            <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>Check Your Email</h2>
            <p style={{ color: '#666', margin: '0' }}>
              We sent a 4-digit verification code to:<br />
              <strong>{email}</strong>
            </p>
          </div>

          {error && (
            <div style={{
              color: 'red',
              marginBottom: '16px',
              padding: '12px',
              background: '#fee',
              borderRadius: '8px'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="otp" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', textAlign: 'center' }}>
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="0000"
              maxLength={4}
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid #ddd',
                borderRadius: '12px',
                fontSize: '24px',
                textAlign: 'center',
                letterSpacing: '8px',
                fontWeight: 'bold',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otpCode.length !== 4}
            style={{
              width: '100%',
              padding: '14px',
              background: (isLoading || otpCode.length !== 4) ? '#ccc' : '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (isLoading || otpCode.length !== 4) ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
            }}
          >
            {isLoading ? 'Verifying...' : 'Verify & Create Account'}
          </button>

          <button
            type="button"
            onClick={handleBackToForm}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: '#0070f3',
              border: '1px solid #0070f3',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            ← Change Email/Password
          </button>
        </form>
      )}

      <nav className="placeholder-nav" style={{ marginTop: '32px' }}>
        <Link href="/">← Back to Home</Link>
        <Link href="/auth/login">Already have an account? Login</Link>
      </nav>
    </div>
  );
}
