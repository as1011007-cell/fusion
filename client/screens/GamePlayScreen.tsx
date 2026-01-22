import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeIn, FadeInUp, SlideInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { QuestionCard } from "@/components/QuestionCard";
import { AnswerInput } from "@/components/AnswerInput";
import { PowerCardDock } from "@/components/PowerCardDock";
import { Timer } from "@/components/Timer";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ResultCard } from "@/components/ResultCard";
import { GradientButton } from "@/components/GradientButton";
import { GameColors, Spacing, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useGame } from "@/context/GameContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "GamePlay">;

const ROUND_DURATION = 30;

export default function GamePlayScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const {
    gameState,
    submitAnswer,
    nextRound,
    usePowerCard,
    resetGame,
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

  const handleSubmit = (answer: string) => {
    setTimerActive(false);
    submitAnswer(answer);
  };

  const handleTimeUp = () => {
    if (!gameState.showResults) {
      submitAnswer("");
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

  if (!gameState.currentQuestion || !gameState.selectedPanel) {
    return null;
  }

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

      <View style={styles.content}>
        {!gameState.showResults ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.questionArea}>
            <QuestionCard
              question={gameState.currentQuestion.text}
              panel={gameState.selectedPanel}
              layer={gameState.selectedLayer}
              round={gameState.currentRound}
              totalRounds={gameState.totalRounds}
            />
          </Animated.View>
        ) : (
          <Animated.View
            entering={SlideInUp.springify()}
            style={styles.resultArea}
          >
            {gameState.lastResult ? (
              <ResultCard
                correct={gameState.lastResult.correct}
                points={gameState.lastResult.points}
                correctAnswer={gameState.lastResult.correctAnswer}
                playerAnswer={gameState.playerAnswer || "(No answer)"}
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
      </View>

      {!gameState.showResults ? (
        <View style={styles.footer}>
          <PowerCardDock
            cards={gameState.powerCards}
            onUseCard={handleUsePowerCard}
          />
          <View style={{ paddingBottom: insets.bottom }}>
            <AnswerInput onSubmit={handleSubmit} disabled={gameState.showResults} />
          </View>
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
  content: {
    flex: 1,
    justifyContent: "center",
  },
  questionArea: {
    flex: 1,
    justifyContent: "center",
  },
  resultArea: {
    flex: 1,
    justifyContent: "center",
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
