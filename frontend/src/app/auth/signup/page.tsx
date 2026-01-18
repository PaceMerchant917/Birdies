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
    <div className="mobile-container placeholder-page">
      <h1>Sign Up</h1>
      <p>Create your McGill Dating account</p>

      {success ? (
        <div style={{ color: 'green', marginTop: '20px' }}>
          <p>✅ Account created successfully!</p>
          <p>Email: {email}</p>
          <p>Redirecting to login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px', marginTop: '20px' }}>
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
            {isLoading ? 'Creating Account...' : 'Sign Up'}
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
