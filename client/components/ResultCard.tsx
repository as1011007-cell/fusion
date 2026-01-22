import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, BorderRadius, Spacing, Typography } from "@/constants/theme";

interface ResultCardProps {
  correct: boolean;
  points: number;
  correctAnswer: string;
  playerAnswer: string;
}

export function ResultCard({
  correct,
  points,
  correctAnswer,
  playerAnswer,
}: ResultCardProps) {
  const scale = useSharedValue(0);
  const iconScale = useSharedValue(0);

  useEffect(() => {
    const triggerHaptic = () => {
      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    };

    scale.value = withSpring(1, { damping: 12 });
    iconScale.value = withDelay(
      200,
      withSequence(
        withSpring(1.3, { damping: 5 }, () => runOnJS(triggerHaptic)()),
        withSpring(1, { damping: 10 })
      )
    );
  }, [correct]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const color = correct ? GameColors.correct : GameColors.wrong;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View
        style={[
          styles.iconContainer,
          iconStyle,
          { backgroundColor: color + "20" },
        ]}
      >
        <Feather
          name={correct ? "check-circle" : "x-circle"}
          size={48}
          color={color}
        />
      </Animated.View>

      <ThemedText style={[styles.title, { color }]}>
        {correct ? "Correct!" : "Not Quite!"}
      </ThemedText>

      {correct ? (
        <View style={styles.pointsContainer}>
          <Feather name="star" size={20} color={GameColors.accent} />
          <ThemedText style={styles.points}>+{points} points</ThemedText>
        </View>
      ) : null}

      <View style={styles.answersContainer}>
        <View style={styles.answerRow}>
          <ThemedText style={styles.answerLabel}>Your answer:</ThemedText>
          <ThemedText style={styles.playerAnswer}>{playerAnswer}</ThemedText>
        </View>
        {!correct ? (
          <View style={styles.answerRow}>
            <ThemedText style={styles.answerLabel}>Top answer:</ThemedText>
            <ThemedText style={[styles.correctAnswer, { color }]}>
              {correctAnswer}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
    marginHorizontal: Spacing.lg,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    marginBottom: Spacing.md,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.accent + "20",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xl,
  },
  points: {
    ...Typography.h4,
    color: GameColors.accent,
    marginLeft: Spacing.sm,
  },
  answersContainer: {
    width: "100%",
  },
  answerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  answerLabel: {
    ...Typography.small,
    color: GameColors.textSecondary,
  },
  playerAnswer: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "600",
  },
  correctAnswer: {
    ...Typography.body,
    fontWeight: "700",
  },
});
