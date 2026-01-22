import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, BorderRadius, Spacing, Typography } from "@/constants/theme";
import { Panel } from "@/context/GameContext";

interface PanelCardProps {
  panel: Panel;
  selected: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PanelCard({ panel, selected, onPress }: PanelCardProps) {
  const scale = useSharedValue(1);
  const selectedValue = useSharedValue(selected ? 1 : 0);

  React.useEffect(() => {
    selectedValue.value = withSpring(selected ? 1 : 0);
  }, [selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: interpolateColor(
      selectedValue.value,
      [0, 1],
      ["rgba(255,255,255,0.1)", panel.color]
    ),
    borderWidth: 2,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.card, animatedStyle]}
    >
      <View style={[styles.iconContainer, { backgroundColor: panel.color + "20" }]}>
        <Feather name={panel.icon as any} size={24} color={panel.color} />
      </View>
      <ThemedText style={styles.name}>{panel.name}</ThemedText>
      <ThemedText style={styles.description}>{panel.description}</ThemedText>
      {selected ? (
        <View style={[styles.selectedBadge, { backgroundColor: panel.color }]}>
          <Feather name="check" size={14} color={GameColors.backgroundDark} />
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: 160,
    marginRight: Spacing.md,
    position: "relative",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  name: {
    ...Typography.h4,
    color: GameColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  description: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  selectedBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
