import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GradientButton } from "@/components/GradientButton";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useGame } from "@/context/GameContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Results">;

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { gameState, resetGame, totalCoins } = useGame();

  const scoreScale = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    scoreScale.value = withDelay(
      300,
      withSequence(
        withSpring(1.2, { damping: 5 }),
        withSpring(1, { damping: 10 })
      )
    );
  }, []);

  const scoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const handlePlayAgain = () => {
    resetGame();
    navigation.navigate("GameSetup");
  };

  const handleGoHome = () => {
    resetGame();
    navigation.navigate("Home");
  };

  const getGrade = () => {
    const percentage = (gameState.score / (gameState.totalRounds * 300)) * 100;
    if (percentage >= 80) return { grade: "S", color: GameColors.accent };
    if (percentage >= 60) return { grade: "A", color: GameColors.correct };
    if (percentage >= 40) return { grade: "B", color: GameColors.secondary };
    if (percentage >= 20) return { grade: "C", color: GameColors.warning };
    return { grade: "D", color: GameColors.wrong };
  };

  const gradeInfo = getGrade();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing["3xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.logoContainer}
        >
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(200).springify()}
          style={styles.gradeContainer}
        >
          <View
            style={[
              styles.gradeBadge,
              { backgroundColor: gradeInfo.color + "20" },
            ]}
          >
            <ThemedText style={[styles.grade, { color: gradeInfo.color }]}>
              {gradeInfo.grade}
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View style={[styles.scoreContainer, scoreStyle]}>
          <ThemedText style={styles.scoreLabel}>Final Score</ThemedText>
          <ThemedText style={styles.score}>
            {gameState.score.toLocaleString()}
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400).springify()}
          style={styles.statsContainer}
        >
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: GameColors.secondary + "20" }]}>
              <Feather name="target" size={20} color={GameColors.secondary} />
            </View>
            <ThemedText style={styles.statValue}>
              {gameState.totalRounds}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Rounds</ThemedText>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: GameColors.accent + "20" }]}>
              <Feather name="star" size={20} color={GameColors.accent} />
            </View>
            <ThemedText style={styles.statValue}>
              +{Math.floor(gameState.score / 10)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Coins Earned</ThemedText>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: GameColors.primary + "20" }]}>
              <Feather name="zap" size={20} color={GameColors.primary} />
            </View>
            <ThemedText style={styles.statValue}>{gameState.streak}</ThemedText>
            <ThemedText style={styles.statLabel}>Best Streak</ThemedText>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(500).springify()}
          style={styles.coinsCard}
        >
          <View style={styles.coinsContent}>
            <Feather name="star" size={24} color={GameColors.accent} />
            <View style={styles.coinsText}>
              <ThemedText style={styles.totalCoinsLabel}>Total Coins</ThemedText>
              <ThemedText style={styles.totalCoins}>{totalCoins}</ThemedText>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(600).springify()}
          style={styles.messageContainer}
        >
          <ThemedText style={styles.message}>
            {gradeInfo.grade === "S"
              ? "Mind reader! You truly understand the people!"
              : gradeInfo.grade === "A"
              ? "Impressive! You've got great perspective!"
              : gradeInfo.grade === "B"
              ? "Good job! Keep practicing those perspectives!"
              : "Keep trying! Understanding others takes practice!"}
          </ThemedText>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.delay(700).springify()}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <GradientButton onPress={handlePlayAgain} variant="primary">
          Play Again
        </GradientButton>

        <GradientButton
          onPress={handleGoHome}
          variant="secondary"
          style={styles.homeButton}
        >
          Home
        </GradientButton>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.backgroundDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing["3xl"],
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
  },
  gradeContainer: {
    marginBottom: Spacing.lg,
  },
  gradeBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  grade: {
    fontSize: 56,
    fontWeight: "700",
    fontFamily: Typography.h1.fontFamily,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  scoreLabel: {
    ...Typography.body,
    color: GameColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  score: {
    fontSize: 48,
    fontWeight: "700",
    color: GameColors.textPrimary,
    fontFamily: Typography.h1.fontFamily,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    marginHorizontal: Spacing.xs,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.h4,
    color: GameColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    textAlign: "center",
  },
  coinsCard: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: "100%",
    marginBottom: Spacing.xl,
  },
  coinsContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinsText: {
    marginLeft: Spacing.md,
  },
  totalCoinsLabel: {
    ...Typography.small,
    color: GameColors.textSecondary,
  },
  totalCoins: {
    ...Typography.h3,
    color: GameColors.accent,
  },
  messageContainer: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: "100%",
  },
  message: {
    ...Typography.body,
    color: GameColors.textPrimary,
    textAlign: "center",
    fontStyle: "italic",
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    backgroundColor: GameColors.backgroundDark,
  },
  homeButton: {
    marginTop: Spacing.md,
  },
});
