import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import apiService from '../api/apiService';
import axios from 'axios';

// Define User interface
interface User {
  id: number;
  type: 'admin' | 'client';
}

// Define AuthContextType interface
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

// Create the context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isAuthenticated = !!token && !!user;
  
  // Function to decode token and set user
  const decodeTokenAndSetUser = (token: string): User | null => {
    try {
      const decoded: { adminId?: number; clientId?: number } = jwtDecode(token);
      
      if (decoded.adminId) {
        return { id: decoded.adminId, type: 'admin' };
      } else if (decoded.clientId) {
        return { id: decoded.clientId, type: 'client' };
      } else {
        console.error('Invalid token payload: missing adminId or clientId');
        return null;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Logout function - defined first to avoid circular dependencies
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    
    // Determine where to redirect based on current path
    const currentPath = location.pathname;
    if (currentPath.startsWith('/admin')) {
      navigate('/admin/login');
    } else {
      navigate('/client/login');
    }
  }, [location, navigate]);

  // Handle smart project display logic for clients
  const handleClientProjects = useCallback(async () => {
    try {
      const response = await apiService.get('/client/projects');
      const projects = response.data.data; // Backend returns data in response.data.data
      
      if (!projects || projects.length === 0) {
        navigate('/client/no-projects');
      } else if (projects.length === 1) {
        navigate(`/client/projects/${projects[0].id}`);
      } else {
        navigate('/client/dashboard');
      }
    } catch (error) {
      console.error('Error fetching client projects:', error);
      navigate('/client/login');
    }
  }, [navigate]);

  // Login function - memoized to prevent recreation on each render
  const login = useCallback(async (newToken: string) => {
    try {
      // Save token to localStorage
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Decode the token and create user object
      const newUser = decodeTokenAndSetUser(newToken);
      if (!newUser) {
        logout();
        return;
      }
      
      setUser(newUser);
      
      // Implement smart redirection based on user type
      if (newUser.type === 'admin') {
        navigate('/admin/dashboard');
      } else if (newUser.type === 'client') {
        await handleClientProjects();
      }
    } catch (error) {
      console.error('Error during login:', error);
      logout();
    }
  }, [navigate, handleClientProjects, logout]);
  
  // Set up response interceptor for handling expired tokens
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    
    return () => {
      // Remove the interceptor when the component unmounts
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  // Initialize user from token in localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        if (token) {
          const decodedUser = decodeTokenAndSetUser(token);
          if (decodedUser) {
            setUser(decodedUser);
          } else {
            // Invalid token, clear it
            logout();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [token, logout]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout
  }), [user, token, isAuthenticated, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
