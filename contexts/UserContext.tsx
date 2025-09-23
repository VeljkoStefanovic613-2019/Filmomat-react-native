import { getCurrentUser, loginUser, logoutUser, registerUser } from "@/services/appwrite";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  $id: string;
  email: string;
  name: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkCurrentUser = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser as User | null);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await loginUser(email, password);
      await checkCurrentUser();
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      await registerUser(email, password, name);
      await login(email, password); // Auto-login after registration
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await logoutUser();
      setUser(null);
    } catch (error: any) {
      console.error("Logout error:", error);
      throw new Error(error.message || "Failed to logout");
    } finally {
      setIsLoading(false);
    }
  };

  const refetchUser = async () => {
    await checkCurrentUser();
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout,
      refetchUser 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};