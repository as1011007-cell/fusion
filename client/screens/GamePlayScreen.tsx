import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeIn, FadeInUp, SlideInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { QuestionCard } from "@/components/QuestionCard";
import { MultipleChoiceOptions } from "@/components/MultipleChoiceOptions";
import { PowerCardDock } from "@/components/PowerCardDock";
import { Timer } from "@/components/Timer";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ResultCard } from "@/components/ResultCard";
import { GradientButton } from "@/components/GradientButton";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useGame, Panel } from "@/context/GameContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "GamePlay">;

const ROUND_DURATION = 30;

const defaultPanel: Panel = {
  id: "mixed",
  name: "Mixed",
  description: "All panels",
  icon: "globe",
  color: GameColors.secondary,
};

export default function GamePlayScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const {
    gameState,
    selectOption,
    nextRound,
    usePowerCard,
    resetGame,
    panels,
  } = useGame();

  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    if (gameState.showResults) {
      setTimerActive(false);
    }
  }, [gameState.showResults]);

  useEffect(() => {
    if (!gameState.showResults && gameState.currentRound > 0) {
      setTimerActive(true);
    }
  }, [gameState.currentRound]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetGame();
    navigation.goBack();
  };

  const handleSelectOption = (index: number) => {
    setTimerActive(false);
    selectOption(index);
  };

  const handleTimeUp = () => {
    if (!gameState.showResults && gameState.selectedOptionIndex === null) {
      selectOption(-1);
    }
  };

  const handleNextRound = () => {
    if (gameState.currentRound >= gameState.totalRounds) {
      navigation.navigate("Results");
    } else {
      nextRound();
    }
  };

  const handleUsePowerCard = (cardId: string) => {
    usePowerCard(cardId);
  };

  if (!gameState.currentQuestion) {
    return null;
  }

  const currentPanel = gameState.mode === "solo" && gameState.selectedPanel
    ? gameState.selectedPanel
    : panels.find(p => p.id === gameState.currentQuestion?.panelId) || defaultPanel;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="x" size={24} color={GameColors.textPrimary} />
        </Pressable>

        {!gameState.showResults ? (
          <Timer
            duration={ROUND_DURATION}
            onComplete={handleTimeUp}
            isActive={timerActive}
          />
        ) : (
          <View style={styles.timerPlaceholder} />
        )}

        <ScoreDisplay score={gameState.score} streak={gameState.streak} />
      </View>

      {gameState.mode === "party" ? (
        <View style={styles.teamIndicator}>
          <View
            style={[
              styles.teamBadge,
              {
                backgroundColor:
                  gameState.currentTeam === "red" ? "#FF444430" : "#4444FF30",
              },
            ]}
          >
            <ThemedText
              style={[
                styles.teamText,
                { color: gameState.currentTeam === "red" ? "#FF4444" : "#4444FF" },
              ]}
            >
              {gameState.currentTeam === "red" ? "Red Team" : "Blue Team"}'s Turn
            </ThemedText>
          </View>
          <View style={styles.teamScores}>
            <ThemedText style={[styles.teamScore, { color: "#FF4444" }]}>
              {gameState.redScore}
            </ThemedText>
            <ThemedText style={styles.teamScoreDivider}>-</ThemedText>
            <ThemedText style={[styles.teamScore, { color: "#4444FF" }]}>
              {gameState.blueScore}
            </ThemedText>
          </View>
        </View>
      ) : null}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {!gameState.showResults ? (
          <Animated.View entering={FadeIn.duration(300)}>
            <QuestionCard
              question={gameState.currentQuestion.text}
              panel={currentPanel}
              layer={gameState.currentQuestion.layer || gameState.selectedLayer}
              round={gameState.currentRound}
              totalRounds={gameState.totalRounds}
            />

            <View style={styles.optionsContainer}>
              <MultipleChoiceOptions
                options={gameState.currentQuestion.options}
                selectedIndex={gameState.selectedOptionIndex}
                showResults={gameState.showResults}
                onSelect={handleSelectOption}
              />
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={SlideInUp.springify()}>
            {gameState.lastResult ? (
              <ResultCard
                correct={gameState.lastResult.correct}
                points={gameState.lastResult.points}
                correctAnswer={gameState.lastResult.correctAnswer}
                playerAnswer={
                  gameState.selectedOptionIndex !== null &&
                  gameState.selectedOptionIndex >= 0
                    ? gameState.currentQuestion.options[gameState.selectedOptionIndex]
                        ?.text || "(No answer)"
                    : "(Time's up!)"
                }
              />
            ) : null}

            <Animated.View
              entering={FadeInUp.delay(500).springify()}
              style={styles.nextButtonContainer}
            >
              <GradientButton
                onPress={handleNextRound}
                variant={
                  gameState.currentRound >= gameState.totalRounds
                    ? "accent"
                    : "secondary"
                }
              >
                {gameState.currentRound >= gameState.totalRounds
                  ? "See Results"
                  : "Next Round"}
              </GradientButton>
            </Animated.View>
          </Animated.View>
        )}
      </ScrollView>

      {!gameState.showResults ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
          <PowerCardDock
            cards={gameState.powerCards}
            onUseCard={handleUsePowerCard}
          />
        </View>
      ) : null}
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
  teamIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  teamBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  teamText: {
    ...Typography.body,
    fontWeight: "600",
  },
  teamScores: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamScore: {
    ...Typography.h4,
    fontWeight: "700",
  },
  teamScoreDivider: {
    ...Typography.h4,
    color: GameColors.textSecondary,
    marginHorizontal: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing.xl,
  },
  optionsContainer: {
    marginTop: Spacing.xl,
  },
  nextButtonContainer: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing["2xl"],
  },
  footer: {
    backgroundColor: GameColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});
