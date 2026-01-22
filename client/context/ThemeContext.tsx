import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeId = "electric" | "sunset" | "ocean" | "forest" | "galaxy";

export type GameTheme = {
  id: ThemeId;
  name: string;
  description: string;
  price: number;
  owned: boolean;
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
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themes, setThemes] = useState<GameTheme[]>(defaultThemes);
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>("electric");
  const [starPoints, setStarPoints] = useState(0);
  const [isAdFree, setIsAdFree] = useState(false);
  const [hasSupported, setHasSupportedState] = useState(false);

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
    } catch (error) {
      console.error("Error saving theme data:", error);
    }
  };

  useEffect(() => {
    saveThemeData();
  }, [currentThemeId, themes, starPoints, isAdFree, hasSupported]);

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
