import React, { useEffect } from "react";
import { StyleSheet, View, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GradientButton } from "@/components/GradientButton";
import { FloatingBubbles } from "@/components/FloatingBubbles";
import { AdBanner } from "@/components/AdBanner";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useGame } from "@/context/GameContext";
import { useTheme } from "@/context/ThemeContext";
import { useProfile } from "@/context/ProfileContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { totalCoins, gameState, setStarPointsCallback } = useGame();
  const { currentTheme, starPoints, addStarPoints } = useTheme();
  const { settings, currentProfile } = useProfile();
  const colors = currentTheme.colors;

  const profileScale = useSharedValue(1);
  const logoScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    setStarPointsCallback(addStarPoints);
    return () => setStarPointsCallback(null);
  }, [addStarPoints, setStarPointsCallback]);

  useEffect(() => {
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const profileStyle = useAnimatedStyle(() => ({
    transform: [{ scale: profileScale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleProfilePress = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("Profile");
  };

  const handlePlay = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.navigate("GameSetup");
  };

  const handlePartyMode = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("PartySetup");
  };

  const handleDailyChallenge = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("DailyChallenge");
  };

  const handleShop = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("Shop");
  };

  const handleMultiplayer = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("MultiplayerLobby");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundDark }]}>
      <FloatingBubbles />

      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <AnimatedPressable
          onPress={handleProfilePress}
          onPressIn={() => {
            profileScale.value = withSpring(0.9);
          }}
          onPressOut={() => {
            profileScale.value = withSpring(1);
          }}
          style={[styles.profileButton, profileStyle]}
          accessibilityLabel="Open your profile"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={[GameColors.primary + "40", GameColors.secondary + "40"]}
            style={styles.profileGradient}
          >
            <Feather name="user" size={20} color={GameColors.textPrimary} />
          </LinearGradient>
        </AnimatedPressable>

        <View style={styles.currencyContainer}>
          <Pressable onPress={handleShop} style={styles.currencyBadge}>
            <Feather name="star" size={16} color={GameColors.secondary} />
            <ThemedText style={styles.currencyText}>{starPoints}</ThemedText>
          </Pressable>
          <Pressable onPress={handleShop} style={styles.currencyBadge}>
            <Feather name="disc" size={16} color={GameColors.accent} />
            <ThemedText style={[styles.currencyText, { color: GameColors.accent }]}>{totalCoins}</ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.logoWrapper}>
          <Animated.View style={[styles.logoGlow, glowStyle]} />
          <Animated.Image
            source={require("../../assets/images/icon.png")}
            style={[styles.logo, logoStyle]}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400).springify()}
          style={styles.titleContainer}
        >
          <View style={styles.titleRow}>
            <ThemedText style={styles.title}>FEUD</ThemedText>
            <ThemedText style={styles.titleAccent}>FUSION</ThemedText>
          </View>
          <ThemedText style={styles.subtitle}>What Would They Say?</ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(600).springify()}
          style={styles.buttonsContainer}
        >
          <Pressable onPress={handlePlay} style={styles.playButtonWrapper}>
            <LinearGradient
              colors={[GameColors.primary, "#FF1493", GameColors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playButton}
            >
              <Feather name="play" size={24} color="#fff" style={styles.playIcon} />
              <ThemedText style={styles.playButtonText}>PLAY NOW</ThemedText>
            </LinearGradient>
          </Pressable>

          <View style={styles.secondaryButtons}>
            <Pressable
              style={styles.secondaryButton}
              onPress={handlePartyMode}
            >
              <View style={[styles.secondaryButtonInner, { borderLeftColor: GameColors.secondary }]}>
                <View style={[styles.secondaryButtonIcon, { backgroundColor: GameColors.secondary + "30" }]}>
                  <Feather name="users" size={22} color={GameColors.secondary} />
                </View>
                <View style={styles.secondaryButtonContent}>
                  <ThemedText style={styles.secondaryButtonText}>Party Mode</ThemedText>
                  <ThemedText style={styles.secondaryButtonDesc}>Play with friends</ThemedText>
                </View>
                <Feather name="chevron-right" size={20} color={GameColors.secondary} />
              </View>
            </Pressable>

            <Pressable
              style={[
                styles.secondaryButton,
                gameState.dailyChallengeCompleted && styles.completedButton,
              ]}
              onPress={handleDailyChallenge}
            >
              <View style={[styles.secondaryButtonInner, { borderLeftColor: GameColors.accent }]}>
                <View style={[styles.secondaryButtonIcon, { backgroundColor: GameColors.accent + "30" }]}>
                  <Feather name="zap" size={22} color={GameColors.accent} />
                </View>
                <View style={styles.secondaryButtonContent}>
                  <ThemedText style={styles.secondaryButtonText}>Daily Challenge</ThemedText>
                  <ThemedText style={styles.secondaryButtonDesc}>
                    {gameState.dailyChallengeCompleted ? "Completed!" : "Win bonus rewards"}
                  </ThemedText>
                </View>
                {gameState.dailyChallengeCompleted ? (
                  <Feather name="check-circle" size={20} color={GameColors.correct} />
                ) : (
                  <View style={styles.liveBadge}>
                    <ThemedText style={styles.liveBadgeText}>LIVE</ThemedText>
                  </View>
                )}
              </View>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={handleMultiplayer}
            >
              <View style={[styles.secondaryButtonInner, { borderLeftColor: GameColors.primary }]}>
                <View style={[styles.secondaryButtonIcon, { backgroundColor: GameColors.primary + "30" }]}>
                  <Feather name="globe" size={22} color={GameColors.primary} />
                </View>
                <View style={styles.secondaryButtonContent}>
                  <ThemedText style={styles.secondaryButtonText}>Multiplayer</ThemedText>
                  <ThemedText style={styles.secondaryButtonDesc}>Play across devices</ThemedText>
                </View>
                <Feather name="chevron-right" size={20} color={GameColors.primary} />
              </View>
            </Pressable>
          </View>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(800).springify()}>
        <AdBanner />
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(900).springify()}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}
      >
        <ThemedText style={styles.footerText}>
          Think from their perspective, not yours
        </ThemedText>
      </Animated.View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    zIndex: 10,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  profileGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: GameColors.primary + "50",
  },
  currencyContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  currencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  currencyText: {
    ...Typography.body,
    color: GameColors.secondary,
    fontWeight: "700",
    fontSize: 14,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  logoWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  logoGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: GameColors.primary,
    shadowColor: GameColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    ...Typography.h1,
    fontSize: 42,
    color: GameColors.textPrimary,
    letterSpacing: 4,
    fontWeight: "800",
  },
  titleAccent: {
    ...Typography.h1,
    fontSize: 42,
    color: GameColors.primary,
    letterSpacing: 4,
    fontWeight: "800",
  },
  subtitle: {
    ...Typography.body,
    color: GameColors.textSecondary,
    marginTop: Spacing.sm,
    fontSize: 16,
    letterSpacing: 1,
  },
  buttonsContainer: {
    width: "100%",
    maxWidth: 340,
  },
  playButtonWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    shadowColor: GameColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg + 4,
    borderRadius: BorderRadius.lg,
  },
  playIcon: {
    marginRight: Spacing.sm,
  },
  playButtonText: {
    ...Typography.h2,
    color: "#fff",
    fontWeight: "800",
    fontSize: 20,
    letterSpacing: 2,
  },
  secondaryButtons: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  secondaryButton: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  completedButton: {
    opacity: 0.7,
  },
  secondaryButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: GameColors.surface,
    borderLeftWidth: 4,
  },
  secondaryButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    marginRight: Spacing.md,
  },
  secondaryButtonContent: {
    flex: 1,
  },
  secondaryButtonText: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButtonDesc: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    marginTop: 2,
  },
  liveBadge: {
    backgroundColor: GameColors.wrong,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  liveBadgeText: {
    ...Typography.caption,
    color: "#fff",
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 1,
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  footerText: {
    ...Typography.small,
    color: GameColors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    opacity: 0.7,
  },
});
