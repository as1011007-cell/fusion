import React from "react";
import { StyleSheet, View, Pressable, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useGame } from "@/context/GameContext";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { totalCoins } = useGame();

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const stats = [
    { icon: "award", label: "Games Played", value: "12", color: GameColors.primary },
    { icon: "target", label: "Accuracy", value: "68%", color: GameColors.secondary },
    { icon: "zap", label: "Best Streak", value: "5", color: GameColors.accent },
    { icon: "trophy", label: "High Score", value: "2,450", color: GameColors.correct },
  ];

  const menuItems = [
    { icon: "settings", label: "Settings", onPress: () => {} },
    { icon: "help-circle", label: "How to Play", onPress: () => {} },
    { icon: "star", label: "Rate App", onPress: () => {} },
    { icon: "share-2", label: "Share with Friends", onPress: () => {} },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.headerSpacer} />
        <ThemedText style={styles.headerTitle}>Profile</ThemedText>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Feather name="x" size={24} color={GameColors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing["3xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.profileCard}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.avatar}
              resizeMode="contain"
            />
          </View>
          <ThemedText style={styles.username}>Player One</ThemedText>
          <ThemedText style={styles.userTitle}>Perspective Master</ThemedText>

          <View style={styles.coinsDisplay}>
            <Feather name="star" size={20} color={GameColors.accent} />
            <ThemedText style={styles.coinsValue}>{totalCoins}</ThemedText>
            <ThemedText style={styles.coinsLabel}>coins</ThemedText>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(200).springify()}
          style={styles.statsGrid}
        >
          {stats.map((stat, index) => (
            <View key={stat.label} style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: stat.color + "20" },
                ]}
              >
                <Feather name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
              <ThemedText style={styles.statLabel}>{stat.label}</ThemedText>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <ThemedText style={styles.sectionTitle}>Power Cards</ThemedText>
          <View style={styles.powerCardsContainer}>
            <View style={styles.powerCard}>
              <View style={[styles.powerCardIcon, { backgroundColor: GameColors.textSecondary + "20" }]}>
                <Feather name="volume-x" size={24} color={GameColors.textSecondary} />
              </View>
              <ThemedText style={styles.powerCardName}>Mute</ThemedText>
              <ThemedText style={styles.powerCardCount}>x2</ThemedText>
            </View>
            <View style={styles.powerCard}>
              <View style={[styles.powerCardIcon, { backgroundColor: GameColors.accent + "20" }]}>
                <Feather name="copy" size={24} color={GameColors.accent} />
              </View>
              <ThemedText style={styles.powerCardName}>Steal</ThemedText>
              <ThemedText style={styles.powerCardCount}>x1</ThemedText>
            </View>
            <View style={styles.powerCard}>
              <View style={[styles.powerCardIcon, { backgroundColor: GameColors.primary + "20" }]}>
                <Feather name="zap" size={24} color={GameColors.primary} />
              </View>
              <ThemedText style={styles.powerCardName}>Bluff</ThemedText>
              <ThemedText style={styles.powerCardCount}>x1</ThemedText>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400).springify()}
          style={styles.menuContainer}
        >
          {menuItems.map((item, index) => (
            <Pressable
              key={item.label}
              style={styles.menuItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                item.onPress();
              }}
            >
              <View style={styles.menuItemIcon}>
                <Feather
                  name={item.icon as any}
                  size={20}
                  color={GameColors.textSecondary}
                />
              </View>
              <ThemedText style={styles.menuItemLabel}>{item.label}</ThemedText>
              <Feather
                name="chevron-right"
                size={20}
                color={GameColors.textSecondary}
              />
            </Pressable>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.backgroundDark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerSpacer: {
    width: 44,
  },
  headerTitle: {
    ...Typography.h4,
    color: GameColors.textPrimary,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GameColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  profileCard: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GameColors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
  },
  username: {
    ...Typography.h3,
    color: GameColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  userTitle: {
    ...Typography.small,
    color: GameColors.textSecondary,
    marginBottom: Spacing.lg,
  },
  coinsDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.accent + "20",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  coinsValue: {
    ...Typography.h4,
    color: GameColors.accent,
    marginLeft: Spacing.sm,
  },
  coinsLabel: {
    ...Typography.small,
    color: GameColors.textSecondary,
    marginLeft: Spacing.xs,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: "48%",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.h3,
    color: GameColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    textAlign: "center",
  },
  sectionTitle: {
    ...Typography.h4,
    color: GameColors.textPrimary,
    marginBottom: Spacing.md,
  },
  powerCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  powerCard: {
    flex: 1,
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
    marginHorizontal: Spacing.xs,
  },
  powerCardIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  powerCardName: {
    ...Typography.caption,
    color: GameColors.textPrimary,
    fontWeight: "600",
  },
  powerCardCount: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  menuContainer: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  menuItemLabel: {
    ...Typography.body,
    color: GameColors.textPrimary,
    flex: 1,
  },
});
