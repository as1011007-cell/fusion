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
  const { totalCoins, gameState, setStarPointsCallback, setXPCallback } = useGame();
  const { currentTheme, starPoints, addStarPoints } = useTheme();
  const { settings, addExperience } = useProfile();
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
    setXPCallback(addExperience);
    return () => setXPCallback(() => {});
  }, [addExperience, setXPCallback]);

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

  const handleIQMultiplayer = () => {
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("IQMultiplayerLobby", { difficulty: "all", category: "all", questionCount: 20 });
  };

  const handleIQTest = () => {
    if (settings.hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("IQSetup");
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
      <Pressable 
        onPress={handlePlay} 
        style={styles.primaryButtonWrapper}
        accessibilityLabel={`Play FEUD Fusion - ${config.playText}`}
        accessibilityHint="Start a new solo game"
        accessibilityRole="button"
      >
        <LinearGradient
          colors={gradientColors[themeId]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.playButton, buttonStyles[config.playButtonStyle]]}
        >
          <Feather 
            name={themeId === "galaxy" ? "send" : themeId === "ocean" ? "anchor" : themeId === "forest" ? "compass" : "play"} 
            size={22} 
            color="#fff" 
            style={styles.playIcon} 
          />
          <ThemedText style={styles.primaryButtonText}>{config.playText}</ThemedText>
        </LinearGradient>
      </Pressable>
    );
  };

  const renderIQButton = () => {
    return (
      <Pressable 
        onPress={handleIQTest} 
        style={styles.primaryButtonWrapper}
        accessibilityLabel="IQ Test"
        accessibilityHint="Start an IQ test challenge"
        accessibilityRole="button"
      >
        <LinearGradient
          colors={["#9B59B6", "#8E44AD", "#7D3C98"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.playButton, { borderRadius: BorderRadius.lg }]}
        >
          <Feather 
            name="cpu" 
            size={22} 
            color="#fff" 
            style={styles.playIcon} 
          />
          <ThemedText style={styles.primaryButtonText}>IQ TEST</ThemedText>
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
      <Animated.View entering={FadeInUp.delay(delay).springify()} style={styles.secondaryButtonWrapper}>
        <Pressable
          style={[styles.secondaryButton, isCompleted && styles.completedButton]}
          onPress={onPress}
          accessibilityLabel={title}
          accessibilityHint={desc}
          accessibilityRole="button"
          accessibilityState={{ disabled: isCompleted }}
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
              <ThemedText 
                style={[styles.secondaryButtonText, { color: colors.primary === "#FF006E" ? GameColors.textPrimary : colors.primary }]}
                numberOfLines={1}
              >
                {title}
              </ThemedText>
              <ThemedText style={styles.secondaryButtonDesc} numberOfLines={1}>{desc}</ThemedText>
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

  const backgroundGradients: Record<ThemeId, [string, string, string]> = {
    electric: [colors.backgroundDark, "#0F1235", "#1A0A2E"],
    sunset: ["#1A0505", "#2D1010", "#1A0A0A"],
    ocean: ["#051525", "#0A1628", "#0A2035"],
    forest: ["#051510", "#0A1A14", "#0A1F18"],
    galaxy: ["#0A0515", "#0D0A1A", "#150A25"],
  };

  return (
    <LinearGradient
      colors={backgroundGradients[themeId]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {renderDecoration()}
      <FloatingBubbles />

      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
        <AnimatedPressable
          onPress={handleProfilePress}
          onPressIn={() => { profileScale.value = withSpring(0.9); }}
          onPressOut={() => { profileScale.value = withSpring(1); }}
          style={[styles.profileButton, profileStyle]}
          accessibilityLabel="Profile"
          accessibilityHint="View your profile and settings"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={[colors.primary + "40", colors.secondary + "40"]}
            style={[styles.profileGradient, { borderColor: colors.primary + "50" }]}
          >
            <Feather name="user" size={20} color={GameColors.textPrimary} />
          </LinearGradient>
        </AnimatedPressable>

        <View style={styles.currencyContainer}>
          <Pressable 
            onPress={handleShop} 
            style={[styles.currencyBadge, { backgroundColor: colors.surface }]}
            accessibilityLabel={`${starPoints} star points`}
            accessibilityHint="Open shop to spend star points"
            accessibilityRole="button"
          >
            <Feather name="star" size={16} color={colors.secondary} />
            <ThemedText style={[styles.currencyText, { color: colors.secondary }]}>{starPoints}</ThemedText>
          </Pressable>
          <Pressable 
            onPress={handleShop} 
            style={[styles.currencyBadge, { backgroundColor: colors.surface }]}
            accessibilityLabel={`${totalCoins} coins`}
            accessibilityHint="Open shop to spend coins"
            accessibilityRole="button"
          >
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
            <ThemedText style={styles.title}>
              FEUD
            </ThemedText>
            <ThemedText style={[styles.titleAccent, { color: colors.primary, textShadowColor: colors.primary }]}>
              FUSION
            </ThemedText>
          </View>
          <ThemedText style={styles.subtitle} numberOfLines={1} adjustsFontSizeToFit>{config.tagline}</ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.buttonsContainer}>
          <View style={styles.primaryButtonsRow}>
            {renderPlayButton()}
            {renderIQButton()}
          </View>

          <View style={styles.secondaryButtons}>
            <View style={styles.partyDailyRow}>
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
            </View>
            <View style={styles.multiplayerRow}>
              <Animated.View entering={FadeInUp.delay(750).springify()} style={styles.compactButton}>
                <Pressable 
                  onPress={handleMultiplayer}
                  accessibilityLabel="FEUD Online"
                  accessibilityHint="Play FEUD with friends online"
                  accessibilityRole="button"
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primary + "CC"]}
                    style={styles.compactButtonInner}
                  >
                    <Feather name="globe" size={16} color="#fff" />
                    <ThemedText style={styles.compactButtonText} numberOfLines={1}>FEUD Online</ThemedText>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
              <Animated.View entering={FadeInUp.delay(800).springify()} style={styles.compactButton}>
                <Pressable 
                  onPress={handleIQMultiplayer}
                  accessibilityLabel="IQ Online"
                  accessibilityHint="Play IQ Test with friends online"
                  accessibilityRole="button"
                >
                  <LinearGradient
                    colors={["#9B59B6", "#8E44AD"]}
                    style={styles.compactButtonInner}
                  >
                    <Feather name="cpu" size={16} color="#fff" />
                    <ThemedText style={styles.compactButtonText} numberOfLines={1}>IQ Online</ThemedText>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(800).springify()}>
        <AdBanner />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(900).springify()} style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <ThemedText style={styles.footerText}>What Would They Say?</ThemedText>
      </Animated.View>
    </LinearGradient>
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
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  profileGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    borderWidth: 2.5,
  },
  currencyContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  currencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  currencyText: {
    ...Typography.body,
    fontWeight: "800",
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
    marginBottom: Spacing.xl,
  },
  logoGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
    elevation: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    width: "100%",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    flexWrap: "nowrap",
  },
  title: {
    fontSize: Math.min(36, SCREEN_WIDTH * 0.09),
    lineHeight: Math.min(44, SCREEN_WIDTH * 0.11),
    color: GameColors.textPrimary,
    letterSpacing: 2,
    fontWeight: "900",
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    includeFontPadding: false,
  },
  titleAccent: {
    fontSize: Math.min(36, SCREEN_WIDTH * 0.09),
    lineHeight: Math.min(44, SCREEN_WIDTH * 0.11),
    letterSpacing: 2,
    fontWeight: "900",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    includeFontPadding: false,
  },
  subtitle: {
    ...Typography.body,
    color: GameColors.textSecondary,
    marginTop: Spacing.sm,
    fontSize: Math.min(14, SCREEN_WIDTH * 0.035),
    letterSpacing: 0.3,
    opacity: 0.9,
    textAlign: "center",
  },
  buttonsContainer: {
    width: "100%",
    maxWidth: Math.min(340, SCREEN_WIDTH - 48),
    paddingHorizontal: Spacing.xs,
  },
  primaryButtonsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  primaryButtonWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg + 2,
    minHeight: 60,
  },
  playIcon: {
    marginRight: Spacing.sm,
  },
  primaryButtonText: {
    ...Typography.body,
    color: "#fff",
    fontWeight: "800",
    fontSize: Math.min(14, SCREEN_WIDTH * 0.035),
    letterSpacing: 1,
  },
  secondaryButtons: {
    marginTop: Spacing["2xl"],
    gap: Spacing.md,
  },
  multiplayerRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  partyDailyRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  compactButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  compactButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
    minHeight: 50,
  },
  compactButtonText: {
    ...Typography.body,
    color: "#fff",
    fontWeight: "700",
    fontSize: Math.min(13, SCREEN_WIDTH * 0.032),
    letterSpacing: 0.3,
  },
  secondaryButtonWrapper: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    minHeight: 76,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  completedButton: {
    opacity: 0.6,
  },
  secondaryButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md + 2,
    borderRadius: 14,
  },
  secondaryButtonIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  secondaryButtonContent: {
    flex: 1,
  },
  secondaryButtonText: {
    ...Typography.body,
    fontWeight: "700",
    fontSize: Math.min(14, SCREEN_WIDTH * 0.035),
    letterSpacing: 0.2,
  },
  secondaryButtonDesc: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    fontSize: Math.min(11, SCREEN_WIDTH * 0.028),
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
    paddingTop: Spacing.sm,
  },
  footerText: {
    ...Typography.small,
    color: GameColors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    opacity: 0.6,
    letterSpacing: 0.5,
    fontSize: 13,
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
