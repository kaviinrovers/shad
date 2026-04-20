import React, { createContext, useContext, useEffect, useState } from 'react';

// Mock authentication using localStorage
// In production, replace with real Firebase authentication

type User = {
  uid: string;
  email: string;
};

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  nickname?: string;
  partner?: string;
  avatar?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (displayName: string, nickname: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('shadhee_user');
        const savedProfile = localStorage.getItem('shadhee_profile');

        if (savedUser && savedProfile) {
          const userData = JSON.parse(savedUser);
          const profileData = JSON.parse(savedProfile);
          setUser(userData);
          setUserProfile(profileData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Clear corrupted data
        localStorage.removeItem('shadhee_user');
        localStorage.removeItem('shadhee_profile');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const signup = async (email: string, password: string, displayName: string) => {
    // Mock signup - just create a user in localStorage
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newUser: User = {
      uid: userId,
      email: email,
    };

    const newProfile: UserProfile = {
      uid: userId,
      email: email,
      displayName: displayName,
      nickname: displayName,
      createdAt: new Date(),
    };

    // Save to localStorage
    localStorage.setItem('shadhee_user', JSON.stringify(newUser));
    localStorage.setItem('shadhee_profile', JSON.stringify(newProfile));

    setUser(newUser);
    setUserProfile(newProfile);
  };

  const login = async (email: string, password: string) => {
    // Mock login - check if user exists in localStorage
    const savedProfile = localStorage.getItem('shadhee_profile');

    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      if (profileData.email === email) {
        const userData: User = {
          uid: profileData.uid,
          email: profileData.email,
        };
        setUser(userData);
        setUserProfile(profileData);
        return;
      }
    }

    // If user doesn't exist, create them (for demo purposes)
    await signup(email, password, email.split('@')[0]);
  };

  const logout = async () => {
    localStorage.removeItem('shadhee_user');
    localStorage.removeItem('shadhee_profile');
    setUser(null);
    setUserProfile(null);
  };

  const updateProfile = async (displayName: string, nickname: string) => {
    if (!userProfile) return;

    const updatedProfile = {
      ...userProfile,
      displayName,
      nickname,
    };

    localStorage.setItem('shadhee_profile', JSON.stringify(updatedProfile));
    setUserProfile(updatedProfile);
  };

  const value = {
    user,
    userProfile,
    loading,
    signup,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
