import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GradientButton } from "@/components/GradientButton";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useGame } from "@/context/GameContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "PartySetup">;

export default function PartySetupScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { gameState, addPartyPlayer, removePartyPlayer, assignRoles, startGame } = useGame();
  const [playerName, setPlayerName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<"red" | "blue">("red");

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleAddPlayer = () => {
    if (playerName.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      addPartyPlayer(playerName.trim(), selectedTeam);
      setPlayerName("");
    }
  };

  const handleStartParty = () => {
    if (gameState.partyPlayers.length >= 2) {
      assignRoles();
      startGame("party");
      navigation.navigate("GamePlay");
    }
  };

  const redTeam = gameState.partyPlayers.filter(p => p.team === "red");
  const blueTeam = gameState.partyPlayers.filter(p => p.team === "blue");

  const roleIcons: Record<string, string> = {
    talker: "mic",
    whisperer: "message-circle",
    saboteur: "alert-triangle",
  };

  const roleColors: Record<string, string> = {
    talker: GameColors.accent,
    whisperer: GameColors.secondary,
    saboteur: GameColors.wrong,
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={GameColors.textPrimary} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Party Mode</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ThemedText style={styles.sectionTitle}>Add Players</ThemedText>
          
          <View style={styles.teamSelector}>
            <Pressable
              style={[
                styles.teamButton,
                selectedTeam === "red" && styles.teamButtonActive,
                { borderColor: "#FF4444" },
              ]}
              onPress={() => setSelectedTeam("red")}
            >
              <ThemedText style={[styles.teamButtonText, { color: "#FF4444" }]}>
                Red Team
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.teamButton,
                selectedTeam === "blue" && styles.teamButtonActive,
                { borderColor: "#4444FF" },
              ]}
              onPress={() => setSelectedTeam("blue")}
            >
              <ThemedText style={[styles.teamButtonText, { color: "#4444FF" }]}>
                Blue Team
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter player name..."
              placeholderTextColor={GameColors.textSecondary}
              value={playerName}
              onChangeText={setPlayerName}
              onSubmitEditing={handleAddPlayer}
            />
            <Pressable
              style={[styles.addButton, !playerName.trim() && styles.addButtonDisabled]}
              onPress={handleAddPlayer}
              disabled={!playerName.trim()}
            >
              <Feather name="plus" size={24} color={GameColors.textPrimary} />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.teamsContainer}>
          <View style={styles.teamColumn}>
            <View style={[styles.teamHeader, { backgroundColor: "#FF444430" }]}>
              <ThemedText style={[styles.teamName, { color: "#FF4444" }]}>
                Red Team
              </ThemedText>
              <ThemedText style={styles.teamCount}>{redTeam.length} players</ThemedText>
            </View>
            {redTeam.map((player) => (
              <View key={player.id} style={styles.playerCard}>
                <View style={styles.playerInfo}>
                  <View style={[styles.roleIcon, { backgroundColor: roleColors[player.role] + "30" }]}>
                    <Feather
                      name={roleIcons[player.role] as any}
                      size={14}
                      color={roleColors[player.role]}
                    />
                  </View>
                  <ThemedText style={styles.playerName}>{player.name}</ThemedText>
                </View>
                <Pressable onPress={() => removePartyPlayer(player.id)}>
                  <Feather name="x" size={18} color={GameColors.textSecondary} />
                </Pressable>
              </View>
            ))}
            {redTeam.length === 0 ? (
              <View style={styles.emptyTeam}>
                <ThemedText style={styles.emptyText}>Add players</ThemedText>
              </View>
            ) : null}
          </View>

          <View style={styles.teamColumn}>
            <View style={[styles.teamHeader, { backgroundColor: "#4444FF30" }]}>
              <ThemedText style={[styles.teamName, { color: "#4444FF" }]}>
                Blue Team
              </ThemedText>
              <ThemedText style={styles.teamCount}>{blueTeam.length} players</ThemedText>
            </View>
            {blueTeam.map((player) => (
              <View key={player.id} style={styles.playerCard}>
                <View style={styles.playerInfo}>
                  <View style={[styles.roleIcon, { backgroundColor: roleColors[player.role] + "30" }]}>
                    <Feather
                      name={roleIcons[player.role] as any}
                      size={14}
                      color={roleColors[player.role]}
                    />
                  </View>
                  <ThemedText style={styles.playerName}>{player.name}</ThemedText>
                </View>
                <Pressable onPress={() => removePartyPlayer(player.id)}>
                  <Feather name="x" size={18} color={GameColors.textSecondary} />
                </Pressable>
              </View>
            ))}
            {blueTeam.length === 0 ? (
              <View style={styles.emptyTeam}>
                <ThemedText style={styles.emptyText}>Add players</ThemedText>
              </View>
            ) : null}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.rolesInfo}>
          <ThemedText style={styles.sectionTitle}>Roles</ThemedText>
          <View style={styles.roleCard}>
            <View style={[styles.roleIconLarge, { backgroundColor: GameColors.accent + "30" }]}>
              <Feather name="mic" size={20} color={GameColors.accent} />
            </View>
            <View style={styles.roleContent}>
              <ThemedText style={styles.roleName}>Talker</ThemedText>
              <ThemedText style={styles.roleDesc}>Speaks the answer out loud</ThemedText>
            </View>
          </View>
          <View style={styles.roleCard}>
            <View style={[styles.roleIconLarge, { backgroundColor: GameColors.secondary + "30" }]}>
              <Feather name="message-circle" size={20} color={GameColors.secondary} />
            </View>
            <View style={styles.roleContent}>
              <ThemedText style={styles.roleName}>Whisperer</ThemedText>
              <ThemedText style={styles.roleDesc}>Can only whisper suggestions</ThemedText>
            </View>
          </View>
          <View style={styles.roleCard}>
            <View style={[styles.roleIconLarge, { backgroundColor: GameColors.wrong + "30" }]}>
              <Feather name="alert-triangle" size={20} color={GameColors.wrong} />
            </View>
            <View style={styles.roleContent}>
              <ThemedText style={styles.roleName}>Saboteur</ThemedText>
              <ThemedText style={styles.roleDesc}>Secret agent for the other team</ThemedText>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.delay(400).springify()}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <GradientButton
          onPress={handleStartParty}
          disabled={gameState.partyPlayers.length < 2}
          variant="secondary"
        >
          Start Chaos
        </GradientButton>
      </Animated.View>
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
  headerTitle: {
    ...Typography.h4,
    color: GameColors.textPrimary,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
  sectionTitle: {
    ...Typography.h3,
    color: GameColors.textPrimary,
    marginBottom: Spacing.md,
  },
  teamSelector: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  teamButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: "center",
    backgroundColor: GameColors.surface,
  },
  teamButtonActive: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  teamButtonText: {
    ...Typography.body,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  input: {
    flex: 1,
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    color: GameColors.textPrimary,
    ...Typography.body,
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: GameColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  teamsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  teamColumn: {
    flex: 1,
  },
  teamHeader: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  teamName: {
    ...Typography.body,
    fontWeight: "700",
  },
  teamCount: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: GameColors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  playerName: {
    ...Typography.small,
    color: GameColors.textPrimary,
  },
  emptyTeam: {
    backgroundColor: GameColors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  emptyText: {
    ...Typography.small,
    color: GameColors.textSecondary,
  },
  rolesInfo: {
    marginTop: Spacing.md,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  roleIconLarge: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  roleContent: {
    flex: 1,
  },
  roleName: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "600",
  },
  roleDesc: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    backgroundColor: GameColors.backgroundDark,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
});
