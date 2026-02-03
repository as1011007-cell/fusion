import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Pressable, TextInput, ScrollView, Share, Alert, ActivityIndicator, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeIn, FadeInDown, SlideInUp, useAnimatedStyle, useSharedValue, withSpring, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { GradientButton } from "@/components/GradientButton";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useLastTurn, LastTurnPlayer, ChatMessage } from "@/context/LastTurnContext";
import { useProfile, avatarImages } from "@/context/ProfileContext";
import { useTheme } from "@/context/ThemeContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GAME_MODES = [
  { id: "classic", name: "Classic", icon: "heart", color: "#FF6B6B", description: "Start with 3 lives. Pull the trigger and hope you survive. Last player standing wins!" },
  { id: "countdown", name: "Countdown", icon: "clock", color: "#F39C12", description: "Timer gets shorter each round. Make quick decisions or face the consequences!" },
  { id: "truth", name: "Truth-or-Risk", icon: "message-circle", color: "#3498DB", description: "Answer a personal question truthfully or take your chances with the chamber." },
];

const HOW_TO_PLAY = [
  { icon: "target", text: "Each round has 6 chamber slots - one is the CRASH slot" },
  { icon: "heart", text: "Everyone starts with 3 lives. Hit the crash slot and lose a life" },
  { icon: "zap", text: "Use FORCE token to make another player pull instead of you" },
  { icon: "skip-forward", text: "Use PASS token to skip your turn safely" },
  { icon: "repeat", text: "Use REVENGE token after being crashed to strike back" },
  { icon: "award", text: "Last player standing wins the game!" },
];

export default function LastTurnLobbyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { currentProfile, settings } = useProfile();
  const { currentTheme } = useTheme();
  const colors = currentTheme.colors;
  
  const {
    connected,
    playerId,
    room,
    error,
    gameStarted,
    chatMessages,
    createRoom,
    joinRoom,
    setReady,
    setGameMode,
    startGame,
    sendChatMessage,
    leaveRoom,
    clearError,
    resetGameState,
  } = useLastTurn();

  const [mode, setMode] = useState<"select" | "join" | "lobby">("select");
  const [joinCode, setJoinCode] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const codeInputRef = useRef<TextInput>(null);
  const chatInputRef = useRef<TextInput>(null);
  const chatScrollRef = useRef<ScrollView>(null);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (room) {
      setMode("lobby");
      setIsConnecting(false);
    }
  }, [room]);

  useEffect(() => {
    if (error) {
      setIsConnecting(false);
      
      // Show user-friendly messages based on error type
      if (error === "Room not found") {
        Alert.alert(
          "Room Doesn't Exist",
          "The room code you entered doesn't exist. Please check the code and try again.",
          [
            { 
              text: "Try Again", 
              onPress: () => {
                clearError();
                setJoinCode("");
              }
            }
          ]
        );
      } else if (error === "Game already in progress") {
        Alert.alert(
          "Game Already Started",
          "This game has already started. You cannot join a game in progress.",
          [
            { 
              text: "OK", 
              onPress: () => {
                clearError();
                setJoinCode("");
              }
            }
          ]
        );
      } else if (error === "Room is full") {
        Alert.alert(
          "Room Full",
          "This room is full. Try joining a different room.",
          [
            { 
              text: "Try Again", 
              onPress: () => {
                clearError();
                setJoinCode("");
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", error, [{ text: "OK", onPress: clearError }]);
      }
    }
  }, [error]);

  useEffect(() => {
    if (gameStarted && room?.status === "playing") {
      resetGameState();
      navigation.navigate("LastTurnGame");
    }
  }, [gameStarted, room?.status]);

  useEffect(() => {
    if (mode === "join") {
      setTimeout(() => codeInputRef.current?.focus(), 100);
    }
  }, [mode]);

  useEffect(() => {
    if (isConnecting) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [isConnecting]);

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleBack = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (mode === "lobby") {
      leaveRoom();
      setMode("select");
    } else if (mode !== "select") {
      setMode("select");
    } else {
      navigation.goBack();
    }
  };

  const handleCreateRoom = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsConnecting(true);
    createRoom(currentProfile?.name || "Player", currentProfile?.avatarId || "avatar-1", "classic");
  };

  const handleJoinRoom = () => {
    if (joinCode.length !== 6) {
      Alert.alert("Invalid Code", "Please enter a 6-character room code");
      return;
    }
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsConnecting(true);
    joinRoom(joinCode.toUpperCase(), currentProfile?.name || "Player", currentProfile?.avatarId || "avatar-1");
  };

  const handleCodeChange = (text: string) => {
    const cleanText = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setJoinCode(cleanText);
    if (cleanText.length > 0 && settings.hapticsEnabled) {
      Haptics.selectionAsync();
    }
  };

  const handleCopyCode = async () => {
    if (room?.code) {
      await Clipboard.setStringAsync(room.code);
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Copied!", "Room code copied to clipboard");
    }
  };

  const handleShareCode = async () => {
    if (room?.code) {
      try {
        await Share.share({
          message: `Join my Last Turn game! Room code: ${room.code}`,
        });
      } catch (e) {
        console.error("Share failed:", e);
      }
    }
  };

  const handleToggleReady = () => {
    Keyboard.dismiss();
    if (!room || !playerId) return;
    const currentPlayer = room.players.find(p => p.id === playerId);
    if (currentPlayer) {
      setReady(!currentPlayer.ready);
      if (settings.hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  const handleModeChange = (modeId: string) => {
    if (settings.hapticsEnabled) {
      Haptics.selectionAsync();
    }
    if (room && playerId === room.hostId) {
      setGameMode(modeId);
    }
  };

  const handleStartGame = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    startGame();
  };

  const handleSendChat = () => {
    if (chatInput.trim()) {
      sendChatMessage(chatInput.trim());
      setChatInput("");
      if (settings.hapticsEnabled) {
        Haptics.selectionAsync();
      }
    }
  };

  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages.length]);

  const isHost = room?.hostId === playerId;
  const allReady = room?.players.every(p => p.ready) ?? false;
  const canStart = isHost && allReady && (room?.players.length ?? 0) >= 2;

  const renderSelectMode = () => (
    <Animated.View entering={FadeIn} style={styles.selectContainer}>
      <ThemedText style={[styles.title, { color: GameColors.textPrimary }]}>LAST TURN</ThemedText>
      <ThemedText style={[styles.subtitle, { color: GameColors.textSecondary }]}>
        A game of risk and nerve
      </ThemedText>

      <View style={styles.buttonGroup}>
        <Animated.View style={pulseAnimatedStyle}>
          <Pressable
            style={[styles.modeButton, { backgroundColor: colors.surface, borderColor: colors.primary, opacity: isConnecting ? 0.7 : 1 }]}
            onPress={handleCreateRoom}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator size={28} color={colors.primary} />
            ) : (
              <Feather name="plus-circle" size={28} color={colors.primary} />
            )}
            <ThemedText style={[styles.modeButtonText, { color: GameColors.textPrimary }]}>
              {isConnecting ? "Creating..." : "Create Room"}
            </ThemedText>
            <ThemedText style={[styles.modeButtonDesc, { color: GameColors.textSecondary }]}>
              Host a new game
            </ThemedText>
          </Pressable>
        </Animated.View>

        <Pressable
          style={[styles.modeButton, { backgroundColor: colors.surface, borderColor: colors.secondary }]}
          onPress={() => setMode("join")}
        >
          <Feather name="log-in" size={28} color={colors.secondary} />
          <ThemedText style={[styles.modeButtonText, { color: GameColors.textPrimary }]}>Join Room</ThemedText>
          <ThemedText style={[styles.modeButtonDesc, { color: GameColors.textSecondary }]}>
            Enter a room code
          </ThemedText>
        </Pressable>
      </View>
    </Animated.View>
  );

  const renderJoinMode = () => (
    <Animated.View entering={FadeInDown} style={[styles.joinContainer, { paddingTop: insets.top + Spacing.xl + 40 }]}>
      <ThemedText style={[styles.sectionTitle, { color: GameColors.textPrimary }]}>Enter Room Code</ThemedText>
      
      <TextInput
        ref={codeInputRef}
        style={[styles.codeInput, { backgroundColor: colors.surface, color: GameColors.textPrimary, borderColor: "#2E3350" }]}
        value={joinCode}
        onChangeText={handleCodeChange}
        placeholder="XXXXXX"
        placeholderTextColor={GameColors.textSecondary}
        maxLength={6}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      <Animated.View style={pulseAnimatedStyle}>
        <GradientButton
          onPress={handleJoinRoom}
          disabled={isConnecting || joinCode.length !== 6}
          variant="secondary"
          style={styles.actionButton}
        >
          {isConnecting ? "Joining..." : "Join Room"}
        </GradientButton>
      </Animated.View>
    </Animated.View>
  );

  const renderLobby = () => (
    <Animated.View entering={SlideInUp} style={[styles.lobbyContainer, { paddingBottom: insets.bottom }]}>
      <View style={styles.roomHeader}>
        <View style={styles.roomCodeContainer}>
          <ThemedText style={[styles.roomCodeLabel, { color: GameColors.textSecondary }]}>Room Code</ThemedText>
          <View style={styles.roomCodeRow}>
            <ThemedText style={[styles.roomCode, { color: colors.primary }]}>{room?.code}</ThemedText>
            <Pressable onPress={handleCopyCode} style={styles.copyButton}>
              <Feather name="copy" size={20} color={GameColors.textSecondary} />
            </Pressable>
            <Pressable onPress={handleShareCode} style={styles.shareButton}>
              <Feather name="share" size={20} color={GameColors.textSecondary} />
            </Pressable>
          </View>
        </View>
        
        <View style={[styles.modeTag, { backgroundColor: colors.primary + '30' }]}>
          <ThemedText style={[styles.modeTagText, { color: colors.primary }]}>
            {GAME_MODES.find(m => m.id === room?.gameMode)?.name || "Classic"}
          </ThemedText>
        </View>
      </View>

      {isHost && room?.status === "waiting" && (
        <View style={styles.hostModeSelector}>
          <ThemedText style={[styles.hostModeLabel, { color: GameColors.textPrimary }]}>Select Game Mode</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeCardsContainer}>
            {GAME_MODES.map((gameMode) => {
              const isSelected = room?.gameMode === gameMode.id;
              return (
                <Pressable
                  key={gameMode.id}
                  style={[
                    styles.lobbyModeCard,
                    { 
                      backgroundColor: isSelected ? gameMode.color + '15' : colors.surface,
                      borderColor: isSelected ? gameMode.color : "#2E3350",
                      borderWidth: isSelected ? 2 : 1,
                    }
                  ]}
                  onPress={() => handleModeChange(gameMode.id)}
                >
                  <View style={[styles.lobbyModeIconContainer, { backgroundColor: gameMode.color + '20' }]}>
                    <Feather name={gameMode.icon as any} size={20} color={gameMode.color} />
                  </View>
                  <ThemedText style={[styles.lobbyModeName, { color: isSelected ? gameMode.color : GameColors.textPrimary }]}>
                    {gameMode.name}
                  </ThemedText>
                  <ThemedText style={[styles.lobbyModeDesc, { color: GameColors.textSecondary }]}>
                    {gameMode.description}
                  </ThemedText>
                  {isSelected && (
                    <View style={[styles.lobbySelectedBadge, { backgroundColor: gameMode.color }]}>
                      <Feather name="check" size={10} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <Pressable 
        style={[styles.howToPlayHeader, { backgroundColor: colors.surface }]}
        onPress={() => setShowHowToPlay(!showHowToPlay)}
      >
        <View style={styles.howToPlayTitleRow}>
          <Feather name="help-circle" size={18} color={colors.accent} />
          <ThemedText style={[styles.howToPlayTitle, { color: GameColors.textPrimary }]}>How to Play</ThemedText>
        </View>
        <Feather 
          name={showHowToPlay ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={GameColors.textSecondary} 
        />
      </Pressable>
      
      {showHowToPlay && (
        <Animated.View entering={FadeIn.duration(200)} style={[styles.howToPlayContent, { backgroundColor: colors.surface }]}>
          {HOW_TO_PLAY.map((item, index) => (
            <View key={index} style={styles.howToPlayItem}>
              <View style={[styles.howToPlayIcon, { backgroundColor: colors.primary + '20' }]}>
                <Feather name={item.icon as any} size={16} color={colors.primary} />
              </View>
              <ThemedText style={[styles.howToPlayText, { color: GameColors.textSecondary }]}>
                {item.text}
              </ThemedText>
            </View>
          ))}
        </Animated.View>
      )}

      <ThemedText style={[styles.playersTitle, { color: GameColors.textPrimary }]}>
        Players ({room?.players.length}/6)
      </ThemedText>

      <ScrollView style={styles.playersList}>
        {room?.players.map((player) => (
          <View key={player.id} style={[styles.playerCard, { backgroundColor: colors.surface }]}>
            <Image
              source={avatarImages[player.avatarId] || avatarImages["avatar-1"]}
              style={styles.playerAvatar}
              contentFit="contain"
            />
            <View style={styles.playerInfo}>
              <View style={styles.playerNameRow}>
                <ThemedText style={[styles.playerName, { color: GameColors.textPrimary }]}>{player.name}</ThemedText>
                {player.id === room?.hostId && (
                  <View style={[styles.hostBadge, { backgroundColor: colors.accent }]}>
                    <ThemedText style={styles.hostBadgeText}>HOST</ThemedText>
                  </View>
                )}
              </View>
              <View style={styles.playerStats}>
                <View style={styles.livesContainer}>
                  {[1, 2, 3].map((life) => (
                    <Feather
                      key={life}
                      name="heart"
                      size={14}
                      color={life <= player.lives ? "#FF6B6B" : "#2E3350"}
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>
              </View>
            </View>
            <View style={[
              styles.readyBadge,
              { backgroundColor: player.ready ? colors.primary + '30' : colors.surface }
            ]}>
              <Feather
                name={player.ready ? "check-circle" : "circle"}
                size={18}
                color={player.ready ? colors.primary : GameColors.textSecondary}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.chatSection, { backgroundColor: colors.surface }]}>
          <View style={styles.chatHeader}>
            <Feather name="message-circle" size={16} color={colors.accent} />
            <ThemedText style={[styles.chatTitle, { color: GameColors.textPrimary }]}>Lobby Chat</ThemedText>
          </View>
          <ScrollView 
            ref={chatScrollRef}
            style={styles.chatMessages} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.chatMessagesContent}
          >
            {chatMessages.length === 0 ? (
              <ThemedText style={[styles.chatEmptyText, { color: GameColors.textSecondary }]}>
                No messages yet. Say hello!
              </ThemedText>
            ) : (
              chatMessages.map((msg) => (
                <Animated.View
                  key={msg.id}
                  entering={FadeInDown.duration(200)}
                  style={[
                    styles.chatBubble,
                    msg.playerId === playerId 
                      ? { backgroundColor: colors.primary + '30', alignSelf: 'flex-end' }
                      : { backgroundColor: colors.backgroundDark, alignSelf: 'flex-start' }
                  ]}
                >
                  {msg.playerId !== playerId && (
                    <ThemedText style={[styles.chatSender, { color: colors.accent }]}>{msg.playerName}</ThemedText>
                  )}
                  <ThemedText style={[styles.chatMessageText, { color: GameColors.textPrimary }]}>{msg.message}</ThemedText>
                </Animated.View>
              ))
            )}
          </ScrollView>
          <View style={styles.chatInputRow}>
            <TextInput
              ref={chatInputRef}
              style={[styles.chatInput, { backgroundColor: colors.backgroundDark, color: GameColors.textPrimary }]}
              placeholder="Type a message..."
              placeholderTextColor={GameColors.textSecondary}
              value={chatInput}
              onChangeText={setChatInput}
              maxLength={200}
              onSubmitEditing={handleSendChat}
              returnKeyType="send"
            />
            <Pressable 
              style={[styles.chatSendBtn, { backgroundColor: chatInput.trim() ? colors.accent : colors.surface }]}
              onPress={handleSendChat}
              disabled={!chatInput.trim()}
            >
              <Feather name="send" size={18} color={chatInput.trim() ? colors.backgroundDark : GameColors.textSecondary} />
            </Pressable>
          </View>
        </View>

      <View style={styles.lobbyActions}>
        {!isHost && (
          <Pressable
            style={[
              styles.readyButton,
              { 
                backgroundColor: room?.players.find(p => p.id === playerId)?.ready 
                  ? colors.primary 
                  : colors.surface,
                borderColor: colors.primary,
              }
            ]}
            onPress={handleToggleReady}
          >
            <ThemedText style={[
              styles.readyButtonText,
              { color: room?.players.find(p => p.id === playerId)?.ready ? colors.backgroundDark : colors.primary }
            ]}>
              {room?.players.find(p => p.id === playerId)?.ready ? "READY" : "TAP TO READY"}
            </ThemedText>
          </Pressable>
        )}

        {isHost && (
          <GradientButton
            onPress={handleStartGame}
            disabled={!canStart}
            variant={canStart ? "accent" : "primary"}
            style={styles.startButton}
          >
            {canStart ? "START GAME" : `Waiting for players... (${room?.players.filter(p => p.ready).length}/${room?.players.length})`}
          </GradientButton>
        )}
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.backgroundDark }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color={GameColors.textPrimary} />
        </Pressable>
        <ThemedText style={[styles.headerTitle, { color: GameColors.textPrimary }]}>
          {mode === "select" ? "LAST TURN" : mode === "lobby" ? "LOBBY" : mode.toUpperCase()}
        </ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {mode === "select" && renderSelectMode()}
        {mode === "join" && renderJoinMode()}
        {mode === "lobby" && renderLobby()}
      </View>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  selectContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 4,
    marginBottom: Spacing.xs,
    textAlign: "center",
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: Spacing["xl"],
    textAlign: "center",
  },
  buttonGroup: {
    width: "100%",
    gap: Spacing.md,
  },
  modeButton: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    alignItems: "center",
  },
  modeButtonText: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginTop: Spacing.sm,
  },
  modeButtonDesc: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginBottom: Spacing.md,
  },
  actionButton: {
    marginTop: Spacing.xl,
  },
  joinContainer: {
    flex: 1,
    paddingTop: Spacing.xl,
    alignItems: "center",
  },
  codeInput: {
    width: "100%",
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    letterSpacing: 8,
    marginBottom: Spacing.xl,
  },
  lobbyContainer: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  roomCodeContainer: {
  },
  roomCodeLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  roomCodeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  roomCode: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 4,
  },
  copyButton: {
    marginLeft: Spacing.md,
    padding: Spacing.xs,
  },
  shareButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  modeTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  modeTagText: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  hostModeSelector: {
    marginBottom: Spacing.md,
  },
  hostModeLabel: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    marginBottom: Spacing.sm,
  },
  modeCardsContainer: {
    paddingRight: Spacing.md,
  },
  lobbyModeCard: {
    width: 140,
    minHeight: 180,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    position: "relative",
  },
  lobbyModeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  lobbyModeName: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    marginBottom: 4,
  },
  lobbyModeDesc: {
    fontSize: 10,
    lineHeight: 14,
  },
  lobbySelectedBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  howToPlayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  howToPlayTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  howToPlayTitle: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  howToPlayContent: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  howToPlayItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  howToPlayIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  howToPlayText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  playersTitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    marginBottom: Spacing.md,
  },
  playersList: {
    flex: 1,
  },
  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  playerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  playerNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  playerName: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  hostBadge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  hostBadgeText: {
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  playerStats: {
    marginTop: 4,
  },
  livesContainer: {
    flexDirection: "row",
  },
  readyBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  lobbyActions: {
    paddingVertical: Spacing.lg,
  },
  readyButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: "center",
  },
  readyButtonText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
  startButton: {
    marginTop: Spacing.sm,
  },
  chatSection: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  chatTitle: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  chatMessages: {
    maxHeight: 120,
    marginBottom: Spacing.sm,
  },
  chatMessagesContent: {
    paddingVertical: Spacing.xs,
  },
  chatEmptyText: {
    ...Typography.caption,
    textAlign: "center",
    paddingVertical: Spacing.sm,
  },
  chatBubble: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    maxWidth: "85%",
  },
  chatSender: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 2,
  },
  chatMessageText: {
    fontSize: 14,
  },
  chatInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  chatInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    ...Typography.body,
  },
  chatSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
