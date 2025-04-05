'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { User } from '../types';

// Define types for our context
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getToken: () => string | undefined;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
  getToken: () => undefined,
});

// Auth provider props type
interface AuthProviderProps {
  children: ReactNode;
}

// Cookie configuration
const TOKEN_COOKIE_NAME = process.env.NEXT_PUBLIC_TOKEN_COOKIE_NAME || 'auth_token';
const USER_COOKIE_NAME = process.env.NEXT_PUBLIC_USER_COOKIE_NAME || 'auth_user';
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Initialize auth state from cookies on component mount
  useEffect(() => {
    const token = Cookies.get(TOKEN_COOKIE_NAME);
    const userJson = Cookies.get(USER_COOKIE_NAME);
    
    if (token) {
      setIsAuthenticated(true);
      
      if (userJson) {
        try {
          setUser(JSON.parse(userJson));
        } catch (error) {
          console.error('Error parsing user data from cookie:', error);
        }
      }
    }
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      // Replace this with your actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store token and user data in cookies
      Cookies.set(TOKEN_COOKIE_NAME, data.token, COOKIE_OPTIONS);
      Cookies.set(USER_COOKIE_NAME, JSON.stringify(data.user), COOKIE_OPTIONS);
      
      // Update state
      setIsAuthenticated(true);
      setUser(data.user);
      
      // Redirect to dashboard or home page after login
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Remove cookies
    Cookies.remove(TOKEN_COOKIE_NAME);
    Cookies.remove(USER_COOKIE_NAME);
    
    // Update state
    setIsAuthenticated(false);
    setUser(null);
    
    // Redirect to login page
    router.push('/auth/login');
  };

  // Get token function - make sure to use the constant
  const getToken = (): string | undefined => {
    return Cookies.get(TOKEN_COOKIE_NAME);
  };

  // Provide the context value
  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    getToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);