'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { ApiError } from '../../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      // Redirect to home page on success
      router.push('/home');
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError?.error?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      console.error('Login error:', err);
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
            Welcome Back
          </h1>
          <p style={{ color: '#8e8e93', fontSize: '16px' }}>
            Sign in to continue to McGill Dating
          </p>
        </div>

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
              Email
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

          <div style={{ marginBottom: '28px' }}>
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
              placeholder="Enter your password"
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
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

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
          <Link href="/auth/signup" style={{
            display: 'block',
            padding: '14px',
            textAlign: 'center',
            color: '#000000',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '15px'
          }}>
            Don't have an account? <span style={{ fontWeight: '600' }}>Sign Up</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
