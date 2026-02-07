import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as StoreReview from "expo-store-review";
import { getApiUrl } from "@/lib/query-client";

export const avatarImages: { [key: string]: any } = {
  "avatar-1": require("../../assets/avatars/avatar-1.png"),
  "avatar-2": require("../../assets/avatars/avatar-2.png"),
  "avatar-3": require("../../assets/avatars/avatar-3.png"),
  "avatar-4": require("../../assets/avatars/avatar-4.png"),
  "avatar-5": require("../../assets/avatars/avatar-5.png"),
  "avatar-6": require("../../assets/avatars/avatar-6.png"),
  "avatar-7": require("../../assets/avatars/avatar-7.png"),
  "avatar-8": require("../../assets/avatars/avatar-8.png"),
  "avatar-9": require("../../assets/avatars/avatar-9.png"),
  "avatar-10": require("../../assets/avatars/avatar-10.png"),
  "avatar-11": require("../../assets/avatars/avatar-11.png"),
  "avatar-12": require("../../assets/avatars/avatar-12.png"),
  "avatar-13": require("../../assets/avatars/avatar-13.png"),
  "avatar-14": require("../../assets/avatars/avatar-14.png"),
  "avatar-15": require("../../assets/avatars/avatar-15.png"),
  "avatar-16": require("../../assets/avatars/avatar-16.png"),
};

export type Avatar = {
  id: string;
  name: string;
  icon: string;
  image: any;
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

export type LevelInfo = {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  title: string;
};

const LEVEL_TITLES = [
  "Newbie",
  "Rookie",
  "Player",
  "Enthusiast",
  "Competitor",
  "Challenger",
  "Expert",
  "Master",
  "Champion",
  "Legend",
  "Ultimate",
];

export const calculateLevel = (xp: number): LevelInfo => {
  let level = 1;
  let xpRequired = 100;
  let totalXpForLevel = 0;
  
  while (xp >= totalXpForLevel + xpRequired && level < 100) {
    totalXpForLevel += xpRequired;
    level++;
    xpRequired = Math.floor(100 * Math.pow(1.2, level - 1));
  }
  
  const currentXP = xp - totalXpForLevel;
  const xpForNextLevel = xpRequired;
  const titleIndex = Math.min(Math.floor(level / 10), LEVEL_TITLES.length - 1);
  const title = LEVEL_TITLES[titleIndex];
  
  return { level, currentXP, xpForNextLevel, title };
};

type ProfileContextType = {
  currentProfile: Profile | null;
  profiles: Profile[];
  avatars: Avatar[];
  settings: Settings;
  answeredQuestions: Set<string>;
  experiencePoints: number;
  levelInfo: LevelInfo;
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
  addExperience: (xp: number) => void;
  syncToCloud: (overrideSocialId?: string, email?: string) => Promise<boolean>;
  loadFromCloud: (overrideSocialId?: string) => Promise<boolean>;
};

const defaultAvatars: Avatar[] = [
  { id: "avatar-1", name: "Happy Kid", icon: "smile", image: avatarImages["avatar-1"], color: "#FF006E", price: 0, owned: true },
  { id: "avatar-2", name: "Cool Cat", icon: "github", image: avatarImages["avatar-2"], color: "#FFD700", price: 0, owned: true },
  { id: "avatar-3", name: "Friendly Ghost", icon: "cloud", image: avatarImages["avatar-3"], color: "#FFFFFF", price: 0, owned: true },
  { id: "avatar-4", name: "Silly Monster", icon: "frown", image: avatarImages["avatar-4"], color: "#00F5FF", price: 100, owned: false },
  { id: "avatar-5", name: "Royal Prince", icon: "award", image: avatarImages["avatar-5"], color: "#FFD700", price: 150, owned: false },
  { id: "avatar-6", name: "Fire Dragon", icon: "sun", image: avatarImages["avatar-6"], color: "#FF8C00", price: 200, owned: false },
  { id: "avatar-7", name: "Sleepy Owl", icon: "moon", image: avatarImages["avatar-7"], color: "#C0C0FF", price: 250, owned: false },
  { id: "avatar-8", name: "Space Alien", icon: "globe", image: avatarImages["avatar-8"], color: "#9B59B6", price: 300, owned: false },
  { id: "avatar-9", name: "Thunder Bear", icon: "cloud-lightning", image: avatarImages["avatar-9"], color: "#F1C40F", price: 350, owned: false },
  { id: "avatar-10", name: "Brave Fox", icon: "sunrise", image: avatarImages["avatar-10"], color: "#E74C3C", price: 400, owned: false },
  { id: "avatar-11", name: "Ice Yeti", icon: "hexagon", image: avatarImages["avatar-11"], color: "#1ABC9C", price: 450, owned: false },
  { id: "avatar-12", name: "Purple Goblin", icon: "target", image: avatarImages["avatar-12"], color: "#8E44AD", price: 500, owned: false },
  { id: "avatar-13", name: "Ocean Mermaid", icon: "compass", image: avatarImages["avatar-13"], color: "#3498DB", price: 600, owned: false },
  { id: "avatar-14", name: "Forest Elf", icon: "feather", image: avatarImages["avatar-14"], color: "#00FF87", price: 700, owned: false },
  { id: "avatar-15", name: "Pink Unicorn", icon: "heart", image: avatarImages["avatar-15"], color: "#E91E63", price: 800, owned: false },
  { id: "avatar-16", name: "Golden Hero", icon: "shield", image: avatarImages["avatar-16"], color: "#FF006E", price: 1000, owned: false },
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
  const [experiencePoints, setExperiencePoints] = useState<number>(0);
  const levelInfo = calculateLevel(experiencePoints);

  const loadData = async () => {
    try {
      const profilesData = await AsyncStorage.getItem("profiles");
      const currentProfileId = await AsyncStorage.getItem("currentProfileId");
      const avatarsData = await AsyncStorage.getItem("avatars");
      const settingsData = await AsyncStorage.getItem("settings");
      const answeredData = await AsyncStorage.getItem("answeredQuestions");
      const xpData = await AsyncStorage.getItem("experiencePoints");

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

      if (xpData) {
        setExperiencePoints(JSON.parse(xpData));
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
      await AsyncStorage.setItem("experiencePoints", JSON.stringify(experiencePoints));
      if (currentProfile) {
        await AsyncStorage.setItem("currentProfileId", currentProfile.id);
      }
    } catch (error) {
      console.error("Error saving profile data:", error);
    }
  };

  // Track if initial load is complete to avoid syncing during load
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  
  // Track when we loaded from cloud to skip auto-syncs for a period
  const cloudLoadTimestampRef = useRef<number>(0);

  useEffect(() => {
    const initializeData = async () => {
      await loadData();
      setIsInitialLoadComplete(true);
    };
    initializeData();
  }, []);

  // Check for needsCloudSync flag (set by AuthContext on login/register)
  useEffect(() => {
    if (!isInitialLoadComplete) return;

    const checkAndSyncFromCloud = async () => {
      const needsSync = await AsyncStorage.getItem("needsCloudSync");
      if (needsSync === "true") {
        const authUserData = await AsyncStorage.getItem("authUser");
        if (authUserData) {
          const authUser = JSON.parse(authUserData);
          console.log("needsCloudSync flag detected, syncing from cloud for user:", authUser.id);
          await AsyncStorage.removeItem("needsCloudSync");

          cloudLoadTimestampRef.current = Date.now();

          const success = await loadFromCloud(authUser.id);
          if (success) {
            console.log("Cloud sync completed successfully on login");
          }
        }
      }
    };

    checkAndSyncFromCloud();
    const interval = setInterval(checkAndSyncFromCloud, 1500);
    return () => clearInterval(interval);
  }, [isInitialLoadComplete]);

  useEffect(() => {
    if (!isInitialLoadComplete) return;
    
    const timeSinceCloudLoad = Date.now() - cloudLoadTimestampRef.current;
    if (timeSinceCloudLoad < 5000) return;
    
    saveData();
  }, [profiles, avatars, settings, answeredQuestions, currentProfile, experiencePoints, isInitialLoadComplete]);

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
    console.log("ProfileContext updateProfile called:", { profileId, updates });
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, ...updates } : p))
    );
    if (currentProfile?.id === profileId) {
      setCurrentProfile((prev) => {
        const updated = prev ? { ...prev, ...updates } : null;
        console.log("currentProfile updated to:", updated);
        return updated;
      });
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
    console.log("purchaseAvatar called:", { avatarId, points, avatarPrice: avatar?.price, avatarOwned: avatar?.owned });
    if (!avatar || avatar.owned || points < avatar.price) {
      console.log("purchaseAvatar failed - conditions not met");
      return false;
    }

    console.log("purchaseAvatar success - updating avatar state");
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

  const addExperience = async (xp: number) => {
    const prevLevel = calculateLevel(experiencePoints).level;
    const newXP = experiencePoints + xp;
    setExperiencePoints(newXP);
    const newLevel = calculateLevel(newXP).level;

    if (prevLevel < 4 && newLevel >= 4) {
      try {
        const alreadyAsked = await AsyncStorage.getItem("storeReviewAsked");
        if (!alreadyAsked) {
          const isAvailable = await StoreReview.isAvailableAsync();
          if (isAvailable) {
            await StoreReview.requestReview();
            await AsyncStorage.setItem("storeReviewAsked", "true");
          }
        }
      } catch (e) {
        // silently ignore review errors
      }
    }
  };

  const syncToCloud = async (overrideSocialId?: string, email?: string): Promise<boolean> => {
    const socialId = overrideSocialId || currentProfile?.socialId;
    console.log("syncToCloud called with socialId:", socialId);
    if (!socialId) {
      console.log("syncToCloud: No socialId, returning false");
      return false;
    }

    const timeSinceCloudLoad = Date.now() - cloudLoadTimestampRef.current;
    if (timeSinceCloudLoad < 10000) {
      console.log("syncToCloud: Skipping (just loaded from cloud)");
      return false;
    }
    
    try {
      const currentThemeId = await AsyncStorage.getItem("currentThemeId");
      const ownedThemes = await AsyncStorage.getItem("ownedThemes");
      const starPoints = await AsyncStorage.getItem("starPoints");
      const isAdFree = await AsyncStorage.getItem("isAdFree");
      const hasSupported = await AsyncStorage.getItem("hasSupported");
      const totalCoins = await AsyncStorage.getItem("totalCoins");
      const totalGamesPlayed = await AsyncStorage.getItem("totalGamesPlayed");
      const highScore = await AsyncStorage.getItem("highScore");
      const lastWeeklyClaimDate = await AsyncStorage.getItem("lastWeeklyClaimDate");
      const answeredQuestionIds = await AsyncStorage.getItem("answeredQuestionIds");
      const multiplayerAnsweredIds = await AsyncStorage.getItem("multiplayerAnsweredQuestionIds");
      const powerCards = await AsyncStorage.getItem("powerCards");

      const cloudData = {
        profiles,
        avatars,
        settings,
        answeredQuestions: [...answeredQuestions],
        experiencePoints,
        themeData: {
          currentThemeId,
          ownedThemes: ownedThemes ? JSON.parse(ownedThemes) : ["electric"],
          starPoints: starPoints ? parseInt(starPoints, 10) : 0,
          isAdFree: isAdFree === "true",
          hasSupported: hasSupported === "true",
        },
        gameData: {
          totalCoins: totalCoins ? parseInt(totalCoins, 10) : 100,
          totalGamesPlayed: totalGamesPlayed ? parseInt(totalGamesPlayed, 10) : 0,
          highScore: highScore ? parseInt(highScore, 10) : 0,
          lastWeeklyClaimDate,
          answeredQuestionIds: answeredQuestionIds ? JSON.parse(answeredQuestionIds) : [],
          multiplayerAnsweredIds: multiplayerAnsweredIds ? JSON.parse(multiplayerAnsweredIds) : [],
          powerCards: powerCards ? JSON.parse(powerCards) : null,
        },
        lastSync: new Date().toISOString(),
      };

      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}/api/cloud-sync/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: socialId,
          email,
          data: cloudData,
        }),
      });

      if (!response.ok) {
        console.error("syncToCloud: Server returned error", response.status);
        return false;
      }

      console.log("syncToCloud: Successfully saved data for socialId:", socialId);
      return true;
    } catch (error) {
      console.error("Error syncing to cloud:", error);
      return false;
    }
  };

  const loadFromCloud = async (overrideUserId?: string): Promise<boolean> => {
    const userId = overrideUserId || currentProfile?.socialId;
    console.log("loadFromCloud called with userId:", userId);
    if (!userId) {
      console.log("loadFromCloud: No userId, returning false");
      return false;
    }
    
    cloudLoadTimestampRef.current = Date.now();
    
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}/api/cloud-sync/load/${encodeURIComponent(userId)}`);
      
      if (!response.ok) {
        console.log("loadFromCloud: No cloud data found or server error", response.status);
        return false;
      }

      const result = await response.json();
      console.log("loadFromCloud: Retrieved data from server");

      if (result.success && result.data) {
        cloudLoadTimestampRef.current = Date.now();
        
        const parsed = result.data;

        if (parsed.profiles) {
          setProfiles(parsed.profiles);
          const matchingProfile = parsed.profiles.find((p: Profile) => p.socialId === userId);
          if (matchingProfile) {
            setCurrentProfile(matchingProfile);
            await AsyncStorage.setItem("currentProfileId", matchingProfile.id);
          } else if (parsed.profiles.length > 0) {
            setCurrentProfile(parsed.profiles[0]);
            await AsyncStorage.setItem("currentProfileId", parsed.profiles[0].id);
          }
          await AsyncStorage.setItem("profiles", JSON.stringify(parsed.profiles));
        }

        if (parsed.avatars) {
          const cloudAvatars = parsed.avatars.map((cloudAvatar: Avatar) => ({
            ...cloudAvatar,
            image: avatarImages[cloudAvatar.id] || avatarImages["avatar-1"],
          }));
          setAvatars(cloudAvatars);
          await AsyncStorage.setItem("avatars", JSON.stringify(cloudAvatars));
          console.log("Cloud loaded avatars - owned:", cloudAvatars.filter((a: Avatar) => a.owned).length);
        }

        if (parsed.settings) {
          setSettings(parsed.settings);
          await AsyncStorage.setItem("settings", JSON.stringify(parsed.settings));
        }

        if (parsed.answeredQuestions) {
          setAnsweredQuestions(new Set(parsed.answeredQuestions));
          await AsyncStorage.setItem("answeredQuestions", JSON.stringify(parsed.answeredQuestions));
        }

        if (parsed.experiencePoints !== undefined) {
          setExperiencePoints(parsed.experiencePoints);
          await AsyncStorage.setItem("experiencePoints", parsed.experiencePoints.toString());
          console.log("Cloud loaded XP:", parsed.experiencePoints);
        }

        if (parsed.themeData) {
          const { currentThemeId, ownedThemes, starPoints, isAdFree, hasSupported } = parsed.themeData;
          
          await AsyncStorage.setItem("starPoints", (starPoints || 0).toString());
          await AsyncStorage.setItem("ownedThemes", JSON.stringify(ownedThemes || ["electric"]));
          if (currentThemeId) await AsyncStorage.setItem("currentThemeId", currentThemeId);
          await AsyncStorage.setItem("isAdFree", (isAdFree || false).toString());
          await AsyncStorage.setItem("hasSupported", (hasSupported || false).toString());
          
          await AsyncStorage.setItem("needsThemeReload", "true");
          console.log("Cloud loaded theme data - stars:", starPoints, "themes:", ownedThemes?.length);
        }

        if (parsed.gameData) {
          const { totalCoins, totalGamesPlayed, highScore, lastWeeklyClaimDate, answeredQuestionIds, multiplayerAnsweredIds, powerCards } = parsed.gameData;
          
          await AsyncStorage.setItem("totalCoins", (totalCoins || 0).toString());
          await AsyncStorage.setItem("totalGamesPlayed", (totalGamesPlayed || 0).toString());
          await AsyncStorage.setItem("highScore", (highScore || 0).toString());
          
          if (lastWeeklyClaimDate) await AsyncStorage.setItem("lastWeeklyClaimDate", lastWeeklyClaimDate);
          if (answeredQuestionIds) await AsyncStorage.setItem("answeredQuestionIds", JSON.stringify(answeredQuestionIds));
          if (multiplayerAnsweredIds) await AsyncStorage.setItem("multiplayerAnsweredQuestionIds", JSON.stringify(multiplayerAnsweredIds));
          
          if (powerCards) {
            const getCount = (cards: any, id: string): number => {
              if (Array.isArray(cards)) {
                const card = cards.find((c: any) => c.id === id);
                return card?.count || 0;
              }
              if (cards && typeof cards === 'object') {
                return cards[id] || cards[id.replace('-', '')] || 0;
              }
              return 0;
            };
            
            const cardDefs = [
              { id: "skip", name: "Skip", description: "Skip this question", icon: "skip-forward" },
              { id: "steal", name: "Steal", description: "Reveal one wrong answer", icon: "copy" },
              { id: "double-bluff", name: "Double Bluff", description: "Double your points if correct", icon: "zap" },
            ];
            
            const cloudPowerCards = cardDefs.map(def => ({
              ...def,
              count: getCount(powerCards, def.id),
            }));
            await AsyncStorage.setItem("powerCards", JSON.stringify(cloudPowerCards));
          }
          
          await AsyncStorage.setItem("needsGameReload", "true");
          console.log("Cloud loaded game data - coins:", totalCoins, "games:", totalGamesPlayed);
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error loading from cloud:", error);
      return false;
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        currentProfile,
        profiles,
        avatars,
        settings,
        answeredQuestions,
        experiencePoints,
        levelInfo,
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
        addExperience,
        syncToCloud,
        loadFromCloud,
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
