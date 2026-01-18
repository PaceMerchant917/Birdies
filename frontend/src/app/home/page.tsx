'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { getMe } from '../../lib/api';

export default function HomePage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Check if user has a profile
    const checkProfile = async () => {
      if (isAuthenticated) {
        try {
          const response = await getMe();
          setHasProfile(response.profile !== null);
          
          // Redirect to onboarding if no profile
          if (response.profile === null) {
            router.push('/onboarding');
          }
        } catch (error) {
          console.error('Error checking profile:', error);
        } finally {
          setCheckingProfile(false);
        }
      }
    };

    checkProfile();
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading || !user || checkingProfile) {
    return (
      <div className="mobile-container">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container home-wrapper">
      {/* Top Bar */}
      <header className="home-header">
        <div className="header-content">
          <h1 className="app-logo">💕 McGill Dating</h1>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="home-content">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="profile-preview">
            <div className="avatar-placeholder">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h2>Hey there! 👋</h2>
              <p className="profile-subtitle">Ready to make connections?</p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">💕</div>
            <div className="stat-info">
              <div className="stat-number">0</div>
              <div className="stat-label">Matches</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-info">
              <div className="stat-number">0</div>
              <div className="stat-label">Messages</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👀</div>
            <div className="stat-info">
              <div className="stat-number">0</div>
              <div className="stat-label">Views</div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="actions-section">
          <h3 className="section-title">Quick Actions</h3>
          
          <Link href="/discover" className="action-card primary">
            <div className="action-icon">🔍</div>
            <div className="action-content">
              <h4>Start Discovering</h4>
              <p>Browse profiles and find your match</p>
            </div>
            <div className="action-arrow">→</div>
          </Link>

          <Link href="/onboarding" className="action-card secondary">
            <div className="action-icon">✨</div>
            <div className="action-content">
              <h4>Create Your Profile</h4>
              <p>Add photos, bio, and info about yourself</p>
            </div>
            <div className="action-arrow">→</div>
          </Link>

          <Link href="/matches" className="action-card">
            <div className="action-icon">💕</div>
            <div className="action-content">
              <h4>View Matches</h4>
              <p>See who you've matched with</p>
            </div>
            <div className="action-arrow">→</div>
          </Link>

          <Link href="/settings" className="action-card">
            <div className="action-icon">⚙️</div>
            <div className="action-content">
              <h4>Settings</h4>
              <p>Manage preferences and privacy</p>
            </div>
            <div className="action-arrow">→</div>
          </Link>
        </section>

        {/* Activity Feed Placeholder */}
        <section className="activity-section">
          <h3 className="section-title">Recent Activity</h3>
          <div className="activity-placeholder">
            <div className="placeholder-icon">📭</div>
            <p>No recent activity yet</p>
            <p className="placeholder-subtitle">Start swiping to see updates here!</p>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <Link href="/home" className="nav-item active">
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
        <Link href="/chat/1" className="nav-item">
          <span className="nav-icon">💬</span>
          <span className="nav-label">Chats</span>
        </Link>
        <Link href="/profile" className="nav-item">
          <span className="nav-icon">👤</span>
          <span className="nav-label">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
