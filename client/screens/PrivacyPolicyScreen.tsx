import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { currentTheme } = useTheme();
  const colors = currentTheme.colors;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundDark }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={GameColors.textPrimary} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Privacy Policy</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing["3xl"] }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <ThemedText style={styles.lastUpdated}>Last updated January 22, 2026</ThemedText>

          <ThemedText style={styles.paragraph}>
            This Privacy Policy describes how FEUD FUSION ("we", "us", or "our") collects, uses, and shares information about you when you use our mobile application.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>WHAT INFORMATION DO WE COLLECT?</ThemedText>
          <ThemedText style={styles.paragraph}>
            We collect personal information that you voluntarily provide to us when you register on the app, express an interest in obtaining information about us or our products and services, when you participate in activities on the app, or otherwise when you contact us.
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            <ThemedText style={styles.bold}>Personal Information Provided by You.</ThemedText> The personal information that we collect depends on the context of your interactions with us and the app, the choices you make, and the products and features you use. The personal information we collect may include the following:
          </ThemedText>
          <ThemedText style={styles.listItem}>- Email addresses</ThemedText>
          <ThemedText style={styles.listItem}>- Passwords (encrypted)</ThemedText>
          <ThemedText style={styles.listItem}>- Names</ThemedText>
          <ThemedText style={styles.listItem}>- Profile pictures</ThemedText>

          <ThemedText style={styles.sectionTitle}>HOW DO WE PROCESS YOUR INFORMATION?</ThemedText>
          <ThemedText style={styles.paragraph}>
            We process your personal information for a variety of reasons, depending on how you interact with our app, including:
          </ThemedText>
          <ThemedText style={styles.listItem}>- To facilitate account creation and authentication</ThemedText>
          <ThemedText style={styles.listItem}>- To save your game progress and preferences</ThemedText>
          <ThemedText style={styles.listItem}>- To enable cloud sync across your devices</ThemedText>
          <ThemedText style={styles.listItem}>- To respond to user inquiries and offer support</ThemedText>
          <ThemedText style={styles.listItem}>- To send administrative information to you</ThemedText>

          <ThemedText style={styles.sectionTitle}>WHEN AND WITH WHOM DO WE SHARE YOUR INFORMATION?</ThemedText>
          <ThemedText style={styles.paragraph}>
            We may share information in specific situations described in this section and/or with the following third parties:
          </ThemedText>
          <ThemedText style={styles.listItem}>- Business Transfers: We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</ThemedText>

          <ThemedText style={styles.sectionTitle}>HOW LONG DO WE KEEP YOUR INFORMATION?</ThemedText>
          <ThemedText style={styles.paragraph}>
            We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Policy, unless a longer retention period is required or permitted by law.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>HOW DO WE KEEP YOUR INFORMATION SAFE?</ThemedText>
          <ThemedText style={styles.paragraph}>
            We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>DO WE COLLECT INFORMATION FROM MINORS?</ThemedText>
          <ThemedText style={styles.paragraph}>
            We do not knowingly solicit data from or market to children under 18 years of age. By using the app, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent's use of the app.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>WHAT ARE YOUR PRIVACY RIGHTS?</ThemedText>
          <ThemedText style={styles.paragraph}>
            In some regions (like the EEA, UK, and Canada), you have certain rights under applicable data protection laws. These may include the right to request access and obtain a copy of your personal information, to request rectification or erasure, to restrict the processing of your personal information, and if applicable, to data portability.
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            <ThemedText style={styles.bold}>Account Information:</ThemedText> If you would at any time like to review or change the information in your account or terminate your account, you can log in to your account settings and update your user account.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>DO WE MAKE UPDATES TO THIS POLICY?</ThemedText>
          <ThemedText style={styles.paragraph}>
            Yes, we will update this policy as necessary to stay compliant with relevant laws. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>HOW CAN YOU CONTACT US ABOUT THIS POLICY?</ThemedText>
          <ThemedText style={styles.paragraph}>
            If you have questions or comments about this policy, you may contact us through the app's support features or settings.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>ABOUT FEUD FUSION</ThemedText>
          <ThemedText style={styles.paragraph}>
            Think fast, trust your instincts, and read the room. Whether you're playing solo, with friends, or battling online, every round is a mix of strategy, psychology, and pure fun.
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            Features include real survey-based questions with surprising answers, multiple game modes (Solo, Friends, and Online Battles), family-friendly fun for all ages, quick rounds, big reactions, and endless replay value.
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            The goal is simple: Don't answer what you think—answer what they would say. Get ready to argue, laugh, and shout when you steal the top answer. FEUD FUSION — where minds collide and opinions rule.
          </ThemedText>

          <ThemedText style={styles.footer}>
            This Privacy Policy was created using Termly's Privacy Policy Generator.
          </ThemedText>
        </View>
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
  },
  card: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  lastUpdated: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  sectionTitle: {
    ...Typography.h4,
    color: GameColors.textPrimary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  paragraph: {
    ...Typography.body,
    color: GameColors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  bold: {
    fontWeight: "700",
    color: GameColors.textPrimary,
  },
  listItem: {
    ...Typography.body,
    color: GameColors.textSecondary,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.md,
    lineHeight: 22,
  },
  footer: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    marginTop: Spacing.xl,
    textAlign: "center",
    fontStyle: "italic",
  },
});
