'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { getDiscoverFeed, createLike, type Profile, type ApiError } from '../../lib/api';

export default function DiscoverPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchModal, setMatchModal] = useState<{ show: boolean; matchId?: string }>({ show: false });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfiles();
    }
  }, [isAuthenticated]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDiscoverFeed(10);
      setProfiles(response.profiles);
      setCurrentIndex(0);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error?.message || 'Failed to load profiles');
      console.error('Error loading profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    try {
      const response = await createLike(currentProfile.userId);
      
      if (response.matched && response.matchId) {
        // It's a match! Show modal
        setMatchModal({ show: true, matchId: response.matchId });
      } else {
        // Just a like, move to next profile
        nextProfile();
      }
    } catch (err) {
      const apiError = err as ApiError;
      console.error('Error creating like:', apiError.error?.message);
      // Still advance to next profile
      nextProfile();
    }
  };

  const handlePass = () => {
    nextProfile();
  };

  const nextProfile = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more profiles, could load more here
      setProfiles([]);
    }
  };

  const closeMatchModal = () => {
    setMatchModal({ show: false });
    nextProfile();
  };

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

  const currentProfile = profiles[currentIndex];

  return (
    <div className="mobile-container discover-page">
      {/* Header */}
      <header className="discover-header">
        <Link href="/home" className="back-button">
          ← Home
        </Link>
        <h1>Discover</h1>
        <Link href="/settings" className="settings-button">
          ⚙️
        </Link>
      </header>

      {/* Main Discover Area */}
      <main className="discover-content">
        {loading ? (
          <div className="discover-placeholder">
            <div className="placeholder-icon">⏳</div>
            <h2>Loading profiles...</h2>
          </div>
        ) : error ? (
          <div className="discover-placeholder">
            <div className="placeholder-icon">⚠️</div>
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={loadProfiles} style={{ marginTop: '20px', padding: '10px 20px' }}>
              Try Again
            </button>
          </div>
        ) : !currentProfile ? (
          <div className="discover-placeholder">
            <div className="placeholder-icon">🎉</div>
            <h2>No More Profiles</h2>
            <p>You've seen all available profiles for now.</p>
            <p>Check back later for new matches!</p>
            <button onClick={loadProfiles} style={{ marginTop: '20px', padding: '10px 20px' }}>
              Refresh
            </button>
          </div>
        ) : (
          <div className="profile-card">
            {/* Profile Photo */}
            <div className="profile-photo">
              {currentProfile.photos && currentProfile.photos.length > 0 ? (
                <>
                  <img 
                    src={currentProfile.photos[0]} 
                    alt={currentProfile.displayName}
                  />
                  <div className="profile-gradient"></div>
                  <div className="profile-counter">
                    {currentIndex + 1} / {profiles.length}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #000000 0%, #434343 100%)',
                    fontSize: '80px'
                  }}>
                    👤
                  </div>
                  <div className="profile-counter">
                    {currentIndex + 1} / {profiles.length}
                  </div>
                </>
              )}
            </div>

            {/* Profile Info */}
            <div className="profile-info">
              <h2>{currentProfile.displayName}</h2>
              {currentProfile.faculty && currentProfile.year && (
                <p className="profile-meta">
                  {currentProfile.faculty} • Class of {currentProfile.year}
                </p>
              )}
              {currentProfile.pronouns && (
                <p className="profile-meta">{currentProfile.pronouns}</p>
              )}
              {currentProfile.intent && (
                <p className="profile-intent">
                  Looking for: {currentProfile.intent}
                </p>
              )}
              {currentProfile.bio && (
                <p className="profile-bio">{currentProfile.bio}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="profile-actions">
              <button 
                className="action-button pass-button"
                onClick={handlePass}
                aria-label="Pass"
              >
                ✕
              </button>
              <button 
                className="action-button like-button"
                onClick={handleLike}
                aria-label="Like"
              >
                ♥
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Match Modal */}
      {matchModal.show && (
        <div className="match-modal-overlay" onClick={closeMatchModal}>
          <div className="match-modal" onClick={(e) => e.stopPropagation()}>
            <div className="match-modal-content">
              <div className="match-icon">🎉</div>
              <h2>It's a Match!</h2>
              <p>You and {profiles[currentIndex]?.displayName} liked each other!</p>
              <div className="match-actions">
                <Link 
                  href={`/chat/${matchModal.matchId}`}
                  className="match-button primary"
                >
                  Send Message
                </Link>
                <button 
                  onClick={closeMatchModal}
                  className="match-button secondary"
                >
                  Keep Swiping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <Link href="/home" className="nav-item">
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </Link>
        <Link href="/discover" className="nav-item active">
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

      <style jsx>{`
        .discover-content {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }

        .profile-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          margin: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 0.5px solid #e5e5e7;
          transition: all 0.2s ease;
        }

        .profile-photo {
          width: 100%;
          height: 460px;
          background: #f0f0f0;
          position: relative;
          overflow: hidden;
        }

        .profile-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-gradient {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 120px;
          background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
          pointer-events: none;
        }

        .profile-info {
          padding: 24px;
        }

        .profile-info h2 {
          margin: 0 0 6px 0;
          font-size: 26px;
          font-weight: 700;
          color: #000000;
          letter-spacing: -0.5px;
        }

        .profile-meta {
          margin: 4px 0;
          color: #8e8e93;
          font-size: 15px;
          font-weight: 500;
        }

        .profile-intent {
          margin: 12px 0 8px;
          padding: 8px 14px;
          background: #f2f2f7;
          border-radius: 12px;
          color: #000000;
          font-size: 14px;
          font-weight: 600;
          display: inline-block;
        }

        .profile-bio {
          margin: 16px 0 0;
          color: #2c2c2e;
          font-size: 16px;
          line-height: 1.5;
        }

        .profile-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          padding: 20px 24px 24px;
          background: white;
        }

        .action-button {
          width: 64px;
          height: 64px;
          border-radius: 32px;
          border: 2px solid #e5e5e7;
          font-size: 28px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
        }

        .action-button:active {
          transform: scale(0.9);
        }

        .pass-button {
          color: #ff3b30;
          border-color: #ff3b30;
        }

        .like-button {
          color: #34c759;
          border-color: #34c759;
          font-size: 32px;
        }

        .profile-counter {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 600;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .discover-placeholder {
          text-align: center;
          padding: 60px 20px;
        }

        .placeholder-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .match-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .match-modal {
          background: white;
          border-radius: 24px;
          padding: 40px 32px;
          max-width: 360px;
          width: 90%;
          text-align: center;
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideUp {
          from {
            transform: translateY(100px) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        .match-icon {
          font-size: 72px;
          margin-bottom: 16px;
        }

        .match-modal h2 {
          font-size: 28px;
          color: #000000;
          margin-bottom: 12px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .match-modal p {
          font-size: 16px;
          color: #8e8e93;
          margin-bottom: 28px;
          line-height: 1.4;
        }

        .match-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .match-button {
          padding: 16px 24px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: block;
        }

        .match-button.primary {
          background: #000000;
          color: white;
        }

        .match-button.primary:active {
          transform: scale(0.98);
          background: #2c2c2e;
        }

        .match-button.secondary {
          background: #f2f2f7;
          color: #000000;
        }

        .match-button.secondary:active {
          background: #e5e5ea;
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}
