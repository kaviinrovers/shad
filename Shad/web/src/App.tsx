import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import { ConnectPartner } from './components/ConnectPartner';
import './App.css';

type AppView = 'login' | 'dashboard' | 'chat' | 'profile';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [view, setView] = useState<AppView>('dashboard');
  const [partnerId, setPartnerId] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading Shad...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleLogout = async () => {
    await logout();
    setView('login');
    window.location.reload();
  };

  const handleStartChat = () => {
    if (!partnerId || !partnerEmail) {
      alert('Please connect with your partner first');
      return;
    }
    setView('chat');
  };

  return (
    <>
      {view === 'dashboard' && (
        <>
          <Dashboard
            onStartChat={handleStartChat}
            onViewProfile={() => setView('profile')}
            onLogout={handleLogout}
            onConnectPartner={() => setShowConnectModal(true)}
            partnerId={partnerId}
            partnerEmail={partnerEmail}
          />
          {showConnectModal && (
            <ConnectPartner
              onConnected={(pId, pEmail) => {
                setPartnerId(pId);
                setPartnerEmail(pEmail);
                setShowConnectModal(false);
                alert('Partner connected! You can now start chatting.');
              }}
              onCancel={() => setShowConnectModal(false)}
            />
          )}
        </>
      )}

      {view === 'chat' && partnerId && partnerEmail && (
        <div className="chat-wrapper">
          <button className="back-to-dashboard" onClick={() => setView('dashboard')}>
            ← Dashboard
          </button>
          <Chat partnerEmail={partnerEmail} partnerId={partnerId} />
        </div>
      )}

      {view === 'profile' && (
        <Profile onBack={() => setView('dashboard')} />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
