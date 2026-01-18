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
      const response = await getDiscoverFeed(100);
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
    <div className="page-container">
      <div className="content-rectangle discover-page">
        {/* Header */}
        <header className="discover-header">
          <div style={{ width: '40px' }}></div>
          <h1>Discover</h1>
          <div style={{ width: '40px' }}></div>
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
            {/* Profile Photo Section with Name Overlay */}
            <div className="profile-photo-section">
              {currentProfile.photos && currentProfile.photos.length > 0 ? (
                <img
                  src={currentProfile.photos[0]}
                  alt={currentProfile.displayName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '80px'
                }}>
                  👤
                </div>
              )}
              <div className="profile-name-overlay">
                <h2>{currentProfile.displayName}</h2>
              </div>
            </div>

            {/* Profile Details Section */}
            <div className="profile-details-section">
              <div className="profile-details-top">
                {currentProfile.faculty && currentProfile.year && (
                  <div className="profile-details-row">
                    <span className="profile-details-label">🎓</span>
                    <span className="profile-details-value">{currentProfile.faculty} • Class of {currentProfile.year}</span>
                  </div>
                )}

                {currentProfile.pronouns && (
                  <div className="profile-details-row">
                    <span className="profile-details-label">🏳️‍🌈</span>
                    <span className="profile-details-value">{currentProfile.pronouns}</span>
                  </div>
                )}

                {currentProfile.intent && (
                  <div className="profile-details-row">
                    <span className="profile-details-label">💕</span>
                    <span className="profile-details-value">Looking for {currentProfile.intent}</span>
                  </div>
                )}
              </div>

              <div className="profile-details-divider"></div>

              <div className="profile-bio-section">
                <div className="profile-bio-label">About me</div>
                {currentProfile.bio ? (
                  <div className="profile-bio-text">{currentProfile.bio}</div>
                ) : (
                  <div className="profile-bio-text" style={{ color: '#999', fontStyle: 'italic' }}>
                    No bio yet...
                  </div>
                )}
              </div>
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
      </div>

      <style jsx>{`
        .page-container {
          min-height: 100vh;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .content-rectangle {
          width: 100%;
          max-width: 480px;
          min-height: 90vh;
          background: white;
          border-radius: 28px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .discover-page {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .discover-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          overflow: hidden;
        }

        .discover-header {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 24px;
          background: white;
          border-bottom: 1px solid #f0f0f0;
          position: relative;
          flex-shrink: 0;
        }

        .discover-header h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.3px;
        }

        .profile-card {
          width: 100%;
          max-width: 420px;
          height: 85vh;
          max-height: 780px;
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .profile-photo-section {
          width: 100%;
          height: 60%;
          background: #f0f0f0;
          position: relative;
          display: flex;
          align-items: flex-end;
        }

        .profile-name-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
          padding: 60px 24px 24px 24px;
          color: white;
        }

        .profile-name-overlay h2 {
          margin: 0;
          font-size: 36px;
          font-weight: 800;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
          letter-spacing: -0.5px;
        }

        .profile-details-section {
          padding: 32px 24px;
          flex: 1;
          background: #ffffff;
          border-top: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
        }

        .profile-details-top {
          flex: 0 0 auto;
          margin-bottom: 20px;
        }

        .profile-details-row {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          font-size: 16px;
          color: #333;
        }

        .profile-details-label {
          font-weight: 600;
          margin-right: 12px;
          color: #666;
          min-width: 20px;
        }

        .profile-details-value {
          color: #1a1a1a;
          font-weight: 500;
        }

        .profile-details-divider {
          height: 1px;
          background: #e8e8e8;
          margin: 24px 0 20px 0;
        }

        .profile-bio-section {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .profile-bio-label {
          font-size: 14px;
          font-weight: 600;
          color: #666;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 12px;
        }

        .profile-bio-text {
          color: #333;
          font-size: 16px;
          line-height: 1.6;
          flex: 1;
          overflow-y: auto;
        }

        .profile-actions {
          display: flex;
          justify-content: center;
          gap: 30px;
          padding: 20px;
          background: white;
          border-top: 1px solid #eee;
        }

        .action-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          font-size: 30px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pass-button {
          background: #fee;
          color: #e74c3c;
        }

        .pass-button:hover {
          background: #fdd;
          transform: scale(1.1);
        }

        .like-button {
          background: #efe;
          color: #27ae60;
        }

        .like-button:hover {
          background: #dfd;
          transform: scale(1.1);
        }

        .profile-counter {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .discover-placeholder {
          text-align: center;
          padding: 40px 20px;
        }

        .placeholder-icon {
          font-size: 60px;
          margin-bottom: 20px;
        }

        .match-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .match-modal {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .match-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }

        .match-modal h2 {
          font-size: 32px;
          color: #667eea;
          margin-bottom: 12px;
        }

        .match-modal p {
          font-size: 16px;
          color: #666;
          margin-bottom: 30px;
        }

        .match-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .match-button {
          padding: 14px 24px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: block;
        }

        .match-button.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .match-button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .match-button.secondary {
          background: #f0f0f0;
          color: #333;
        }

        .match-button.secondary:hover {
          background: #e0e0e0;
        }
      `}</style>
    </div>
  );
}
