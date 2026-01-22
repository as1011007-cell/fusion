import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export type SocialProvider = "google" | "facebook" | null;

export type SocialUser = {
  id: string;
  name: string;
  email: string;
  picture: string | null;
  provider: SocialProvider;
};

type AuthContextType = {
  socialUser: SocialUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
};

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";
const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || "";

const googleDiscovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
  userInfoEndpoint: "https://www.googleapis.com/oauth2/v3/userinfo",
};

const facebookDiscovery = {
  authorizationEndpoint: "https://www.facebook.com/v18.0/dialog/oauth",
  tokenEndpoint: "https://graph.facebook.com/v18.0/oauth/access_token",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [socialUser, setSocialUser] = useState<SocialUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "feudfusion",
    path: "auth",
  });

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("socialUser");
      if (userData) {
        setSocialUser(JSON.parse(userData));
      }
    } catch (err) {
      console.error("Error loading stored user:", err);
    }
  };

  const saveUser = async (user: SocialUser | null) => {
    try {
      if (user) {
        await AsyncStorage.setItem("socialUser", JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem("socialUser");
      }
      setSocialUser(user);
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const loginWithGoogle = async () => {
    if (!GOOGLE_CLIENT_ID) {
      setError("Google login is not configured. Please add EXPO_PUBLIC_GOOGLE_CLIENT_ID.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ["openid", "profile", "email"],
        redirectUri,
        responseType: AuthSession.ResponseType.Token,
      });

      const result = await request.promptAsync(googleDiscovery);

      if (result.type === "success" && result.authentication?.accessToken) {
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${result.authentication.accessToken}`
        );
        const userInfo = await userInfoResponse.json();

        const user: SocialUser = {
          id: userInfo.sub,
          name: userInfo.name || "Google User",
          email: userInfo.email || "",
          picture: userInfo.picture || null,
          provider: "google",
        };

        await saveUser(user);
      } else if (result.type === "cancel") {
        setError("Login was cancelled");
      } else {
        setError("Failed to login with Google");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("An error occurred during Google login");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithFacebook = async () => {
    if (!FACEBOOK_APP_ID) {
      setError("Facebook login is not configured. Please add EXPO_PUBLIC_FACEBOOK_APP_ID.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request = new AuthSession.AuthRequest({
        clientId: FACEBOOK_APP_ID,
        scopes: ["public_profile", "email"],
        redirectUri,
        responseType: AuthSession.ResponseType.Token,
      });

      const result = await request.promptAsync(facebookDiscovery);

      if (result.type === "success" && result.authentication?.accessToken) {
        const userInfoResponse = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${result.authentication.accessToken}`
        );
        const userInfo = await userInfoResponse.json();

        const user: SocialUser = {
          id: userInfo.id,
          name: userInfo.name || "Facebook User",
          email: userInfo.email || "",
          picture: userInfo.picture?.data?.url || null,
          provider: "facebook",
        };

        await saveUser(user);
      } else if (result.type === "cancel") {
        setError("Login was cancelled");
      } else {
        setError("Failed to login with Facebook");
      }
    } catch (err) {
      console.error("Facebook login error:", err);
      setError("An error occurred during Facebook login");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await saveUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        socialUser,
        isLoading,
        isAuthenticated: !!socialUser,
        loginWithGoogle,
        loginWithFacebook,
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
