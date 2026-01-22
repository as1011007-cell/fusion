import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, BorderRadius, Spacing, Typography } from "@/constants/theme";
import { PowerCard } from "@/context/GameContext";

interface PowerCardDockProps {
  cards: PowerCard[];
  onUseCard: (cardId: string) => void;
}

interface PowerCardItemProps {
  card: PowerCard;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const cardColors: Record<string, string> = {
  mute: GameColors.textSecondary,
  steal: GameColors.accent,
  "double-bluff": GameColors.primary,
};

function PowerCardItem({ card, onPress }: PowerCardItemProps) {
  const scale = useSharedValue(1);
  const disabled = card.count === 0;
  const color = cardColors[card.id] || GameColors.secondary;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.9);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onPress();
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.card,
        animatedStyle,
        {
          backgroundColor: color + "20",
          borderColor: color,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <Feather name={card.icon as any} size={20} color={color} />
      <ThemedText style={[styles.cardName, { color }]}>{card.name}</ThemedText>
      <View style={[styles.countBadge, { backgroundColor: color }]}>
        <ThemedText style={styles.countText}>{card.count}</ThemedText>
      </View>
    </AnimatedPressable>
  );
}

export function PowerCardDock({ cards, onUseCard }: PowerCardDockProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Power Cards</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {cards.map((card) => (
          <PowerCardItem
            key={card.id}
            card={card}
            onPress={() => onUseCard(card.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  title: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  card: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: Spacing.sm,
    minWidth: 80,
  },
  cardName: {
    ...Typography.caption,
    fontWeight: "600",
    marginTop: Spacing.xs,
  },
  countBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    ...Typography.caption,
    color: GameColors.backgroundDark,
    fontWeight: "700",
    fontSize: 10,
  },
});
