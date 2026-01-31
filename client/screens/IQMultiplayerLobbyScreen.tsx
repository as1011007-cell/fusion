import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Pressable, TextInput, ScrollView, Share, Alert, ActivityIndicator, Platform, Keyboard } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeIn, FadeInDown, SlideInUp, FadeInUp, useAnimatedStyle, useSharedValue, withSpring, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { GradientButton } from "@/components/GradientButton";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useMultiplayer, ChatMessage } from "@/context/MultiplayerContext";
import { useProfile, avatarImages } from "@/context/ProfileContext";
import { useTheme } from "@/context/ThemeContext";
import { useIQ } from "@/context/IQContext";
import { iqQuestions } from "@/data/iqQuestions";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type IQMultiplayerLobbyRouteProp = RouteProp<RootStackParamList, "IQMultiplayerLobby">;

const IQColors = {
  primary: "#8B5CF6",
  secondary: "#A78BFA",
  accent: "#C4B5FD",
  glow: "#7C3AED",
};

export default function IQMultiplayerLobbyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<IQMultiplayerLobbyRouteProp>();
  const { currentProfile, settings } = useProfile();
  const { currentTheme } = useTheme();
  const colors = currentTheme.colors;
  const { getRandomQuestions, markQuestionsAnswered } = useIQ();
  
  const { difficulty, category, questionCount } = route.params;
  
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
    startGame,
    leaveRoom,
    sendChatMessage,
    updateIQSettings,
    setIQSettings,
    clearError,
    resetGameStarted,
  } = useMultiplayer();

  const [mode, setMode] = useState<"select" | "create" | "join" | "lobby">("select");
  const [joinCode, setJoinCode] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [localDifficulty, setLocalDifficulty] = useState(difficulty);
  const [localCategory, setLocalCategory] = useState(category);
  const [localQuestionCount, setLocalQuestionCount] = useState(questionCount);
  const codeInputRef = useRef<TextInput>(null);
  const chatScrollRef = useRef<ScrollView>(null);
  const chatInputRef = useRef<TextInput>(null);
  const roomRef = useRef(room);
  const pulseScale = useSharedValue(1);
  
  // Keep roomRef updated with latest room state
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  const difficultyOptions = ["all", "easy", "medium", "hard"];
  const categoryOptions = ["all", "logical", "pattern", "verbal", "math", "spatial"];
  const questionCountOptions = [5, 10, 15, 20, 25, 30];

  // Compute isHost early so it's available for all handlers
  const isHost = room?.hostId === playerId;
  const currentPlayer = room?.players.find(p => p.id === playerId);

  useEffect(() => {
    if (room) {
      setMode("lobby");
      setIsConnecting(false);
    }
  }, [room]);

  // Sync local settings with room settings from server
  useEffect(() => {
    if (room?.iqSettings) {
      setLocalDifficulty(room.iqSettings.difficulty);
      setLocalCategory(room.iqSettings.category);
      setLocalQuestionCount(room.iqSettings.questionCount);
    }
  }, [room?.iqSettings]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [{ text: "OK", onPress: clearError }]);
      setIsConnecting(false);
    }
  }, [error]);

  useEffect(() => {
    if (gameStarted && room?.status === "playing") {
      resetGameStarted();
      navigation.navigate("IQMultiplayerGame");
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
    createRoom(
      currentProfile?.name || "Player", 
      currentProfile?.avatarId || "avatar-1",
      8,
      { difficulty: localDifficulty, category: localCategory, questionCount: localQuestionCount }
    );
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
          message: `Join my IQ Test multiplayer game! Room code: ${room.code}`,
        });
      } catch (e) {
        console.error("Share failed:", e);
      }
    }
  };

  const handleToggleReady = () => {
    Keyboard.dismiss();
    chatInputRef.current?.blur();
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
    chatInputRef.current?.blur();
    
    // Use ref to get latest room state (avoids stale closures)
    const currentRoom = roomRef.current;
    if (!currentRoom) return;
    
    const players = currentRoom.players;
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

    // Use room settings (synced from server) or fallback to local
    const useDiff = currentRoom.iqSettings?.difficulty || localDifficulty;
    const useCat = currentRoom.iqSettings?.category || localCategory;
    const useCount = currentRoom.iqSettings?.questionCount || localQuestionCount;
    
    let gameQuestions = getRandomQuestions(useCount, useDiff, useCat);
    
    // Fallback: if no questions found, get all questions without filters
    if (gameQuestions.length === 0) {
      gameQuestions = getRandomQuestions(useCount, "all", "all");
    }
    
    // Mark questions as answered to prevent repeats in future games
    markQuestionsAnswered(gameQuestions.map(q => q.id));
    
    const panelName = `IQ Test - ${formatDifficulty(useDiff)} - ${formatCategory(useCat)}`;
    
    startGame(gameQuestions, panelName);
  };

  const handleSettingChange = (type: "difficulty" | "category" | "questionCount", value: string | number) => {
    if (!isHost) return;
    
    if (settings.hapticsEnabled) {
      Haptics.selectionAsync();
    }
    
    let newDiff = localDifficulty;
    let newCat = localCategory;
    let newCount = localQuestionCount;
    
    if (type === "difficulty") {
      newDiff = value as string;
      setLocalDifficulty(newDiff);
    } else if (type === "category") {
      newCat = value as string;
      setLocalCategory(newCat);
    } else if (type === "questionCount") {
      newCount = value as number;
      setLocalQuestionCount(newCount);
    }
    
    // Broadcast to all players in real-time
    updateIQSettings(newDiff, newCat, newCount);
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

  const formatDifficulty = (diff: string) => {
    if (diff === "all") return "All Levels";
    return diff.charAt(0).toUpperCase() + diff.slice(1);
  };

  const formatCategory = (cat: string) => {
    if (cat === "all") return "All Categories";
    return cat.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const renderModeSelect = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.modeSelect}>
      <View style={styles.brainIcon}>
        <Feather name="cpu" size={48} color={IQColors.primary} />
      </View>
      <ThemedText style={styles.title}>IQ Test Multiplayer</ThemedText>
      <ThemedText style={[styles.subtitle, { color: GameColors.textSecondary }]}>
        Challenge friends to an IQ battle
      </ThemedText>

      <View style={[styles.settingsCard, { backgroundColor: IQColors.primary + "15", borderColor: IQColors.primary + "40" }]}>
        <ThemedText style={[styles.settingsTitle, { color: IQColors.primary }]}>Game Settings</ThemedText>
        <View style={styles.settingsRow}>
          <Feather name="bar-chart-2" size={16} color={IQColors.secondary} />
          <ThemedText style={styles.settingsLabel}>Difficulty:</ThemedText>
          <ThemedText style={[styles.settingsValue, { color: IQColors.primary }]}>{formatDifficulty(difficulty)}</ThemedText>
        </View>
        <View style={styles.settingsRow}>
          <Feather name="grid" size={16} color={IQColors.secondary} />
          <ThemedText style={styles.settingsLabel}>Category:</ThemedText>
          <ThemedText style={[styles.settingsValue, { color: IQColors.primary }]}>{formatCategory(category)}</ThemedText>
        </View>
        <View style={styles.settingsRow}>
          <Feather name="hash" size={16} color={IQColors.secondary} />
          <ThemedText style={styles.settingsLabel}>Questions:</ThemedText>
          <ThemedText style={[styles.settingsValue, { color: IQColors.primary }]}>{questionCount}</ThemedText>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <Pressable
          style={[styles.modeButton, { backgroundColor: colors.surface, borderColor: IQColors.primary }]}
          onPress={() => setMode("create")}
        >
          <View style={[styles.modeIconContainer, { backgroundColor: IQColors.primary + "20" }]}>
            <Feather name="plus-circle" size={32} color={IQColors.primary} />
          </View>
          <ThemedText style={styles.modeButtonTitle}>Create Room</ThemedText>
          <ThemedText style={[styles.modeButtonDesc, { color: GameColors.textSecondary }]}>
            Host a new IQ challenge
          </ThemedText>
        </Pressable>

        <Pressable
          style={[styles.modeButton, { backgroundColor: colors.surface, borderColor: IQColors.secondary }]}
          onPress={() => setMode("join")}
        >
          <View style={[styles.modeIconContainer, { backgroundColor: IQColors.secondary + "20" }]}>
            <Feather name="log-in" size={32} color={IQColors.secondary} />
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
        <Feather name="cpu" size={48} color={IQColors.primary} style={{ marginBottom: Spacing.md }} />
        <ThemedText style={styles.title}>Create IQ Room</ThemedText>
        <ThemedText style={[styles.subtitle, { color: GameColors.textSecondary }]}>
          A unique room code will be generated for your friends to join
        </ThemedText>
      </View>

      {isConnecting ? (
        <Animated.View style={[styles.connectingContainer, pulseAnimatedStyle]}>
          <ActivityIndicator size="large" color={IQColors.primary} />
          <ThemedText style={[styles.connectingText, { color: GameColors.textSecondary }]}>
            Creating your room...
          </ThemedText>
        </Animated.View>
      ) : (
        <View style={styles.createInfo}>
          <View style={styles.infoRow}>
            <Feather name="users" size={20} color={IQColors.secondary} />
            <ThemedText style={[styles.infoText, { color: GameColors.textSecondary }]}>
              Up to 8 players can join
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Feather name="share-2" size={20} color={IQColors.secondary} />
            <ThemedText style={[styles.infoText, { color: GameColors.textSecondary }]}>
              Share the code with friends
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Feather name="zap" size={20} color={IQColors.secondary} />
            <ThemedText style={[styles.infoText, { color: GameColors.textSecondary }]}>
              {questionCount} IQ challenge questions
            </ThemedText>
          </View>
        </View>
      )}

      <Pressable
        style={[styles.purpleButton, { opacity: isConnecting ? 0.5 : 1 }]}
        onPress={handleCreateRoom}
        disabled={isConnecting}
      >
        <View style={styles.buttonContent}>
          {isConnecting ? null : <Feather name="play" size={20} color={GameColors.textPrimary} />}
          <ThemedText style={styles.buttonText}>
            {isConnecting ? "Creating..." : "Create Room"}
          </ThemedText>
        </View>
      </Pressable>
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
              backgroundColor: isFilled ? IQColors.primary + '20' : GameColors.surface,
              borderColor: isNext ? IQColors.primary : (isFilled ? IQColors.primary : GameColors.surface),
            }
          ]}
        >
          <ThemedText style={[styles.codeBoxText, { color: isFilled ? IQColors.primary : GameColors.textSecondary }]}>
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
        <Feather name="log-in" size={48} color={IQColors.secondary} style={{ marginBottom: Spacing.md }} />
        <ThemedText style={styles.title}>Join IQ Room</ThemedText>
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
          <ActivityIndicator size="large" color={IQColors.primary} />
          <ThemedText style={[styles.connectingText, { color: GameColors.textSecondary }]}>
            Connecting to room...
          </ThemedText>
        </Animated.View>
      ) : (
        <>
          <Pressable
            style={[styles.purpleButton, { opacity: joinCode.length === 6 ? 1 : 0.5 }]}
            onPress={() => handleJoinRoom()}
            disabled={joinCode.length !== 6}
          >
            <ThemedText style={styles.buttonText}>
              Join Room
            </ThemedText>
          </Pressable>

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
      <View style={[styles.roomCodeContainer, { backgroundColor: IQColors.primary + "15" }]}>
        <ThemedText style={[styles.roomCodeLabel, { color: GameColors.textSecondary }]}>
          Room Code
        </ThemedText>
        <View style={styles.roomCodeRow}>
          <ThemedText style={[styles.roomCode, { color: IQColors.primary }]}>
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

      <View style={[styles.settingsCard, { backgroundColor: IQColors.primary + "10", borderColor: IQColors.primary + "30", marginBottom: Spacing.lg }]}>
        <View style={styles.settingsHeaderRow}>
          <Feather name="cpu" size={18} color={IQColors.primary} />
          <ThemedText style={[styles.settingsTitle, { color: IQColors.primary, marginLeft: Spacing.sm }]}>
            IQ Challenge Settings {isHost ? "(Host Controls)" : ""}
          </ThemedText>
        </View>

        <View style={styles.settingSection}>
          <View style={styles.settingLabelRow}>
            <Feather name="bar-chart-2" size={14} color={IQColors.secondary} />
            <ThemedText style={styles.settingsLabel}>Difficulty:</ThemedText>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
            <View style={styles.optionRow}>
              {difficultyOptions.map((opt) => (
                <Pressable
                  key={opt}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: localDifficulty === opt ? IQColors.primary : colors.backgroundDark,
                      borderColor: localDifficulty === opt ? IQColors.primary : colors.surface,
                      opacity: isHost ? 1 : 0.7,
                    }
                  ]}
                  onPress={() => handleSettingChange("difficulty", opt)}
                  disabled={!isHost}
                >
                  <ThemedText style={[
                    styles.optionChipText,
                    { color: localDifficulty === opt ? colors.backgroundDark : GameColors.textPrimary }
                  ]}>
                    {formatDifficulty(opt)}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.settingSection}>
          <View style={styles.settingLabelRow}>
            <Feather name="grid" size={14} color={IQColors.secondary} />
            <ThemedText style={styles.settingsLabel}>Category:</ThemedText>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
            <View style={styles.optionRow}>
              {categoryOptions.map((opt) => (
                <Pressable
                  key={opt}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: localCategory === opt ? IQColors.primary : colors.backgroundDark,
                      borderColor: localCategory === opt ? IQColors.primary : colors.surface,
                      opacity: isHost ? 1 : 0.7,
                    }
                  ]}
                  onPress={() => handleSettingChange("category", opt)}
                  disabled={!isHost}
                >
                  <ThemedText style={[
                    styles.optionChipText,
                    { color: localCategory === opt ? colors.backgroundDark : GameColors.textPrimary }
                  ]}>
                    {formatCategory(opt)}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.settingSection}>
          <View style={styles.settingLabelRow}>
            <Feather name="hash" size={14} color={IQColors.secondary} />
            <ThemedText style={styles.settingsLabel}>Questions:</ThemedText>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
            <View style={styles.optionRow}>
              {questionCountOptions.map((opt) => (
                <Pressable
                  key={opt}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: localQuestionCount === opt ? IQColors.primary : colors.backgroundDark,
                      borderColor: localQuestionCount === opt ? IQColors.primary : colors.surface,
                      opacity: isHost ? 1 : 0.7,
                    }
                  ]}
                  onPress={() => handleSettingChange("questionCount", opt)}
                  disabled={!isHost}
                >
                  <ThemedText style={[
                    styles.optionChipText,
                    { color: localQuestionCount === opt ? colors.backgroundDark : GameColors.textPrimary }
                  ]}>
                    {opt}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {!isHost ? (
          <ThemedText style={[styles.hostNote, { color: GameColors.textSecondary }]}>
            Only the host can change settings
          </ThemedText>
        ) : null}
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

      <View style={[styles.chatSection, { backgroundColor: colors.surface }]}>
        <View style={styles.chatHeader}>
          <Feather name="message-circle" size={18} color={IQColors.primary} />
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
                    ? [styles.chatBubbleMine, { backgroundColor: IQColors.primary + "30" }] 
                    : styles.chatBubbleOther,
                ]}
              >
                {msg.playerId !== playerId ? (
                  <ThemedText style={[styles.chatSender, { color: IQColors.primary }]}>
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
            style={[styles.chatSendBtn, { backgroundColor: chatInput.trim() ? IQColors.primary : colors.surface }]}
            onPress={handleSendChat}
            disabled={!chatInput.trim()}
          >
            <Feather name="send" size={18} color={chatInput.trim() ? GameColors.textPrimary : GameColors.textSecondary} />
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
          <Pressable
            style={[
              styles.purpleButton,
              { opacity: (room?.players.length || 0) < 2 || !room?.players.every(p => p.ready) ? 0.5 : 1 }
            ]}
            onPress={handleStartGame}
            disabled={(room?.players.length || 0) < 2 || !room?.players.every(p => p.ready)}
          >
            <ThemedText style={styles.buttonText}>Start IQ Challenge</ThemedText>
          </Pressable>
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
          {mode === "lobby" ? "IQ Lobby" : "IQ Multiplayer"}
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
  brainIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: IQColors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
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
  settingsCard: {
    width: "100%",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  settingsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  settingsTitle: {
    ...Typography.caption,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  settingsLabel: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    flex: 1,
  },
  settingsValue: {
    ...Typography.body,
    fontWeight: "600",
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
  purpleButton: {
    width: "100%",
    backgroundColor: IQColors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
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
  settingSection: {
    marginBottom: Spacing.md,
  },
  settingLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  optionScroll: {
    marginHorizontal: -Spacing.sm,
  },
  optionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  optionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  optionChipText: {
    ...Typography.caption,
    fontWeight: "600",
  },
  hostNote: {
    ...Typography.caption,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: Spacing.sm,
  },
});
