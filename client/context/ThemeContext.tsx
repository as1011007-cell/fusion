import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeId = "electric" | "sunset" | "ocean" | "forest" | "galaxy" | "neon" | "retro" | "midnight" | "aurora" | "candy";

export type VisualEffectId = "sparkles" | "bubbles" | "stars" | "flames" | "snow" | "confetti" | "hearts" | "lightning";

export type AchievementId = 
  | "first_game" 
  | "ten_games" 
  | "fifty_games" 
  | "perfect_round" 
  | "streak_master" 
  | "level_10" 
  | "level_25" 
  | "level_50"
  | "daily_warrior"
  | "multiplayer_champion";

export type Achievement = {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  reward?: {
    type: "theme" | "effect" | "starPoints";
    id?: string;
    amount?: number;
  };
};

export type VisualEffect = {
  id: VisualEffectId;
  name: string;
  description: string;
  icon: string;
  price: number;
  owned: boolean;
  unlockRequirement?: AchievementId;
};

export type GameTheme = {
  id: ThemeId;
  name: string;
  description: string;
  price: number;
  owned: boolean;
  unlockRequirement?: AchievementId;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    backgroundDark: string;
    surface: string;
    correct: string;
    wrong: string;
  };
};

const defaultThemes: GameTheme[] = [
  {
    id: "electric",
    name: "Electric Collision",
    description: "The classic neon experience",
    price: 0,
    owned: true,
    colors: {
      primary: "#FF006E",
      secondary: "#00F5FF",
      accent: "#FFD700",
      backgroundDark: "#0A0E27",
      surface: "#1C1F3A",
      correct: "#00FF87",
      wrong: "#FF0044",
    },
  },
  {
    id: "sunset",
    name: "Sunset Blaze",
    description: "Warm oranges and fiery reds",
    price: 1500,
    owned: false,
    colors: {
      primary: "#FF6B35",
      secondary: "#FFB347",
      accent: "#FF4757",
      backgroundDark: "#1A0A0A",
      surface: "#2D1515",
      correct: "#7BED9F",
      wrong: "#FF4757",
    },
  },
  {
    id: "ocean",
    name: "Ocean Depths",
    description: "Cool blues and aqua tones",
    price: 1500,
    owned: false,
    colors: {
      primary: "#0984E3",
      secondary: "#74B9FF",
      accent: "#00CEC9",
      backgroundDark: "#0A1628",
      surface: "#152238",
      correct: "#55EFC4",
      wrong: "#E17055",
    },
  },
  {
    id: "forest",
    name: "Enchanted Forest",
    description: "Natural greens and earth tones",
    price: 1500,
    owned: false,
    colors: {
      primary: "#00B894",
      secondary: "#55EFC4",
      accent: "#FDCB6E",
      backgroundDark: "#0A1A14",
      surface: "#152D23",
      correct: "#2ED573",
      wrong: "#FF6B6B",
    },
  },
  {
    id: "galaxy",
    name: "Cosmic Galaxy",
    description: "Deep purples and cosmic vibes",
    price: 1500,
    owned: false,
    colors: {
      primary: "#A55EEA",
      secondary: "#D980FA",
      accent: "#FFA502",
      backgroundDark: "#0D0A1A",
      surface: "#1A152D",
      correct: "#7BED9F",
      wrong: "#FF4757",
    },
  },
  {
    id: "neon",
    name: "Neon Dreams",
    description: "Unlocked by playing 10 games",
    price: 0,
    owned: false,
    unlockRequirement: "ten_games",
    colors: {
      primary: "#FF00FF",
      secondary: "#00FFFF",
      accent: "#FFFF00",
      backgroundDark: "#0A0A15",
      surface: "#1A1A2E",
      correct: "#39FF14",
      wrong: "#FF073A",
    },
  },
  {
    id: "retro",
    name: "Retro Arcade",
    description: "Unlocked by reaching Level 10",
    price: 0,
    owned: false,
    unlockRequirement: "level_10",
    colors: {
      primary: "#FF6347",
      secondary: "#FFD700",
      accent: "#32CD32",
      backgroundDark: "#1A1A1A",
      surface: "#2D2D2D",
      correct: "#00FF00",
      wrong: "#FF0000",
    },
  },
  {
    id: "midnight",
    name: "Midnight Noir",
    description: "Unlocked by a perfect round",
    price: 0,
    owned: false,
    unlockRequirement: "perfect_round",
    colors: {
      primary: "#708090",
      secondary: "#C0C0C0",
      accent: "#FFD700",
      backgroundDark: "#0D0D0D",
      surface: "#1C1C1C",
      correct: "#98FB98",
      wrong: "#DC143C",
    },
  },
  {
    id: "aurora",
    name: "Aurora Borealis",
    description: "Unlocked by reaching Level 25",
    price: 0,
    owned: false,
    unlockRequirement: "level_25",
    colors: {
      primary: "#00CED1",
      secondary: "#9370DB",
      accent: "#98FB98",
      backgroundDark: "#0A1628",
      surface: "#152238",
      correct: "#7FFFD4",
      wrong: "#FF6347",
    },
  },
  {
    id: "candy",
    name: "Candy Land",
    description: "Unlocked by playing 50 games",
    price: 0,
    owned: false,
    unlockRequirement: "fifty_games",
    colors: {
      primary: "#FF69B4",
      secondary: "#FFB6C1",
      accent: "#FF1493",
      backgroundDark: "#2D1B2E",
      surface: "#3D2B3E",
      correct: "#98FB98",
      wrong: "#FF6B6B",
    },
  },
];

const defaultAchievements: Achievement[] = [
  {
    id: "first_game",
    name: "First Steps",
    description: "Complete your first game",
    icon: "play",
    unlocked: false,
    reward: { type: "starPoints", amount: 100 },
  },
  {
    id: "ten_games",
    name: "Getting Started",
    description: "Play 10 games",
    icon: "award",
    unlocked: false,
    reward: { type: "theme", id: "neon" },
  },
  {
    id: "fifty_games",
    name: "Dedicated Player",
    description: "Play 50 games",
    icon: "star",
    unlocked: false,
    reward: { type: "theme", id: "candy" },
  },
  {
    id: "perfect_round",
    name: "Perfectionist",
    description: "Get all answers correct in a game",
    icon: "check-circle",
    unlocked: false,
    reward: { type: "theme", id: "midnight" },
  },
  {
    id: "streak_master",
    name: "Streak Master",
    description: "Achieve a 10-answer streak",
    icon: "zap",
    unlocked: false,
    reward: { type: "effect", id: "flames" },
  },
  {
    id: "level_10",
    name: "Rising Star",
    description: "Reach Level 10",
    icon: "trending-up",
    unlocked: false,
    reward: { type: "theme", id: "retro" },
  },
  {
    id: "level_25",
    name: "Expert Player",
    description: "Reach Level 25",
    icon: "shield",
    unlocked: false,
    reward: { type: "theme", id: "aurora" },
  },
  {
    id: "level_50",
    name: "Legendary",
    description: "Reach Level 50",
    icon: "crown",
    unlocked: false,
    reward: { type: "effect", id: "lightning" },
  },
  {
    id: "daily_warrior",
    name: "Daily Warrior",
    description: "Complete 7 daily challenges",
    icon: "calendar",
    unlocked: false,
    reward: { type: "effect", id: "stars" },
  },
  {
    id: "multiplayer_champion",
    name: "Multiplayer Champion",
    description: "Win 5 multiplayer games",
    icon: "users",
    unlocked: false,
    reward: { type: "effect", id: "confetti" },
  },
];

const defaultVisualEffects: VisualEffect[] = [
  {
    id: "sparkles",
    name: "Sparkles",
    description: "Glittering sparkle effects",
    icon: "star",
    price: 500,
    owned: false,
  },
  {
    id: "bubbles",
    name: "Bubbles",
    description: "Floating bubble animations",
    icon: "circle",
    price: 500,
    owned: false,
  },
  {
    id: "stars",
    name: "Shooting Stars",
    description: "Stars streak across the screen",
    icon: "navigation",
    price: 0,
    owned: false,
    unlockRequirement: "daily_warrior",
  },
  {
    id: "flames",
    name: "Flames",
    description: "Fiery particle effects",
    icon: "sun",
    price: 0,
    owned: false,
    unlockRequirement: "streak_master",
  },
  {
    id: "snow",
    name: "Snowfall",
    description: "Gentle falling snowflakes",
    icon: "cloud-snow",
    price: 750,
    owned: false,
  },
  {
    id: "confetti",
    name: "Confetti",
    description: "Celebration confetti burst",
    icon: "gift",
    price: 0,
    owned: false,
    unlockRequirement: "multiplayer_champion",
  },
  {
    id: "hearts",
    name: "Hearts",
    description: "Floating heart particles",
    icon: "heart",
    price: 600,
    owned: false,
  },
  {
    id: "lightning",
    name: "Lightning",
    description: "Electric lightning bolts",
    icon: "zap",
    price: 0,
    owned: false,
    unlockRequirement: "level_50",
  },
];

type ThemeContextType = {
  themes: GameTheme[];
  currentTheme: GameTheme;
  setCurrentTheme: (themeId: ThemeId) => void;
  purchaseTheme: (themeId: ThemeId) => boolean;
  starPoints: number;
  addStarPoints: (amount: number) => void;
  spendStarPoints: (amount: number) => boolean;
  isAdFree: boolean;
  setAdFree: (value: boolean) => void;
  hasSupported: boolean;
  setHasSupported: (value: boolean) => void;
  achievements: Achievement[];
  unlockAchievement: (achievementId: AchievementId) => Achievement | null;
  checkAchievementProgress: (stats: AchievementStats) => Achievement[];
  visualEffects: VisualEffect[];
  activeEffect: VisualEffectId | null;
  setActiveEffect: (effectId: VisualEffectId | null) => void;
  purchaseEffect: (effectId: VisualEffectId) => boolean;
  getUnlockedThemesCount: () => number;
  getUnlockedEffectsCount: () => number;
};

export type AchievementStats = {
  gamesPlayed: number;
  level: number;
  bestStreak: number;
  perfectRounds: number;
  dailyChallengesCompleted: number;
  multiplayerWins: number;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themes, setThemes] = useState<GameTheme[]>(defaultThemes);
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>("electric");
  const [starPoints, setStarPoints] = useState(0);
  const [isAdFree, setIsAdFree] = useState(false);
  const [hasSupported, setHasSupportedState] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
  const [visualEffects, setVisualEffects] = useState<VisualEffect[]>(defaultVisualEffects);
  const [activeEffect, setActiveEffectState] = useState<VisualEffectId | null>(null);

  useEffect(() => {
    loadThemeData();
  }, []);

  const loadThemeData = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem("currentThemeId");
      const savedOwnedThemes = await AsyncStorage.getItem("ownedThemes");
      const savedStarPoints = await AsyncStorage.getItem("starPoints");
      const savedAdFree = await AsyncStorage.getItem("isAdFree");
      const savedHasSupported = await AsyncStorage.getItem("hasSupported");
      const savedAchievements = await AsyncStorage.getItem("achievements");
      const savedOwnedEffects = await AsyncStorage.getItem("ownedEffects");
      const savedActiveEffect = await AsyncStorage.getItem("activeEffect");

      if (savedThemeId) {
        setCurrentThemeId(savedThemeId as ThemeId);
      }

      if (savedOwnedThemes) {
        const ownedIds = JSON.parse(savedOwnedThemes) as ThemeId[];
        setThemes((prev) =>
          prev.map((theme) => ({
            ...theme,
            owned: theme.id === "electric" || ownedIds.includes(theme.id),
          }))
        );
      }

      if (savedStarPoints) {
        setStarPoints(parseInt(savedStarPoints, 10));
      }

      if (savedAdFree === "true") {
        setIsAdFree(true);
      }

      if (savedHasSupported === "true") {
        setHasSupportedState(true);
      }

      if (savedAchievements) {
        const savedAchievementData = JSON.parse(savedAchievements) as Achievement[];
        setAchievements((prev) =>
          prev.map((achievement) => {
            const saved = savedAchievementData.find((a) => a.id === achievement.id);
            return saved ? { ...achievement, ...saved } : achievement;
          })
        );
      }

      if (savedOwnedEffects) {
        const ownedEffectIds = JSON.parse(savedOwnedEffects) as VisualEffectId[];
        setVisualEffects((prev) =>
          prev.map((effect) => ({
            ...effect,
            owned: ownedEffectIds.includes(effect.id),
          }))
        );
      }

      if (savedActiveEffect) {
        setActiveEffectState(savedActiveEffect as VisualEffectId);
      }
    } catch (error) {
      console.error("Error loading theme data:", error);
    }
  };

  const saveThemeData = async () => {
    try {
      await AsyncStorage.setItem("currentThemeId", currentThemeId);
      const ownedIds = themes.filter((t) => t.owned).map((t) => t.id);
      await AsyncStorage.setItem("ownedThemes", JSON.stringify(ownedIds));
      await AsyncStorage.setItem("starPoints", starPoints.toString());
      await AsyncStorage.setItem("isAdFree", isAdFree.toString());
      await AsyncStorage.setItem("hasSupported", hasSupported.toString());
      await AsyncStorage.setItem("achievements", JSON.stringify(achievements));
      const ownedEffectIds = visualEffects.filter((e) => e.owned).map((e) => e.id);
      await AsyncStorage.setItem("ownedEffects", JSON.stringify(ownedEffectIds));
      if (activeEffect) {
        await AsyncStorage.setItem("activeEffect", activeEffect);
      } else {
        await AsyncStorage.removeItem("activeEffect");
      }
    } catch (error) {
      console.error("Error saving theme data:", error);
    }
  };

  useEffect(() => {
    saveThemeData();
  }, [currentThemeId, themes, starPoints, isAdFree, hasSupported, achievements, visualEffects, activeEffect]);

  const currentTheme = themes.find((t) => t.id === currentThemeId) || themes[0];

  const setCurrentTheme = (themeId: ThemeId) => {
    const theme = themes.find((t) => t.id === themeId);
    if (theme?.owned) {
      setCurrentThemeId(themeId);
    }
  };

  const purchaseTheme = (themeId: ThemeId): boolean => {
    const theme = themes.find((t) => t.id === themeId);
    if (!theme || theme.owned || starPoints < theme.price) {
      return false;
    }

    setStarPoints((prev) => prev - theme.price);
    setThemes((prev) =>
      prev.map((t) => (t.id === themeId ? { ...t, owned: true } : t))
    );
    return true;
  };

  const addStarPoints = (amount: number) => {
    setStarPoints((prev) => prev + amount);
  };

  const spendStarPoints = (amount: number): boolean => {
    if (starPoints < amount) return false;
    setStarPoints((prev) => prev - amount);
    return true;
  };

  const setAdFree = (value: boolean) => {
    setIsAdFree(value);
  };

  const setHasSupported = (value: boolean) => {
    setHasSupportedState(value);
  };

  const unlockAchievement = (achievementId: AchievementId): Achievement | null => {
    const achievement = achievements.find((a) => a.id === achievementId);
    if (!achievement || achievement.unlocked) return null;

    const updatedAchievement = {
      ...achievement,
      unlocked: true,
      unlockedAt: new Date().toISOString(),
    };

    setAchievements((prev) =>
      prev.map((a) => (a.id === achievementId ? updatedAchievement : a))
    );

    if (achievement.reward) {
      if (achievement.reward.type === "starPoints" && achievement.reward.amount) {
        addStarPoints(achievement.reward.amount);
      } else if (achievement.reward.type === "theme" && achievement.reward.id) {
        setThemes((prev) =>
          prev.map((t) => (t.id === achievement.reward!.id ? { ...t, owned: true } : t))
        );
      } else if (achievement.reward.type === "effect" && achievement.reward.id) {
        setVisualEffects((prev) =>
          prev.map((e) => (e.id === achievement.reward!.id ? { ...e, owned: true } : e))
        );
      }
    }

    return updatedAchievement;
  };

  const checkAchievementProgress = (stats: AchievementStats): Achievement[] => {
    const newlyUnlocked: Achievement[] = [];

    const checkAndUnlock = (id: AchievementId, condition: boolean) => {
      const achievement = achievements.find((a) => a.id === id);
      if (achievement && !achievement.unlocked && condition) {
        const unlocked = unlockAchievement(id);
        if (unlocked) newlyUnlocked.push(unlocked);
      }
    };

    checkAndUnlock("first_game", stats.gamesPlayed >= 1);
    checkAndUnlock("ten_games", stats.gamesPlayed >= 10);
    checkAndUnlock("fifty_games", stats.gamesPlayed >= 50);
    checkAndUnlock("streak_master", stats.bestStreak >= 10);
    checkAndUnlock("perfect_round", stats.perfectRounds >= 1);
    checkAndUnlock("level_10", stats.level >= 10);
    checkAndUnlock("level_25", stats.level >= 25);
    checkAndUnlock("level_50", stats.level >= 50);
    checkAndUnlock("daily_warrior", stats.dailyChallengesCompleted >= 7);
    checkAndUnlock("multiplayer_champion", stats.multiplayerWins >= 5);

    return newlyUnlocked;
  };

  const setActiveEffect = (effectId: VisualEffectId | null) => {
    if (effectId === null) {
      setActiveEffectState(null);
      return;
    }
    const effect = visualEffects.find((e) => e.id === effectId);
    if (effect?.owned) {
      setActiveEffectState(effectId);
    }
  };

  const purchaseEffect = (effectId: VisualEffectId): boolean => {
    const effect = visualEffects.find((e) => e.id === effectId);
    if (!effect || effect.owned || starPoints < effect.price) {
      return false;
    }

    setStarPoints((prev) => prev - effect.price);
    setVisualEffects((prev) =>
      prev.map((e) => (e.id === effectId ? { ...e, owned: true } : e))
    );
    return true;
  };

  const getUnlockedThemesCount = () => themes.filter((t) => t.owned).length;
  const getUnlockedEffectsCount = () => visualEffects.filter((e) => e.owned).length;

  return (
    <ThemeContext.Provider
      value={{
        themes,
        currentTheme,
        setCurrentTheme,
        purchaseTheme,
        starPoints,
        addStarPoints,
        spendStarPoints,
        isAdFree,
        setAdFree,
        hasSupported,
        setHasSupported,
        achievements,
        unlockAchievement,
        checkAchievementProgress,
        visualEffects,
        activeEffect,
        setActiveEffect,
        purchaseEffect,
        getUnlockedThemesCount,
        getUnlockedEffectsCount,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
