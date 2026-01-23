import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable, TextInput, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { FeudFusionBrand } from "@/components/FeudFusionBrand";
import { GradientButton } from "@/components/GradientButton";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useGame, PartyRole } from "@/context/GameContext";
import { useTheme } from "@/context/ThemeContext";
import { useProfile } from "@/context/ProfileContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "PartySetup">;

export default function PartySetupScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { gameState, addPartyPlayer, removePartyPlayer, updatePlayerRole, startGame } = useGame();
  const { currentTheme } = useTheme();
  const { settings } = useProfile();
  const colors = currentTheme.colors;
  const [playerName, setPlayerName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<"red" | "blue">("red");
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const handleBack = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.goBack();
  };

  const handleAddPlayer = () => {
    if (playerName.trim()) {
      if (settings.hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      addPartyPlayer(playerName.trim(), selectedTeam);
      setPlayerName("");
    }
  };

  const handleStartParty = () => {
    if (gameState.partyPlayers.length >= 2) {
      startGame("party");
      navigation.navigate("GamePlay");
    }
  };

  const handleSelectRole = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setRoleModalVisible(true);
  };

  const handleRoleChange = (role: PartyRole) => {
    if (selectedPlayerId) {
      updatePlayerRole(selectedPlayerId, role);
    }
    setRoleModalVisible(false);
    setSelectedPlayerId(null);
  };

  const redTeam = gameState.partyPlayers.filter(p => p.team === "red");
  const blueTeam = gameState.partyPlayers.filter(p => p.team === "blue");

  const roles: { role: PartyRole; icon: string; color: string; name: string; desc: string }[] = [
    { role: "talker", icon: "mic", color: GameColors.accent, name: "Talker", desc: "Speaks the answer out loud" },
    { role: "whisperer", icon: "message-circle", color: GameColors.secondary, name: "Whisperer", desc: "Can only whisper suggestions" },
    { role: "saboteur", icon: "alert-triangle", color: GameColors.wrong, name: "Saboteur", desc: "Secret agent for the other team" },
  ];

  const getRoleInfo = (role: PartyRole) => roles.find(r => r.role === role) || roles[0];

  const PlayerCard = ({ player }: { player: typeof gameState.partyPlayers[0] }) => {
    const roleInfo = getRoleInfo(player.role);
    return (
      <View style={styles.playerCard}>
        <Pressable
          style={styles.playerInfo}
          onPress={() => handleSelectRole(player.id)}
        >
          <View style={[styles.roleIcon, { backgroundColor: roleInfo.color + "30" }]}>
            <Feather name={roleInfo.icon as any} size={14} color={roleInfo.color} />
          </View>
          <View style={styles.playerDetails}>
            <ThemedText style={styles.playerName}>{player.name}</ThemedText>
            <ThemedText style={[styles.playerRole, { color: roleInfo.color }]}>
              {roleInfo.name}
            </ThemedText>
          </View>
          <Feather name="chevron-down" size={16} color={GameColors.textSecondary} />
        </Pressable>
        <Pressable onPress={() => removePartyPlayer(player.id)} style={styles.removeButton}>
          <Feather name="x" size={18} color={GameColors.textSecondary} />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundDark }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBack} style={[styles.backButton, { backgroundColor: colors.surface }]}>
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
              <PlayerCard key={player.id} player={player} />
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
              <PlayerCard key={player.id} player={player} />
            ))}
            {blueTeam.length === 0 ? (
              <View style={styles.emptyTeam}>
                <ThemedText style={styles.emptyText}>Add players</ThemedText>
              </View>
            ) : null}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.rolesInfo}>
          <ThemedText style={styles.sectionTitle}>Roles Guide</ThemedText>
          <ThemedText style={styles.rolesHint}>Tap a player to change their role</ThemedText>
          {roles.map((role) => (
            <View key={role.role} style={styles.roleCard}>
              <View style={[styles.roleIconLarge, { backgroundColor: role.color + "30" }]}>
                <Feather name={role.icon as any} size={20} color={role.color} />
              </View>
              <View style={styles.roleContent}>
                <ThemedText style={styles.roleName}>{role.name}</ThemedText>
                <ThemedText style={styles.roleDesc}>{role.desc}</ThemedText>
              </View>
            </View>
          ))}
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

      <Modal
        visible={roleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setRoleModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Select Role</ThemedText>
            {roles.map((role) => (
              <Pressable
                key={role.role}
                style={styles.roleOption}
                onPress={() => handleRoleChange(role.role)}
              >
                <View style={[styles.roleIconLarge, { backgroundColor: role.color + "30" }]}>
                  <Feather name={role.icon as any} size={20} color={role.color} />
                </View>
                <View style={styles.roleContent}>
                  <ThemedText style={styles.roleName}>{role.name}</ThemedText>
                  <ThemedText style={styles.roleDesc}>{role.desc}</ThemedText>
                </View>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: Spacing.sm,
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
    marginBottom: Spacing.sm,
  },
  rolesHint: {
    ...Typography.caption,
    color: GameColors.textSecondary,
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
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  playerDetails: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  roleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  playerName: {
    ...Typography.small,
    color: GameColors.textPrimary,
    fontWeight: "600",
  },
  playerRole: {
    ...Typography.caption,
    fontSize: 10,
  },
  removeButton: {
    padding: Spacing.xs,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 340,
  },
  modalTitle: {
    ...Typography.h4,
    color: GameColors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.backgroundDark,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
});
