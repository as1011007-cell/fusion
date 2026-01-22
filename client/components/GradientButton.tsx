import React, { ReactNode } from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, BorderRadius, Spacing, Typography } from "@/constants/theme";

interface GradientButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "accent";
  size?: "small" | "medium" | "large";
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const gradientColors = {
  primary: [GameColors.primary, "#CC0058"] as const,
  secondary: [GameColors.secondary, "#00C4CC"] as const,
  accent: [GameColors.accent, "#CC9900"] as const,
};

export function GradientButton({
  onPress,
  children,
  style,
  disabled = false,
  variant = "primary",
  size = "large",
}: GradientButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.95, springConfig);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, springConfig);
    }
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const buttonHeight = size === "small" ? 44 : size === "medium" ? 52 : 56;
  const fontSize = size === "small" ? 14 : size === "medium" ? 16 : 18;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style]}
    >
      <LinearGradient
        colors={gradientColors[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.button,
          { height: buttonHeight, opacity: disabled ? 0.5 : 1 },
        ]}
      >
        <ThemedText
          style={[
            styles.buttonText,
            { fontSize, fontFamily: Typography.button.fontFamily },
          ]}
        >
          {children}
        </ThemedText>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
    shadowColor: GameColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: GameColors.textPrimary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
