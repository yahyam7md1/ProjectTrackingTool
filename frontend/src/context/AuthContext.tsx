import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const isAuthenticated = !!token;
  
  // Initialize token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // No need to manually update API headers - our apiService handles this dynamically
    }
  }, []);

  const login = (newToken: string) => {
    // Simply update state and localStorage - the API service will use the latest token automatically
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    // Simply remove from localStorage and update state - the API service will handle the rest
    localStorage.removeItem('token');
    setToken(null);
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
