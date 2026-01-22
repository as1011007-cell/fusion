import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, BorderRadius, Spacing, Typography } from "@/constants/theme";

type Option = {
  text: string;
  isCorrect: boolean;
};

interface MultipleChoiceOptionsProps {
  options: Option[];
  selectedIndex: number | null;
  showResults: boolean;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

const optionLetters = ["A", "B", "C", "D"];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function OptionButton({
  option,
  index,
  isSelected,
  showResults,
  onSelect,
  disabled,
}: {
  option: Option;
  index: number;
  isSelected: boolean;
  showResults: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !showResults) {
      scale.value = withSpring(0.97);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (!disabled && !showResults) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSelect();
    }
  };

  const getBackgroundColor = () => {
    if (showResults) {
      if (option.isCorrect) return GameColors.correct + "30";
      if (isSelected && !option.isCorrect) return GameColors.wrong + "30";
    }
    if (isSelected) return GameColors.primary + "30";
    return GameColors.surface;
  };

  const getBorderColor = () => {
    if (showResults) {
      if (option.isCorrect) return GameColors.correct;
      if (isSelected && !option.isCorrect) return GameColors.wrong;
    }
    if (isSelected) return GameColors.primary;
    return "rgba(255,255,255,0.1)";
  };

  const getIcon = () => {
    if (!showResults) return null;
    if (option.isCorrect) {
      return <Feather name="check-circle" size={20} color={GameColors.correct} />;
    }
    if (isSelected && !option.isCorrect) {
      return <Feather name="x-circle" size={20} color={GameColors.wrong} />;
    }
    return null;
  };

  const isDisabled = option.text.startsWith("[X]");

  return (
    <Animated.View entering={FadeIn.delay(index * 100).duration(300)}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || showResults || isDisabled}
        style={[
          styles.option,
          animatedStyle,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            opacity: isDisabled ? 0.4 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.letterBadge,
            {
              backgroundColor: isSelected || (showResults && option.isCorrect)
                ? getBorderColor()
                : "rgba(255,255,255,0.1)",
            },
          ]}
        >
          <ThemedText
            style={[
              styles.letter,
              {
                color: isSelected || (showResults && option.isCorrect)
                  ? GameColors.backgroundDark
                  : GameColors.textSecondary,
              },
            ]}
          >
            {optionLetters[index]}
          </ThemedText>
        </View>
        <ThemedText
          style={[
            styles.optionText,
            isDisabled && styles.strikethrough,
          ]}
        >
          {option.text.replace("[X] ", "")}
        </ThemedText>
        {getIcon()}
      </AnimatedPressable>
    </Animated.View>
  );
}

export function MultipleChoiceOptions({
  options,
  selectedIndex,
  showResults,
  onSelect,
  disabled = false,
}: MultipleChoiceOptionsProps) {
  return (
    <View style={styles.container}>
      {options.map((option, index) => (
        <OptionButton
          key={index}
          option={option}
          index={index}
          isSelected={selectedIndex === index}
          showResults={showResults}
          onSelect={() => onSelect(index)}
          disabled={disabled}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  letterBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  letter: {
    ...Typography.body,
    fontWeight: "700",
  },
  optionText: {
    ...Typography.body,
    color: GameColors.textPrimary,
    flex: 1,
  },
  strikethrough: {
    textDecorationLine: "line-through",
    color: GameColors.textSecondary,
  },
});
