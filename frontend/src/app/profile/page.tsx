'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { getMe, updateProfile, type ApiError, type Profile } from '../../lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form fields (local state mirrors profile for editing)
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [faculty, setFaculty] = useState('');
  const [year, setYear] = useState<number | undefined>(undefined);
  const [pronouns, setPronouns] = useState('');
  const [intent, setIntent] = useState<'dating' | 'friendship' | 'networking' | 'casual' | ''>('');
  const [ageMin, setAgeMin] = useState<number | undefined>(18);
  const [ageMax, setAgeMax] = useState<number | undefined>(30);
  const [genderPreference, setGenderPreference] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load profile on mount
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    loadProfile();
  }, [isAuthenticated, user]);

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true);
      setError(null);
      const data = await getMe();
      
      if (data.profile) {
        // Profile exists, populate fields
        setProfile(data.profile);
        setSavedSnapshot(data.profile);
        populateFormFields(data.profile);
      } else {
        // No profile yet, initialize with defaults
        const emptyProfile: Profile = {
          userId: user!.id,
          displayName: '',
          bio: '',
          photos: [],
          preferences: {}
        };
        setProfile(emptyProfile);
        setSavedSnapshot(emptyProfile);
        populateFormFields(emptyProfile);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error?.message || 'Failed to load profile');
      console.error('Profile load error:', err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const populateFormFields = (prof: Profile) => {
    setDisplayName(prof.displayName || '');
    setBio(prof.bio || '');
    setPhotos(prof.photos || []);
    setFaculty(prof.faculty || '');
    setYear(prof.year);
    setPronouns(prof.pronouns || '');
    setIntent(prof.intent || '');
    setAgeMin(prof.preferences?.ageMin ?? 18);
    setAgeMax(prof.preferences?.ageMax ?? 30);
    setGenderPreference(prof.preferences?.genderPreference || []);
    setMaxDistance(prof.preferences?.maxDistance);
    setIsDirty(false);
  };

  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!displayName.trim()) {
      setError('Please enter your display name');
      return;
    }
    if (!bio.trim()) {
      setError('Please write a short bio');
      return;
    }
    if (ageMin !== undefined && ageMax !== undefined && ageMin > ageMax) {
      setError('Minimum age cannot be greater than maximum age');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        photos,
        faculty: faculty || undefined,
        year: year,
        pronouns: pronouns || undefined,
        gender: undefined,
        intent: intent || undefined,
        preferences: {
          ageMin,
          ageMax,
          genderPreference,
          maxDistance,
        },
      };

      const response = await updateProfile(payload);
      
      // Update saved snapshot and profile
      setProfile(response.profile);
      setSavedSnapshot(response.profile);
      setIsDirty(false);
      setSuccessMessage('Profile saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error?.message || 'Failed to save profile');
      console.error('Profile save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    if (savedSnapshot) {
      populateFormFields(savedSnapshot);
    }
    setIsDirty(false);
    setError(null);
    setSuccessMessage(null);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Calculate dimensions (max 900px)
          let width = img.width;
          let height = img.height;
          const maxDim = 900;
          
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = (height / width) * maxDim;
              width = maxDim;
            } else {
              width = (width / height) * maxDim;
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 6) {
      alert('You can upload maximum 6 photos');
      return;
    }

    try {
      // Compress all images
      const compressed = await Promise.all(files.map(compressImage));
      const newPhotos = [...photos, ...compressed];
      setPhotos(newPhotos);
      setIsDirty(true);
    } catch (err) {
      console.error('Error compressing images:', err);
      alert('Failed to process images. Please try again.');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const handleFieldChange = (setter: (val: any) => void, value: any) => {
    setter(value);
    setIsDirty(true);
  };

  const toggleGenderPreference = (gender: string) => {
    const newPrefs = genderPreference.includes(gender)
      ? genderPreference.filter(g => g !== gender)
      : [...genderPreference, gender];
    setGenderPreference(newPrefs);
    setIsDirty(true);
  };

  const getYearLabel = (yearNum: number | undefined): string => {
    if (yearNum === undefined) return '';
    const labels: { [key: number]: string } = {
      0: 'U0',
      1: 'U1',
      2: 'U2',
      3: 'U3',
      4: 'U4+',
      5: 'Graduate',
      6: 'PhD'
    };
    return labels[yearNum] || '';
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

  if (isLoadingProfile) {
    return (
      <div className="mobile-container placeholder-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="mobile-container profile-page">
      {/* Header */}
      <header className="page-header">
        <div style={{ width: '40px' }}></div>
        <h1>Profile</h1>
        <Link href="/settings" className="settings-button">
          ⚙️
        </Link>
      </header>

      {/* Profile Content */}
      <main className="profile-content">
        {/* Error/Success Messages */}
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="success-banner">
            {successMessage}
          </div>
        )}

        {/* Profile Preview */}
        <div className="profile-preview-section">
          {photos.length > 0 ? (
            <div className="avatar-large avatar-img">
              <img src={photos[0]} alt="Profile" />
            </div>
          ) : (
            <div className="avatar-large">
              {(displayName || user.email).charAt(0).toUpperCase()}
            </div>
          )}
          <h2 style={{ marginTop: '16px' }}>
            {displayName || user.email.split('@')[0]}
          </h2>
          <p style={{ color: '#666', fontSize: '14px' }}>{user.email}</p>
          {user.mcgillVerified && (
            <span style={{ 
              display: 'inline-block',
              marginTop: '8px',
              padding: '4px 12px',
              background: '#e6f7e6',
              color: '#2d862d',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              ✓ Verified McGill Student
            </span>
          )}
        </div>

        {/* Photos Section */}
        <section className="form-section">
          <h2 className="form-section-title">📸 Photos</h2>
          <p className="form-section-subtitle">
            Add up to 6 photos. First photo will be your main profile picture.
          </p>
          
          <div className="photo-grid">
            {photos.map((photo, index) => (
              <div key={index} className="photo-item">
                <img src={photo} alt={`Photo ${index + 1}`} />
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

        {/* Bio & Display Name Section */}
        <section className="form-section">
          <h2 className="form-section-title">✍️ Bio & Display Name</h2>
          
          <div className="form-group">
            <label className="form-label">Display Name *</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => handleFieldChange(setDisplayName, e.target.value)}
              placeholder="How should we call you?"
              className="form-input"
              maxLength={50}
            />
            <p className="form-hint">{displayName.length}/50 characters</p>
          </div>

          <div className="form-group">
            <label className="form-label">Bio *</label>
            <textarea
              value={bio}
              onChange={(e) => handleFieldChange(setBio, e.target.value)}
              placeholder="Write a short bio that tells others about yourself..."
              className="form-textarea"
              maxLength={500}
              rows={5}
            />
            <p className="form-hint">{bio.length}/500 characters</p>
          </div>
        </section>

        {/* McGill Info Section */}
        <section className="form-section">
          <h2 className="form-section-title">🎓 McGill Info</h2>
          
          <div className="form-group">
            <label className="form-label">Faculty</label>
            <select 
              value={faculty}
              onChange={(e) => handleFieldChange(setFaculty, e.target.value)}
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
              value={year ?? ''}
              onChange={(e) => handleFieldChange(setYear, e.target.value ? parseInt(e.target.value) : undefined)}
              className="form-select"
            >
              <option value="">Select your year</option>
              <option value="0">U0</option>
              <option value="1">U1</option>
              <option value="2">U2</option>
              <option value="3">U3</option>
              <option value="4">U4+</option>
              <option value="5">Graduate Student</option>
              <option value="6">PhD Student</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Pronouns</label>
            <select 
              value={pronouns}
              onChange={(e) => handleFieldChange(setPronouns, e.target.value)}
              className="form-select"
            >
              <option value="">Select pronouns (optional)</option>
              <option value="he/him">he/him</option>
              <option value="she/her">she/her</option>
              <option value="they/them">they/them</option>
              <option value="other">other</option>
            </select>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="form-section">
          <h2 className="form-section-title">⚙️ Preferences</h2>
          
          <div className="form-group">
            <label className="form-label">Looking For</label>
            <select 
              value={intent}
              onChange={(e) => handleFieldChange(setIntent, e.target.value)}
              className="form-select"
            >
              <option value="">What are you looking for?</option>
              <option value="dating">Dating / Relationship</option>
              <option value="friendship">Friendship</option>
              <option value="networking">Networking</option>
              <option value="casual">Casual</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Age Range</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="number"
                value={ageMin ?? ''}
                onChange={(e) => handleFieldChange(setAgeMin, e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Min"
                className="form-input"
                min="18"
                max="99"
                style={{ width: '80px' }}
              />
              <span>to</span>
              <input
                type="number"
                value={ageMax ?? ''}
                onChange={(e) => handleFieldChange(setAgeMax, e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Max"
                className="form-input"
                min="18"
                max="99"
                style={{ width: '80px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Gender Preference</label>
            <div className="checkbox-group">
              {['Men', 'Women', 'Non-binary', 'Other'].map((gender) => (
                <label key={gender} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={genderPreference.includes(gender)}
                    onChange={() => toggleGenderPreference(gender)}
                  />
                  <span>{gender}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Maximum Distance (km)</label>
            <input
              type="number"
              value={maxDistance ?? ''}
              onChange={(e) => handleFieldChange(setMaxDistance, e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Any distance"
              className="form-input"
              min="1"
              max="500"
            />
          </div>
        </section>
      </main>

      {/* Save Bar (appears when dirty) */}
      {isDirty && (
        <div className="save-bar">
          <button 
            className="discard-button"
            onClick={discardChanges}
            disabled={isSaving}
          >
            Discard
          </button>
          <button 
            className="save-button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <Link href="/discover" className="nav-item">
          <span className="nav-icon">🔍</span>
          <span className="nav-label">Discover</span>
        </Link>
        <Link href="/matches" className="nav-item">
          <span className="nav-icon">💕</span>
          <span className="nav-label">Matches</span>
        </Link>
        <Link href="/profile" className="nav-item active">
          <span className="nav-icon">👤</span>
          <span className="nav-label">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
