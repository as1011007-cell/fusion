import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
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
import { useIQ } from "@/context/IQContext";
import { useTheme } from "@/context/ThemeContext";
import { useProfile } from "@/context/ProfileContext";
import { IQCategory } from "@/data/iqQuestions";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "IQSetup">;

type GameMode = "single" | "multiplayer";
type DifficultyOption = "all" | "easy" | "medium" | "hard";
type CategoryOption = "all" | IQCategory;

const DIFFICULTY_OPTIONS: { value: DifficultyOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const CATEGORY_OPTIONS: { value: CategoryOption; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "logical-reasoning", label: "Logical" },
  { value: "pattern-recognition", label: "Pattern" },
  { value: "verbal-intelligence", label: "Verbal" },
  { value: "mathematical-reasoning", label: "Math" },
  { value: "spatial-reasoning", label: "Spatial" },
];

const QUESTION_COUNT_OPTIONS = [10, 20, 30, 50];

export default function IQSetupScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { startGame } = useIQ();
  const { currentTheme } = useTheme();
  const { settings } = useProfile();
  const colors = currentTheme.colors;

  const [gameMode, setGameMode] = useState<GameMode>("single");
  const [difficulty, setDifficulty] = useState<DifficultyOption>("all");
  const [category, setCategory] = useState<CategoryOption>("all");
  const [questionCount, setQuestionCount] = useState<number>(10);

  const handleBack = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.goBack();
  };

  const handleModeSelect = (mode: GameMode) => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setGameMode(mode);
  };

  const handleDifficultySelect = (diff: DifficultyOption) => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDifficulty(diff);
  };

  const handleCategorySelect = (cat: CategoryOption) => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCategory(cat);
  };

  const handleQuestionCountSelect = (count: number) => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setQuestionCount(count);
  };

  const handleStartTest = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (gameMode === "single") {
      startGame(difficulty, category, questionCount);
      navigation.navigate("IQGame");
    } else {
      navigation.navigate("IQMultiplayerLobby", {
        difficulty,
        category,
        questionCount,
      } as never);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundDark }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBack} style={[styles.backButton, { backgroundColor: colors.surface }]}>
          <Feather name="arrow-left" size={24} color={GameColors.textPrimary} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>IQ Test Setup</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ThemedText style={styles.sectionTitle}>Game Mode</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Play solo or challenge friends
          </ThemedText>

          <View style={styles.modeContainer}>
            <Pressable
              style={[
                styles.modeButton,
                { backgroundColor: colors.surface },
                gameMode === "single" && styles.modeButtonSelected,
              ]}
              onPress={() => handleModeSelect("single")}
            >
              <Feather
                name="user"
                size={24}
                color={gameMode === "single" ? GameColors.secondary : GameColors.textSecondary}
              />
              <ThemedText
                style={[
                  styles.modeButtonText,
                  gameMode === "single" && styles.modeButtonTextSelected,
                ]}
              >
                Single Player
              </ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.modeButton,
                { backgroundColor: colors.surface },
                gameMode === "multiplayer" && styles.modeButtonSelected,
              ]}
              onPress={() => handleModeSelect("multiplayer")}
            >
              <Feather
                name="users"
                size={24}
                color={gameMode === "multiplayer" ? GameColors.secondary : GameColors.textSecondary}
              />
              <ThemedText
                style={[
                  styles.modeButtonText,
                  gameMode === "multiplayer" && styles.modeButtonTextSelected,
                ]}
              >
                Multiplayer
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(200).springify()}
          style={styles.section}
        >
          <ThemedText style={styles.sectionTitle}>Difficulty</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Choose your challenge level
          </ThemedText>

          <View style={styles.optionsRow}>
            {DIFFICULTY_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.optionButton,
                  { backgroundColor: colors.surface },
                  difficulty === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => handleDifficultySelect(option.value)}
              >
                <ThemedText
                  style={[
                    styles.optionButtonText,
                    difficulty === option.value && styles.optionButtonTextSelected,
                  ]}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(300).springify()}
          style={styles.section}
        >
          <ThemedText style={styles.sectionTitle}>Category</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Select question type
          </ThemedText>

          <View style={styles.categoryContainer}>
            {CATEGORY_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.categoryButton,
                  { backgroundColor: colors.surface },
                  category === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => handleCategorySelect(option.value)}
              >
                <ThemedText
                  style={[
                    styles.categoryButtonText,
                    category === option.value && styles.optionButtonTextSelected,
                  ]}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400).springify()}
          style={styles.section}
        >
          <ThemedText style={styles.sectionTitle}>Question Count</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            How many questions to answer
          </ThemedText>

          <View style={styles.optionsRow}>
            {QUESTION_COUNT_OPTIONS.map((count) => (
              <Pressable
                key={count}
                style={[
                  styles.optionButton,
                  { backgroundColor: colors.surface },
                  questionCount === count && styles.optionButtonSelected,
                ]}
                onPress={() => handleQuestionCountSelect(count)}
              >
                <ThemedText
                  style={[
                    styles.optionButtonText,
                    questionCount === count && styles.optionButtonTextSelected,
                  ]}
                >
                  {count}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(500).springify()}
          style={styles.section}
        >
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Feather name="zap" size={20} color={GameColors.secondary} />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoTitle}>How It Works</ThemedText>
              <ThemedText style={styles.infoText}>
                Answer questions as quickly and accurately as possible. Harder difficulties and faster answers earn more points. Your IQ estimate will be calculated at the end.
              </ThemedText>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.delay(600).springify()}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <GradientButton
          onPress={handleStartTest}
          variant="primary"
        >
          Start IQ Test
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
  section: {
    marginTop: Spacing["2xl"],
  },
  modeContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  modeButtonSelected: {
    borderColor: GameColors.secondary,
  },
  modeButtonText: {
    ...Typography.body,
    color: GameColors.textSecondary,
    fontWeight: "600",
  },
  modeButtonTextSelected: {
    color: GameColors.secondary,
  },
  optionsRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  optionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionButtonSelected: {
    borderColor: GameColors.secondary,
  },
  optionButtonText: {
    ...Typography.body,
    color: GameColors.textSecondary,
    fontWeight: "600",
  },
  optionButtonTextSelected: {
    color: GameColors.secondary,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryButtonText: {
    ...Typography.small,
    color: GameColors.textSecondary,
    fontWeight: "600",
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
