import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './ConnectPartner.css';

interface ConnectPartnerProps {
  onConnected?: (partnerId: string, partnerEmail: string) => void;
  onCancel?: () => void;
}

export const ConnectPartner: React.FC<ConnectPartnerProps> = ({
  onConnected,
  onCancel,
}) => {
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();

  const handleConnect = async () => {
    setError('');

    if (!partnerEmail.trim()) {
      setError('Please enter your partner\'s email');
      return;
    }

    if (!partnerId.trim()) {
      setError('Please enter your partner\'s user ID');
      return;
    }

    if (partnerEmail === userProfile?.email) {
      setError('You cannot connect with yourself');
      return;
    }

    setLoading(true);
    try {
      // In a real app, verify the partner exists in database
      // For now, we'll just accept it
      onConnected?.(partnerId, partnerEmail);
    } catch (err: any) {
      setError(err.message || 'Failed to connect with partner');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleConnect();
    }
  };

  return (
    <div className="connect-partner-modal">
      <div className="connect-partner-card">
        <div className="connect-header">
          <h2>Connect with Your Partner 💕</h2>
          <button onClick={onCancel} className="close-btn">×</button>
        </div>

        <p className="connect-subtitle">
          Enter your partner's information to start chatting on Shadhee
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="connect-form">
          <div className="form-group">
            <label>Partner's Email</label>
            <input
              type="email"
              placeholder="partner@email.com"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Partner's User ID</label>
            <input
              type="text"
              placeholder="Your partner's unique ID"
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <small>Ask your partner for their User ID from their profile</small>
          </div>

          <div className="form-actions">
            <button
              onClick={handleConnect}
              disabled={loading || !partnerEmail || !partnerId}
              className="connect-btn"
            >
              {loading ? 'Connecting...' : 'Connect'}
            </button>
            <button onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>

        <div className="connect-info">
          <h4>How to find your partner's ID:</h4>
          <ol>
            <li>Ask your partner to go to 👤 Profile</li>
            <li>Look for "User ID" section</li>
            <li>Share that ID with you</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ConnectPartner;
