'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="mobile-container placeholder-page">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="mobile-container placeholder-page">
      <h1>McGill Dating</h1>
      <p>McGill-exclusive dating app</p>
      <p>Connect with fellow McGill students</p>
      
      <nav className="placeholder-nav" style={{ marginTop: '32px' }}>
        <Link 
          href="/auth/login"
          style={{
            display: 'block',
            padding: '14px 24px',
            margin: '8px 0',
            background: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: '600',
          }}
        >
          Login
        </Link>
        <Link 
          href="/auth/signup"
          style={{
            display: 'block',
            padding: '14px 24px',
            margin: '8px 0',
            background: '#f0f0f0',
            color: '#333',
            textDecoration: 'none',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: '600',
          }}
        >
          Sign Up
        </Link>
      </nav>
    </div>
  );
}
