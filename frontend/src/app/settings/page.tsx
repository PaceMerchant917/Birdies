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
            <span>Email</span>
            <span style={{ color: '#666', fontSize: '14px' }}>{user.email}</span>
          </div>
          <div className="settings-item">
            <span>Account Status</span>
            <span style={{ 
              color: user.mcgillVerified ? '#2d862d' : '#999',
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

        {/* Actions Section */}
        <section className="settings-section">
          <h3 className="settings-section-title">Actions</h3>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '14px',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '12px'
            }}
          >
            Logout
          </button>
          <button 
            style={{
              width: '100%',
              padding: '14px',
              background: '#fee',
              color: '#c00',
              border: '1px solid #fcc',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
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
