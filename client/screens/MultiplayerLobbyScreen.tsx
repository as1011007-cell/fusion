import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Pressable, TextInput, ScrollView, Share, Alert, Platform, ActivityIndicator, Keyboard } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeIn, FadeInDown, SlideInUp, FadeInUp, useAnimatedStyle, useSharedValue, withSpring, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { FeudFusionBrand } from "@/components/FeudFusionBrand";
import { GradientButton } from "@/components/GradientButton";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useMultiplayer, MultiplayerPlayer, ChatMessage } from "@/context/MultiplayerContext";
import { useProfile, avatarImages } from "@/context/ProfileContext";
import { useTheme } from "@/context/ThemeContext";
import { useGame } from "@/context/GameContext";
import { allQuestions } from "@/data/questions";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MultiplayerLobbyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { currentProfile, settings } = useProfile();
  const { currentTheme } = useTheme();
  const colors = currentTheme.colors;
  const { panels, getMultiplayerUnansweredQuestions, addMultiplayerAnsweredQuestions } = useGame();
  
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
    selectPanel,
    startGame,
    leaveRoom,
    sendChatMessage,
    clearError,
    resetGameStarted,
  } = useMultiplayer();

  const [mode, setMode] = useState<"select" | "create" | "join" | "lobby">("select");
  const [joinCode, setJoinCode] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedPanelId, setSelectedPanelId] = useState<string>("mixed");
  const [chatInput, setChatInput] = useState("");
  const codeInputRef = useRef<TextInput>(null);
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
      Alert.alert("Error", error, [{ text: "OK", onPress: clearError }]);
      setIsConnecting(false);
    }
  }, [error]);

  useEffect(() => {
    if (gameStarted && room?.status === "playing") {
      resetGameStarted();
      navigation.navigate("MultiplayerGame");
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
    createRoom(currentProfile?.name || "Player", currentProfile?.avatarId || "avatar-1");
  };

  const handleJoinRoom = (code?: string) => {
    const codeToUse = code || joinCode;
    if (codeToUse.length !== 6) {
      Alert.alert("Invalid Code", "Please enter a 6-character room code");
      return;
    }
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsConnecting(true);
    joinRoom(codeToUse.toUpperCase(), currentProfile?.name || "Player", currentProfile?.avatarId || "avatar-1");
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
          message: `Join my Feud Fusion game! Room code: ${room.code}`,
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

  const handleStartGame = () => {
    Keyboard.dismiss();
    if (!room) return;
    
    const players = room.players;
    const allReady = players.every(p => p.ready);
    if (!allReady) {
      Alert.alert("Not Ready", "All players must be ready to start");
      return;
    }
    
    if (players.length < 2) {
      Alert.alert("Need More Players", "At least 2 players required to start");
      return;
    }

    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    let gameQuestions;
    let panelName = "Mixed";
    
    if (selectedPanelId === "mixed") {
      const unansweredQuestions = getMultiplayerUnansweredQuestions(allQuestions);
      const shuffled = [...unansweredQuestions].sort(() => Math.random() - 0.5);
      gameQuestions = shuffled.slice(0, 10);
    } else {
      const panelQuestions = allQuestions.filter(q => q.panelId === selectedPanelId);
      const unansweredQuestions = getMultiplayerUnansweredQuestions(panelQuestions);
      const shuffled = [...unansweredQuestions].sort(() => Math.random() - 0.5);
      gameQuestions = shuffled.slice(0, 10);
      const panel = panels.find(p => p.id === selectedPanelId);
      panelName = panel?.name || selectedPanelId;
    }
    
    addMultiplayerAnsweredQuestions(gameQuestions.map((q: any) => q.id));
    startGame(gameQuestions, panelName);
  };

  const handlePanelSelect = (panelId: string) => {
    setSelectedPanelId(panelId);
    const panel = panels.find(p => p.id === panelId);
    const panelName = panelId === "mixed" ? "Mixed" : (panel?.name || panelId);
    selectPanel(panelId, panelName);
    if (settings.hapticsEnabled) {
      Haptics.selectionAsync();
    }
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
  const currentPlayer = room?.players.find(p => p.id === playerId);

  const renderModeSelect = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.modeSelect}>
      <ThemedText style={styles.title}>FEUD Online</ThemedText>
      <ThemedText style={[styles.subtitle, { color: GameColors.textSecondary }]}>
        Play with friends on different devices
      </ThemedText>

      <View style={styles.buttonGroup}>
        <Pressable
          style={[styles.modeButton, { backgroundColor: colors.surface, borderColor: colors.accent }]}
          onPress={() => setMode("create")}
        >
          <View style={[styles.modeIconContainer, { backgroundColor: colors.accent + "20" }]}>
            <Feather name="plus-circle" size={32} color={colors.accent} />
          </View>
          <ThemedText style={styles.modeButtonTitle}>Create Room</ThemedText>
          <ThemedText style={[styles.modeButtonDesc, { color: GameColors.textSecondary }]}>
            Host a new game session
          </ThemedText>
        </Pressable>

        <Pressable
          style={[styles.modeButton, { backgroundColor: colors.surface, borderColor: colors.secondary }]}
          onPress={() => setMode("join")}
        >
          <View style={[styles.modeIconContainer, { backgroundColor: colors.secondary + "20" }]}>
            <Feather name="log-in" size={32} color={colors.secondary} />
          </View>
          <ThemedText style={styles.modeButtonTitle}>Join Room</ThemedText>
          <ThemedText style={[styles.modeButtonDesc, { color: GameColors.textSecondary }]}>
            Enter a friend's room code
          </ThemedText>
        </Pressable>
      </View>
    </Animated.View>
  );

  const renderCreateRoom = () => (
    <Animated.View entering={SlideInUp.duration(300)} style={styles.actionContainer}>
      <View style={styles.createHeader}>
        <Feather name="plus-circle" size={48} color={GameColors.accent} style={{ marginBottom: Spacing.md }} />
        <ThemedText style={styles.title}>Create Room</ThemedText>
        <ThemedText style={[styles.subtitle, { color: GameColors.textSecondary }]}>
          A unique room code will be generated for your friends to join
        </ThemedText>
      </View>

      {isConnecting ? (
        <Animated.View style={[styles.connectingContainer, pulseAnimatedStyle]}>
          <ActivityIndicator size="large" color={GameColors.accent} />
          <ThemedText style={[styles.connectingText, { color: GameColors.textSecondary }]}>
            Creating your room...
          </ThemedText>
        </Animated.View>
      ) : (
        <View style={styles.createInfo}>
          <View style={styles.infoRow}>
            <Feather name="users" size={20} color={GameColors.secondary} />
            <ThemedText style={[styles.infoText, { color: GameColors.textSecondary }]}>
              Up to 8 players can join
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Feather name="share-2" size={20} color={GameColors.secondary} />
            <ThemedText style={[styles.infoText, { color: GameColors.textSecondary }]}>
              Share the code with friends
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Feather name="zap" size={20} color={GameColors.secondary} />
            <ThemedText style={[styles.infoText, { color: GameColors.textSecondary }]}>
              10 rapid-fire questions
            </ThemedText>
          </View>
        </View>
      )}

      <GradientButton
        onPress={handleCreateRoom}
        disabled={isConnecting}
        style={styles.createButton}
      >
        <View style={styles.buttonContent}>
          {isConnecting ? null : <Feather name="play" size={20} color={GameColors.textPrimary} />}
          <ThemedText style={styles.buttonText}>
            {isConnecting ? "Creating..." : "Create Room"}
          </ThemedText>
        </View>
      </GradientButton>
    </Animated.View>
  );

  const renderCodeBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      const char = joinCode[i] || '';
      const isFilled = char !== '';
      const isNext = i === joinCode.length;
      
      boxes.push(
        <Animated.View
          key={i}
          entering={FadeInUp.delay(i * 50).duration(200)}
          style={[
            styles.codeBox,
            { 
              backgroundColor: isFilled ? GameColors.accent + '20' : GameColors.surface,
              borderColor: isNext ? GameColors.accent : (isFilled ? GameColors.accent : GameColors.surface),
            }
          ]}
        >
          <ThemedText style={[styles.codeBoxText, { color: isFilled ? GameColors.accent : GameColors.textSecondary }]}>
            {char || (isNext ? '_' : '')}
          </ThemedText>
        </Animated.View>
      );
    }
    return boxes;
  };

  const renderJoinRoom = () => (
    <Animated.View entering={SlideInUp.duration(300)} style={styles.actionContainer}>
      <View style={styles.joinHeader}>
        <Feather name="log-in" size={48} color={GameColors.secondary} style={{ marginBottom: Spacing.md }} />
        <ThemedText style={styles.title}>Join Room</ThemedText>
        <ThemedText style={[styles.subtitle, { color: GameColors.textSecondary }]}>
          Enter the 6-character room code from your friend
        </ThemedText>
      </View>

      <Pressable 
        style={styles.codeBoxContainer} 
        onPress={() => codeInputRef.current?.focus()}
      >
        {renderCodeBoxes()}
      </Pressable>

      <TextInput
        ref={codeInputRef}
        style={styles.hiddenInput}
        value={joinCode}
        onChangeText={handleCodeChange}
        autoCapitalize="characters"
        maxLength={6}
        autoCorrect={false}
        autoComplete="off"
        keyboardType="default"
      />

      {isConnecting ? (
        <Animated.View style={[styles.connectingContainer, pulseAnimatedStyle]}>
          <ActivityIndicator size="large" color={GameColors.accent} />
          <ThemedText style={[styles.connectingText, { color: GameColors.textSecondary }]}>
            Connecting to room...
          </ThemedText>
        </Animated.View>
      ) : (
        <>
          <GradientButton
            onPress={() => handleJoinRoom()}
            disabled={joinCode.length !== 6}
            style={[styles.joinButton, { opacity: joinCode.length === 6 ? 1 : 0.5 }]}
          >
            <ThemedText style={styles.buttonText}>
              Join Room
            </ThemedText>
          </GradientButton>

          {joinCode.length > 0 ? (
            <Pressable 
              style={styles.clearButton}
              onPress={() => {
                setJoinCode('');
                codeInputRef.current?.focus();
              }}
            >
              <Feather name="x" size={18} color={GameColors.textSecondary} />
              <ThemedText style={[styles.clearButtonText, { color: GameColors.textSecondary }]}>
                Clear
              </ThemedText>
            </Pressable>
          ) : null}
        </>
      )}
    </Animated.View>
  );

  const renderLobby = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.lobbyContainer}>
      <View style={styles.roomCodeContainer}>
        <ThemedText style={[styles.roomCodeLabel, { color: GameColors.textSecondary }]}>
          Room Code
        </ThemedText>
        <View style={styles.roomCodeRow}>
          <ThemedText style={[styles.roomCode, { color: GameColors.accent }]}>
            {room?.code}
          </ThemedText>
          <View style={styles.codeActions}>
            <Pressable style={styles.codeActionBtn} onPress={handleCopyCode}>
              <Feather name="copy" size={20} color={GameColors.textSecondary} />
            </Pressable>
            <Pressable style={styles.codeActionBtn} onPress={handleShareCode}>
              <Feather name="share-2" size={20} color={GameColors.textSecondary} />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={[styles.playersSection, { backgroundColor: colors.surface }]}>
        <ThemedText style={styles.playersSectionTitle}>
          Players ({room?.players.length}/{room?.maxPlayers})
        </ThemedText>
        <ScrollView style={styles.playersList} showsVerticalScrollIndicator={false}>
          {room?.players.map((player, index) => (
            <Animated.View
              key={player.id}
              entering={FadeInDown.delay(index * 100)}
              style={[styles.playerCard, { backgroundColor: colors.backgroundDark }]}
            >
              <Image
                source={avatarImages[player.avatarId] || avatarImages["avatar-1"]}
                style={styles.playerAvatar}
                contentFit="cover"
              />
              <View style={styles.playerInfo}>
                <ThemedText style={styles.playerName}>
                  {player.name} {player.id === room?.hostId ? "(Host)" : ""}
                </ThemedText>
                <ThemedText style={[styles.playerStatus, { color: player.ready ? GameColors.correct : GameColors.textSecondary }]}>
                  {player.ready ? "Ready" : "Not Ready"}
                </ThemedText>
              </View>
              {player.ready ? (
                <Feather name="check-circle" size={24} color={GameColors.correct} />
              ) : (
                <Feather name="circle" size={24} color={GameColors.textSecondary} />
              )}
            </Animated.View>
          ))}
        </ScrollView>
      </View>

      {isHost ? (
        <View style={[styles.feudSection, { backgroundColor: colors.surface }]}>
          <ThemedText style={styles.feudSectionTitle}>Select Feud</ThemedText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.feudScrollContent}
          >
            <Pressable
              style={[
                styles.feudChip,
                {
                  backgroundColor: selectedPanelId === "mixed" ? colors.accent : colors.backgroundDark,
                  borderColor: selectedPanelId === "mixed" ? colors.accent : colors.surface,
                }
              ]}
              onPress={() => handlePanelSelect("mixed")}
            >
              <Feather name="shuffle" size={16} color={selectedPanelId === "mixed" ? colors.backgroundDark : GameColors.textPrimary} />
              <ThemedText style={[styles.feudChipText, { color: selectedPanelId === "mixed" ? colors.backgroundDark : GameColors.textPrimary }]}>
                Mixed
              </ThemedText>
            </Pressable>
            {panels.map((panel) => (
              <Pressable
                key={panel.id}
                style={[
                  styles.feudChip,
                  {
                    backgroundColor: selectedPanelId === panel.id ? colors.accent : colors.backgroundDark,
                    borderColor: selectedPanelId === panel.id ? colors.accent : colors.surface,
                  }
                ]}
                onPress={() => handlePanelSelect(panel.id)}
              >
                <Feather name={panel.icon as any} size={16} color={selectedPanelId === panel.id ? colors.backgroundDark : GameColors.textPrimary} />
                <ThemedText style={[styles.feudChipText, { color: selectedPanelId === panel.id ? colors.backgroundDark : GameColors.textPrimary }]}>
                  {panel.name}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={[styles.feudInfoSection, { backgroundColor: colors.surface }]}>
          <View style={styles.feudInfoHeader}>
            <Feather name="target" size={18} color={colors.accent} />
            <ThemedText style={styles.feudInfoLabel}>Selected Feud</ThemedText>
          </View>
          <View style={[styles.selectedFeudDisplay, { backgroundColor: colors.backgroundDark }]}>
            <Feather 
              name={room?.selectedPanelId === "mixed" ? "shuffle" : (panels.find(p => p.id === room?.selectedPanelId)?.icon as any || "users")} 
              size={20} 
              color={colors.accent} 
            />
            <ThemedText style={[styles.selectedFeudText, { color: GameColors.textPrimary }]}>
              {room?.selectedPanelName || "Mixed"}
            </ThemedText>
          </View>
        </View>
      )}

      <View style={[styles.chatSection, { backgroundColor: colors.surface }]}>
        <View style={styles.chatHeader}>
          <Feather name="message-circle" size={18} color={colors.accent} />
          <ThemedText style={styles.chatTitle}>Lobby Chat</ThemedText>
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
                    ? [styles.chatBubbleMine, { backgroundColor: colors.accent + "30" }] 
                    : styles.chatBubbleOther,
                ]}
              >
                {msg.playerId !== playerId ? (
                  <ThemedText style={[styles.chatSender, { color: colors.accent }]}>
                    {msg.playerName}
                  </ThemedText>
                ) : null}
                <ThemedText style={styles.chatMessageText}>{msg.message}</ThemedText>
              </Animated.View>
            ))
          )}
        </ScrollView>
        <View style={styles.chatInputRow}>
          <TextInput
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
        <Pressable
          style={[
            styles.readyButton,
            {
              backgroundColor: currentPlayer?.ready ? GameColors.surface : GameColors.correct,
              borderColor: currentPlayer?.ready ? GameColors.textSecondary : GameColors.correct,
            },
          ]}
          onPress={handleToggleReady}
        >
          <Feather
            name={currentPlayer?.ready ? "x" : "check"}
            size={20}
            color={currentPlayer?.ready ? GameColors.textSecondary : GameColors.backgroundDark}
          />
          <ThemedText
            style={[
              styles.readyButtonText,
              { color: currentPlayer?.ready ? GameColors.textSecondary : GameColors.backgroundDark },
            ]}
          >
            {currentPlayer?.ready ? "Cancel Ready" : "Ready Up"}
          </ThemedText>
        </Pressable>

        {isHost ? (
          <GradientButton
            onPress={handleStartGame}
            disabled={(room?.players.length || 0) < 2 || !room?.players.every(p => p.ready)}
            style={styles.startButton}
          >
            <ThemedText style={styles.buttonText}>Start Game</ThemedText>
          </GradientButton>
        ) : null}
      </View>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.backgroundDark, paddingTop: insets.top + Spacing.md }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color={GameColors.textPrimary} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>
          {mode === "lobby" ? "FEUD Lobby" : "FEUD Online"}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {mode === "select" ? renderModeSelect() : null}
        {mode === "create" ? renderCreateRoom() : null}
        {mode === "join" ? renderJoinRoom() : null}
        {mode === "lobby" ? renderLobby() : null}
      </ScrollView>
    </KeyboardAvoidingView>
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
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...Typography.h3,
    fontWeight: "bold",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing["5xl"],
  },
  modeSelect: {
    alignItems: "center",
  },
  title: {
    ...Typography.h2,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  buttonGroup: {
    width: "100%",
    gap: Spacing.md,
  },
  modeButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: "center",
  },
  modeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  modeButtonTitle: {
    ...Typography.h3,
    fontWeight: "bold",
    marginBottom: Spacing.xs,
  },
  modeButtonDesc: {
    ...Typography.body,
    textAlign: "center",
  },
  actionContainer: {
    alignItems: "center",
  },
  joinHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  codeBoxContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  codeBox: {
    width: 44,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  codeBoxText: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "bold",
    includeFontPadding: false,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
  connectingContainer: {
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  connectingText: {
    ...Typography.body,
    marginTop: Spacing.sm,
  },
  joinHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    opacity: 0.7,
  },
  hintText: {
    ...Typography.caption,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    padding: Spacing.sm,
  },
  clearButtonText: {
    ...Typography.caption,
  },
  joinButton: {
    width: "100%",
    marginBottom: Spacing.md,
  },
  codeInput: {
    width: "100%",
    height: 60,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    width: "100%",
  },
  createHeader: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  createInfo: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  infoText: {
    ...Typography.body,
  },
  createButton: {
    width: "100%",
    marginTop: Spacing.md,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  buttonText: {
    ...Typography.button,
    color: GameColors.textPrimary,
    fontWeight: "bold",
  },
  lobbyContainer: {
    flex: 1,
  },
  roomCodeContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  roomCodeLabel: {
    ...Typography.caption,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
    letterSpacing: 2,
  },
  roomCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  roomCode: {
    fontSize: 38,
    lineHeight: 50,
    fontWeight: "bold",
    letterSpacing: 6,
    includeFontPadding: false,
  },
  codeActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  codeActionBtn: {
    padding: Spacing.sm,
  },
  playersSection: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  playersSectionTitle: {
    ...Typography.h4,
    fontWeight: "bold",
    marginBottom: Spacing.md,
  },
  playersList: {
    maxHeight: 200,
  },
  feudSection: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  feudSectionTitle: {
    ...Typography.h4,
    fontWeight: "bold",
    marginBottom: Spacing.md,
  },
  feudScrollContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  feudChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  feudChipText: {
    ...Typography.caption,
    fontWeight: "600",
  },
  feudInfoSection: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  feudInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  feudInfoLabel: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    textTransform: "uppercase",
  },
  feudInfoText: {
    ...Typography.body,
  },
  selectedFeudDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  selectedFeudText: {
    ...Typography.h4,
    fontWeight: "bold",
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
    marginRight: Spacing.md,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    ...Typography.body,
    fontWeight: "600",
  },
  playerStatus: {
    ...Typography.caption,
  },
  lobbyActions: {
    gap: Spacing.md,
  },
  readyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    gap: Spacing.sm,
  },
  readyButtonText: {
    ...Typography.button,
    fontWeight: "bold",
  },
  startButton: {
    width: "100%",
  },
  chatSection: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chatTitle: {
    ...Typography.h4,
    fontWeight: "bold",
  },
  chatMessages: {
    maxHeight: 150,
    marginBottom: Spacing.sm,
  },
  chatMessagesContent: {
    paddingVertical: Spacing.xs,
  },
  chatEmptyText: {
    ...Typography.caption,
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: Spacing.lg,
  },
  chatBubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    maxWidth: "85%",
  },
  chatBubbleMine: {
    backgroundColor: GameColors.accent + "30",
    alignSelf: "flex-end",
  },
  chatBubbleOther: {
    backgroundColor: GameColors.backgroundDark,
    alignSelf: "flex-start",
  },
  chatSender: {
    ...Typography.caption,
    fontWeight: "bold",
    marginBottom: 2,
  },
  chatMessageText: {
    ...Typography.body,
    fontSize: 14,
  },
  chatInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  chatInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    ...Typography.body,
    fontSize: 14,
  },
  chatSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
