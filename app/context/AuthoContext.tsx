'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
  register: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<Array<{id: string, name: string, email: string, password: string, role: string, avatarUrl?: string}>>([]);
  const router = useRouter();

  React.useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const register = async (username: string, email: string, password: string) => {
    const exists = users.some(u => u.email === email);
    if (exists) throw new Error('User already exists');
    const newUser = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      name: username,
      email,
      password,
      role: 'supervisor',
      avatarUrl: undefined
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setIsAuthenticated(true);
    const authUser = { id: newUser.id, name: newUser.name, role: newUser.role, avatarUrl: newUser.avatarUrl };
    setUser(authUser);
    localStorage.setItem('auth_user', JSON.stringify(authUser));
    router.push('/dashboard');
  };

  const login = async (email: string, password: string) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('auth_user');
      throw new Error('Invalid credentials');
    }
    setIsAuthenticated(true);
    const authUser = { id: found.id, name: found.name, role: found.role, avatarUrl: found.avatarUrl };
    setUser(authUser);
    localStorage.setItem('auth_user', JSON.stringify(authUser));
    router.push('/dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('auth_user');
    router.push('/auth/login');
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);