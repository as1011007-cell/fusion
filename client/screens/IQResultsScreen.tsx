import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, ScrollView, Image, Share, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  runOnJS,
  Easing,
  interpolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GradientButton } from "@/components/GradientButton";
import { AdBanner } from "@/components/AdBanner";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useIQ } from "@/context/IQContext";
import { useTheme } from "@/context/ThemeContext";
import { useProfile } from "@/context/ProfileContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "IQResults">;
type RouteProps = RouteProp<RootStackParamList, "IQResults">;

const IQ_RATINGS = [
  { min: 145, label: "Genius", color: "#A855F7", icon: "star" },
  { min: 130, label: "Very Superior", color: "#EC4899", icon: "award" },
  { min: 115, label: "Superior", color: GameColors.accent, icon: "trending-up" },
  { min: 100, label: "Above Average", color: GameColors.correct, icon: "thumbs-up" },
  { min: 85, label: "Average", color: GameColors.secondary, icon: "target" },
  { min: 70, label: "Below Average", color: GameColors.warning, icon: "activity" },
  { min: 0, label: "Below Average", color: GameColors.warning, icon: "activity" },
];

const CATEGORY_LABELS: Record<string, string> = {
  "logical-reasoning": "Logical Reasoning",
  "pattern-recognition": "Pattern Recognition",
  "verbal-intelligence": "Verbal Intelligence",
  "mathematical-reasoning": "Mathematical",
  "spatial-reasoning": "Spatial Reasoning",
};

const CATEGORY_ICONS: Record<string, string> = {
  "logical-reasoning": "git-branch",
  "pattern-recognition": "grid",
  "verbal-intelligence": "type",
  "mathematical-reasoning": "hash",
  "spatial-reasoning": "box",
};

function getIQRating(iq: number) {
  return IQ_RATINGS.find((r) => iq >= r.min) || IQ_RATINGS[IQ_RATINGS.length - 1];
}

function AnimatedIQNumber({ targetIQ }: { targetIQ: number }) {
  const [displayIQ, setDisplayIQ] = useState(70);
  const animatedValue = useSharedValue(70);
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      200,
      withSequence(
        withSpring(1.15, { damping: 5 }),
        withSpring(1, { damping: 10 })
      )
    );

    animatedValue.value = withDelay(
      400,
      withTiming(targetIQ, {
        duration: 2000,
        easing: Easing.out(Easing.cubic),
      })
    );

    let frame: number;
    const startTime = Date.now() + 400;
    const duration = 2000;
    const startValue = 70;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < 0) {
        frame = requestAnimationFrame(animate);
        return;
      }
      if (elapsed >= duration) {
        setDisplayIQ(targetIQ);
        return;
      }
      const progress = elapsed / duration;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (targetIQ - startValue) * eased);
      setDisplayIQ(current);
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [targetIQ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={styles.iqNumber}>{displayIQ}</ThemedText>
    </Animated.View>
  );
}

function ConfettiParticle({ delay, x }: { delay: number; x: number }) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const colors = [GameColors.primary, GameColors.secondary, GameColors.accent, GameColors.correct];
  const color = colors[Math.floor(Math.random() * colors.length)];

  useEffect(() => {
    const randomX = (Math.random() - 0.5) * 200;
    
    translateY.value = withDelay(
      delay,
      withTiming(500, { duration: 3000, easing: Easing.out(Easing.quad) })
    );
    translateX.value = withDelay(
      delay,
      withTiming(randomX, { duration: 3000, easing: Easing.out(Easing.quad) })
    );
    rotate.value = withDelay(
      delay,
      withTiming(720, { duration: 3000, easing: Easing.linear })
    );
    opacity.value = withDelay(
      delay + 2000,
      withTiming(0, { duration: 1000 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confettiParticle,
        { left: x, backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

function ConfettiEffect() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 500,
    x: Math.random() * 300,
  }));

  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {particles.map((p) => (
        <ConfettiParticle key={p.id} delay={p.delay} x={p.x} />
      ))}
    </View>
  );
}

export default function IQResultsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { resetGame } = useIQ();
  const { currentTheme } = useTheme();
  const { settings } = useProfile();
  const colors = currentTheme.colors;

  const { finalScore, correctCount, avgTime, iqEstimate, totalQuestions, categoryBreakdown } = route.params;

  const rating = getIQRating(iqEstimate);
  const isHighScore = iqEstimate >= 115;

  useEffect(() => {
    if (settings.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const handlePlayAgain = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    resetGame();
    navigation.navigate("IQSetup");
  };

  const handleGoHome = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    resetGame();
    navigation.navigate("Home");
  };

  const handleShare = async () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    try {
      await Share.share({
        message: `I just scored an IQ of ${iqEstimate} (${rating.label}) on Feud Fusion IQ Challenge! 🧠\n\nAccuracy: ${accuracy}%\nScore: ${finalScore} points\n\nThink you can beat me?`,
        title: "My IQ Test Results",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundDark }]}>
      {isHighScore ? <ConfettiEffect /> : null}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + 120 },
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
          style={styles.ratingBadge}
        >
          <View style={[styles.ratingIconContainer, { backgroundColor: rating.color + "20" }]}>
            <Feather name={rating.icon as any} size={24} color={rating.color} />
          </View>
          <ThemedText style={[styles.ratingLabel, { color: rating.color }]}>
            {rating.label}
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(300).springify()}
          style={styles.iqContainer}
        >
          <ThemedText style={styles.iqLabel}>Your Estimated IQ</ThemedText>
          <AnimatedIQNumber targetIQ={iqEstimate} />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(500).springify()}
          style={styles.statsGrid}
        >
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: GameColors.accent + "20" }]}>
              <Feather name="award" size={20} color={GameColors.accent} />
            </View>
            <ThemedText style={styles.statValue}>{finalScore.toLocaleString()}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Score</ThemedText>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: GameColors.correct + "20" }]}>
              <Feather name="check-circle" size={20} color={GameColors.correct} />
            </View>
            <ThemedText style={styles.statValue}>
              {correctCount}/{totalQuestions}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Correct</ThemedText>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: GameColors.secondary + "20" }]}>
              <Feather name="clock" size={20} color={GameColors.secondary} />
            </View>
            <ThemedText style={styles.statValue}>{avgTime}s</ThemedText>
            <ThemedText style={styles.statLabel}>Avg Time</ThemedText>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: GameColors.primary + "20" }]}>
              <Feather name="percent" size={20} color={GameColors.primary} />
            </View>
            <ThemedText style={styles.statValue}>{accuracy}%</ThemedText>
            <ThemedText style={styles.statLabel}>Accuracy</ThemedText>
          </View>
        </Animated.View>

        {categoryBreakdown && Object.keys(categoryBreakdown).length > 0 ? (
          <Animated.View
            entering={FadeInUp.delay(600).springify()}
            style={styles.categorySection}
          >
            <ThemedText style={styles.sectionTitle}>Category Breakdown</ThemedText>
            <View style={styles.categoryGrid}>
              {Object.entries(categoryBreakdown).map(([category, data]: [string, any], index) => {
                const catAccuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                const iconName = CATEGORY_ICONS[category] || "circle";
                return (
                  <Animated.View
                    key={category}
                    entering={FadeInUp.delay(700 + index * 100).springify()}
                    style={styles.categoryCard}
                  >
                    <View style={styles.categoryHeader}>
                      <Feather name={iconName as any} size={16} color={GameColors.secondary} />
                      <ThemedText style={styles.categoryName}>
                        {CATEGORY_LABELS[category] || category}
                      </ThemedText>
                    </View>
                    <View style={styles.categoryStats}>
                      <ThemedText style={styles.categoryAccuracy}>{catAccuracy}%</ThemedText>
                      <ThemedText style={styles.categoryCount}>
                        {data.correct}/{data.total}
                      </ThemedText>
                    </View>
                    <View style={styles.categoryProgressBar}>
                      <View
                        style={[
                          styles.categoryProgressFill,
                          {
                            width: `${catAccuracy}%`,
                            backgroundColor:
                              catAccuracy >= 80
                                ? GameColors.correct
                                : catAccuracy >= 50
                                ? GameColors.warning
                                : GameColors.wrong,
                          },
                        ]}
                      />
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        ) : null}

        <Animated.View
          entering={FadeInUp.delay(800).springify()}
          style={styles.messageCard}
        >
          <ThemedText style={styles.messageText}>
            {iqEstimate >= 145
              ? "Exceptional! Your cognitive abilities are truly outstanding!"
              : iqEstimate >= 130
              ? "Brilliant performance! You have superior cognitive skills!"
              : iqEstimate >= 115
              ? "Great job! You demonstrated above-average intelligence!"
              : iqEstimate >= 100
              ? "Well done! Your score shows solid cognitive abilities!"
              : iqEstimate >= 85
              ? "Good effort! Keep practicing to improve your skills!"
              : "Keep challenging yourself! Practice makes perfect!"}
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(850).springify()}>
          <AdBanner />
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.delay(900).springify()}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <View style={styles.footerButtons}>
          <GradientButton onPress={handleShare} variant="accent" size="medium" style={styles.shareButton}>
            <View style={styles.buttonContent}>
              <Feather name="share-2" size={18} color={GameColors.textPrimary} />
              <ThemedText style={styles.buttonText}>Share</ThemedText>
            </View>
          </GradientButton>
        </View>
        <GradientButton onPress={handlePlayAgain} variant="primary">
          Play Again
        </GradientButton>
        <GradientButton onPress={handleGoHome} variant="secondary">
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
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
  },
  ratingBadge: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  ratingIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  ratingLabel: {
    ...Typography.h3,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  iqContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
    overflow: "visible",
    paddingVertical: Spacing.md,
  },
  iqLabel: {
    ...Typography.body,
    color: GameColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  iqNumber: {
    fontSize: 96,
    fontWeight: "800",
    color: GameColors.textPrimary,
    textShadowColor: GameColors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    includeFontPadding: false,
    lineHeight: 110,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: "center",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.h4,
    color: GameColors.textPrimary,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  categorySection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h4,
    color: GameColors.textPrimary,
    marginBottom: Spacing.md,
  },
  categoryGrid: {
    gap: Spacing.sm,
  },
  categoryCard: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  categoryName: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "600",
    flex: 1,
  },
  categoryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  categoryAccuracy: {
    ...Typography.h4,
    color: GameColors.accent,
    fontWeight: "700",
  },
  categoryCount: {
    ...Typography.body,
    color: GameColors.textSecondary,
  },
  categoryProgressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  categoryProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  messageCard: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: GameColors.secondary,
  },
  messageText: {
    ...Typography.body,
    color: GameColors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: GameColors.backgroundDark + "F5",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  footerButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  shareButton: {
    flex: 1,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  buttonText: {
    ...Typography.button,
    color: GameColors.textPrimary,
  },
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    overflow: "hidden",
    zIndex: 10,
  },
  confettiParticle: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
