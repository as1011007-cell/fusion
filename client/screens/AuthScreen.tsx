import React, { useState } from "react";
import { StyleSheet, View, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
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
import { useAuth } from "@/context/AuthContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Auth">;

type AuthMode = "login" | "register" | "forgot" | "reset";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { login, register, forgotPassword, resetPassword, isLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingResetEmail, setPendingResetEmail] = useState("");

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter your email and password");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await login(email.trim(), password);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(result.error || "Login failed");
    }
  };

  const handleRegister = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter your email and password");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await register(email.trim(), password, name.trim() || undefined);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(result.error || "Registration failed");
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setSuccess(null);
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await forgotPassword(email.trim());
    if (result.success) {
      setPendingResetEmail(email.trim());
      setMode("reset");
      setSuccess("Reset code sent! Check below for the code.");
      if (result.resetCode) {
        setResetCode(result.resetCode);
      }
    } else {
      setError(result.error || "Failed to send reset code");
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    setSuccess(null);
    if (!resetCode.trim() || !newPassword) {
      setError("Please enter the reset code and new password");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await resetPassword(pendingResetEmail, resetCode.trim(), newPassword);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess("Password reset successfully! You can now login.");
      setMode("login");
      setPassword("");
      setResetCode("");
      setNewPassword("");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(result.error || "Failed to reset password");
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: GameColors.backgroundDark }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={GameColors.textPrimary} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>
          {mode === "login" ? "Login" : mode === "register" ? "Create Account" : mode === "forgot" ? "Forgot Password" : "Reset Password"}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInUp.springify()} style={styles.formCard}>
            {mode === "login" ? (
              <>
                <ThemedText style={styles.formTitle}>Welcome Back</ThemedText>
                <ThemedText style={styles.formDesc}>Sign in to sync your progress across devices</ThemedText>

                <View style={styles.inputContainer}>
                  <Feather name="mail" size={20} color={GameColors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={GameColors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color={GameColors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={GameColors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={GameColors.textSecondary} />
                  </Pressable>
                </View>

                <Pressable onPress={() => switchMode("forgot")} style={styles.forgotButton}>
                  <ThemedText style={styles.forgotText}>Forgot Password?</ThemedText>
                </Pressable>

                {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
                {success ? <ThemedText style={styles.successText}>{success}</ThemedText> : null}

                <GradientButton onPress={handleLogin} disabled={isLoading} variant="primary">
                  {isLoading ? "Signing In..." : "Sign In"}
                </GradientButton>

                <View style={styles.switchContainer}>
                  <ThemedText style={styles.switchText}>Don't have an account?</ThemedText>
                  <Pressable onPress={() => switchMode("register")}>
                    <ThemedText style={styles.switchLink}>Create Account</ThemedText>
                  </Pressable>
                </View>
              </>
            ) : mode === "register" ? (
              <>
                <ThemedText style={styles.formTitle}>Create Account</ThemedText>
                <ThemedText style={styles.formDesc}>Save your progress and play on any device</ThemedText>

                <View style={styles.inputContainer}>
                  <Feather name="user" size={20} color={GameColors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Name (optional)"
                    placeholderTextColor={GameColors.textSecondary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Feather name="mail" size={20} color={GameColors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={GameColors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color={GameColors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password (min 6 characters)"
                    placeholderTextColor={GameColors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={GameColors.textSecondary} />
                  </Pressable>
                </View>

                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color={GameColors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor={GameColors.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </View>

                {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

                <GradientButton onPress={handleRegister} disabled={isLoading} variant="primary">
                  {isLoading ? "Creating Account..." : "Create Account"}
                </GradientButton>

                <View style={styles.switchContainer}>
                  <ThemedText style={styles.switchText}>Already have an account?</ThemedText>
                  <Pressable onPress={() => switchMode("login")}>
                    <ThemedText style={styles.switchLink}>Sign In</ThemedText>
                  </Pressable>
                </View>
              </>
            ) : mode === "forgot" ? (
              <>
                <ThemedText style={styles.formTitle}>Forgot Password</ThemedText>
                <ThemedText style={styles.formDesc}>Enter your email to receive a reset code</ThemedText>

                <View style={styles.inputContainer}>
                  <Feather name="mail" size={20} color={GameColors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={GameColors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

                <GradientButton onPress={handleForgotPassword} disabled={isLoading} variant="primary">
                  {isLoading ? "Sending..." : "Send Reset Code"}
                </GradientButton>

                <View style={styles.switchContainer}>
                  <ThemedText style={styles.switchText}>Remember your password?</ThemedText>
                  <Pressable onPress={() => switchMode("login")}>
                    <ThemedText style={styles.switchLink}>Sign In</ThemedText>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <ThemedText style={styles.formTitle}>Reset Password</ThemedText>
                <ThemedText style={styles.formDesc}>Enter the code and your new password</ThemedText>

                <View style={styles.inputContainer}>
                  <Feather name="key" size={20} color={GameColors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Reset Code"
                    placeholderTextColor={GameColors.textSecondary}
                    value={resetCode}
                    onChangeText={setResetCode}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color={GameColors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="New Password (min 6 characters)"
                    placeholderTextColor={GameColors.textSecondary}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={GameColors.textSecondary} />
                  </Pressable>
                </View>

                {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
                {success ? <ThemedText style={styles.successText}>{success}</ThemedText> : null}

                <GradientButton onPress={handleResetPassword} disabled={isLoading} variant="primary">
                  {isLoading ? "Resetting..." : "Reset Password"}
                </GradientButton>

                <View style={styles.switchContainer}>
                  <Pressable onPress={() => switchMode("login")}>
                    <ThemedText style={styles.switchLink}>Back to Sign In</ThemedText>
                  </Pressable>
                </View>
              </>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing["3xl"],
  },
  formCard: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  formTitle: {
    ...Typography.h3,
    color: GameColors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  formDesc: {
    ...Typography.body,
    color: GameColors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.backgroundDark,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: GameColors.textPrimary,
    paddingVertical: Spacing.md,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: Spacing.lg,
  },
  forgotText: {
    ...Typography.caption,
    color: GameColors.primary,
  },
  errorText: {
    ...Typography.caption,
    color: GameColors.wrong,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  successText: {
    ...Typography.caption,
    color: GameColors.correct,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  switchText: {
    ...Typography.body,
    color: GameColors.textSecondary,
  },
  switchLink: {
    ...Typography.body,
    color: GameColors.primary,
    fontWeight: "600",
  },
});
