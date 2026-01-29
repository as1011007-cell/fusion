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
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; resetCode?: string; error?: string }>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [userData, storedToken] = await Promise.all([
        AsyncStorage.getItem("authUser"),
        AsyncStorage.getItem("authToken"),
      ]);
      if (userData) {
        setUser(JSON.parse(userData));
      }
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (err) {
      console.error("Error loading stored auth:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuth = async (userData: AuthUser | null, authToken: string | null) => {
    try {
      if (userData && authToken) {
        await Promise.all([
          AsyncStorage.setItem("authUser", JSON.stringify(userData)),
          AsyncStorage.setItem("authToken", authToken),
        ]);
      } else {
        await Promise.all([
          AsyncStorage.removeItem("authUser"),
          AsyncStorage.removeItem("authToken"),
        ]);
      }
      setUser(userData);
      setToken(authToken);
    } catch (err) {
      console.error("Error saving auth:", err);
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    if (token) {
      return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      };
    }
    return { "Content-Type": "application/json" };
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

      await saveAuth(data.user, data.token);
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

      await saveAuth(data.user, data.token);
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

  const deleteAccount = async (password: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "Not logged in" };
    }

    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}/api/auth/delete-account`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId: user.id, email: user.email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return { success: false, error: data.error };
      }

      await saveAuth(null, null);
      await AsyncStorage.removeItem("lastSyncedUserId");
      await AsyncStorage.removeItem("needsCloudSync");
      setError(null);
      return { success: true };
    } catch (err) {
      const errorMessage = "Failed to delete account. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await saveAuth(null, null);
    await AsyncStorage.removeItem("lastSyncedUserId");
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        register,
        login,
        forgotPassword,
        resetPassword,
        deleteAccount,
        logout,
        getAuthHeaders,
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
