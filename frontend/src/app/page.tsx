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
    <div className="mobile-container" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#ffffff',
      padding: '40px 24px',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '72px', marginBottom: '24px' }}>💕</div>
          <h1 style={{ 
            fontSize: '40px', 
            fontWeight: '700',
            marginBottom: '16px',
            color: '#000000',
            letterSpacing: '-1px'
          }}>
            McGill Dating
          </h1>
          <p style={{ 
            color: '#8e8e93', 
            fontSize: '18px',
            lineHeight: '1.5',
            marginBottom: '8px'
          }}>
            Connect with fellow McGill students
          </p>
          <p style={{ 
            color: '#8e8e93', 
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            Your McGill-exclusive dating community
          </p>
        </div>
        
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <Link 
            href="/auth/signup"
            style={{
              display: 'block',
              padding: '16px 24px',
              background: '#000000',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '16px',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '16px',
              letterSpacing: '-0.3px',
              transition: 'all 0.2s ease'
            }}
          >
            Create Account
          </Link>
          <Link 
            href="/auth/login"
            style={{
              display: 'block',
              padding: '16px 24px',
              background: '#f2f2f7',
              color: '#000000',
              textDecoration: 'none',
              borderRadius: '16px',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '16px',
              letterSpacing: '-0.3px',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </Link>
        </div>

        <div style={{ 
          marginTop: '48px',
          padding: '20px',
          background: '#f9f9f9',
          borderRadius: '20px',
          border: '0.5px solid #e5e5e7'
        }}>
          <p style={{ 
            color: '#8e8e93', 
            fontSize: '13px',
            lineHeight: '1.5'
          }}>
            ✓ McGill verified students only<br />
            ✓ Safe and secure platform<br />
            ✓ Find meaningful connections
          </p>
        </div>
      </div>
    </div>
  );
}
