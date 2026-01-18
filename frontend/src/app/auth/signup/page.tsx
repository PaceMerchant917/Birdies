'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup, ApiError } from '../../../lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    return email.endsWith('@mail.mcgill.ca');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

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
      const response = await signup({ email, password });
      setSuccess(true);
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError?.error?.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mobile-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      background: '#ffffff',
      padding: '40px 24px'
    }}>
      <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700',
            marginBottom: '8px',
            color: '#000000',
            letterSpacing: '-0.5px'
          }}>
            Get Started
          </h1>
          <p style={{ color: '#8e8e93', fontSize: '16px' }}>
            Create your McGill Dating account
          </p>
        </div>

        {success ? (
          <div style={{ 
            textAlign: 'center',
            padding: '40px 24px',
            background: '#e8f5e9',
            borderRadius: '20px',
            border: '0.5px solid #81c784'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✓</div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700',
              color: '#2e7d32',
              marginBottom: '12px',
              letterSpacing: '-0.5px'
            }}>
              Account Created!
            </h2>
            <p style={{ color: '#2e7d32', fontSize: '15px', marginBottom: '8px' }}>
              {email}
            </p>
            <p style={{ color: '#8e8e93', fontSize: '14px' }}>
              Redirecting to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            {error && (
              <div style={{ 
                color: '#c62828', 
                marginBottom: '20px', 
                padding: '14px 16px', 
                background: '#ffebee', 
                borderRadius: '12px',
                border: '0.5px solid #ef9a9a',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="email" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                fontSize: '14px',
                color: '#000000',
                letterSpacing: '-0.2px'
              }}>
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
                  padding: '14px 16px',
                  border: '0.5px solid #d1d1d6',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: '#f9f9f9',
                  color: '#000000',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="password" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                fontSize: '14px',
                color: '#000000',
                letterSpacing: '-0.2px'
              }}>
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
                  padding: '14px 16px',
                  border: '0.5px solid #d1d1d6',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: '#f9f9f9',
                  color: '#000000',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label htmlFor="confirmPassword" style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                fontSize: '14px',
                color: '#000000',
                letterSpacing: '-0.2px'
              }}>
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
                  padding: '14px 16px',
                  border: '0.5px solid #d1d1d6',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: '#f9f9f9',
                  color: '#000000',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                background: isLoading ? '#8e8e93' : '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                letterSpacing: '-0.3px'
              }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div style={{ 
          marginTop: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <Link href="/" style={{
            display: 'block',
            padding: '14px',
            textAlign: 'center',
            background: '#f2f2f7',
            color: '#000000',
            textDecoration: 'none',
            borderRadius: '16px',
            fontWeight: '600',
            fontSize: '15px',
            transition: 'all 0.2s ease'
          }}>
            ← Back to Home
          </Link>
          <Link href="/auth/login" style={{
            display: 'block',
            padding: '14px',
            textAlign: 'center',
            color: '#000000',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '15px'
          }}>
            Already have an account? <span style={{ fontWeight: '600' }}>Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
