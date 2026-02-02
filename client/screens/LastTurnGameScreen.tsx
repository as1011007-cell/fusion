import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Pressable, Dimensions, Alert } from "react-native";
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHAMBER_SIZE = Math.min(SCREEN_WIDTH - 80, 300);
const SLOT_SIZE = CHAMBER_SIZE / 3.5;

export default function LastTurnGameScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { currentProfile, settings } = useProfile();
  const { currentTheme, isAdFree } = useTheme();
  const colors = currentTheme.colors;
  
  const {
    playerId,
    room,
    lastAction,
    gameFinished,
    winner,
    pullSlot,
    passAction,
    forcePlayer,
    leaveRoom,
    playAgain,
  } = useLastTurn();

  const [showingAction, setShowingAction] = useState(false);
  const [showForceModal, setShowForceModal] = useState(false);
  
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
      
      if (lastAction.wasCrash && settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        crashShake.value = withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
      } else if (settings.hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      const timer = setTimeout(() => setShowingAction(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [lastAction]);

  useEffect(() => {
    if (gameFinished && !isAdFree) {
      initInterstitialAd();
      const adTimer = setTimeout(() => {
        showInterstitialAd();
      }, 2000);
      return () => clearTimeout(adTimer);
    }
  }, [gameFinished, isAdFree]);

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
    const radius = CHAMBER_SIZE / 2 - SLOT_SIZE / 2 - 10;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;

    return (
      <Animated.View
        key={index}
        entering={ZoomIn.delay(index * 100)}
        style={[
          styles.slot,
          {
            width: SLOT_SIZE,
            height: SLOT_SIZE,
            backgroundColor: isRevealed 
              ? (isCrash ? "#FF4444" : colors.primary + "40") 
              : colors.surface,
            borderColor: isRevealed 
              ? (isCrash ? "#FF4444" : colors.primary) 
              : "#2E3350",
            transform: [
              { translateX: x },
              { translateY: y },
            ],
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

  const renderGameFinished = () => (
    <Animated.View entering={FadeIn} style={[styles.finishedOverlay, { backgroundColor: colors.backgroundDark + "F0" }]}>
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

      <View style={styles.chamberContainer}>
        <ThemedText style={[styles.turnIndicator, { color: isMyTurn ? colors.primary : GameColors.textSecondary }]}>
          {isMyTurn ? "YOUR TURN" : `${currentTurnPlayer?.name}'s turn`}
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
                backgroundColor: isMyTurn ? colors.primary : colors.surface,
                opacity: isMyTurn ? 1 : 0.5,
              }
            ]}
            onPress={handlePull}
            disabled={!isMyTurn}
          >
            <Feather name="zap" size={28} color={isMyTurn ? colors.backgroundDark : GameColors.textSecondary} />
            <ThemedText style={[styles.pullButtonText, { color: isMyTurn ? colors.backgroundDark : GameColors.textSecondary }]}>
              PULL
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
  },
  roundInfo: {
    alignItems: "center",
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
    borderRadius: SLOT_SIZE / 2,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  slotNumber: {
    fontSize: 16,
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
    width: 100,
    height: 100,
    borderRadius: 50,
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
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    marginTop: 2,
  },
  finishedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  finishedContent: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  finishedTitle: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 4,
    marginBottom: Spacing.xl,
  },
  winnerAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: Spacing.md,
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
});
