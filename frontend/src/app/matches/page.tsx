'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { getMatches, type Match, type Profile, type ApiError } from '../../lib/api';

export default function MatchesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [matches, setMatches] = useState<Array<{ match: Match; profile: Profile }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadMatches();
    }
  }, [isAuthenticated]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMatches();
      setMatches(response.matches);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error?.message || 'Failed to load matches');
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
    }
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
        {loading ? (
          <div className="matches-placeholder">
            <div className="placeholder-icon">⏳</div>
            <h2>Loading matches...</h2>
          </div>
        ) : error ? (
          <div className="matches-placeholder">
            <div className="placeholder-icon">⚠️</div>
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={loadMatches} style={{ marginTop: '20px', padding: '10px 20px' }}>
              Try Again
            </button>
          </div>
        ) : matches.length === 0 ? (
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
        ) : (
          <div className="matches-list">
            {matches.map(({ match, profile }) => (
              <Link 
                key={match.id} 
                href={`/chat/${match.id}`}
                className="match-item"
              >
                <div className="match-photo">
                  {profile.photos && profile.photos.length > 0 ? (
                    <img 
                      src={profile.photos[0]} 
                      alt={profile.displayName}
                    />
                  ) : (
                    <div className="match-photo-placeholder">
                      👤
                    </div>
                  )}
                </div>
                <div className="match-info">
                  <h3>{profile.displayName}</h3>
                  {profile.faculty && profile.year && (
                    <p className="match-meta">
                      {profile.faculty} • {profile.year}
                    </p>
                  )}
                </div>
                <div className="match-arrow">→</div>
              </Link>
            ))}
          </div>
        )}
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

      <style jsx>{`
        .matches-content {
          flex: 1;
          overflow-y: auto;
          padding-bottom: 80px;
        }

        .matches-placeholder {
          text-align: center;
          padding: 60px 20px;
        }

        .placeholder-icon {
          font-size: 60px;
          margin-bottom: 20px;
        }

        .matches-list {
          padding: 0;
        }

        .match-item {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
          text-decoration: none;
          color: inherit;
          transition: background-color 0.2s;
        }

        .match-item:hover {
          background-color: #f8f8f8;
        }

        .match-photo {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          margin-right: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .match-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .match-photo-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
        }

        .match-info {
          flex: 1;
        }

        .match-info h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .match-meta {
          margin: 0;
          font-size: 14px;
          color: #666;
        }

        .match-arrow {
          font-size: 20px;
          color: #999;
        }
      `}</style>
    </div>
  );
}
