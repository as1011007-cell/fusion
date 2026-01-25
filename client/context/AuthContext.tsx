import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl } from "@/lib/query-client";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; resetCode?: string; error?: string }>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("authUser");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (err) {
      console.error("Error loading stored user:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userData: AuthUser | null) => {
    try {
      if (userData) {
        await AsyncStorage.setItem("authUser", JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem("authUser");
      }
      setUser(userData);
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getApiUrl()}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return { success: false, error: data.error };
      }

      await saveUser(data.user);
      // Set flag to trigger cloud sync in ProfileContext
      await AsyncStorage.setItem("needsCloudSync", "true");
      return { success: true };
    } catch (err) {
      const errorMessage = "Failed to register. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getApiUrl()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return { success: false, error: data.error };
      }

      await saveUser(data.user);
      // Set flag to trigger cloud sync in ProfileContext
      await AsyncStorage.setItem("needsCloudSync", "true");
      return { success: true };
    } catch (err) {
      const errorMessage = "Failed to login. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; resetCode?: string; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getApiUrl()}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return { success: false, error: data.error };
      }

      return { success: true, resetCode: data.resetCode };
    } catch (err) {
      const errorMessage = "Failed to send reset code. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string, resetCode: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getApiUrl()}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetCode, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = "Failed to reset password. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await saveUser(null);
    // Clear sync flag so next login will sync from cloud
    await AsyncStorage.removeItem("lastSyncedUserId");
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        register,
        login,
        forgotPassword,
        resetPassword,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
