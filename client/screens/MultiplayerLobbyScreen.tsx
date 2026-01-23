import React, { useState, useEffect } from "react";
import { StyleSheet, View, Pressable, TextInput, ScrollView, Share, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeIn, FadeInDown, SlideInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { GradientButton } from "@/components/GradientButton";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useMultiplayer, MultiplayerPlayer } from "@/context/MultiplayerContext";
import { useProfile, avatarImages } from "@/context/ProfileContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MultiplayerLobbyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { currentProfile, settings } = useProfile();
  
  const {
    connected,
    playerId,
    room,
    error,
    createRoom,
    joinRoom,
    setReady,
    startGame,
    leaveRoom,
    clearError,
  } = useMultiplayer();

  const [mode, setMode] = useState<"select" | "create" | "join" | "lobby">("select");
  const [joinCode, setJoinCode] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

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
    if (!room) return;
    
    const allReady = room.players.every(p => p.ready);
    if (!allReady) {
      Alert.alert("Not Ready", "All players must be ready to start");
      return;
    }
    
    if (room.players.length < 2) {
      Alert.alert("Need More Players", "At least 2 players required to start");
      return;
    }

    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    navigation.navigate("MultiplayerGame" as any);
  };

  const isHost = room?.hostId === playerId;
  const currentPlayer = room?.players.find(p => p.id === playerId);

  const renderModeSelect = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.modeSelect}>
      <ThemedText style={styles.title}>Multiplayer</ThemedText>
      <ThemedText style={[styles.subtitle, { color: GameColors.textSecondary }]}>
        Play with friends on different devices
      </ThemedText>

      <View style={styles.buttonGroup}>
        <Pressable
          style={[styles.modeButton, { backgroundColor: GameColors.surface, borderColor: GameColors.accent }]}
          onPress={() => setMode("create")}
        >
          <View style={[styles.modeIconContainer, { backgroundColor: GameColors.accent + "20" }]}>
            <Feather name="plus-circle" size={32} color={GameColors.accent} />
          </View>
          <ThemedText style={styles.modeButtonTitle}>Create Room</ThemedText>
          <ThemedText style={[styles.modeButtonDesc, { color: GameColors.textSecondary }]}>
            Host a new game session
          </ThemedText>
        </Pressable>

        <Pressable
          style={[styles.modeButton, { backgroundColor: GameColors.surface, borderColor: GameColors.secondary }]}
          onPress={() => setMode("join")}
        >
          <View style={[styles.modeIconContainer, { backgroundColor: GameColors.secondary + "20" }]}>
            <Feather name="log-in" size={32} color={GameColors.secondary} />
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
      <ThemedText style={styles.title}>Create Room</ThemedText>
      <ThemedText style={[styles.subtitle, { color: GameColors.textSecondary }]}>
        A room code will be generated for your friends to join
      </ThemedText>

      <GradientButton
        onPress={handleCreateRoom}
        disabled={isConnecting}
        style={styles.actionButton}
      >
        <ThemedText style={styles.buttonText}>
          {isConnecting ? "Creating..." : "Create Room"}
        </ThemedText>
      </GradientButton>
    </Animated.View>
  );

  const renderJoinRoom = () => (
    <Animated.View entering={SlideInUp.duration(300)} style={styles.actionContainer}>
      <ThemedText style={styles.title}>Join Room</ThemedText>
      <ThemedText style={[styles.subtitle, { color: GameColors.textSecondary }]}>
        Enter the 6-character room code
      </ThemedText>

      <TextInput
        style={[styles.codeInput, { backgroundColor: GameColors.surface, color: GameColors.textPrimary }]}
        placeholder="ABCDEF"
        placeholderTextColor={GameColors.textSecondary}
        value={joinCode}
        onChangeText={(text) => setJoinCode(text.toUpperCase().slice(0, 6))}
        autoCapitalize="characters"
        maxLength={6}
      />

      <GradientButton
        onPress={handleJoinRoom}
        disabled={isConnecting || joinCode.length !== 6}
        style={styles.actionButton}
      >
        <ThemedText style={styles.buttonText}>
          {isConnecting ? "Joining..." : "Join Room"}
        </ThemedText>
      </GradientButton>
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

      <View style={[styles.playersSection, { backgroundColor: GameColors.surface }]}>
        <ThemedText style={styles.playersSectionTitle}>
          Players ({room?.players.length}/{room?.maxPlayers})
        </ThemedText>
        <ScrollView style={styles.playersList} showsVerticalScrollIndicator={false}>
          {room?.players.map((player, index) => (
            <Animated.View
              key={player.id}
              entering={FadeInDown.delay(index * 100)}
              style={[styles.playerCard, { backgroundColor: GameColors.backgroundDark }]}
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
    <View style={[styles.container, { backgroundColor: GameColors.backgroundDark, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color={GameColors.textPrimary} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>
          {mode === "lobby" ? "Game Lobby" : "Multiplayer"}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {mode === "select" ? renderModeSelect() : null}
        {mode === "create" ? renderCreateRoom() : null}
        {mode === "join" ? renderJoinRoom() : null}
        {mode === "lobby" ? renderLobby() : null}
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
  },
  roomCodeLabel: {
    ...Typography.caption,
    textTransform: "uppercase",
    marginBottom: Spacing.xs,
  },
  roomCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  roomCode: {
    fontSize: 36,
    fontWeight: "bold",
    letterSpacing: 4,
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
    maxHeight: 300,
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
});
