import { useTheme } from "@/context/ThemeContext";

export function useThemeColors() {
  const { currentTheme } = useTheme();
  
  return {
    primary: currentTheme.colors.primary,
    secondary: currentTheme.colors.secondary,
    accent: currentTheme.colors.accent,
    backgroundDark: currentTheme.colors.backgroundDark,
    surface: currentTheme.colors.surface,
    correct: currentTheme.colors.correct,
    wrong: currentTheme.colors.wrong,
    warning: "#FFAA00",
    textPrimary: "#FFFFFF",
    textSecondary: "#A0A8C0",
    backgroundLight: "#F8F9FA",
  };
}
