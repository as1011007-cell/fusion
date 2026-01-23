import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { FeudFusionBrand } from "@/components/FeudFusionBrand";
import { GradientButton } from "@/components/GradientButton";
import { PanelCard } from "@/components/PanelCard";
import { LayerChip } from "@/components/LayerChip";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useGame, AnswerLayer } from "@/context/GameContext";
import { useTheme } from "@/context/ThemeContext";
import { useProfile } from "@/context/ProfileContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "GameSetup">;

export default function GameSetupScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const {
    gameState,
    panels,
    setSelectedPanel,
    setSelectedLayer,
    startGame,
  } = useGame();
  const { currentTheme } = useTheme();
  const { settings } = useProfile();
  const colors = currentTheme.colors;

  const handleBack = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.goBack();
  };

  const handleStartGame = () => {
    if (gameState.selectedPanel) {
      startGame("solo");
      navigation.navigate("GamePlay");
    }
  };

  const canStart = gameState.selectedPanel !== null;

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundDark }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBack} style={[styles.backButton, { backgroundColor: colors.surface }]}>
          <Feather name="arrow-left" size={24} color={GameColors.textPrimary} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Choose Your Feud</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ThemedText style={styles.sectionTitle}>Select Panel</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Who are you predicting answers for?
          </ThemedText>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.panelsContainer}
          >
            {panels.map((panel) => (
              <PanelCard
                key={panel.id}
                panel={panel}
                selected={gameState.selectedPanel?.id === panel.id}
                onPress={() => setSelectedPanel(panel)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(200).springify()}
          style={styles.section}
        >
          <ThemedText style={styles.sectionTitle}>Choose Layer</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Which type of answer are you targeting?
          </ThemedText>

          <View style={styles.layersContainer}>
            {(["common", "honest", "embarrassing"] as AnswerLayer[]).map(
              (layer) => (
                <LayerChip
                  key={layer}
                  layer={layer}
                  selected={gameState.selectedLayer === layer}
                  onPress={() => setSelectedLayer(layer)}
                />
              )
            )}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(300).springify()}
          style={styles.section}
        >
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Feather name="info" size={20} color={GameColors.secondary} />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoTitle}>How to Play</ThemedText>
              <ThemedText style={styles.infoText}>
                Think from the panel's perspective. What would THEY say, not what you would say. Higher risk layers = more points!
              </ThemedText>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.delay(400).springify()}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <GradientButton
          onPress={handleStartGame}
          disabled={!canStart}
          variant="primary"
        >
          Start Feud
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
  sectionTitle: {
    ...Typography.h3,
    color: GameColors.textPrimary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    ...Typography.small,
    color: GameColors.textSecondary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  panelsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  section: {
    marginTop: Spacing["2xl"],
  },
  layersContainer: {
    paddingHorizontal: Spacing.lg,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: GameColors.secondary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  infoText: {
    ...Typography.small,
    color: GameColors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    backgroundColor: GameColors.backgroundDark,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
});
