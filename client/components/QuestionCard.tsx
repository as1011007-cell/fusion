import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  useSharedValue,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, BorderRadius, Spacing, Typography } from "@/constants/theme";
import { Panel, AnswerLayer } from "@/context/GameContext";

interface QuestionCardProps {
  question: string;
  panel: Panel;
  layer: AnswerLayer;
  round: number;
  totalRounds: number;
}

const layerLabels: Record<AnswerLayer, string> = {
  common: "Most Common",
  honest: "Most Honest",
  embarrassing: "Most Embarrassing",
};

export function QuestionCard({
  question,
  panel,
  layer,
  round,
  totalRounds,
}: QuestionCardProps) {
  const pulseValue = useSharedValue(1);

  React.useEffect(() => {
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.roundBadge}>
          <ThemedText style={styles.roundText}>
            Round {round}/{totalRounds}
          </ThemedText>
        </View>
        <View style={[styles.panelBadge, { backgroundColor: panel.color + "30" }]}>
          <Feather name={panel.icon as any} size={14} color={panel.color} />
          <ThemedText style={[styles.panelText, { color: panel.color }]}>
            {panel.name}
          </ThemedText>
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Animated.View style={[styles.quoteMark, pulseStyle]}>
          <ThemedText style={styles.quoteText}>"</ThemedText>
        </Animated.View>
        <ThemedText style={styles.question}>{question}</ThemedText>
        <Animated.View style={[styles.quoteMark, styles.quoteEnd, pulseStyle]}>
          <ThemedText style={styles.quoteText}>"</ThemedText>
        </Animated.View>
      </View>

      <View style={styles.layerContainer}>
        <ThemedText style={styles.layerLabel}>Targeting:</ThemedText>
        <View style={styles.layerBadge}>
          <ThemedText style={styles.layerText}>{layerLabels[layer]}</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  roundBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  roundText: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  panelBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  panelText: {
    ...Typography.caption,
    fontWeight: "600",
    marginLeft: Spacing.xs,
  },
  questionContainer: {
    position: "relative",
    paddingVertical: Spacing.lg,
  },
  quoteMark: {
    position: "absolute",
    left: -10,
    top: 0,
  },
  quoteEnd: {
    left: "auto",
    right: -10,
    top: "auto",
    bottom: 0,
  },
  quoteText: {
    fontSize: 48,
    color: GameColors.primary,
    opacity: 0.3,
    fontWeight: "700",
  },
  question: {
    ...Typography.display,
    color: GameColors.textPrimary,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
  layerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  layerLabel: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    marginRight: Spacing.sm,
  },
  layerBadge: {
    backgroundColor: GameColors.primary + "30",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  layerText: {
    ...Typography.caption,
    color: GameColors.primary,
    fontWeight: "600",
  },
});
