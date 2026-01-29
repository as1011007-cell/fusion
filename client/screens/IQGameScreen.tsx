import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  FadeIn,
  FadeOut,
  FadeInUp,
  SlideInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GradientButton } from "@/components/GradientButton";
import { Timer } from "@/components/Timer";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useIQ } from "@/context/IQContext";
import { useTheme } from "@/context/ThemeContext";
import { useProfile } from "@/context/ProfileContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "IQGame">;

const optionLetters = ["A", "B", "C", "D"];

const CATEGORY_LABELS: Record<string, string> = {
  "logical-reasoning": "Logical",
  "pattern-recognition": "Pattern",
  "verbal-intelligence": "Verbal",
  "mathematical-reasoning": "Math",
  "spatial-reasoning": "Spatial",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: GameColors.correct,
  medium: GameColors.warning,
  hard: GameColors.wrong,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function OptionButton({
  text,
  index,
  isSelected,
  isCorrect,
  showResult,
  onSelect,
  disabled,
}: {
  text: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  showResult: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !showResult) {
      scale.value = withSpring(0.97);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (!disabled && !showResult) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSelect();
    }
  };

  const getBackgroundColor = () => {
    if (showResult) {
      if (isCorrect) return GameColors.correct + "30";
      if (isSelected && !isCorrect) return GameColors.wrong + "30";
    }
    if (isSelected) return GameColors.primary + "30";
    return GameColors.surface;
  };

  const getBorderColor = () => {
    if (showResult) {
      if (isCorrect) return GameColors.correct;
      if (isSelected && !isCorrect) return GameColors.wrong;
    }
    if (isSelected) return GameColors.primary;
    return "rgba(255,255,255,0.1)";
  };

  const getIcon = () => {
    if (!showResult) return null;
    if (isCorrect) {
      return <Feather name="check-circle" size={20} color={GameColors.correct} />;
    }
    if (isSelected && !isCorrect) {
      return <Feather name="x-circle" size={20} color={GameColors.wrong} />;
    }
    return null;
  };

  return (
    <Animated.View entering={FadeIn.delay(index * 80).duration(250)}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || showResult}
        style={[
          styles.option,
          animatedStyle,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
          },
        ]}
      >
        <View
          style={[
            styles.letterBadge,
            {
              backgroundColor:
                isSelected || (showResult && isCorrect)
                  ? getBorderColor()
                  : "rgba(255,255,255,0.1)",
            },
          ]}
        >
          <ThemedText
            style={[
              styles.letter,
              {
                color:
                  isSelected || (showResult && isCorrect)
                    ? GameColors.backgroundDark
                    : GameColors.textSecondary,
              },
            ]}
          >
            {optionLetters[index]}
          </ThemedText>
        </View>
        <ThemedText style={styles.optionText}>{text}</ThemedText>
        {getIcon()}
      </AnimatedPressable>
    </Animated.View>
  );
}

function AnimatedScore({ score }: { score: number }) {
  const scoreScale = useSharedValue(1);

  useEffect(() => {
    scoreScale.value = withSequence(
      withSpring(1.2, { damping: 5 }),
      withSpring(1, { damping: 10 })
    );
  }, [score]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  return (
    <Animated.View style={[styles.scoreContainer, animatedStyle]}>
      <ThemedText style={styles.scoreLabel}>Score</ThemedText>
      <ThemedText style={styles.scoreValue}>{score.toLocaleString()}</ThemedText>
    </Animated.View>
  );
}

export default function IQGameScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const {
    currentQuestion,
    questionNumber,
    totalQuestions,
    score,
    answerQuestion,
    nextQuestion,
    endGame,
    resetGame,
  } = useIQ();
  const { currentTheme } = useTheme();
  const { settings } = useProfile();
  const colors = currentTheme.colors;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<{ correct: boolean; points: number } | null>(null);
  const [timerActive, setTimerActive] = useState(true);
  const [questionKey, setQuestionKey] = useState(0);
  const questionStartTime = useRef(Date.now());

  useEffect(() => {
    if (!currentQuestion) {
      navigation.goBack();
    }
  }, []);

  useEffect(() => {
    questionStartTime.current = Date.now();
    setSelectedIndex(null);
    setShowResult(false);
    setLastResult(null);
    setTimerActive(true);
    setQuestionKey((prev) => prev + 1);
  }, [questionNumber]);

  const handleBack = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    resetGame();
    navigation.goBack();
  };

  const handleSelectOption = (index: number) => {
    if (selectedIndex !== null || showResult) return;

    setTimerActive(false);
    setSelectedIndex(index);

    const timeSpent = (Date.now() - questionStartTime.current) / 1000;
    const result = answerQuestion(index, timeSpent);
    setLastResult(result);

    if (settings.hapticsEnabled) {
      if (result.correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }

    setShowResult(true);
  };

  const handleTimeUp = () => {
    if (selectedIndex !== null || showResult) return;

    setTimerActive(false);
    setSelectedIndex(-1);

    const timeSpent = currentQuestion?.timeLimit || 30;
    const result = answerQuestion(-1, timeSpent);
    setLastResult(result);

    if (settings.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const hasMore = nextQuestion();
    if (!hasMore) {
      const results = endGame();
      navigation.replace("IQResults", results);
    }
  };

  if (!currentQuestion) {
    return null;
  }

  const categoryLabel = CATEGORY_LABELS[currentQuestion.category] || currentQuestion.category;
  const difficultyColor = DIFFICULTY_COLORS[currentQuestion.difficulty] || GameColors.secondary;

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundDark }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable
          onPress={handleBack}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
        >
          <Feather name="x" size={24} color={GameColors.textPrimary} />
        </Pressable>

        {!showResult ? (
          <Timer
            key={questionKey}
            duration={currentQuestion.timeLimit}
            onComplete={handleTimeUp}
            isActive={timerActive}
          />
        ) : (
          <View style={styles.timerPlaceholder} />
        )}

        <AnimatedScore score={score} />
      </View>

      <View style={styles.progressContainer}>
        <ThemedText style={styles.progressText}>
          Question {questionNumber} of {totalQuestions}
        </ThemedText>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(questionNumber / totalQuestions) * 100}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.badgesContainer}>
        <View style={[styles.badge, { backgroundColor: colors.surface }]}>
          <Feather name="layers" size={14} color={GameColors.secondary} />
          <ThemedText style={styles.badgeText}>{categoryLabel}</ThemedText>
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: difficultyColor + "20", borderColor: difficultyColor },
          ]}
        >
          <Feather name="bar-chart-2" size={14} color={difficultyColor} />
          <ThemedText style={[styles.badgeText, { color: difficultyColor }]}>
            {currentQuestion.difficulty.charAt(0).toUpperCase() +
              currentQuestion.difficulty.slice(1)}
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          key={questionKey}
          entering={FadeIn.duration(300)}
          style={styles.questionContainer}
        >
          <ThemedText style={styles.questionText}>{currentQuestion.text}</ThemedText>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <OptionButton
              key={`${questionKey}-${index}`}
              text={option}
              index={index}
              isSelected={selectedIndex === index}
              isCorrect={index === currentQuestion.correctIndex}
              showResult={showResult}
              onSelect={() => handleSelectOption(index)}
              disabled={selectedIndex !== null}
            />
          ))}
        </View>

        {showResult ? (
          <Animated.View entering={SlideInUp.springify()} style={styles.resultContainer}>
            <View
              style={[
                styles.resultCard,
                {
                  backgroundColor: lastResult?.correct
                    ? GameColors.correct + "20"
                    : GameColors.wrong + "20",
                  borderColor: lastResult?.correct ? GameColors.correct : GameColors.wrong,
                },
              ]}
            >
              <View style={styles.resultIconContainer}>
                <Feather
                  name={lastResult?.correct ? "check-circle" : "x-circle"}
                  size={32}
                  color={lastResult?.correct ? GameColors.correct : GameColors.wrong}
                />
              </View>
              <View style={styles.resultTextContainer}>
                <ThemedText
                  style={[
                    styles.resultTitle,
                    { color: lastResult?.correct ? GameColors.correct : GameColors.wrong },
                  ]}
                >
                  {lastResult?.correct ? "Correct!" : selectedIndex === -1 ? "Time's Up!" : "Wrong!"}
                </ThemedText>
                <ThemedText style={styles.resultPoints}>
                  {lastResult?.correct
                    ? `+${lastResult.points} points`
                    : `Correct: ${currentQuestion.options[currentQuestion.correctIndex]}`}
                </ThemedText>
              </View>
            </View>

            <Animated.View entering={FadeInUp.delay(300).springify()}>
              <GradientButton
                onPress={handleNextQuestion}
                variant={questionNumber >= totalQuestions ? "accent" : "secondary"}
              >
                {questionNumber >= totalQuestions ? "See Results" : "Next Question"}
              </GradientButton>
            </Animated.View>
          </Animated.View>
        ) : null}
      </ScrollView>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GameColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  timerPlaceholder: {
    width: 60,
    height: 60,
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  scoreLabel: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  scoreValue: {
    ...Typography.h4,
    color: GameColors.accent,
    fontWeight: "700",
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  progressText: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: GameColors.secondary,
    borderRadius: 2,
  },
  badgesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: "transparent",
  },
  badgeText: {
    ...Typography.caption,
    color: GameColors.secondary,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing["3xl"],
  },
  questionContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  questionText: {
    ...Typography.h3,
    color: GameColors.textPrimary,
    textAlign: "center",
    lineHeight: 32,
  },
  optionsContainer: {
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
  resultContainer: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    gap: Spacing.lg,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  resultIconContainer: {
    marginRight: Spacing.md,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    ...Typography.h4,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  resultPoints: {
    ...Typography.body,
    color: GameColors.textSecondary,
  },
});
