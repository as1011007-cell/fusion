import { Platform } from "react-native";

export const GameColors = {
  primary: "#FF006E",
  secondary: "#00F5FF",
  accent: "#FFD700",
  backgroundDark: "#0A0E27",
  backgroundLight: "#F8F9FA",
  surface: "#1C1F3A",
  correct: "#00FF87",
  wrong: "#FF0044",
  warning: "#FFAA00",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A8C0",
};

export const Colors = {
  light: {
    text: "#11181C",
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: GameColors.primary,
    link: GameColors.primary,
    backgroundRoot: GameColors.backgroundLight,
    backgroundDefault: "#E8E8E8",
    backgroundSecondary: "#DCDCDC",
    backgroundTertiary: "#D0D0D0",
  },
  dark: {
    text: GameColors.textPrimary,
    buttonText: "#FFFFFF",
    tabIconDefault: GameColors.textSecondary,
    tabIconSelected: GameColors.secondary,
    link: GameColors.secondary,
    backgroundRoot: GameColors.backgroundDark,
    backgroundDefault: GameColors.surface,
    backgroundSecondary: "#252945",
    backgroundTertiary: "#2E3350",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 56,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
    fontFamily: Platform.select({
      ios: "Poppins_700Bold",
      android: "Poppins_700Bold",
      default: "Poppins_700Bold",
    }),
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
    fontFamily: Platform.select({
      ios: "Poppins_700Bold",
      android: "Poppins_700Bold",
      default: "Poppins_700Bold",
    }),
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
    fontFamily: Platform.select({
      ios: "Poppins_700Bold",
      android: "Poppins_700Bold",
      default: "Poppins_700Bold",
    }),
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
    fontFamily: Platform.select({
      ios: "Poppins_600SemiBold",
      android: "Poppins_600SemiBold",
      default: "Poppins_600SemiBold",
    }),
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
    fontFamily: Platform.select({
      ios: "Poppins_600SemiBold",
      android: "Poppins_600SemiBold",
      default: "Poppins_600SemiBold",
    }),
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
    fontFamily: Platform.select({
      ios: "Inter_400Regular",
      android: "Inter_400Regular",
      default: "Inter_400Regular",
    }),
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
    fontFamily: Platform.select({
      ios: "Inter_400Regular",
      android: "Inter_400Regular",
      default: "Inter_400Regular",
    }),
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
    fontFamily: Platform.select({
      ios: "Inter_500Medium",
      android: "Inter_500Medium",
      default: "Inter_500Medium",
    }),
  },
  button: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700" as const,
    fontFamily: Platform.select({
      ios: "Poppins_700Bold",
      android: "Poppins_700Bold",
      default: "Poppins_700Bold",
    }),
    textTransform: "uppercase" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
    fontFamily: Platform.select({
      ios: "Inter_400Regular",
      android: "Inter_400Regular",
      default: "Inter_400Regular",
    }),
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
