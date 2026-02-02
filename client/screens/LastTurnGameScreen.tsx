import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Dimensions, Alert, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp,
  ZoomIn,
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withRepeat, 
  withSequence, 
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { GradientButton } from "@/components/GradientButton";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useLastTurn, LastTurnPlayer } from "@/context/LastTurnContext";
import { useProfile, avatarImages } from "@/context/ProfileContext";
import { useTheme } from "@/context/ThemeContext";
import { initInterstitialAd, showInterstitialAd } from "@/services/InterstitialAdService";
import { useLastTurnSounds } from "@/hooks/useLastTurnSounds";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHAMBER_SIZE = Math.min(SCREEN_WIDTH - 40, 340);
const SLOT_SIZE = CHAMBER_SIZE / 3.5;

export default function LastTurnGameScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { currentProfile, settings } = useProfile();
  const { currentTheme, isAdFree } = useTheme();
  const colors = currentTheme.colors;
  const { playSound } = useLastTurnSounds();
  
  const {
    playerId,
    room,
    lastAction,
    gameFinished,
    winner,
    pullSlot,
    passAction,
    forcePlayer,
    answerTruth,
    voteTruth,
    leaveRoom,
    playAgain,
  } = useLastTurn();

  const [showingAction, setShowingAction] = useState(false);
  const [showForceModal, setShowForceModal] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  
  const chamberRotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const crashShake = useSharedValue(0);

  const isMyTurn = room?.currentTurnPlayerId === playerId || room?.forcedPlayerId === playerId;
  const myPlayer = room?.players.find(p => p.id === playerId);
  const currentTurnPlayer = room?.players.find(p => p.id === room?.currentTurnPlayerId);

  useEffect(() => {
    chamberRotation.value = withRepeat(
      withTiming(360, { duration: 60000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    if (isMyTurn) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
      if (settings.hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [isMyTurn]);

  useEffect(() => {
    if (lastAction) {
      setShowingAction(true);
      
      if (lastAction.type === "pull") {
        if (lastAction.wasCrash) {
          playSound("pull-crash");
          if (settings.hapticsEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          crashShake.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(0, { duration: 50 })
          );
        } else {
          playSound("pull-safe");
          if (settings.hapticsEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      } else if (lastAction.type === "pass") {
        playSound("skip");
        if (settings.hapticsEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } else if (lastAction.type === "force") {
        playSound("force");
        if (settings.hapticsEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      } else if (lastAction.type === "revenge") {
        playSound("revenge");
        if (settings.hapticsEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
      
      const timer = setTimeout(() => setShowingAction(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [lastAction, playSound]);

  useEffect(() => {
    if (gameFinished && !isAdFree) {
      initInterstitialAd();
      const adTimer = setTimeout(() => {
        showInterstitialAd();
      }, 2000);
      return () => clearTimeout(adTimer);
    }
  }, [gameFinished, isAdFree]);

  // Reset voting state when voting phase changes
  useEffect(() => {
    if (!room?.votingState) {
      setHasVoted(false);
    }
  }, [room?.votingState]);

  const chamberStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${chamberRotation.value}deg` },
      { translateX: crashShake.value },
    ],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handlePull = () => {
    if (!isMyTurn) return;
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    pullSlot();
  };

  const handleSelectChoice = (choiceIndex: number) => {
    if (!isMyTurn) return;
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    answerTruth(choiceIndex);
  };

  const handleVote = (accept: boolean) => {
    if (hasVoted) return;
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    voteTruth(accept);
    setHasVoted(true);
  };

  const handlePass = () => {
    if (!isMyTurn || !myPlayer?.hasPassToken) return;
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    passAction();
  };

  const handleForce = () => {
    if (!isMyTurn || (!myPlayer?.hasForceToken && !myPlayer?.hasRevengeToken)) return;
    setShowForceModal(true);
  };

  const handleSelectForceTarget = (targetId: string) => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    forcePlayer(targetId);
    setShowForceModal(false);
  };

  const handleLeave = () => {
    Alert.alert(
      "Leave Game",
      "Are you sure you want to leave this game?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Leave", 
          style: "destructive",
          onPress: () => {
            leaveRoom();
            navigation.navigate("Home");
          }
        }
      ]
    );
  };

  const handlePlayAgain = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    playAgain();
  };

  const handleGoHome = () => {
    leaveRoom();
    navigation.navigate("Home");
  };

  const renderSlot = (index: number) => {
    const isRevealed = room?.revealedSlots.includes(index);
    const isCrash = isRevealed && room?.chamberSlots[index];
    
    const angle = (index * 60) - 90;
    const radius = (CHAMBER_SIZE / 2) - (SLOT_SIZE / 2) - 8;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    
    const centerX = CHAMBER_SIZE / 2 - SLOT_SIZE / 2;
    const centerY = CHAMBER_SIZE / 2 - SLOT_SIZE / 2;

    return (
      <Animated.View
        key={index}
        entering={ZoomIn.delay(index * 100)}
        style={[
          styles.slot,
          {
            width: SLOT_SIZE,
            height: SLOT_SIZE,
            borderRadius: SLOT_SIZE / 2,
            left: centerX + x,
            top: centerY + y,
            backgroundColor: isRevealed 
              ? (isCrash ? "#FF4444" : colors.primary + "40") 
              : colors.surface,
            borderColor: isRevealed 
              ? (isCrash ? "#FF4444" : colors.primary) 
              : "#2E3350",
          }
        ]}
      >
        {isRevealed ? (
          <Feather 
            name={isCrash ? "zap" : "check"} 
            size={24} 
            color={isCrash ? "#FFF" : colors.primary} 
          />
        ) : (
          <ThemedText style={[styles.slotNumber, { color: GameColors.textSecondary }]}>
            {index + 1}
          </ThemedText>
        )}
      </Animated.View>
    );
  };

  const renderActionFeedback = () => {
    if (!lastAction || !showingAction) return null;

    const actionPlayer = room?.players.find(p => p.id === lastAction.playerId);
    
    let message = "";
    let icon: any = "circle";
    let iconColor = colors.primary;

    if (lastAction.type === "pull") {
      if (lastAction.wasCrash) {
        message = `${actionPlayer?.name} hit the CRASH!`;
        icon = "zap";
        iconColor = "#FF4444";
      } else {
        message = `${actionPlayer?.name} pulled safely`;
        icon = "check-circle";
        iconColor = colors.primary;
      }
    } else if (lastAction.type === "pass") {
      message = `${actionPlayer?.name} passed their turn`;
      icon = "skip-forward";
      iconColor = colors.secondary;
    } else if (lastAction.type === "force") {
      const targetPlayer = room?.players.find(p => p.id === lastAction.targetPlayerId);
      message = `${actionPlayer?.name} forced ${targetPlayer?.name}!`;
      icon = "target";
      iconColor = colors.accent;
    }

    return (
      <Animated.View 
        entering={FadeInUp} 
        style={[styles.actionFeedback, { backgroundColor: colors.surface }]}
      >
        <Feather name={icon} size={24} color={iconColor} />
        <ThemedText style={[styles.actionText, { color: GameColors.textPrimary }]}>{message}</ThemedText>
      </Animated.View>
    );
  };

  const renderTruthMode = () => {
    if (room?.gameMode !== 'truth') return null;

    // Show voting result
    if (room?.votingResult) {
      return (
        <Animated.View entering={FadeIn} style={styles.truthPopup}>
          <View style={[styles.truthPopupCard, { backgroundColor: colors.surface }]}>
            <View style={styles.truthPopupHeader}>
              <Feather 
                name={room.votingResult.accepted ? "check-circle" : "x-circle"} 
                size={24} 
                color={room.votingResult.accepted ? "#4CAF50" : "#FF4444"} 
              />
              <ThemedText style={[styles.truthPopupTitle, { color: room.votingResult.accepted ? "#4CAF50" : "#FF4444" }]}>
                {room.votingResult.accepted ? "ANSWER ACCEPTED" : "ANSWER REJECTED"}
              </ThemedText>
            </View>
            <ThemedText style={[styles.truthPopupPlayerName, { color: colors.accent }]}>
              {room.votingResult.playerName}
            </ThemedText>
            <ThemedText style={[styles.truthPopupAnswer, { color: GameColors.textPrimary }]}>
              "{room.votingResult.answerText}"
            </ThemedText>
            <View style={styles.voteResultStats}>
              <View style={styles.voteResultColumn}>
                <View style={[styles.voteResultBadge, { backgroundColor: "#4CAF50" + "30" }]}>
                  <Feather name="thumbs-up" size={16} color="#4CAF50" />
                  <ThemedText style={[styles.voteResultCount, { color: "#4CAF50" }]}>
                    {room.votingResult.acceptCount}
                  </ThemedText>
                </View>
                {room.votingResult.acceptedBy.length > 0 && (
                  <ThemedText style={[styles.voterNames, { color: "#4CAF50" }]}>
                    {room.votingResult.acceptedBy.join(", ")}
                  </ThemedText>
                )}
              </View>
              <View style={styles.voteResultColumn}>
                <View style={[styles.voteResultBadge, { backgroundColor: "#FF4444" + "30" }]}>
                  <Feather name="thumbs-down" size={16} color="#FF4444" />
                  <ThemedText style={[styles.voteResultCount, { color: "#FF4444" }]}>
                    {room.votingResult.rejectCount}
                  </ThemedText>
                </View>
                {room.votingResult.rejectedBy.length > 0 && (
                  <ThemedText style={[styles.voterNames, { color: "#FF4444" }]}>
                    {room.votingResult.rejectedBy.join(", ")}
                  </ThemedText>
                )}
              </View>
            </View>
            {!room.votingResult.accepted && room.votingResult.playerId === playerId && (
              <ThemedText style={[styles.mustPullWarning, { color: "#FF4444" }]}>
                You must pull the chamber!
              </ThemedText>
            )}
          </View>
        </Animated.View>
      );
    }

    // Show voting phase
    if (room?.votingState) {
      const isAnsweringPlayer = room.votingState.playerId === playerId;
      const myVote = room.votingState.votes.find(v => v.voterId === playerId);
      
      return (
        <Animated.View entering={FadeIn} style={styles.truthPopup}>
          <View style={[styles.truthPopupCard, { backgroundColor: colors.surface }]}>
            <View style={styles.truthPopupHeader}>
              <Feather name="users" size={24} color={colors.secondary} />
              <ThemedText style={[styles.truthPopupTitle, { color: colors.secondary }]}>
                VOTING TIME
              </ThemedText>
              <View style={[styles.truthTimer, { backgroundColor: room.votingState.votingTimer <= 5 ? "#FF4444" : colors.primary + "30" }]}>
                <ThemedText style={[styles.truthTimerText, { color: room.votingState.votingTimer <= 5 ? "#FFF" : colors.primary }]}>
                  {room.votingState.votingTimer}s
                </ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.truthPopupPlayerName, { color: colors.accent }]}>
              {room.votingState.playerName} answered:
            </ThemedText>
            <ThemedText style={[styles.truthPopupAnswer, { color: GameColors.textPrimary }]}>
              "{room.votingState.answerText}"
            </ThemedText>
            
            {isAnsweringPlayer ? (
              <View style={styles.votingWaitingContainer}>
                <ThemedText style={[styles.votingWaitingText, { color: GameColors.textSecondary }]}>
                  Waiting for others to vote...
                </ThemedText>
                <ThemedText style={[styles.votingCountText, { color: colors.primary }]}>
                  {room.votingState.votes.length} vote(s) received
                </ThemedText>
              </View>
            ) : hasVoted || myVote ? (
              <View style={styles.votingWaitingContainer}>
                <ThemedText style={[styles.votingWaitingText, { color: GameColors.textSecondary }]}>
                  Vote submitted! Waiting for others...
                </ThemedText>
                <ThemedText style={[styles.votingCountText, { color: colors.primary }]}>
                  {room.votingState.votes.length} vote(s) received
                </ThemedText>
              </View>
            ) : (
              <View style={styles.votingButtonsContainer}>
                <ThemedText style={[styles.votingPrompt, { color: GameColors.textSecondary }]}>
                  Do you accept this answer?
                </ThemedText>
                <View style={styles.votingButtons}>
                  <Pressable
                    style={[styles.voteButton, styles.voteAcceptButton]}
                    onPress={() => handleVote(true)}
                  >
                    <Feather name="thumbs-up" size={20} color="#FFF" />
                    <ThemedText style={styles.voteButtonText}>Accept</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.voteButton, styles.voteRejectButton]}
                    onPress={() => handleVote(false)}
                  >
                    <Feather name="thumbs-down" size={20} color="#FFF" />
                    <ThemedText style={styles.voteButtonText}>Reject</ThemedText>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </Animated.View>
      );
    }

    // Show question with multiple choice options
    if (room?.awaitingTruthAnswer && room?.truthQuestion && room?.truthChoices) {
      return (
        <Animated.View entering={FadeIn} style={styles.truthPopup}>
          <View style={[styles.truthPopupCard, { backgroundColor: colors.surface }]}>
            <View style={styles.truthPopupHeader}>
              <Feather name="help-circle" size={24} color={colors.secondary} />
              <ThemedText style={[styles.truthPopupTitle, { color: colors.secondary }]}>
                TRUTH OR RISK
              </ThemedText>
              <View style={[styles.truthTimer, { backgroundColor: room.truthAnswerTimer <= 5 ? "#FF4444" : colors.primary + "30" }]}>
                <ThemedText style={[styles.truthTimerText, { color: room.truthAnswerTimer <= 5 ? "#FFF" : colors.primary }]}>
                  {room.truthAnswerTimer}s
                </ThemedText>
              </View>
            </View>
            
            <ThemedText style={[styles.truthPopupQuestion, { color: GameColors.textPrimary }]}>
              {room.truthQuestion}
            </ThemedText>

            {isMyTurn ? (
              <View style={styles.choicesContainer}>
                {room.truthChoices.map((choice, index) => (
                  <Pressable
                    key={index}
                    style={[styles.choiceButton, { backgroundColor: colors.backgroundDark, borderColor: colors.primary + "50" }]}
                    onPress={() => handleSelectChoice(index)}
                  >
                    <View style={[styles.choiceLetter, { backgroundColor: colors.primary }]}>
                      <ThemedText style={styles.choiceLetterText}>
                        {String.fromCharCode(65 + index)}
                      </ThemedText>
                    </View>
                    <ThemedText style={[styles.choiceText, { color: GameColors.textPrimary }]} numberOfLines={2}>
                      {choice}
                    </ThemedText>
                  </Pressable>
                ))}
                <Pressable
                  style={[styles.riskChamberButton, { backgroundColor: "#FF4444" + "20", borderColor: "#FF4444" }]}
                  onPress={handlePull}
                >
                  <Feather name="zap" size={18} color="#FF4444" />
                  <ThemedText style={[styles.riskChamberText, { color: "#FF4444" }]}>
                    Skip Question - Risk the Chamber
                  </ThemedText>
                </Pressable>
              </View>
            ) : (
              <View style={styles.waitingForAnswerContainer}>
                <ThemedText style={[styles.waitingForAnswerText, { color: GameColors.textSecondary }]}>
                  {currentTurnPlayer?.name} is choosing an answer...
                </ThemedText>
              </View>
            )}
          </View>
        </Animated.View>
      );
    }

    // When mustPullAfterReject is true, don't show a popup - let the player use the main pull button
    // The turn indicator will show they must pull

    return null;
  };

  const renderGameFinished = () => (
    <Animated.View entering={FadeIn} style={[styles.finishedOverlay, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 }]}>
      <Animated.View entering={ZoomIn.delay(300)} style={styles.finishedContent}>
        <ThemedText style={[styles.finishedTitle, { color: colors.primary }]}>GAME OVER</ThemedText>
        
        {winner ? (
          <>
            <Image
              source={avatarImages[winner.avatarId] || avatarImages["avatar-1"]}
              style={styles.winnerAvatar}
              contentFit="contain"
            />
            <ThemedText style={[styles.winnerName, { color: GameColors.textPrimary }]}>{winner.name}</ThemedText>
            <ThemedText style={[styles.winnerLabel, { color: colors.secondary }]}>WINNER</ThemedText>
          </>
        ) : (
          <ThemedText style={[styles.noWinner, { color: GameColors.textSecondary }]}>No winner</ThemedText>
        )}

        <View style={styles.finishedButtons}>
          <GradientButton
            onPress={handlePlayAgain}
            style={styles.finishedButton}
          >
            Play Again
          </GradientButton>
          <Pressable style={[styles.homeButton, { backgroundColor: colors.surface }]} onPress={handleGoHome}>
            <ThemedText style={[styles.homeButtonText, { color: GameColors.textPrimary }]}>Go Home</ThemedText>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );

  const renderForceModal = () => {
    if (!showForceModal) return null;

    const otherPlayers = room?.players.filter(p => p.id !== playerId && p.lives > 0) || [];

    return (
      <View style={styles.modalOverlay}>
        <Animated.View entering={ZoomIn} style={[styles.forceModal, { backgroundColor: colors.surface }]}>
          <ThemedText style={[styles.forceModalTitle, { color: GameColors.textPrimary }]}>
            Choose a player to FORCE
          </ThemedText>
          
          {otherPlayers.map((player) => (
            <Pressable
              key={player.id}
              style={[styles.forcePlayerCard, { backgroundColor: colors.backgroundDark }]}
              onPress={() => handleSelectForceTarget(player.id)}
            >
              <Image
                source={avatarImages[player.avatarId] || avatarImages["avatar-1"]}
                style={styles.forcePlayerAvatar}
                contentFit="contain"
              />
              <View style={styles.forcePlayerInfo}>
                <ThemedText style={[styles.forcePlayerName, { color: GameColors.textPrimary }]}>{player.name}</ThemedText>
                <View style={styles.forceLivesRow}>
                  {[1, 2, 3].map((life) => (
                    <Feather
                      key={life}
                      name="heart"
                      size={12}
                      color={life <= player.lives ? "#FF6B6B" : "#2E3350"}
                    />
                  ))}
                </View>
              </View>
            </Pressable>
          ))}
          
          <Pressable 
            style={[styles.cancelButton, { borderColor: "#2E3350" }]}
            onPress={() => setShowForceModal(false)}
          >
            <ThemedText style={[styles.cancelButtonText, { color: GameColors.textSecondary }]}>Cancel</ThemedText>
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.backgroundDark }]}>
      <View style={styles.header}>
        <Pressable style={styles.leaveButton} onPress={handleLeave}>
          <Feather name="x" size={24} color={GameColors.textSecondary} />
        </Pressable>
        <View style={styles.roundInfo}>
          <ThemedText style={[styles.roundLabel, { color: GameColors.textSecondary }]}>Round</ThemedText>
          <ThemedText style={[styles.roundNumber, { color: colors.primary }]}>{room?.currentRound || 1}</ThemedText>
        </View>
        <View style={styles.timerContainer}>
          <Feather name="clock" size={16} color={GameColors.textSecondary} />
          <ThemedText style={[styles.timer, { color: GameColors.textPrimary }]}>{room?.turnTimer || 30}s</ThemedText>
        </View>
      </View>

      <View style={styles.playersRow}>
        {room?.players.map((player) => (
          <View 
            key={player.id} 
            style={[
              styles.miniPlayer,
              player.id === room?.currentTurnPlayerId && { borderColor: colors.primary, borderWidth: 2 },
              player.lives <= 0 && { opacity: 0.4 },
            ]}
          >
            <Image
              source={avatarImages[player.avatarId] || avatarImages["avatar-1"]}
              style={styles.miniAvatar}
              contentFit="contain"
            />
            <View style={styles.miniLives}>
              {[1, 2, 3].map((life) => (
                <View 
                  key={life}
                  style={[
                    styles.miniHeart,
                    { backgroundColor: life <= player.lives ? "#FF6B6B" : "#2E3350" }
                  ]}
                />
              ))}
            </View>
          </View>
        ))}
      </View>

      {renderActionFeedback()}
      {renderTruthMode()}

      <View style={styles.chamberContainer}>
        <ThemedText style={[styles.turnIndicator, { color: room?.mustPullAfterReject && isMyTurn ? "#FF4444" : (isMyTurn ? colors.primary : GameColors.textSecondary) }]}>
          {room?.mustPullAfterReject && isMyTurn ? "PULL THE CHAMBER!" : (isMyTurn ? "YOUR TURN" : `${currentTurnPlayer?.name}'s turn`)}
        </ThemedText>
        
        <Animated.View style={[styles.chamber, chamberStyle, { borderColor: "#2E3350" }]}>
          <View style={styles.chamberCenter}>
            <LinearGradient
              colors={[colors.primary + "20", colors.secondary + "20"]}
              style={styles.chamberGlow}
            />
          </View>
          {[0, 1, 2, 3, 4, 5].map(renderSlot)}
        </Animated.View>
      </View>

      <Animated.View style={[styles.actionsContainer, pulseStyle]}>
        <View style={styles.actionButtons}>
          <Pressable
            style={[
              styles.passButton,
              { 
                backgroundColor: myPlayer?.hasPassToken ? colors.surface : colors.backgroundDark,
                borderColor: myPlayer?.hasPassToken ? colors.secondary : "#2E3350",
                opacity: isMyTurn && myPlayer?.hasPassToken ? 1 : 0.5,
              }
            ]}
            onPress={handlePass}
            disabled={!isMyTurn || !myPlayer?.hasPassToken}
          >
            <Feather name="skip-forward" size={20} color={myPlayer?.hasPassToken ? colors.secondary : GameColors.textSecondary} />
            <ThemedText style={[styles.actionButtonText, { color: myPlayer?.hasPassToken ? colors.secondary : GameColors.textSecondary }]}>
              PASS
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.pullButton,
              { 
                backgroundColor: room?.mustPullAfterReject && isMyTurn ? "#FF4444" : (isMyTurn ? colors.primary : colors.surface),
                opacity: isMyTurn ? 1 : 0.5,
              }
            ]}
            onPress={handlePull}
            disabled={!isMyTurn}
          >
            <Feather name="zap" size={28} color={isMyTurn ? colors.backgroundDark : GameColors.textSecondary} />
            <ThemedText style={[styles.pullButtonText, { color: isMyTurn ? colors.backgroundDark : GameColors.textSecondary }]}>
              {room?.mustPullAfterReject && isMyTurn ? "MUST PULL!" : "PULL"}
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.forceButton,
              { 
                backgroundColor: (myPlayer?.hasForceToken || myPlayer?.hasRevengeToken) ? colors.surface : colors.backgroundDark,
                borderColor: myPlayer?.hasRevengeToken ? "#FF4444" : (myPlayer?.hasForceToken ? colors.accent : "#2E3350"),
                opacity: isMyTurn && (myPlayer?.hasForceToken || myPlayer?.hasRevengeToken) ? 1 : 0.5,
              }
            ]}
            onPress={handleForce}
            disabled={!isMyTurn || (!myPlayer?.hasForceToken && !myPlayer?.hasRevengeToken)}
          >
            <Feather 
              name="target" 
              size={20} 
              color={myPlayer?.hasRevengeToken ? "#FF4444" : (myPlayer?.hasForceToken ? colors.accent : GameColors.textSecondary)} 
            />
            <ThemedText style={[
              styles.actionButtonText, 
              { color: myPlayer?.hasRevengeToken ? "#FF4444" : (myPlayer?.hasForceToken ? colors.accent : GameColors.textSecondary) }
            ]}>
              {myPlayer?.hasRevengeToken ? "REVENGE" : "FORCE"}
            </ThemedText>
          </Pressable>
        </View>
      </Animated.View>

      {gameFinished && renderGameFinished()}
      {renderForceModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  leaveButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
  },
  roundInfo: {
    alignItems: "center",
    paddingTop: 10,
  },
  roundLabel: {
    fontSize: 12,
  },
  roundNumber: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingTop: 10,
  },
  timer: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  playersRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  miniPlayer: {
    alignItems: "center",
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  miniAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  miniLives: {
    flexDirection: "row",
    marginTop: 4,
    gap: 2,
  },
  miniHeart: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  actionFeedback: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  actionText: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  chamberContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  turnIndicator: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginBottom: Spacing.lg,
    letterSpacing: 2,
  },
  chamber: {
    width: CHAMBER_SIZE,
    height: CHAMBER_SIZE,
    borderRadius: CHAMBER_SIZE / 2,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  chamberCenter: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
  },
  chamberGlow: {
    width: "100%",
    height: "100%",
  },
  slot: {
    position: "absolute",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  slotNumber: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },
  actionsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  passButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  pullButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  forceButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    marginTop: 2,
  },
  pullButtonText: {
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    marginTop: 2,
    textAlign: "center",
  },
  finishedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  finishedContent: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  finishedTitle: {
    fontSize: 26,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 4,
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  winnerAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: Spacing.md,
    borderWidth: 4,
    borderColor: "#FFD700",
  },
  winnerName: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
  },
  winnerLabel: {
    fontSize: 16,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  noWinner: {
    fontSize: 18,
    marginBottom: Spacing.xl,
  },
  finishedButtons: {
    gap: Spacing.md,
    width: 200,
  },
  finishedButton: {},
  homeButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  homeButtonText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  truthContainer: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  truthHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  truthTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 2,
  },
  truthTimer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  truthTimerText: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  truthQuestion: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  truthInputContainer: {
    gap: Spacing.md,
  },
  truthInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: 14,
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: "top",
  },
  truthActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  truthSubmitBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  truthSubmitText: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
  },
  truthOrText: {
    fontSize: 12,
  },
  truthRiskBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    gap: Spacing.xs,
  },
  truthRiskText: {
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
  },
  truthWaiting: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  truthWaitingText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  truthAnswerOverlay: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  truthAnswerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  truthAnswerName: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  truthAnswerText: {
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 24,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  forceModal: {
    width: SCREEN_WIDTH - 60,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  forceModalTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  forcePlayerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  forcePlayerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  forcePlayerInfo: {
    marginLeft: Spacing.md,
  },
  forcePlayerName: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  forceLivesRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
  },
  cancelButton: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
  },
  truthPopup: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 50,
    padding: Spacing.lg,
  },
  truthPopupCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  truthPopupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  truthPopupTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 2,
  },
  truthPopupPlayerName: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    marginBottom: Spacing.xs,
  },
  truthPopupAnswer: {
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  truthPopupQuestion: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    lineHeight: 24,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  choicesContainer: {
    gap: Spacing.sm,
  },
  choiceButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  choiceLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  choiceLetterText: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  choiceText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  riskChamberButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  riskChamberText: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  waitingForAnswerContainer: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  waitingForAnswerText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  votingButtonsContainer: {
    alignItems: "center",
    gap: Spacing.md,
  },
  votingPrompt: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  votingButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    minWidth: 120,
  },
  voteAcceptButton: {
    backgroundColor: "#4CAF50",
  },
  voteRejectButton: {
    backgroundColor: "#FF4444",
  },
  voteButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  votingWaitingContainer: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  votingWaitingText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  votingCountText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  voteResultStats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
    marginTop: Spacing.md,
  },
  voteResultColumn: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  voterNames: {
    fontSize: 12,
    textAlign: "center",
    maxWidth: 120,
  },
  voteResultBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  voteResultCount: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  mustPullWarning: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginTop: Spacing.md,
  },
  mustPullMessage: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  mustPullSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});
