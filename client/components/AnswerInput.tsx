import React, { useState } from "react";
import { StyleSheet, View, TextInput, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, BorderRadius, Spacing, Typography } from "@/constants/theme";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnswerInput({ onSubmit, disabled }: AnswerInputProps) {
  const [answer, setAnswer] = useState("");
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (answer.trim() && !disabled) {
      scale.value = withSpring(0.95);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleSubmit = () => {
    if (answer.trim() && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onSubmit(answer.trim());
      setAnswer("");
    }
  };

  const canSubmit = answer.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your answer..."
          placeholderTextColor={GameColors.textSecondary}
          value={answer}
          onChangeText={setAnswer}
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
          editable={!disabled}
          autoCapitalize="sentences"
          autoCorrect={false}
        />
      </View>
      <AnimatedPressable
        onPress={handleSubmit}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!canSubmit}
        style={[
          styles.submitButton,
          animatedStyle,
          {
            backgroundColor: canSubmit ? GameColors.primary : GameColors.surface,
            opacity: canSubmit ? 1 : 0.5,
          },
        ]}
      >
        <Feather
          name="send"
          size={20}
          color={canSubmit ? GameColors.textPrimary : GameColors.textSecondary}
        />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: GameColors.surface,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  inputContainer: {
    flex: 1,
    backgroundColor: GameColors.backgroundDark,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    marginRight: Spacing.md,
  },
  input: {
    ...Typography.body,
    color: GameColors.textPrimary,
    height: Spacing.inputHeight,
  },
  submitButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
