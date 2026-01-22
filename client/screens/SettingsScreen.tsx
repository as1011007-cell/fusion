import React from "react";
import { StyleSheet, View, ScrollView, Pressable, Switch, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useProfile } from "@/context/ProfileContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Settings">;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { settings, updateSettings, resetAnsweredQuestions, answeredQuestions } = useProfile();

  const handleBack = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.goBack();
  };

  const handleToggleMusic = (value: boolean) => {
    updateSettings({ musicEnabled: value });
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleToggleHaptics = (value: boolean) => {
    updateSettings({ hapticsEnabled: value });
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleResetQuestions = () => {
    resetAnsweredQuestions();
    if (settings.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={GameColors.textPrimary} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Settings</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ThemedText style={styles.sectionTitle}>Audio & Feedback</ThemedText>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: GameColors.secondary + "20" }]}>
                <Feather name="music" size={20} color={GameColors.secondary} />
              </View>
              <View style={styles.settingContent}>
                <ThemedText style={styles.settingTitle}>Background Music</ThemedText>
                <ThemedText style={styles.settingDesc}>
                  Play ambient music during gameplay
                </ThemedText>
              </View>
              <Switch
                value={settings.musicEnabled}
                onValueChange={handleToggleMusic}
                trackColor={{ false: GameColors.backgroundDark, true: GameColors.primary + "50" }}
                thumbColor={settings.musicEnabled ? GameColors.primary : GameColors.textSecondary}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: GameColors.accent + "20" }]}>
                <Feather name="smartphone" size={20} color={GameColors.accent} />
              </View>
              <View style={styles.settingContent}>
                <ThemedText style={styles.settingTitle}>Haptic Feedback</ThemedText>
                <ThemedText style={styles.settingDesc}>
                  Vibration on button presses and events
                </ThemedText>
              </View>
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={handleToggleHaptics}
                trackColor={{ false: GameColors.backgroundDark, true: GameColors.primary + "50" }}
                thumbColor={settings.hapticsEnabled ? GameColors.primary : GameColors.textSecondary}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <ThemedText style={styles.sectionTitle}>Game Data</ThemedText>

          <View style={styles.settingCard}>
            <View style={styles.infoRow}>
              <View style={[styles.settingIcon, { backgroundColor: GameColors.primary + "20" }]}>
                <Feather name="help-circle" size={20} color={GameColors.primary} />
              </View>
              <View style={styles.settingContent}>
                <ThemedText style={styles.settingTitle}>Questions Answered</ThemedText>
                <ThemedText style={styles.settingDesc}>
                  {answeredQuestions.size} unique questions completed
                </ThemedText>
              </View>
            </View>

            <View style={styles.divider} />

            <Pressable style={styles.settingRow} onPress={handleResetQuestions}>
              <View style={[styles.settingIcon, { backgroundColor: GameColors.wrong + "20" }]}>
                <Feather name="refresh-cw" size={20} color={GameColors.wrong} />
              </View>
              <View style={styles.settingContent}>
                <ThemedText style={styles.settingTitle}>Reset Question History</ThemedText>
                <ThemedText style={styles.settingDesc}>
                  Start fresh with all questions available again
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={GameColors.textSecondary} />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <ThemedText style={styles.sectionTitle}>About</ThemedText>

          <View style={styles.settingCard}>
            <View style={styles.infoRow}>
              <View style={[styles.settingIcon, { backgroundColor: GameColors.correct + "20" }]}>
                <Feather name="info" size={20} color={GameColors.correct} />
              </View>
              <View style={styles.settingContent}>
                <ThemedText style={styles.settingTitle}>FEUD FUSION</ThemedText>
                <ThemedText style={styles.settingDesc}>Version 1.0.0</ThemedText>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={[styles.settingIcon, { backgroundColor: "#9B59B620" }]}>
                <Feather name="heart" size={20} color="#9B59B6" />
              </View>
              <View style={styles.settingContent}>
                <ThemedText style={styles.settingTitle}>Made with love</ThemedText>
                <ThemedText style={styles.settingDesc}>
                  Enjoy discovering different perspectives!
                </ThemedText>
              </View>
            </View>
          </View>
        </Animated.View>

        {Platform.OS !== "web" ? (
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.noteContainer}>
            <Feather name="volume-2" size={16} color={GameColors.textSecondary} />
            <ThemedText style={styles.noteText}>
              Music plays during gameplay when enabled. Haptics provide tactile feedback for game events.
            </ThemedText>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.noteContainer}>
            <Feather name="info" size={16} color={GameColors.textSecondary} />
            <ThemedText style={styles.noteText}>
              Some features like haptic feedback work best in Expo Go on a real device.
            </ThemedText>
          </Animated.View>
        )}
      </ScrollView>
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
    ...Typography.h4,
    color: GameColors.textPrimary,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  settingCard: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  settingContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  settingTitle: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "600",
  },
  settingDesc: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: Spacing.lg,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
  },
  noteText: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    marginLeft: Spacing.sm,
    flex: 1,
  },
});
