import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

interface DashboardProps {
  onStartChat?: () => void;
  onViewProfile?: () => void;
  onLogout?: () => void;
  partnerId?: string;
  partnerEmail?: string;
  onConnectPartner?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartChat,
  onViewProfile,
  onLogout,
  partnerId,
  partnerEmail,
  onConnectPartner,
}) => {
  const { userProfile } = useAuth();
  const [selectedTab, setSelectedTab] = useState('home');
  const [showUserId, setShowUserId] = useState(false);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <img src="/logo.svg" alt="Shadhee Logo" className="header-logo" />
          <h1>Shadhee</h1>
        </div>
        <p className="welcome">Welcome, {userProfile?.nickname || userProfile?.displayName}!</p>
        {partnerId && partnerEmail && (
          <p className="partner-status">💕 Connected with {partnerEmail}</p>
        )}
      </header>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <button
            className={`nav-btn ${selectedTab === 'home' ? 'active' : ''}`}
            onClick={() => setSelectedTab('home')}
          >
            💬 Chat
          </button>
          <button
            className={`nav-btn ${selectedTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setSelectedTab('timeline')}
          >
            ❤️ Love Timeline
          </button>
          <button
            className={`nav-btn ${selectedTab === 'memories' ? 'active' : ''}`}
            onClick={() => setSelectedTab('memories')}
          >
            🎬 Memories
          </button>
          <button
            className={`nav-btn ${selectedTab === 'bonding' ? 'active' : ''}`}
            onClick={() => setSelectedTab('bonding')}
          >
            💕 Bonding
          </button>
        </nav>

        <div className="tab-content">
          {selectedTab === 'home' && (
            <div className="tab-pane">
              <h2>Start Messaging</h2>
              {!partnerId ? (
                <>
                  <p>Connect with your partner to start your private conversation.</p>
                  <button className="primary-btn" onClick={onConnectPartner}>
                    🔗 Connect with Partner
                  </button>
                  <div className="user-id-section">
                    <h4>Share Your ID</h4>
                    <p>Your User ID:</p>
                    <div className="user-id-display">
                      <input
                        type={showUserId ? 'text' : 'password'}
                        value={userProfile?.uid || ''}
                        readOnly
                        className="user-id-input"
                      />
                      <button
                        className="copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(userProfile?.uid || '');
                          alert('User ID copied!');
                        }}
                      >
                        📋 Copy
                      </button>
                      <button
                        className="show-btn"
                        onClick={() => setShowUserId(!showUserId)}
                      >
                        {showUserId ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p>You're connected with {partnerEmail}</p>
                  <button className="primary-btn" onClick={onStartChat}>
                    📱 Open Chat
                  </button>
                </>
              )}
            </div>
          )}

          {selectedTab === 'timeline' && (
            <div className="tab-pane">
              <h2>Love Timeline ❤️</h2>
              <p>Save your special moments and milestones together.</p>
              <div className="timeline-empty">
                <p>No memories yet. Start saving special moments!</p>
                <p className="coming-soon">🚀 Coming Soon</p>
              </div>
            </div>
          )}

          {selectedTab === 'memories' && (
            <div className="tab-pane">
              <h2>Shared Memories 🎬</h2>
              <p>View and organize photos and videos together.</p>
              <div className="memories-grid">
                <p>No memories yet. Share your first moment!</p>
                <p className="coming-soon">🚀 Coming Soon</p>
              </div>
            </div>
          )}

          {selectedTab === 'bonding' && (
            <div className="tab-pane">
              <h2>Daily Bonding Prompts 💕</h2>
              <p>Strengthen your connection with daily questions.</p>
              <div className="bonding-prompt">
                <h3>Today's Question:</h3>
                <p>"What was your favorite moment with your partner this week?"</p>
                <button className="secondary-btn">Answer Question</button>
                <p className="coming-soon">🚀 Coming Soon</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="dashboard-footer">
        <button onClick={onViewProfile} className="footer-btn">
          👤 Profile
        </button>
        <button onClick={onLogout} className="footer-btn logout-btn">
          🚪 Logout
        </button>
      </footer>
    </div>
  );
};

export default Dashboard;
