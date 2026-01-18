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
    <div className="mobile-container placeholder-page">
      <h1>Login</h1>
      <p>Welcome back to McGill Dating</p>

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
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
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
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <nav className="placeholder-nav" style={{ marginTop: '32px' }}>
        <Link href="/">← Back to Home</Link>
        <Link href="/auth/signup">Don't have an account? Sign Up</Link>
      </nav>
    </div>
  );
}
