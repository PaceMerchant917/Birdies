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
    <div className="mobile-container discover-page">
      {/* Header */}
      <header className="discover-header">
        <div style={{ width: '40px' }}></div>
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
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow: hidden;
        }

        .profile-card {
          width: 100%;
          max-width: 400px;
          height: 600px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .profile-photo {
          width: 100%;
          height: 400px;
          background: #f0f0f0;
          position: relative;
        }

        .profile-info {
          padding: 20px;
          flex: 1;
          overflow-y: auto;
        }

        .profile-info h2 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 600;
        }

        .profile-meta {
          margin: 4px 0;
          color: #666;
          font-size: 14px;
        }

        .profile-intent {
          margin: 8px 0;
          color: #667eea;
          font-size: 14px;
          font-weight: 500;
        }

        .profile-bio {
          margin: 12px 0;
          color: #333;
          font-size: 15px;
          line-height: 1.5;
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
