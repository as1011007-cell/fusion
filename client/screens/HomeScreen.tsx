import React from "react";
import { StyleSheet, View, Image, Pressable } from "react-native";
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
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GradientButton } from "@/components/GradientButton";
import { FloatingBubbles } from "@/components/FloatingBubbles";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useGame } from "@/context/GameContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { totalCoins } = useGame();

  const profileScale = useSharedValue(1);

  const profileStyle = useAnimatedStyle(() => ({
    transform: [{ scale: profileScale.value }],
  }));

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Profile");
  };

  const handlePlay = () => {
    navigation.navigate("GameSetup");
  };

  return (
    <View style={styles.container}>
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
        >
          <Feather name="user" size={20} color={GameColors.textPrimary} />
        </AnimatedPressable>

        <View style={styles.coinsContainer}>
          <Feather name="star" size={16} color={GameColors.accent} />
          <ThemedText style={styles.coinsText}>{totalCoins}</ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400).springify()}
          style={styles.titleContainer}
        >
          <ThemedText style={styles.title}>FEUD</ThemedText>
          <ThemedText style={styles.titleAccent}>FUSION</ThemedText>
          <ThemedText style={styles.subtitle}>What Would They Say?</ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(600).springify()}
          style={styles.buttonsContainer}
        >
          <GradientButton onPress={handlePlay} variant="primary">
            Play Now
          </GradientButton>

          <View style={styles.secondaryButtons}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={styles.secondaryButtonIcon}>
                <Feather name="users" size={20} color={GameColors.secondary} />
              </View>
              <ThemedText style={styles.secondaryButtonText}>
                Party Mode
              </ThemedText>
              <ThemedText style={styles.comingSoon}>Soon</ThemedText>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={styles.secondaryButtonIcon}>
                <Feather name="calendar" size={20} color={GameColors.accent} />
              </View>
              <ThemedText style={styles.secondaryButtonText}>
                Daily Challenge
              </ThemedText>
              <ThemedText style={styles.comingSoon}>Soon</ThemedText>
            </Pressable>
          </View>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInUp.delay(800).springify()}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GameColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  coinsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  coinsText: {
    ...Typography.body,
    color: GameColors.accent,
    fontWeight: "700",
    marginLeft: Spacing.xs,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: Spacing.xl,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  title: {
    ...Typography.h1,
    fontSize: 48,
    color: GameColors.textPrimary,
    letterSpacing: 8,
  },
  titleAccent: {
    ...Typography.h1,
    fontSize: 48,
    color: GameColors.primary,
    letterSpacing: 8,
    marginTop: -Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: GameColors.textSecondary,
    marginTop: Spacing.md,
  },
  buttonsContainer: {
    width: "100%",
    maxWidth: 320,
  },
  secondaryButtons: {
    marginTop: Spacing.xl,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  secondaryButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  secondaryButtonText: {
    ...Typography.body,
    color: GameColors.textPrimary,
    flex: 1,
    fontWeight: "600",
  },
  comingSoon: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
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
  },
});
