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
import { FeudFusionBrand } from "@/components/FeudFusionBrand";
import { GradientButton } from "@/components/GradientButton";
import { AdBanner } from "@/components/AdBanner";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useGame } from "@/context/GameContext";
import { useTheme } from "@/context/ThemeContext";
import { useProfile } from "@/context/ProfileContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Results">;

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { gameState, resetGame, totalCoins } = useGame();
  const { currentTheme } = useTheme();
  const { settings } = useProfile();
  const colors = currentTheme.colors;

  const scoreScale = useSharedValue(0);

  useEffect(() => {
    if (settings.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
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
    if (gameState.mode === "party") {
      navigation.navigate("PartySetup");
    } else {
      navigation.navigate("GameSetup");
    }
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
  const isPartyMode = gameState.mode === "party";
  const redWins = gameState.redScore > gameState.blueScore;
  const isTie = gameState.redScore === gameState.blueScore;

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundDark }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing["2xl"] },
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

        {isPartyMode ? (
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            style={styles.partyResultContainer}
          >
            {isTie ? (
              <View style={styles.tieContainer}>
                <ThemedText style={styles.tieText}>It's a Tie!</ThemedText>
                <ThemedText style={styles.tieScore}>
                  {gameState.redScore} - {gameState.blueScore}
                </ThemedText>
              </View>
            ) : (
              <View style={styles.winnerContainer}>
                <View
                  style={[
                    styles.winnerBadge,
                    { backgroundColor: redWins ? "#FF444440" : "#4444FF40" },
                  ]}
                >
                  <Feather
                    name="award"
                    size={40}
                    color={redWins ? "#FF4444" : "#4444FF"}
                  />
                </View>
                <ThemedText
                  style={[
                    styles.winnerText,
                    { color: redWins ? "#FF4444" : "#4444FF" },
                  ]}
                >
                  {redWins ? "Red Team" : "Blue Team"} Wins!
                </ThemedText>
              </View>
            )}

            <View style={styles.teamScoresContainer}>
              <View style={[styles.teamScoreCard, { borderColor: "#FF4444" }]}>
                <ThemedText style={[styles.teamLabel, { color: "#FF4444" }]}>
                  Red Team
                </ThemedText>
                <ThemedText style={styles.teamFinalScore}>
                  {gameState.redScore}
                </ThemedText>
                {redWins && !isTie ? (
                  <View style={styles.crownBadge}>
                    <Feather name="award" size={16} color={GameColors.accent} />
                  </View>
                ) : null}
              </View>

              <View style={styles.vsContainer}>
                <ThemedText style={styles.vsText}>VS</ThemedText>
              </View>

              <View style={[styles.teamScoreCard, { borderColor: "#4444FF" }]}>
                <ThemedText style={[styles.teamLabel, { color: "#4444FF" }]}>
                  Blue Team
                </ThemedText>
                <ThemedText style={styles.teamFinalScore}>
                  {gameState.blueScore}
                </ThemedText>
                {!redWins && !isTie ? (
                  <View style={styles.crownBadge}>
                    <Feather name="award" size={16} color={GameColors.accent} />
                  </View>
                ) : null}
              </View>
            </View>

            {gameState.partyPlayers.length > 0 ? (
              <Animated.View
                entering={FadeInUp.delay(400).springify()}
                style={styles.playersSection}
              >
                <ThemedText style={styles.playersSectionTitle}>Players</ThemedText>
                <View style={styles.playersGrid}>
                  {gameState.partyPlayers.map((player) => (
                    <View
                      key={player.id}
                      style={[
                        styles.playerResultCard,
                        {
                          borderLeftColor:
                            player.team === "red" ? "#FF4444" : "#4444FF",
                        },
                      ]}
                    >
                      <ThemedText style={styles.playerResultName}>
                        {player.name}
                      </ThemedText>
                      <ThemedText style={styles.playerResultRole}>
                        {player.role.charAt(0).toUpperCase() + player.role.slice(1)}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </Animated.View>
            ) : null}
          </Animated.View>
        ) : (
          <>
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
          </>
        )}

        <Animated.View
          entering={FadeInUp.delay(isPartyMode ? 500 : 400).springify()}
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
            <ThemedText style={styles.statLabel}>Coins</ThemedText>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: GameColors.primary + "20" }]}>
              <Feather name="zap" size={20} color={GameColors.primary} />
            </View>
            <ThemedText style={styles.statValue}>{gameState.bestStreak}</ThemedText>
            <ThemedText style={styles.statLabel}>Best Streak</ThemedText>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(isPartyMode ? 600 : 500).springify()}
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
          entering={FadeInUp.delay(isPartyMode ? 700 : 600).springify()}
          style={styles.messageContainer}
        >
          <ThemedText style={styles.message}>
            {isPartyMode
              ? isTie
                ? "What a close game! Try again to break the tie!"
                : `Great game everyone! ${redWins ? "Red Team" : "Blue Team"} dominated!`
              : gradeInfo.grade === "S"
              ? "Mind reader! You truly understand the people!"
              : gradeInfo.grade === "A"
              ? "Impressive! You've got great perspective!"
              : gradeInfo.grade === "B"
              ? "Good job! Keep practicing those perspectives!"
              : "Keep trying! Understanding others takes practice!"}
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(isPartyMode ? 750 : 650).springify()}>
          <AdBanner />
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.delay(isPartyMode ? 800 : 700).springify()}
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
  brandContainer: {
    alignItems: "center",
    marginBottom: Spacing.md,
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
    width: "100%",
    paddingHorizontal: Spacing.lg,
  },
  scoreLabel: {
    ...Typography.body,
    color: GameColors.textSecondary,
    marginBottom: Spacing.sm,
    fontSize: 16,
  },
  score: {
    fontSize: 56,
    fontWeight: "700",
    color: GameColors.textPrimary,
    fontFamily: Typography.h1.fontFamily,
    textAlign: "center",
  },
  partyResultContainer: {
    width: "100%",
    marginBottom: Spacing.xl,
  },
  winnerContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  winnerBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  winnerText: {
    ...Typography.h2,
    fontWeight: "700",
  },
  tieContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  tieText: {
    ...Typography.h2,
    color: GameColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  tieScore: {
    ...Typography.h1,
    color: GameColors.textSecondary,
  },
  teamScoresContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  teamScoreCard: {
    flex: 1,
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    borderWidth: 2,
    position: "relative",
  },
  teamLabel: {
    ...Typography.body,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  teamFinalScore: {
    ...Typography.h1,
    fontSize: 36,
    color: GameColors.textPrimary,
  },
  crownBadge: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GameColors.accent + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  vsContainer: {
    paddingHorizontal: Spacing.md,
  },
  vsText: {
    ...Typography.body,
    color: GameColors.textSecondary,
    fontWeight: "700",
  },
  playersSection: {
    width: "100%",
  },
  playersSectionTitle: {
    ...Typography.h4,
    color: GameColors.textPrimary,
    marginBottom: Spacing.md,
  },
  playersGrid: {
    gap: Spacing.sm,
  },
  playerResultCard: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  playerResultName: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "600",
  },
  playerResultRole: {
    ...Typography.caption,
    color: GameColors.textSecondary,
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
