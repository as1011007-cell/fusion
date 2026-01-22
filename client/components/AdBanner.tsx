import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";

type AdBannerProps = {
  style?: object;
};

export function AdBanner({ style }: AdBannerProps) {
  const { isAdFree } = useTheme();

  if (isAdFree) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={["#1a1a2e", "#16213e"]}
        style={styles.adContent}
      >
        <View style={styles.adLabel}>
          <ThemedText style={styles.adLabelText}>AD</ThemedText>
        </View>
        <View style={styles.placeholderContent}>
          <Feather name="gift" size={24} color={GameColors.secondary} />
          <View style={styles.textContainer}>
            <ThemedText style={styles.adTitle}>Go Ad-Free!</ThemedText>
            <ThemedText style={styles.adSubtitle}>
              Remove all ads for just $5
            </ThemedText>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
  },
  adContent: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  adLabel: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adLabelText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
  },
  placeholderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  adTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  adSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
});
