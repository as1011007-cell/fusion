import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { GradientButton } from "@/components/GradientButton";
import { Timer } from "@/components/Timer";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useMultiplayer, RoundResult } from "@/context/MultiplayerContext";
import { useProfile, avatarImages } from "@/context/ProfileContext";
import { useTheme } from "@/context/ThemeContext";
import { IQDifficulty } from "@/context/IQContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const IQColors = {
  primary: "#8B5CF6",
  secondary: "#A78BFA",
  accent: "#C4B5FD",
};

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

const ROUND_DURATION = 30;
const TOTAL_ROUNDS = 10;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function calculatePoints(
  correct: boolean,
  difficulty: IQDifficulty,
  timeSpent: number,
  timeLimit: number
): number {
  if (!correct) return 0;

  const difficultyMultiplier: Record<IQDifficulty, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  const basePoints = 100 * difficultyMultiplier[difficulty];
  const timeRatio = Math.max(0, (timeLimit - timeSpent) / timeLimit);
  const speedBonus = Math.floor(basePoints * timeRatio * 0.5);

  return basePoints + speedBonus;
}

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
    if (isSelected) return IQColors.primary + "30";
    return GameColors.surface;
  };

  const getBorderColor = () => {
    if (showResult) {
      if (isCorrect) return GameColors.correct;
      if (isSelected && !isCorrect) return GameColors.wrong;
    }
    if (isSelected) return IQColors.primary;
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

function PlayerScoreBar({
  players,
  currentPlayerId,
  answeredCount,
}: {
  players: { id: string; name: string; avatarId: string; score: number }[];
  currentPlayerId: string | null;
  answeredCount: number;
}) {
  return (
    <View style={styles.playersBar}>
      <View style={styles.playerScores}>
        {players.slice(0, 4).map((player, idx) => {
          const isCurrentPlayer = player.id === currentPlayerId;
          return (
            <View
              key={player.id}
              style={[
                styles.playerScoreItem,
                isCurrentPlayer && styles.currentPlayerItem,
              ]}
            >
              <Image
                source={avatarImages[player.avatarId] || avatarImages["avatar-1"]}
                style={styles.miniAvatar}
              />
              <ThemedText
                style={[
                  styles.playerScoreText,
                  { color: isCurrentPlayer ? IQColors.primary : GameColors.accent },
                ]}
                numberOfLines={1}
              >
                {player.score}
              </ThemedText>
            </View>
          );
        })}
        {players.length > 4 ? (
          <View style={styles.morePlayersIndicator}>
            <ThemedText style={styles.morePlayersText}>
              +{players.length - 4}
            </ThemedText>
          </View>
        ) : null}
      </View>
      <View style={styles.answeredIndicator}>
        <View style={styles.answeredDots}>
          {players.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    idx < answeredCount ? IQColors.primary : "rgba(255,255,255,0.2)",
                },
              ]}
            />
          ))}
        </View>
        <ThemedText style={styles.answeredText}>
          {answeredCount}/{players.length}
        </ThemedText>
      </View>
    </View>
  );
}

function AnimatedTimer({
  duration,
  onComplete,
  isActive,
  timerKey,
}: {
  duration: number;
  onComplete: () => void;
  isActive: boolean;
  timerKey: number;
}) {
  const progress = useSharedValue(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
      progress.value = 1;
      progress.value = withTiming(0, {
        duration: duration * 1000,
        easing: Easing.linear,
      });

      timerRef.current = setTimeout(() => {
        onComplete();
      }, duration * 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isActive, timerKey]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.timerContainer}>
      <View style={styles.timerBar}>
        <Animated.View
          style={[
            styles.timerProgress,
            animatedStyle,
            { backgroundColor: IQColors.primary },
          ]}
        />
      </View>
    </View>
  );
}

export default function IQMultiplayerGameScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { settings } = useProfile();
  const { currentTheme } = useTheme();
  const colors = currentTheme.colors;

  const {
    playerId,
    room,
    currentQuestion,
    roundResults,
    answeredCount,
    gameFinished,
    roomReset,
    finalScores,
    winner,
    isDraw,
    submitAnswer,
    nextQuestion,
    leaveRoom,
    playAgain,
    clearResults,
    clearRoomReset,
  } = useMultiplayer();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [localQuestion, setLocalQuestion] = useState<any>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);
  const questionStartTime = useRef(Date.now());

  const isHost = room?.hostId === playerId;

  useEffect(() => {
    if (currentQuestion) {
      setLocalQuestion(currentQuestion);
      setSelectedIndex(null);
      setShowResults(false);
      setTimerActive(true);
      setIsAdvancing(false);
      setTimerKey((prev) => prev + 1);
      questionStartTime.current = Date.now();
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (roundResults) {
      setShowResults(true);
      setTimerActive(false);
    }
  }, [roundResults]);

  useEffect(() => {
    if (roomReset && room?.status === "waiting") {
      clearRoomReset();
      navigation.navigate("IQMultiplayerLobby", {
        difficulty: "all",
        category: "all",
        questionCount: TOTAL_ROUNDS,
      });
    }
  }, [roomReset, room?.status]);

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

    const timeSpent = (Date.now() - questionStartTime.current) / 1000;
    const timeLimit = localQuestion?.timeLimit || ROUND_DURATION;
    const difficulty = localQuestion?.difficulty || "medium";
    const isCorrect = index === localQuestion?.correctIndex;
    const points = calculatePoints(isCorrect, difficulty, timeSpent, timeLimit);
    setLastPoints(points);

    if (settings.hapticsEnabled) {
      if (isCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }

    const selectedOption = localQuestion?.options[index] || "";
    const correctOption = localQuestion?.options[localQuestion?.correctIndex] || "";

    submitAnswer(selectedOption, correctOption, points);
  };

  const handleTimeUp = () => {
    if (selectedIndex === null && !showResults) {
      setTimerActive(false);
      setSelectedIndex(-1);

      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      const correctOption = localQuestion?.options[localQuestion?.correctIndex] || "";
      submitAnswer("", correctOption, 0);
      setLastPoints(0);
    }
  };

  const handleNextRound = () => {
    if (isAdvancing) return;
    setIsAdvancing(true);
    clearResults();
    const nextIdx = questionIndex + 1;
    setQuestionIndex(nextIdx);
    nextQuestion();
  };

  const handlePlayAgain = () => {
    playAgain();
  };

  const handleGoHome = () => {
    leaveRoom();
    navigation.navigate("Home");
  };

  const calculateIQEstimate = (score: number, totalQuestions: number): number => {
    const maxPossible = totalQuestions * 150;
    const percentage = score / maxPossible;
    const baseIQ = 85;
    const maxBonus = 45;
    return Math.round(baseIQ + percentage * maxBonus + Math.random() * 5);
  };

  const myResult = roundResults?.find((r) => r.playerId === playerId);

  if (gameFinished) {
    const sortedScores = [...finalScores].sort((a, b) => b.score - a.score);
    
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundDark }]}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}>
          <ThemedText style={styles.headerTitle}>IQ Challenge Complete!</ThemedText>
        </View>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={[styles.resultsContainerFinal, { paddingBottom: insets.bottom + Spacing["5xl"] }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={ZoomIn.duration(500)} style={styles.winnerSection}>
            <View style={[styles.iqBadge, { backgroundColor: IQColors.primary }]}>
              <Feather name="cpu" size={32} color={GameColors.textPrimary} />
            </View>
            <ThemedText style={styles.winnerLabel}>
              {isDraw ? "It's a Tie!" : "Top IQ"}
            </ThemedText>
            {isDraw ? (
              <ThemedText style={styles.winnerName}>
                {sortedScores
                  .filter((p) => p.score === sortedScores[0]?.score)
                  .map((p) => p.name)
                  .join(" & ")}
              </ThemedText>
            ) : (
              <ThemedText style={styles.winnerName}>{winner?.name}</ThemedText>
            )}
            <ThemedText style={[styles.winnerScore, { color: IQColors.primary }]}>
              {isDraw ? sortedScores[0]?.score : winner?.score} pts
            </ThemedText>
            <ThemedText style={styles.iqEstimateText}>
              Est. IQ: {calculateIQEstimate(isDraw ? sortedScores[0]?.score || 0 : winner?.score || 0, TOTAL_ROUNDS)}
            </ThemedText>
          </Animated.View>

          <View style={[styles.leaderboardSection, { backgroundColor: GameColors.surface }]}>
            <ThemedText style={styles.leaderboardTitle}>Final Rankings</ThemedText>
            {sortedScores.map((player, index) => {
              const iqEstimate = calculateIQEstimate(player.score, TOTAL_ROUNDS);
              return (
                <Animated.View
                  key={player.id}
                  entering={FadeInDown.delay(index * 100)}
                  style={[
                    styles.leaderboardRow,
                    player.id === playerId ? styles.myRow : null,
                  ]}
                >
                  <View style={[styles.rankContainer, { backgroundColor: index === 0 ? IQColors.primary + "40" : GameColors.backgroundDark }]}>
                    <ThemedText
                      style={[
                        styles.rankText,
                        { color: index === 0 ? IQColors.primary : GameColors.textSecondary },
                      ]}
                    >
                      #{index + 1}
                    </ThemedText>
                  </View>
                  <Image
                    source={avatarImages[player.avatarId || "avatar-1"] || avatarImages["avatar-1"]}
                    style={styles.leaderboardAvatar}
                  />
                  <View style={styles.playerInfo}>
                    <ThemedText style={styles.playerNameText}>{player.name}</ThemedText>
                    <ThemedText style={styles.iqSmallText}>IQ ~{iqEstimate}</ThemedText>
                  </View>
                  <ThemedText style={[styles.scoreText, { color: IQColors.primary }]}>
                    {player.score}
                  </ThemedText>
                </Animated.View>
              );
            })}
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
      <View style={[styles.container, { backgroundColor: colors.backgroundDark }]}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top + Spacing.xl }]}>
          <Feather name="cpu" size={48} color={IQColors.primary} />
          <ThemedText style={styles.loadingText}>Loading IQ Challenge...</ThemedText>
        </View>
      </View>
    );
  }

  const categoryLabel = CATEGORY_LABELS[localQuestion.category] || localQuestion.category || "Mixed";
  const difficultyColor = DIFFICULTY_COLORS[localQuestion.difficulty] || IQColors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundDark }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable
          onPress={handleBack}
          style={[styles.backButton, { backgroundColor: GameColors.surface }]}
        >
          <Feather name="x" size={24} color={GameColors.textPrimary} />
        </Pressable>

        {!showResults ? (
          <Timer
            key={timerKey}
            duration={localQuestion.timeLimit || ROUND_DURATION}
            onComplete={handleTimeUp}
            isActive={timerActive}
          />
        ) : (
          <View style={styles.timerPlaceholder} />
        )}

        <View style={[styles.progressBadge, { backgroundColor: IQColors.primary + "30" }]}>
          <Feather name="cpu" size={14} color={IQColors.primary} />
          <ThemedText style={[styles.progressText, { color: IQColors.primary }]}>
            {questionIndex + 1}/{TOTAL_ROUNDS}
          </ThemedText>
        </View>
      </View>

      <PlayerScoreBar
        players={room?.players || []}
        currentPlayerId={playerId}
        answeredCount={answeredCount}
      />

      <View style={styles.badgesContainer}>
        <View style={[styles.badge, { backgroundColor: GameColors.surface }]}>
          <Feather name="layers" size={14} color={IQColors.secondary} />
          <ThemedText style={[styles.badgeText, { color: IQColors.secondary }]}>
            {categoryLabel}
          </ThemedText>
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: difficultyColor + "20", borderColor: difficultyColor },
          ]}
        >
          <Feather name="bar-chart-2" size={14} color={difficultyColor} />
          <ThemedText style={[styles.badgeText, { color: difficultyColor }]}>
            {(localQuestion.difficulty || "medium").charAt(0).toUpperCase() +
              (localQuestion.difficulty || "medium").slice(1)}
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {!showResults ? (
          <Animated.View entering={FadeIn.duration(300)}>
            <View style={styles.questionContainer}>
              <ThemedText style={styles.questionText}>{localQuestion.text}</ThemedText>
            </View>

            <View style={styles.optionsContainer}>
              {localQuestion.options.map((option: string, index: number) => (
                <OptionButton
                  key={`${timerKey}-${index}`}
                  text={option}
                  index={index}
                  isSelected={selectedIndex === index}
                  isCorrect={index === localQuestion.correctIndex}
                  showResult={false}
                  onSelect={() => handleSelectOption(index)}
                  disabled={selectedIndex !== null}
                />
              ))}
            </View>

            {selectedIndex !== null && selectedIndex !== -1 ? (
              <Animated.View entering={FadeIn.duration(200)} style={styles.waitingContainer}>
                <Feather name="clock" size={20} color={GameColors.textSecondary} />
                <ThemedText style={styles.waitingText}>
                  Waiting for other players...
                </ThemedText>
              </Animated.View>
            ) : null}
          </Animated.View>
        ) : (
          <Animated.View entering={SlideInUp.springify()}>
            <View style={[styles.resultsCard, { backgroundColor: GameColors.surface }]}>
              <ThemedText style={styles.resultsTitle}>Round Results</ThemedText>

              {roundResults?.map((result, idx) => {
                const isMe = result.playerId === playerId;
                return (
                  <Animated.View
                    key={result.playerId}
                    entering={FadeInDown.delay(idx * 80)}
                    style={[styles.resultRow, isMe ? styles.myResultRow : null]}
                  >
                    <View style={styles.resultPlayerInfo}>
                      <Feather
                        name={result.isCorrect ? "check-circle" : "x-circle"}
                        size={20}
                        color={result.isCorrect ? GameColors.correct : GameColors.wrong}
                      />
                      <ThemedText style={styles.resultPlayerName}>
                        {result.playerName}
                        {isMe ? " (You)" : ""}
                      </ThemedText>
                    </View>
                    <View style={styles.resultScoreContainer}>
                      <ThemedText
                        style={[
                          styles.resultPoints,
                          { color: result.isCorrect ? GameColors.correct : GameColors.wrong },
                        ]}
                      >
                        {result.isCorrect ? `+${result.newScore - (roundResults.find(r => r.playerId === result.playerId)?.newScore || 0) + (result.newScore > 0 ? Math.floor(result.newScore * 0.1) : 0)}` : "0"}
                      </ThemedText>
                      <ThemedText style={styles.totalScore}>{result.newScore}</ThemedText>
                    </View>
                  </Animated.View>
                );
              })}

              <View style={styles.correctAnswerSection}>
                <ThemedText style={styles.correctAnswerLabel}>Correct Answer:</ThemedText>
                <ThemedText style={[styles.correctAnswerText, { color: GameColors.correct }]}>
                  {localQuestion?.options[localQuestion?.correctIndex]}
                </ThemedText>
              </View>
            </View>

            {isHost ? (
              <GradientButton
                onPress={handleNextRound}
                disabled={isAdvancing}
                style={styles.nextButton}
              >
                <ThemedText style={styles.buttonText}>
                  {isAdvancing
                    ? "Loading..."
                    : questionIndex + 1 >= TOTAL_ROUNDS
                    ? "See Final Results"
                    : "Next Question"}
                </ThemedText>
              </GradientButton>
            ) : (
              <View style={styles.waitingHostContainer}>
                <Feather name="clock" size={20} color={IQColors.secondary} />
                <ThemedText style={[styles.waitingHostText, { color: IQColors.secondary }]}>
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
  progressBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  progressText: {
    ...Typography.caption,
    fontWeight: "bold",
  },
  playersBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: GameColors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  playerScores: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  playerScoreItem: {
    alignItems: "center",
    gap: 2,
  },
  currentPlayerItem: {
    opacity: 1,
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: GameColors.backgroundDark,
  },
  playerScoreText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "bold",
  },
  morePlayersIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: IQColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  morePlayersText: {
    ...Typography.caption,
    fontSize: 10,
    color: GameColors.textPrimary,
    fontWeight: "bold",
  },
  answeredIndicator: {
    alignItems: "center",
    gap: 4,
  },
  answeredDots: {
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  answeredText: {
    ...Typography.caption,
    fontSize: 10,
    color: GameColors.textSecondary,
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
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing["5xl"],
  },
  questionContainer: {
    marginBottom: Spacing.xl,
  },
  questionText: {
    ...Typography.h3,
    color: GameColors.textPrimary,
    textAlign: "center",
    lineHeight: 32,
  },
  optionsContainer: {
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
  waitingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  waitingText: {
    ...Typography.body,
    color: GameColors.textSecondary,
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
    backgroundColor: IQColors.primary + "20",
  },
  resultPlayerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  resultPlayerName: {
    ...Typography.body,
    fontWeight: "600",
  },
  resultScoreContainer: {
    alignItems: "flex-end",
  },
  resultPoints: {
    ...Typography.body,
    fontWeight: "bold",
  },
  totalScore: {
    ...Typography.caption,
    color: GameColors.textSecondary,
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
    color: GameColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  correctAnswerText: {
    ...Typography.h4,
    fontWeight: "bold",
  },
  nextButton: {
    width: "100%",
  },
  waitingHostContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  waitingHostText: {
    ...Typography.body,
    fontStyle: "italic",
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
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.h3,
    color: GameColors.textSecondary,
  },
  resultsContainerFinal: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  winnerSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
    backgroundColor: GameColors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: IQColors.primary + "40",
  },
  iqBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  winnerLabel: {
    ...Typography.body,
    color: GameColors.textSecondary,
    marginTop: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  winnerName: {
    ...Typography.h1,
    fontSize: 28,
    fontWeight: "bold",
    color: GameColors.textPrimary,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  winnerScore: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: "bold",
    marginTop: Spacing.sm,
  },
  iqEstimateText: {
    ...Typography.body,
    color: IQColors.secondary,
    marginTop: Spacing.sm,
    fontWeight: "600",
  },
  leaderboardSection: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  leaderboardTitle: {
    ...Typography.h3,
    fontWeight: "bold",
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  myRow: {
    backgroundColor: IQColors.primary + "30",
    borderWidth: 1,
    borderColor: IQColors.primary,
  },
  leaderboardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: Spacing.sm,
    borderWidth: 2,
    borderColor: GameColors.surface,
  },
  rankContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  rankText: {
    ...Typography.body,
    fontWeight: "bold",
  },
  playerInfo: {
    flex: 1,
  },
  playerNameText: {
    ...Typography.body,
    fontWeight: "600",
  },
  iqSmallText: {
    ...Typography.caption,
    color: IQColors.secondary,
  },
  scoreText: {
    ...Typography.h4,
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
  timerContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  timerBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  timerProgress: {
    height: "100%",
    borderRadius: 2,
  },
});
