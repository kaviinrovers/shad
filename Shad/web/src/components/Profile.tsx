import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

interface ProfileProps {
  onBack?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onBack }) => {
  const { userProfile, updateProfile } = useAuth();
  const [nickname, setNickname] = useState(userProfile?.nickname || '');
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(displayName, nickname);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Your Profile</h2>
          <button onClick={onBack} className="back-btn">←</button>
        </div>

        {success && <div className="success-message">Profile updated successfully!</div>}

        <div className="profile-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={userProfile?.email || ''} disabled />
          </div>

          <div className="form-group">
            <label>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label>Nickname for Partner</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., My Love, Sweetheart, etc."
            />
          </div>

          <button onClick={handleSave} disabled={loading} className="save-btn">
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
