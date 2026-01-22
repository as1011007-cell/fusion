import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, BorderRadius, Spacing, Typography } from "@/constants/theme";

interface ScoreDisplayProps {
  score: number;
  streak: number;
}

export function ScoreDisplay({ score, streak }: ScoreDisplayProps) {
  const scoreScale = useSharedValue(1);

  React.useEffect(() => {
    scoreScale.value = withSequence(
      withSpring(1.2, { damping: 5 }),
      withSpring(1, { damping: 10 })
    );
  }, [score]);

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.scoreContainer, scoreAnimatedStyle]}>
        <ThemedText style={styles.label}>Score</ThemedText>
        <ThemedText style={styles.score}>{score.toLocaleString()}</ThemedText>
      </Animated.View>

      {streak > 0 ? (
        <View style={styles.streakContainer}>
          <Feather name="zap" size={16} color={GameColors.accent} />
          <ThemedText style={styles.streak}>{streak}x</ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  label: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  score: {
    ...Typography.h4,
    color: GameColors.accent,
    fontWeight: "700",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.accent + "20",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  streak: {
    ...Typography.caption,
    color: GameColors.accent,
    fontWeight: "700",
    marginLeft: Spacing.xs,
  },
});
