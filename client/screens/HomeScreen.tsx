import React, { useEffect } from "react";
import { StyleSheet, View, Image, Pressable, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
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
import { FloatingBubbles } from "@/components/FloatingBubbles";
import { AdBanner } from "@/components/AdBanner";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useGame } from "@/context/GameContext";
import { useTheme, ThemeId } from "@/context/ThemeContext";
import { useProfile } from "@/context/ProfileContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const themeConfig = {
  electric: {
    playButtonStyle: "angular",
    secondaryStyle: "neon-border",
    tagline: "Think from their perspective",
    playText: "PLAY NOW",
    decoration: "lightning",
  },
  sunset: {
    playButtonStyle: "rounded-glow",
    secondaryStyle: "warm-cards",
    tagline: "Feel the heat of competition",
    playText: "START GAME",
    decoration: "sun-rays",
  },
  ocean: {
    playButtonStyle: "wave-pill",
    secondaryStyle: "floating-bubbles",
    tagline: "Dive into perspectives",
    playText: "DIVE IN",
    decoration: "waves",
  },
  forest: {
    playButtonStyle: "organic-leaf",
    secondaryStyle: "earth-tiles",
    tagline: "Grow your understanding",
    playText: "EXPLORE",
    decoration: "leaves",
  },
  galaxy: {
    playButtonStyle: "cosmic-diamond",
    secondaryStyle: "star-cards",
    tagline: "Explore infinite perspectives",
    playText: "LAUNCH",
    decoration: "stars",
  },
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { totalCoins, gameState, setStarPointsCallback } = useGame();
  const { currentTheme, starPoints, addStarPoints } = useTheme();
  const { settings } = useProfile();
  const colors = currentTheme.colors;
  const themeId = currentTheme.id as ThemeId;
  const config = themeConfig[themeId];

  const profileScale = useSharedValue(1);
  const logoScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);
  const decorationRotate = useSharedValue(0);

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
    decorationRotate.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
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

  const decorationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${decorationRotate.value}deg` }],
  }));

  const handleProfilePress = () => {
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Profile");
  };

  const handlePlay = () => {
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("GameSetup");
  };

  const handlePartyMode = () => {
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("PartySetup");
  };

  const handleDailyChallenge = () => {
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("DailyChallenge");
  };

  const handleShop = () => {
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Shop");
  };

  const handleMultiplayer = () => {
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("MultiplayerLobby");
  };

  const renderPlayButton = () => {
    const buttonStyles: Record<string, any> = {
      "angular": {
        borderRadius: 4,
        borderWidth: 2,
        borderColor: colors.secondary,
        transform: [{ skewX: "-5deg" }],
      },
      "rounded-glow": {
        borderRadius: 30,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
      },
      "wave-pill": {
        borderRadius: 50,
        borderWidth: 3,
        borderColor: colors.accent,
      },
      "organic-leaf": {
        borderRadius: 24,
        borderTopLeftRadius: 40,
        borderBottomRightRadius: 40,
      },
      "cosmic-diamond": {
        borderRadius: 16,
        borderWidth: 2,
        borderColor: colors.accent + "80",
        transform: [{ rotate: "0deg" }],
      },
    };

    const gradientColors: Record<ThemeId, [string, string, string]> = {
      electric: [colors.primary, "#FF1493", colors.secondary],
      sunset: [colors.primary, colors.accent, "#FF8C00"],
      ocean: [colors.primary, colors.secondary, colors.accent],
      forest: [colors.primary, "#2ED573", colors.secondary],
      galaxy: [colors.primary, colors.secondary, "#FFA502"],
    };

    return (
      <Pressable onPress={handlePlay} style={styles.playButtonWrapper}>
        <LinearGradient
          colors={gradientColors[themeId]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.playButton, buttonStyles[config.playButtonStyle]]}
        >
          <Feather 
            name={themeId === "galaxy" ? "send" : themeId === "ocean" ? "anchor" : themeId === "forest" ? "compass" : "play"} 
            size={24} 
            color="#fff" 
            style={styles.playIcon} 
          />
          <ThemedText style={styles.playButtonText}>{config.playText}</ThemedText>
        </LinearGradient>
      </Pressable>
    );
  };

  const renderSecondaryButton = (
    icon: string,
    title: string,
    desc: string,
    onPress: () => void,
    color: string,
    isCompleted?: boolean,
    showLive?: boolean,
    delay: number = 0
  ) => {
    const cardStyles: Record<string, any> = {
      "neon-border": {
        borderWidth: 1,
        borderColor: color + "60",
        borderLeftWidth: 4,
        borderLeftColor: color,
        backgroundColor: colors.surface,
      },
      "warm-cards": {
        backgroundColor: colors.surface,
        borderRadius: 20,
        borderWidth: 0,
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      "floating-bubbles": {
        backgroundColor: colors.surface + "CC",
        borderRadius: 24,
        borderWidth: 2,
        borderColor: color + "40",
      },
      "earth-tiles": {
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderTopLeftRadius: 24,
        borderWidth: 0,
        borderLeftWidth: 5,
        borderLeftColor: color,
      },
      "star-cards": {
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.accent + "30",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
    };

    const iconBgStyles: Record<string, any> = {
      "neon-border": { backgroundColor: color + "20", borderRadius: 8 },
      "warm-cards": { backgroundColor: color + "30", borderRadius: 16 },
      "floating-bubbles": { backgroundColor: color + "25", borderRadius: 20 },
      "earth-tiles": { backgroundColor: color + "20", borderRadius: 8, borderTopLeftRadius: 16 },
      "star-cards": { backgroundColor: color + "25", borderRadius: 12, transform: [{ rotate: "45deg" }] },
    };

    return (
      <Animated.View entering={FadeInUp.delay(delay).springify()}>
        <Pressable
          style={[styles.secondaryButton, isCompleted && styles.completedButton]}
          onPress={onPress}
        >
          <View style={[styles.secondaryButtonInner, cardStyles[config.secondaryStyle]]}>
            <View style={[styles.secondaryButtonIcon, iconBgStyles[config.secondaryStyle]]}>
              <Feather 
                name={icon as any} 
                size={22} 
                color={color} 
                style={config.secondaryStyle === "star-cards" ? { transform: [{ rotate: "-45deg" }] } : undefined}
              />
            </View>
            <View style={styles.secondaryButtonContent}>
              <ThemedText style={[styles.secondaryButtonText, { color: colors.primary === "#FF006E" ? GameColors.textPrimary : colors.primary }]}>
                {title}
              </ThemedText>
              <ThemedText style={styles.secondaryButtonDesc}>{desc}</ThemedText>
            </View>
            {isCompleted ? (
              <Feather name="check-circle" size={20} color={colors.correct} />
            ) : showLive ? (
              <View style={[styles.liveBadge, { backgroundColor: colors.wrong }]}>
                <ThemedText style={styles.liveBadgeText}>LIVE</ThemedText>
              </View>
            ) : (
              <Feather name="chevron-right" size={20} color={color} />
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  const renderDecoration = () => {
    const decorations: Record<string, React.ReactNode> = {
      lightning: (
        <Animated.View style={[styles.decorationContainer, decorationStyle]}>
          {[...Array(6)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.decorationLine,
                {
                  backgroundColor: colors.secondary + "30",
                  transform: [{ rotate: `${i * 60}deg` }],
                },
              ]}
            />
          ))}
        </Animated.View>
      ),
      "sun-rays": (
        <Animated.View style={[styles.decorationContainer, decorationStyle]}>
          {[...Array(12)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.sunRay,
                {
                  backgroundColor: colors.accent + "20",
                  transform: [{ rotate: `${i * 30}deg` }, { translateY: -60 }],
                },
              ]}
            />
          ))}
        </Animated.View>
      ),
      waves: (
        <View style={styles.wavesContainer}>
          {[...Array(3)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.wave,
                {
                  borderColor: colors.secondary + (30 - i * 10).toString(),
                  bottom: i * 15,
                  width: SCREEN_WIDTH - i * 40,
                },
              ]}
            />
          ))}
        </View>
      ),
      leaves: (
        <View style={styles.leavesContainer}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.leaf,
                {
                  backgroundColor: colors.primary + "15",
                  left: i % 2 === 0 ? -30 : undefined,
                  right: i % 2 === 1 ? -30 : undefined,
                  top: 100 + i * 150,
                  transform: [{ rotate: i % 2 === 0 ? "-30deg" : "30deg" }],
                },
              ]}
            />
          ))}
        </View>
      ),
      stars: (
        <View style={styles.starsContainer}>
          {[...Array(20)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.star,
                {
                  backgroundColor: [colors.primary, colors.secondary, colors.accent][i % 3],
                  left: Math.random() * SCREEN_WIDTH,
                  top: Math.random() * 600,
                  width: 2 + Math.random() * 4,
                  height: 2 + Math.random() * 4,
                },
              ]}
            />
          ))}
        </View>
      ),
    };
    return decorations[config.decoration] || null;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundDark }]}>
      {renderDecoration()}
      <FloatingBubbles />

      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <AnimatedPressable
          onPress={handleProfilePress}
          onPressIn={() => { profileScale.value = withSpring(0.9); }}
          onPressOut={() => { profileScale.value = withSpring(1); }}
          style={[styles.profileButton, profileStyle]}
        >
          <LinearGradient
            colors={[colors.primary + "40", colors.secondary + "40"]}
            style={[styles.profileGradient, { borderColor: colors.primary + "50" }]}
          >
            <Feather name="user" size={20} color={GameColors.textPrimary} />
          </LinearGradient>
        </AnimatedPressable>

        <View style={styles.currencyContainer}>
          <Pressable onPress={handleShop} style={[styles.currencyBadge, { backgroundColor: colors.surface }]}>
            <Feather name="star" size={16} color={colors.secondary} />
            <ThemedText style={[styles.currencyText, { color: colors.secondary }]}>{starPoints}</ThemedText>
          </Pressable>
          <Pressable onPress={handleShop} style={[styles.currencyBadge, { backgroundColor: colors.surface }]}>
            <Feather name="disc" size={16} color={colors.accent} />
            <ThemedText style={[styles.currencyText, { color: colors.accent }]}>{totalCoins}</ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.logoWrapper}>
          <Animated.View style={[styles.logoGlow, glowStyle, { backgroundColor: colors.primary, shadowColor: colors.primary }]} />
          <Animated.Image
            source={require("../../assets/images/icon.png")}
            style={[styles.logo, logoStyle]}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.title} adjustsFontSizeToFit numberOfLines={1}>
              FEUD
            </ThemedText>
            <ThemedText style={[styles.titleAccent, { color: colors.primary, textShadowColor: colors.primary }]} adjustsFontSizeToFit numberOfLines={1}>
              FUSION
            </ThemedText>
          </View>
          <ThemedText style={styles.subtitle}>{config.tagline}</ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.buttonsContainer}>
          {renderPlayButton()}

          <View style={styles.secondaryButtons}>
            {renderSecondaryButton("users", "Party Mode", "Play with friends", handlePartyMode, colors.secondary, false, false, 650)}
            {renderSecondaryButton(
              "zap",
              "Daily Challenge",
              gameState.dailyChallengeCompleted ? "Completed!" : "Win bonus rewards",
              handleDailyChallenge,
              colors.accent,
              gameState.dailyChallengeCompleted,
              !gameState.dailyChallengeCompleted,
              700
            )}
            {renderSecondaryButton("globe", "Multiplayer", "Play across devices", handleMultiplayer, colors.primary, false, false, 750)}
          </View>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(800).springify()}>
        <AdBanner />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(900).springify()} style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <ThemedText style={styles.footerText}>What Would They Say?</ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  currencyContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  currencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  currencyText: {
    ...Typography.body,
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
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: 3,
    paddingHorizontal: Spacing.md,
    flexWrap: "nowrap",
  },
  title: {
    ...Typography.h1,
    fontSize: 42,
    color: GameColors.textPrimary,
    letterSpacing: 4,
    fontWeight: "900",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    flexShrink: 1,
  },
  titleAccent: {
    ...Typography.h1,
    fontSize: 42,
    letterSpacing: 4,
    fontWeight: "900",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    flexShrink: 1,
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
    elevation: 8,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg + 4,
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
  },
  secondaryButtonIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  secondaryButtonContent: {
    flex: 1,
  },
  secondaryButtonText: {
    ...Typography.body,
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButtonDesc: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    marginTop: 2,
  },
  liveBadge: {
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
  decorationContainer: {
    position: "absolute",
    width: 200,
    height: 200,
    top: 120,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.3,
  },
  decorationLine: {
    position: "absolute",
    width: 2,
    height: 80,
  },
  sunRay: {
    position: "absolute",
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  wavesContainer: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center",
    opacity: 0.2,
  },
  wave: {
    position: "absolute",
    height: 60,
    borderWidth: 2,
    borderRadius: 100,
    borderBottomWidth: 0,
  },
  leavesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  leaf: {
    position: "absolute",
    width: 80,
    height: 120,
    borderRadius: 60,
    borderTopLeftRadius: 0,
  },
  starsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: "absolute",
    borderRadius: 10,
    opacity: 0.5,
  },
});
