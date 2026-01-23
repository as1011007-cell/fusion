import React from "react";
import { StyleSheet, View, ScrollView, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { FeudFusionBrand } from "@/components/FeudFusionBrand";
import { GradientButton } from "@/components/GradientButton";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useGame } from "@/context/GameContext";
import { useTheme } from "@/context/ThemeContext";
import { useProfile } from "@/context/ProfileContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "DailyChallenge">;

export default function DailyChallengeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { gameState, startGame, highScore, totalGamesPlayed } = useGame();
  const { currentTheme } = useTheme();
  const { settings } = useProfile();
  const colors = currentTheme.colors;

  const handleBack = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.goBack();
  };

  const handleStartChallenge = () => {
    if (!gameState.dailyChallengeCompleted) {
      startGame("daily");
      navigation.navigate("GamePlay");
    }
  };

  const today = new Date();
  const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" });
  const dateString = today.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const rewards = [
    { icon: "star", label: "Coins", value: "50-200", color: GameColors.accent },
    { icon: "zap", label: "Streak Bonus", value: "x2", color: GameColors.primary },
    { icon: "award", label: "XP", value: "+100", color: GameColors.secondary },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundDark }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBack} style={[styles.backButton, { backgroundColor: colors.surface }]}>
          <Feather name="arrow-left" size={24} color={GameColors.textPrimary} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Daily Challenge</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.heroContainer}
        >
          <View style={styles.calendarBadge}>
            <ThemedText style={styles.calendarDay}>
              {today.getDate()}
            </ThemedText>
            <ThemedText style={styles.calendarMonth}>
              {today.toLocaleDateString("en-US", { month: "short" })}
            </ThemedText>
          </View>

          <ThemedText style={styles.heroTitle}>{dayOfWeek} Challenge</ThemedText>
          <ThemedText style={styles.heroSubtitle}>{dateString}</ThemedText>

          {gameState.dailyChallengeCompleted ? (
            <View style={styles.completedBadge}>
              <Feather name="check-circle" size={20} color={GameColors.correct} />
              <ThemedText style={styles.completedText}>
                Completed Today!
              </ThemedText>
            </View>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <ThemedText style={styles.sectionTitle}>Today's Format</ThemedText>
          <View style={styles.formatCard}>
            <View style={styles.formatRow}>
              <Feather name="help-circle" size={20} color={GameColors.secondary} />
              <ThemedText style={styles.formatText}>10 Questions</ThemedText>
            </View>
            <View style={styles.formatRow}>
              <Feather name="users" size={20} color={GameColors.primary} />
              <ThemedText style={styles.formatText}>All Panels Mixed</ThemedText>
            </View>
            <View style={styles.formatRow}>
              <Feather name="clock" size={20} color={GameColors.accent} />
              <ThemedText style={styles.formatText}>30 Seconds Per Question</ThemedText>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <ThemedText style={styles.sectionTitle}>Rewards</ThemedText>
          <View style={styles.rewardsContainer}>
            {rewards.map((reward, index) => (
              <View key={index} style={styles.rewardCard}>
                <View style={[styles.rewardIcon, { backgroundColor: reward.color + "30" }]}>
                  <Feather name={reward.icon as any} size={20} color={reward.color} />
                </View>
                <ThemedText style={styles.rewardValue}>{reward.value}</ThemedText>
                <ThemedText style={styles.rewardLabel}>{reward.label}</ThemedText>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).springify()}>
          <ThemedText style={styles.sectionTitle}>Your Stats</ThemedText>
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <ThemedText style={styles.statLabel}>Games Played</ThemedText>
              <ThemedText style={styles.statValue}>{totalGamesPlayed}</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statRow}>
              <ThemedText style={styles.statLabel}>High Score</ThemedText>
              <ThemedText style={styles.statValue}>{highScore.toLocaleString()}</ThemedText>
            </View>
          </View>
        </Animated.View>

        {gameState.dailyChallengeCompleted ? (
          <Animated.View
            entering={FadeInUp.delay(500).springify()}
            style={styles.completedContainer}
          >
            <Image
              source={require("../../assets/images/empty-challenges.png")}
              style={styles.completedImage}
              resizeMode="contain"
            />
            <ThemedText style={styles.completedTitle}>
              Great job completing today's challenge!
            </ThemedText>
            <ThemedText style={styles.completedDesc}>
              Come back tomorrow for a new set of questions
            </ThemedText>
          </Animated.View>
        ) : null}
      </ScrollView>

      {!gameState.dailyChallengeCompleted ? (
        <Animated.View
          entering={FadeInUp.delay(500).springify()}
          style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
        >
          <GradientButton onPress={handleStartChallenge} variant="accent">
            Start Challenge
          </GradientButton>
        </Animated.View>
      ) : null}
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GameColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...Typography.h4,
    color: GameColors.textPrimary,
  },
  headerSpacer: {
    width: 44,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
  heroContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  calendarBadge: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    backgroundColor: GameColors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  calendarDay: {
    fontSize: 32,
    fontWeight: "700",
    color: GameColors.backgroundDark,
  },
  calendarMonth: {
    ...Typography.caption,
    color: GameColors.backgroundDark,
    fontWeight: "600",
    marginTop: -4,
  },
  heroTitle: {
    ...Typography.h2,
    color: GameColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    ...Typography.body,
    color: GameColors.textSecondary,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.correct + "20",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.lg,
  },
  completedText: {
    ...Typography.body,
    color: GameColors.correct,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h4,
    color: GameColors.textPrimary,
    marginBottom: Spacing.md,
  },
  formatCard: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  formatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  formatText: {
    ...Typography.body,
    color: GameColors.textPrimary,
    marginLeft: Spacing.md,
  },
  rewardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    marginHorizontal: Spacing.xs,
  },
  rewardIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  rewardValue: {
    ...Typography.h4,
    color: GameColors.textPrimary,
  },
  rewardLabel: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  statsCard: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  statDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: Spacing.xs,
  },
  statLabel: {
    ...Typography.body,
    color: GameColors.textSecondary,
  },
  statValue: {
    ...Typography.h4,
    color: GameColors.textPrimary,
  },
  completedContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  completedImage: {
    width: 120,
    height: 120,
    marginBottom: Spacing.lg,
  },
  completedTitle: {
    ...Typography.h4,
    color: GameColors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  completedDesc: {
    ...Typography.body,
    color: GameColors.textSecondary,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    backgroundColor: GameColors.backgroundDark,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
});
