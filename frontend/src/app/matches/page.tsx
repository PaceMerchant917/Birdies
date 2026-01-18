'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function MatchesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="mobile-container placeholder-page">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mobile-container matches-page">
      {/* Header */}
      <header className="page-header">
        <Link href="/home" className="back-button">
          ← Home
        </Link>
        <h1>Matches</h1>
        <div style={{ width: '40px' }}></div>
      </header>

      {/* Matches List */}
      <main className="matches-content">
        <div className="matches-placeholder">
          <div className="placeholder-icon">💕</div>
          <h2>No Matches Yet</h2>
          <p>Start swiping in the Discover tab to find your matches!</p>
          <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            When someone you like likes you back, you'll see them here.
          </p>
          <Link 
            href="/discover" 
            style={{
              display: 'inline-block',
              marginTop: '24px',
              padding: '12px 24px',
              background: '#0070f3',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
            }}
          >
            Start Discovering
          </Link>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <Link href="/home" className="nav-item">
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </Link>
        <Link href="/discover" className="nav-item">
          <span className="nav-icon">🔍</span>
          <span className="nav-label">Discover</span>
        </Link>
        <Link href="/matches" className="nav-item active">
          <span className="nav-icon">💕</span>
          <span className="nav-label">Matches</span>
        </Link>
        <Link href="/profile" className="nav-item">
          <span className="nav-icon">👤</span>
          <span className="nav-label">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
