import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeIn, FadeInDown, SlideInUp, ZoomIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { QuestionCard } from "@/components/QuestionCard";
import { MultipleChoiceOptions } from "@/components/MultipleChoiceOptions";
import { Timer } from "@/components/Timer";
import { GradientButton } from "@/components/GradientButton";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useMultiplayer, RoundResult } from "@/context/MultiplayerContext";
import { useProfile, avatarImages } from "@/context/ProfileContext";
import { useGame, Panel } from "@/context/GameContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ROUND_DURATION = 30;
const TOTAL_ROUNDS = 10;

export default function MultiplayerGameScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { settings } = useProfile();
  const { panels } = useGame();
  
  const {
    playerId,
    room,
    currentQuestion,
    roundResults,
    answeredCount,
    gameFinished,
    finalScores,
    winner,
    submitAnswer,
    nextQuestion,
    leaveRoom,
    clearResults,
  } = useMultiplayer();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [localQuestion, setLocalQuestion] = useState<any>(null);

  const isHost = room?.hostId === playerId;

  const currentPanel: Panel = useMemo(() => {
    if (!localQuestion) {
      return { id: "mixed", name: "Mixed", description: "Various panels", icon: "globe", color: GameColors.secondary };
    }
    return panels.find(p => p.id === localQuestion.panelId) || 
      { id: localQuestion.panelId, name: localQuestion.panelId, description: "", icon: "users", color: GameColors.secondary };
  }, [localQuestion, panels]);

  useEffect(() => {
    if (currentQuestion) {
      setLocalQuestion(currentQuestion);
      setSelectedIndex(null);
      setShowResults(false);
      setTimerActive(true);
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (roundResults) {
      setShowResults(true);
      setTimerActive(false);
    }
  }, [roundResults]);

  const handleBack = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    leaveRoom();
    navigation.navigate("Home");
  };

  const handleSelectOption = (index: number) => {
    if (selectedIndex !== null || showResults) return;
    
    setSelectedIndex(index);
    setTimerActive(false);
    
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (localQuestion) {
      const selectedOption = localQuestion.options[index];
      const correctOption = localQuestion.options.find((o: any) => o.isCorrect);
      const isCorrect = selectedOption?.isCorrect;
      const points = isCorrect ? 100 : 0;

      submitAnswer(
        selectedOption?.text || "",
        correctOption?.text || "",
        points
      );
    }
  };

  const handleTimeUp = () => {
    if (selectedIndex === null && !showResults) {
      setTimerActive(false);
      if (localQuestion) {
        const correctOption = localQuestion.options.find((o: any) => o.isCorrect);
        submitAnswer("", correctOption?.text || "", 0);
      }
    }
  };

  const handleNextRound = () => {
    if (!isHost) return;
    
    clearResults();
    const nextIdx = questionIndex + 1;
    
    if (nextIdx >= TOTAL_ROUNDS) {
      nextQuestion();
    } else {
      setQuestionIndex(nextIdx);
      nextQuestion();
    }
  };

  const handlePlayAgain = () => {
    leaveRoom();
    navigation.navigate("MultiplayerLobby" as any);
  };

  const handleGoHome = () => {
    leaveRoom();
    navigation.navigate("Home");
  };

  const myResult = roundResults?.find(r => r.playerId === playerId);

  if (gameFinished) {
    return (
      <View style={[styles.container, { backgroundColor: GameColors.backgroundDark }]}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <ThemedText style={styles.headerTitle}>Game Over!</ThemedText>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.resultsContainer}>
          <Animated.View entering={ZoomIn.duration(500)} style={styles.winnerSection}>
            <Feather name="award" size={64} color={GameColors.accent} />
            <ThemedText style={styles.winnerLabel}>Winner</ThemedText>
            <ThemedText style={styles.winnerName}>{winner?.name}</ThemedText>
            <ThemedText style={[styles.winnerScore, { color: GameColors.accent }]}>
              {winner?.score} points
            </ThemedText>
          </Animated.View>

          <View style={[styles.leaderboardSection, { backgroundColor: GameColors.surface }]}>
            <ThemedText style={styles.leaderboardTitle}>Final Standings</ThemedText>
            {finalScores.map((player, index) => (
              <Animated.View
                key={player.id}
                entering={FadeInDown.delay(index * 100)}
                style={[
                  styles.leaderboardRow,
                  player.id === playerId ? styles.myRow : null,
                ]}
              >
                <View style={styles.rankContainer}>
                  <ThemedText style={[styles.rankText, { color: index === 0 ? GameColors.accent : GameColors.textSecondary }]}>
                    #{index + 1}
                  </ThemedText>
                </View>
                <ThemedText style={styles.playerNameText}>{player.name}</ThemedText>
                <ThemedText style={[styles.scoreText, { color: GameColors.accent }]}>
                  {player.score}
                </ThemedText>
              </Animated.View>
            ))}
          </View>

          <View style={styles.finalActions}>
            <GradientButton onPress={handlePlayAgain} style={styles.actionBtn}>
              <ThemedText style={styles.buttonText}>Play Again</ThemedText>
            </GradientButton>
            <Pressable
              style={[styles.secondaryBtn, { borderColor: GameColors.textSecondary }]}
              onPress={handleGoHome}
            >
              <ThemedText style={[styles.secondaryBtnText, { color: GameColors.textSecondary }]}>
                Back to Home
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!localQuestion) {
    return (
      <View style={[styles.container, { backgroundColor: GameColors.backgroundDark }]}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <ThemedText style={styles.loadingText}>Loading game...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: GameColors.backgroundDark }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBack} style={[styles.backButton, { backgroundColor: GameColors.surface }]}>
          <Feather name="x" size={24} color={GameColors.textPrimary} />
        </Pressable>

        {!showResults ? (
          <Timer
            duration={ROUND_DURATION}
            onComplete={handleTimeUp}
            isActive={timerActive}
          />
        ) : (
          <View style={styles.timerPlaceholder} />
        )}

        <View style={styles.progressBadge}>
          <ThemedText style={styles.progressText}>
            {questionIndex + 1}/{TOTAL_ROUNDS}
          </ThemedText>
        </View>
      </View>

      <View style={styles.playersBar}>
        <View style={styles.playerAvatars}>
          {room?.players.slice(0, 4).map((player, idx) => (
            <Image
              key={player.id}
              source={avatarImages[player.avatarId] || avatarImages["avatar-1"]}
              style={[styles.miniAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}
            />
          ))}
          {(room?.players.length || 0) > 4 ? (
            <View style={styles.morePlayersIndicator}>
              <ThemedText style={styles.morePlayersText}>
                +{(room?.players.length || 0) - 4}
              </ThemedText>
            </View>
          ) : null}
        </View>
        <ThemedText style={[styles.answeredText, { color: GameColors.textSecondary }]}>
          {answeredCount}/{room?.players.length || 0} answered
        </ThemedText>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {!showResults ? (
          <Animated.View entering={FadeIn.duration(300)}>
            <QuestionCard
              question={localQuestion.text}
              panel={currentPanel}
              layer={localQuestion.layer || "common"}
              round={questionIndex + 1}
              totalRounds={TOTAL_ROUNDS}
            />

            <View style={styles.optionsContainer}>
              <MultipleChoiceOptions
                options={localQuestion.options}
                selectedIndex={selectedIndex}
                showResults={false}
                onSelect={handleSelectOption}
              />
            </View>

            {selectedIndex !== null ? (
              <View style={styles.waitingContainer}>
                <ThemedText style={[styles.waitingText, { color: GameColors.textSecondary }]}>
                  Waiting for other players...
                </ThemedText>
              </View>
            ) : null}
          </Animated.View>
        ) : (
          <Animated.View entering={SlideInUp.springify()}>
            <View style={[styles.resultsCard, { backgroundColor: GameColors.surface }]}>
              <ThemedText style={styles.resultsTitle}>Round Results</ThemedText>
              
              {roundResults?.map((result, idx) => (
                <Animated.View
                  key={result.playerId}
                  entering={FadeInDown.delay(idx * 80)}
                  style={[
                    styles.resultRow,
                    result.playerId === playerId ? styles.myResultRow : null,
                  ]}
                >
                  <View style={styles.resultPlayerInfo}>
                    <Feather
                      name={result.isCorrect ? "check-circle" : "x-circle"}
                      size={20}
                      color={result.isCorrect ? GameColors.correct : GameColors.wrong}
                    />
                    <ThemedText style={styles.resultPlayerName}>
                      {result.playerName}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.resultPoints, { color: result.isCorrect ? GameColors.correct : GameColors.wrong }]}>
                    {result.isCorrect ? "+100" : "0"}
                  </ThemedText>
                </Animated.View>
              ))}

              <View style={styles.correctAnswerSection}>
                <ThemedText style={[styles.correctAnswerLabel, { color: GameColors.textSecondary }]}>
                  Correct Answer:
                </ThemedText>
                <ThemedText style={[styles.correctAnswerText, { color: GameColors.correct }]}>
                  {localQuestion?.options.find((o: any) => o.isCorrect)?.text}
                </ThemedText>
              </View>
            </View>

            {isHost ? (
              <GradientButton onPress={handleNextRound} style={styles.nextButton}>
                <ThemedText style={styles.buttonText}>
                  {questionIndex + 1 >= TOTAL_ROUNDS ? "See Final Results" : "Next Question"}
                </ThemedText>
              </GradientButton>
            ) : (
              <View style={styles.waitingContainer}>
                <ThemedText style={[styles.waitingText, { color: GameColors.textSecondary }]}>
                  Waiting for host to continue...
                </ThemedText>
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.h2,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  timerPlaceholder: {
    width: 60,
    height: 40,
  },
  progressBadge: {
    backgroundColor: GameColors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  progressText: {
    ...Typography.caption,
    color: GameColors.accent,
    fontWeight: "bold",
  },
  playersBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: GameColors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  playerAvatars: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: GameColors.backgroundDark,
  },
  morePlayersIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GameColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  morePlayersText: {
    ...Typography.caption,
    fontSize: 10,
    color: GameColors.textPrimary,
    fontWeight: "bold",
  },
  answeredText: {
    ...Typography.caption,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing["5xl"],
  },
  optionsContainer: {
    marginTop: Spacing.lg,
  },
  waitingContainer: {
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  waitingText: {
    ...Typography.body,
    fontStyle: "italic",
  },
  resultsCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  resultsTitle: {
    ...Typography.h3,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  myResultRow: {
    backgroundColor: GameColors.primary + "20",
  },
  resultPlayerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  resultPlayerName: {
    ...Typography.body,
    fontWeight: "600",
  },
  resultPoints: {
    ...Typography.body,
    fontWeight: "bold",
  },
  correctAnswerSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: GameColors.backgroundDark,
    alignItems: "center",
  },
  correctAnswerLabel: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
  correctAnswerText: {
    ...Typography.h4,
    fontWeight: "bold",
  },
  nextButton: {
    width: "100%",
  },
  buttonText: {
    ...Typography.button,
    color: GameColors.textPrimary,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    ...Typography.h3,
    color: GameColors.textSecondary,
  },
  resultsContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing["5xl"],
  },
  winnerSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  winnerLabel: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    marginTop: Spacing.md,
  },
  winnerName: {
    ...Typography.h1,
    fontWeight: "bold",
    color: GameColors.textPrimary,
    marginTop: Spacing.xs,
  },
  winnerScore: {
    ...Typography.h3,
    fontWeight: "bold",
    marginTop: Spacing.sm,
  },
  leaderboardSection: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  leaderboardTitle: {
    ...Typography.h4,
    fontWeight: "bold",
    marginBottom: Spacing.md,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  myRow: {
    backgroundColor: GameColors.primary + "20",
  },
  rankContainer: {
    width: 40,
  },
  rankText: {
    ...Typography.body,
    fontWeight: "bold",
  },
  playerNameText: {
    ...Typography.body,
    flex: 1,
  },
  scoreText: {
    ...Typography.body,
    fontWeight: "bold",
  },
  finalActions: {
    gap: Spacing.md,
  },
  actionBtn: {
    width: "100%",
  },
  secondaryBtn: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: "center",
  },
  secondaryBtnText: {
    ...Typography.button,
    fontWeight: "bold",
  },
});
