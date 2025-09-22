import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  $id: string;
  email: string;
  name: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      // For demo purposes, we'll use a simple mock user
      // In a real app, you'd integrate with AppWrite Auth
      const mockUser = {
        $id: '1',
        email: 'user@example.com',
        name: 'Demo User'
      };
      setUser(mockUser);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Mock login - replace with actual AppWrite auth
      const mockUser = {
        $id: '1',
        email: email,
        name: 'Demo User'
      };
      setUser(mockUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      // Mock registration - replace with actual AppWrite auth
      const mockUser = {
        $id: '1',
        email: email,
        name: name
      };
      setUser(mockUser);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};