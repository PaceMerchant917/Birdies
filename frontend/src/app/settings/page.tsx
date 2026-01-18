'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading || !user) {
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
    <div className="mobile-container settings-page">
      {/* Header */}
      <header className="page-header">
        <Link href="/home" className="back-button">
          ← Home
        </Link>
        <h1>Settings</h1>
        <div style={{ width: '40px' }}></div>
      </header>

      {/* Settings Content */}
      <main className="settings-content">
        {/* Account Section */}
        <section className="settings-section">
          <h3 className="settings-section-title">Account</h3>
          <div className="settings-item">
            <span style={{ fontWeight: '500', color: '#000000' }}>Email</span>
            <span style={{ color: '#8e8e93', fontSize: '14px', fontWeight: '500' }}>{user.email}</span>
          </div>
          <div className="settings-item">
            <span style={{ fontWeight: '500', color: '#000000' }}>Account Status</span>
            <span style={{ 
              color: user.mcgillVerified ? '#34c759' : '#8e8e93',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {user.mcgillVerified ? '✓ Verified' : 'Not Verified'}
            </span>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="settings-section">
          <h3 className="settings-section-title">Privacy & Safety</h3>
          <button className="settings-button">
            🔒 Privacy Settings
            <span style={{ fontSize: '12px', color: '#999' }}>Coming Soon</span>
          </button>
          <button className="settings-button">
            🚫 Blocked Users
            <span style={{ fontSize: '12px', color: '#999' }}>Coming Soon</span>
          </button>
          <button className="settings-button">
            📢 Report an Issue
            <span style={{ fontSize: '12px', color: '#999' }}>Coming Soon</span>
          </button>
        </section>

        {/* Preferences Section */}
        <section className="settings-section">
          <h3 className="settings-section-title">Preferences</h3>
          <button className="settings-button">
            🔔 Notifications
            <span style={{ fontSize: '12px', color: '#999' }}>Coming Soon</span>
          </button>
          <button className="settings-button">
            🎯 Discovery Preferences
            <span style={{ fontSize: '12px', color: '#999' }}>Coming Soon</span>
          </button>
        </section>

        {/* Developer Section - Only show in development */}
        {process.env.NEXT_PUBLIC_ENV !== 'production' && (
          <section className="settings-section" style={{ 
            background: '#fff9e6', 
            border: '2px solid #ffd700',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h3 className="settings-section-title" style={{ color: '#c28200' }}>
              🛠️ Developer Tools
            </h3>
            <div style={{ 
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              marginTop: '12px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                Seed Demo Data
              </h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                Generate sample profiles, likes, matches, and messages for testing:
              </p>
              <pre style={{
                background: '#f4f4f4',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '13px',
                overflow: 'auto',
                margin: '0 0 8px 0',
                fontFamily: 'monospace'
              }}>
                cd backend{'\n'}TARGET_EMAIL={user?.email || 'your.email@mail.mcgill.ca'} npm run seed-dev
              </pre>
              <p style={{ margin: '0', fontSize: '12px', color: '#888', lineHeight: '1.4' }}>
                This will create ~80 sample profiles, 20 likes to your account, 10 matches with messages.
                Safe to re-run (idempotent).
              </p>
            </div>
          </section>
        )}

        {/* Actions Section */}
        <section className="settings-section">
          <h3 className="settings-section-title">Actions</h3>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '16px',
              background: '#000000',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '12px',
              letterSpacing: '-0.3px',
              transition: 'all 0.2s ease'
            }}
          >
            Sign Out
          </button>
          <button 
            style={{
              width: '100%',
              padding: '16px',
              background: '#ffebee',
              color: '#c62828',
              border: '0.5px solid #ef9a9a',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              letterSpacing: '-0.3px',
              transition: 'all 0.2s ease'
            }}
          >
            Delete Account (Coming Soon)
          </button>
        </section>
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
        <Link href="/matches" className="nav-item">
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
