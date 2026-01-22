import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Avatar = {
  id: string;
  name: string;
  icon: string;
  color: string;
  price: number;
  owned: boolean;
};

export type SocialProvider = "google" | "facebook" | null;

export type Profile = {
  id: string;
  name: string;
  avatarId: string;
  customPhoto: string | null;
  createdAt: string;
  socialProvider?: SocialProvider;
  socialId?: string;
  email?: string;
};

export type Settings = {
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  musicVolume: number;
};

type ProfileContextType = {
  currentProfile: Profile | null;
  profiles: Profile[];
  avatars: Avatar[];
  settings: Settings;
  answeredQuestions: Set<string>;
  createProfile: (name: string, avatarId: string, customPhoto?: string) => void;
  createSocialProfile: (name: string, photo: string | null, provider: SocialProvider, socialId: string, email?: string) => void;
  updateProfile: (profileId: string, updates: Partial<Profile>) => void;
  deleteProfile: (profileId: string) => void;
  selectProfile: (profileId: string) => void;
  purchaseAvatar: (avatarId: string, points: number) => boolean;
  updateSettings: (newSettings: Partial<Settings>) => void;
  markQuestionAnswered: (questionId: string) => void;
  resetAnsweredQuestions: () => void;
  getUnansweredCount: (totalQuestions: number) => number;
  findProfileBySocialId: (socialId: string) => Profile | undefined;
};

const defaultAvatars: Avatar[] = [
  { id: "avatar-1", name: "Lightning", icon: "zap", color: "#FF006E", price: 0, owned: true },
  { id: "avatar-2", name: "Star", icon: "star", color: "#FFD700", price: 0, owned: true },
  { id: "avatar-3", name: "Heart", icon: "heart", color: "#FF4444", price: 0, owned: true },
  { id: "avatar-4", name: "Diamond", icon: "octagon", color: "#00F5FF", price: 100, owned: false },
  { id: "avatar-5", name: "Crown", icon: "award", color: "#FFD700", price: 150, owned: false },
  { id: "avatar-6", name: "Flame", icon: "sun", color: "#FF8C00", price: 200, owned: false },
  { id: "avatar-7", name: "Moon", icon: "moon", color: "#C0C0FF", price: 250, owned: false },
  { id: "avatar-8", name: "Galaxy", icon: "globe", color: "#9B59B6", price: 300, owned: false },
  { id: "avatar-9", name: "Thunder", icon: "cloud-lightning", color: "#F1C40F", price: 350, owned: false },
  { id: "avatar-10", name: "Phoenix", icon: "sunrise", color: "#E74C3C", price: 400, owned: false },
  { id: "avatar-11", name: "Crystal", icon: "hexagon", color: "#1ABC9C", price: 450, owned: false },
  { id: "avatar-12", name: "Nebula", icon: "target", color: "#8E44AD", price: 500, owned: false },
  { id: "avatar-13", name: "Cosmic", icon: "compass", color: "#3498DB", price: 600, owned: false },
  { id: "avatar-14", name: "Aurora", icon: "layers", color: "#00FF87", price: 700, owned: false },
  { id: "avatar-15", name: "Infinity", icon: "circle", color: "#E91E63", price: 800, owned: false },
  { id: "avatar-16", name: "Legend", icon: "shield", color: "#FF006E", price: 1000, owned: false },
];

const defaultSettings: Settings = {
  musicEnabled: true,
  hapticsEnabled: true,
  musicVolume: 0.5,
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>(defaultAvatars);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profilesData = await AsyncStorage.getItem("profiles");
      const currentProfileId = await AsyncStorage.getItem("currentProfileId");
      const avatarsData = await AsyncStorage.getItem("avatars");
      const settingsData = await AsyncStorage.getItem("settings");
      const answeredData = await AsyncStorage.getItem("answeredQuestions");

      if (profilesData) {
        const parsed = JSON.parse(profilesData);
        setProfiles(parsed);
        if (currentProfileId) {
          const current = parsed.find((p: Profile) => p.id === currentProfileId);
          if (current) setCurrentProfile(current);
        }
      }

      if (avatarsData) {
        setAvatars(JSON.parse(avatarsData));
      }

      if (settingsData) {
        setSettings({ ...defaultSettings, ...JSON.parse(settingsData) });
      }

      if (answeredData) {
        setAnsweredQuestions(new Set(JSON.parse(answeredData)));
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem("profiles", JSON.stringify(profiles));
      await AsyncStorage.setItem("avatars", JSON.stringify(avatars));
      await AsyncStorage.setItem("settings", JSON.stringify(settings));
      await AsyncStorage.setItem("answeredQuestions", JSON.stringify([...answeredQuestions]));
      if (currentProfile) {
        await AsyncStorage.setItem("currentProfileId", currentProfile.id);
      }
    } catch (error) {
      console.error("Error saving profile data:", error);
    }
  };

  useEffect(() => {
    saveData();
  }, [profiles, avatars, settings, answeredQuestions, currentProfile]);

  const createProfile = (name: string, avatarId: string, customPhoto?: string) => {
    const newProfile: Profile = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      avatarId,
      customPhoto: customPhoto || null,
      createdAt: new Date().toISOString(),
    };
    setProfiles((prev) => [...prev, newProfile]);
    setCurrentProfile(newProfile);
    setAnsweredQuestions(new Set());
  };

  const createSocialProfile = (
    name: string,
    photo: string | null,
    provider: SocialProvider,
    socialId: string,
    email?: string
  ) => {
    const existingProfile = profiles.find((p) => p.socialId === socialId);
    if (existingProfile) {
      updateProfile(existingProfile.id, { name, customPhoto: photo, email });
      setCurrentProfile({ ...existingProfile, name, customPhoto: photo, email });
      return;
    }

    const newProfile: Profile = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      avatarId: "avatar-1",
      customPhoto: photo,
      createdAt: new Date().toISOString(),
      socialProvider: provider,
      socialId,
      email,
    };
    setProfiles((prev) => [...prev, newProfile]);
    setCurrentProfile(newProfile);
    setAnsweredQuestions(new Set());
  };

  const findProfileBySocialId = (socialId: string): Profile | undefined => {
    return profiles.find((p) => p.socialId === socialId);
  };

  const updateProfile = (profileId: string, updates: Partial<Profile>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, ...updates } : p))
    );
    if (currentProfile?.id === profileId) {
      setCurrentProfile((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteProfile = (profileId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    if (currentProfile?.id === profileId) {
      setCurrentProfile(null);
    }
  };

  const selectProfile = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      setCurrentProfile(profile);
    }
  };

  const purchaseAvatar = (avatarId: string, points: number): boolean => {
    const avatar = avatars.find((a) => a.id === avatarId);
    if (!avatar || avatar.owned || points < avatar.price) {
      return false;
    }

    setAvatars((prev) =>
      prev.map((a) => (a.id === avatarId ? { ...a, owned: true } : a))
    );
    return true;
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const markQuestionAnswered = (questionId: string) => {
    setAnsweredQuestions((prev) => new Set([...prev, questionId]));
  };

  const resetAnsweredQuestions = () => {
    setAnsweredQuestions(new Set());
  };

  const getUnansweredCount = (totalQuestions: number) => {
    return totalQuestions - answeredQuestions.size;
  };

  return (
    <ProfileContext.Provider
      value={{
        currentProfile,
        profiles,
        avatars,
        settings,
        answeredQuestions,
        createProfile,
        createSocialProfile,
        updateProfile,
        deleteProfile,
        selectProfile,
        purchaseAvatar,
        updateSettings,
        markQuestionAnswered,
        resetAnsweredQuestions,
        getUnansweredCount,
        findProfileBySocialId,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
