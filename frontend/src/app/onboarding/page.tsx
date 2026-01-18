'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile, type ApiError } from '../../lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [faculty, setFaculty] = useState('');
  const [year, setYear] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [intent, setIntent] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 6) {
      alert('You can upload maximum 6 photos');
      return;
    }

    setPhotos([...photos, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreview(photoPreview.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!displayName.trim()) {
      setError('Please enter your display name');
      return;
    }
    
    if (!bio.trim()) {
      setError('Please write a short bio');
      return;
    }

    // Note: Photo upload will be implemented later
    // For now, we'll create profiles without photos
    
    setIsSubmitting(true);

    try {
      // Create/update profile in database
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        faculty: faculty || undefined,
        year: year ? parseInt(year) : undefined,
        pronouns: pronouns || undefined,
        intent: intent as 'dating' | 'friendship' | 'networking' | 'casual' || undefined,
        photos: [], // Will add photo upload later
        preferences: {
          ageMin: 18,
          ageMax: 30,
          genderPreference: [],
          maxDistance: undefined,
        },
      });

      // Profile created successfully! Redirect to discover page
      router.push('/discover');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error?.message || 'Failed to create profile. Please try again.');
      console.error('Profile creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="mobile-container onboarding-page">
      {/* Header */}
      <header className="page-header">
        <div style={{ width: '40px' }}></div>
        <h1>Create Profile</h1>
        <div style={{ width: '40px' }}></div>
      </header>

      {/* Form Content */}
      <main className="onboarding-content">
        {error && (
          <div style={{
            background: '#fee',
            color: '#c00',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Photos Section */}
          <section className="form-section">
            <h2 className="form-section-title">📸 Your Photos</h2>
            <p className="form-section-subtitle">Add up to 6 photos. First photo will be your main profile picture.</p>
            
            <div className="photo-grid">
              {photoPreview.map((preview, index) => (
                <div key={index} className="photo-item">
                  <img src={preview} alt={`Upload ${index + 1}`} />
                  <button 
                    type="button"
                    className="photo-remove"
                    onClick={() => removePhoto(index)}
                  >
                    ×
                  </button>
                  {index === 0 && <span className="main-badge">Main</span>}
                </div>
              ))}
              
              {photos.length < 6 && (
                <label className="photo-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-icon">+</div>
                  <div className="upload-text">Add Photo</div>
                </label>
              )}
            </div>
          </section>

          {/* Display Name */}
          <section className="form-section">
            <h2 className="form-section-title">👤 Display Name</h2>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How should we call you?"
              className="form-input"
              maxLength={50}
              required
            />
            <p className="form-hint">{displayName.length}/50 characters</p>
          </section>

          {/* Bio */}
          <section className="form-section">
            <h2 className="form-section-title">✍️ About You</h2>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio that tells others about yourself..."
              className="form-textarea"
              maxLength={500}
              rows={5}
              required
            />
            <p className="form-hint">{bio.length}/500 characters</p>
          </section>

          {/* McGill Info */}
          <section className="form-section">
            <h2 className="form-section-title">🎓 McGill Info</h2>
            
            <div className="form-group">
              <label className="form-label">Faculty</label>
              <select 
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="form-select"
              >
                <option value="">Select your faculty</option>
                <option value="Arts">Arts</option>
                <option value="Science">Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Management">Management (Desautels)</option>
                <option value="Medicine">Medicine</option>
                <option value="Law">Law</option>
                <option value="Education">Education</option>
                <option value="Music">Music (Schulich)</option>
                <option value="Agricultural">Agricultural & Environmental Sciences</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Year</label>
              <select 
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="form-select"
              >
                <option value="">Select your year</option>
                <option value="U0">U0</option>
                <option value="U1">U1</option>
                <option value="U2">U2</option>
                <option value="U3">U3</option>
                <option value="U4+">U4+</option>
                <option value="Graduate">Graduate Student</option>
                <option value="PhD">PhD Student</option>
              </select>
            </div>
          </section>

          {/* Personal Info */}
          <section className="form-section">
            <h2 className="form-section-title">💫 Personal Info</h2>
            
            <div className="form-group">
              <label className="form-label">Pronouns</label>
              <select 
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
                className="form-select"
              >
                <option value="">Select pronouns (optional)</option>
                <option value="he/him">he/him</option>
                <option value="she/her">she/her</option>
                <option value="they/them">they/them</option>
                <option value="other">other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Looking For</label>
              <select 
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                className="form-select"
              >
                <option value="">What are you looking for?</option>
                <option value="dating">Dating / Relationship</option>
                <option value="friendship">Friendship</option>
                <option value="networking">Networking</option>
                <option value="casual">Casual</option>
              </select>
            </div>
          </section>

          {/* Submit Button */}
          <div className="form-actions">
            <button 
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
              style={{
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Creating Profile...' : 'Create Profile & Start Discovering'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
