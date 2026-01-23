import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

interface FeudFusionBrandProps {
  size?: "small" | "medium" | "large";
}

export function FeudFusionBrand({ size = "small" }: FeudFusionBrandProps) {
  const { currentTheme } = useTheme();
  const colors = currentTheme.colors;

  const getFontSize = () => {
    switch (size) {
      case "large":
        return 32;
      case "medium":
        return 24;
      case "small":
      default:
        return 18;
    }
  };

  const fontSize = getFontSize();

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.feud, { fontSize }]}>FEUD</ThemedText>
      <ThemedText
        style={[
          styles.fusion,
          {
            fontSize,
            color: colors.primary,
            textShadowColor: colors.primary,
          },
        ]}
      >
        FUSION
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  feud: {
    fontWeight: "900",
    color: GameColors.textPrimary,
    letterSpacing: 2,
    marginRight: 4,
  },
  fusion: {
    fontWeight: "900",
    letterSpacing: 2,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
