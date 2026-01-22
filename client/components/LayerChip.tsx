import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, BorderRadius, Spacing, Typography } from "@/constants/theme";
import { AnswerLayer } from "@/context/GameContext";

interface LayerChipProps {
  layer: AnswerLayer;
  selected: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const layerConfig = {
  common: {
    label: "Most Common",
    icon: "users",
    color: GameColors.secondary,
    points: "100 pts",
    risk: "Low Risk",
  },
  honest: {
    label: "Most Honest",
    icon: "eye",
    color: GameColors.warning,
    points: "200 pts",
    risk: "Medium Risk",
  },
  embarrassing: {
    label: "Most Embarrassing",
    icon: "alert-triangle",
    color: GameColors.primary,
    points: "300 pts",
    risk: "High Risk",
  },
};

export function LayerChip({ layer, selected, onPress }: LayerChipProps) {
  const scale = useSharedValue(1);
  const config = layerConfig[layer];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
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
      style={[
        styles.chip,
        animatedStyle,
        {
          backgroundColor: selected ? config.color + "30" : GameColors.surface,
          borderColor: selected ? config.color : "rgba(255,255,255,0.1)",
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: config.color + "20" }]}>
        <Feather name={config.icon as any} size={20} color={config.color} />
      </View>
      <View style={styles.content}>
        <ThemedText style={styles.label}>{config.label}</ThemedText>
        <View style={styles.meta}>
          <ThemedText style={[styles.points, { color: config.color }]}>
            {config.points}
          </ThemedText>
          <ThemedText style={styles.risk}>{config.risk}</ThemedText>
        </View>
      </View>
      {selected ? (
        <View style={[styles.selectedDot, { backgroundColor: config.color }]} />
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 2,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "600",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  points: {
    ...Typography.caption,
    fontWeight: "700",
    marginRight: Spacing.sm,
  },
  risk: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
