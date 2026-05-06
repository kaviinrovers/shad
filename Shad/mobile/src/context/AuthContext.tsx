import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthApi from '../services/AuthApi';
import ApiClient from '../services/ApiClient';
import ChatService from '../services/ChatService';

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
  createdAt: string;
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

  // Load user from storage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('shadhee_auth_token');
        const savedUser = await AsyncStorage.getItem('shadhee_user');

        if (savedToken && savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          
          // Connect chat
          ChatService.connect(userData.uid);
          
          // Fetch fresh profile from API
          const response = await AuthApi.getProfile();
          if (response.success && response.data) {
            setUserProfile(response.data);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signup = async (email: string, password: string, displayName: string) => {
    const response = await AuthApi.signup(email, password, displayName);
    
    if (response.success && response.data) {
      const { token, userId } = response.data;
      
      const newUser = { uid: userId, email };
      setUser(newUser);
      
      // Save session
      await AsyncStorage.setItem('shadhee_auth_token', token);
      await AsyncStorage.setItem('shadhee_user', JSON.stringify(newUser));
      
      // Connect chat
      ChatService.connect(userId);
      
      // Fetch profile
      const profileResp = await AuthApi.getProfile();
      if (profileResp.success && profileResp.data) {
        setUserProfile(profileResp.data);
      }
    } else {
      throw new Error(response.error || 'Signup failed');
    }
  };

  const login = async (email: string, password: string) => {
    const response = await AuthApi.login(email, password);
    
    if (response.success && response.data) {
      const { token, userId } = response.data;
      
      const newUser = { uid: userId, email };
      setUser(newUser);
      
      // Save session
      await AsyncStorage.setItem('shadhee_auth_token', token);
      await AsyncStorage.setItem('shadhee_user', JSON.stringify(newUser));
      
      // Connect chat
      ChatService.connect(userId);
      
      // Fetch profile
      const profileResp = await AuthApi.getProfile();
      if (profileResp.success && profileResp.data) {
        setUserProfile(profileResp.data);
      }
    } else {
      throw new Error(response.error || 'Login failed');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('shadhee_auth_token');
    await AsyncStorage.removeItem('shadhee_user');
    ChatService.disconnect();
    setUser(null);
    setUserProfile(null);
  };

  const updateProfile = async (displayName: string, nickname: string) => {
    const response = await AuthApi.updateProfile(displayName, nickname);
    if (response.success && response.data) {
      setUserProfile(response.data);
    } else {
      throw new Error(response.error || 'Update failed');
    }
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
