import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Pressable, TextInput, Image, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GradientButton } from "@/components/GradientButton";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useProfile } from "@/context/ProfileContext";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Profile">;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { currentProfile, profiles, avatars, createProfile, createSocialProfile, updateProfile, selectProfile, deleteProfile } = useProfile();
  const { totalCoins } = useGame();
  const { socialUser, isLoading: authLoading, loginWithGoogle, loginWithFacebook, logout, error: authError } = useAuth();

  const [showCreateForm, setShowCreateForm] = useState(!currentProfile && profiles.length === 0);
  const [profileName, setProfileName] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState(avatars[0]?.id || "");
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    if (socialUser && !currentProfile) {
      createSocialProfile(
        socialUser.name,
        socialUser.picture,
        socialUser.provider,
        socialUser.id,
        socialUser.email
      );
      setShowCreateForm(false);
    }
  }, [socialUser]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handlePickImage = async () => {
    if (Platform.OS === "web") {
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setCustomPhoto(result.assets[0].uri);
      setSelectedAvatarId("");
    }
  };

  const handleCreateProfile = () => {
    if (profileName.trim()) {
      createProfile(profileName.trim(), selectedAvatarId, customPhoto || undefined);
      setShowCreateForm(false);
      setProfileName("");
      setCustomPhoto(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleUpdateProfile = () => {
    if (currentProfile && profileName.trim()) {
      updateProfile(currentProfile.id, {
        name: profileName.trim(),
        avatarId: selectedAvatarId,
        customPhoto,
      });
      setEditingProfile(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleStartEditing = () => {
    if (currentProfile) {
      setProfileName(currentProfile.name);
      setSelectedAvatarId(currentProfile.avatarId);
      setCustomPhoto(currentProfile.customPhoto);
      setEditingProfile(true);
    }
  };

  const handleSelectProfile = (profileId: string) => {
    selectProfile(profileId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDeleteProfile = (profileId: string) => {
    deleteProfile(profileId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const ownedAvatars = avatars.filter((a) => a.owned);
  const currentAvatar = avatars.find((a) => a.id === currentProfile?.avatarId);

  const handleGoogleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await loginWithGoogle();
  };

  const handleFacebookLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await loginWithFacebook();
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await logout();
  };

  const renderSocialLoginButtons = () => (
    <View style={styles.socialSection}>
      <ThemedText style={styles.socialTitle}>Quick Sign In</ThemedText>
      <ThemedText style={styles.socialSubtitle}>
        Sync your profile with your social account
      </ThemedText>

      {authError ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={16} color={GameColors.wrong} />
          <ThemedText style={styles.errorText}>{authError}</ThemedText>
        </View>
      ) : null}

      {authLoading ? (
        <ActivityIndicator size="large" color={GameColors.primary} style={styles.loader} />
      ) : (
        <View style={styles.socialButtons}>
          <Pressable style={styles.googleButton} onPress={handleGoogleLogin}>
            <View style={styles.socialIconWrapper}>
              <Feather name="mail" size={20} color="#ffffff" />
            </View>
            <ThemedText style={styles.socialButtonText}>Continue with Google</ThemedText>
          </Pressable>

          <Pressable style={styles.facebookButton} onPress={handleFacebookLogin}>
            <View style={styles.socialIconWrapper}>
              <Feather name="facebook" size={20} color="#ffffff" />
            </View>
            <ThemedText style={styles.socialButtonText}>Continue with Facebook</ThemedText>
          </Pressable>
        </View>
      )}

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <ThemedText style={styles.dividerText}>or create manually</ThemedText>
        <View style={styles.divider} />
      </View>
    </View>
  );

  const renderProfileForm = () => (
    <Animated.View entering={FadeInDown.springify()} style={styles.formContainer}>
      <ThemedText style={styles.formTitle}>
        {editingProfile ? "Edit Profile" : "Create Profile"}
      </ThemedText>

      {!editingProfile ? renderSocialLoginButtons() : null}

      <View style={styles.photoSection}>
        <Pressable onPress={handlePickImage} style={styles.photoButton}>
          {customPhoto ? (
            <Image source={{ uri: customPhoto }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Feather name="camera" size={32} color={GameColors.textSecondary} />
              <ThemedText style={styles.photoText}>Add Photo</ThemedText>
            </View>
          )}
        </Pressable>
        {Platform.OS === "web" ? (
          <ThemedText style={styles.webNote}>
            Photo upload available in Expo Go
          </ThemedText>
        ) : null}
      </View>

      <ThemedText style={styles.orText}>- or choose an avatar -</ThemedText>

      <View style={styles.avatarGrid}>
        {ownedAvatars.map((avatar) => (
          <Pressable
            key={avatar.id}
            style={[
              styles.avatarOption,
              selectedAvatarId === avatar.id && styles.avatarSelected,
              { borderColor: avatar.color },
            ]}
            onPress={() => {
              setSelectedAvatarId(avatar.id);
              setCustomPhoto(null);
            }}
          >
            <View style={[styles.avatarIcon, { backgroundColor: avatar.color + "30" }]}>
              <Feather name={avatar.icon as any} size={24} color={avatar.color} />
            </View>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.nameInput}
        placeholder="Enter your name..."
        placeholderTextColor={GameColors.textSecondary}
        value={profileName}
        onChangeText={setProfileName}
        maxLength={20}
      />

      <View style={styles.formButtons}>
        <GradientButton
          onPress={editingProfile ? handleUpdateProfile : handleCreateProfile}
          disabled={!profileName.trim()}
          variant="secondary"
        >
          {editingProfile ? "Save Changes" : "Create Profile"}
        </GradientButton>

        {editingProfile || profiles.length > 0 ? (
          <Pressable
            style={styles.cancelButton}
            onPress={() => {
              setShowCreateForm(false);
              setEditingProfile(false);
              setProfileName("");
              setCustomPhoto(null);
            }}
          >
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );

  const renderCurrentProfile = () => (
    <Animated.View entering={FadeInUp.springify()} style={styles.currentProfileCard}>
      <View style={styles.profileHeader}>
        {currentProfile?.customPhoto ? (
          <Image
            source={{ uri: currentProfile.customPhoto }}
            style={styles.profilePhoto}
          />
        ) : currentAvatar ? (
          <View
            style={[
              styles.profileAvatar,
              { backgroundColor: currentAvatar.color + "30" },
            ]}
          >
            <Feather
              name={currentAvatar.icon as any}
              size={40}
              color={currentAvatar.color}
            />
          </View>
        ) : null}

        <View style={styles.profileInfo}>
          <ThemedText style={styles.profileName}>{currentProfile?.name}</ThemedText>
          <ThemedText style={styles.profileStats}>
            {totalCoins} coins earned
          </ThemedText>
          {currentProfile?.socialProvider ? (
            <View style={styles.connectedBadge}>
              <Feather
                name={currentProfile.socialProvider === "google" ? "mail" : "facebook"}
                size={12}
                color={GameColors.correct}
              />
              <ThemedText style={styles.connectedText}>
                Connected with {currentProfile.socialProvider === "google" ? "Google" : "Facebook"}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <Pressable onPress={handleStartEditing} style={styles.editButton}>
          <Feather name="edit-2" size={20} color={GameColors.textPrimary} />
        </Pressable>
      </View>

      {socialUser && currentProfile?.socialId === socialUser.id ? (
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={18} color={GameColors.wrong} />
          <ThemedText style={styles.logoutText}>Sign Out</ThemedText>
        </Pressable>
      ) : null}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={GameColors.textPrimary} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Profile</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {showCreateForm || editingProfile ? (
          renderProfileForm()
        ) : currentProfile ? (
          <>
            {renderCurrentProfile()}

            {!currentProfile?.socialProvider ? (
              <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.connectAccountSection}>
                <ThemedText style={styles.connectTitle}>Connect Account</ThemedText>
                <ThemedText style={styles.connectSubtitle}>
                  Link your social account to sync your profile
                </ThemedText>

                {authError ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={16} color={GameColors.wrong} />
                    <ThemedText style={styles.errorText}>{authError}</ThemedText>
                  </View>
                ) : null}

                {authLoading ? (
                  <ActivityIndicator size="small" color={GameColors.primary} style={styles.loader} />
                ) : (
                  <View style={styles.connectButtons}>
                    <Pressable style={styles.googleConnectButton} onPress={handleGoogleLogin}>
                      <Feather name="mail" size={18} color="#ffffff" />
                      <ThemedText style={styles.connectButtonText}>Google</ThemedText>
                    </Pressable>

                    <Pressable style={styles.facebookConnectButton} onPress={handleFacebookLogin}>
                      <Feather name="facebook" size={18} color="#ffffff" />
                      <ThemedText style={styles.connectButtonText}>Facebook</ThemedText>
                    </Pressable>
                  </View>
                )}
              </Animated.View>
            ) : null}

            <Animated.View entering={FadeInUp.delay(200).springify()}>
              <Pressable
                style={styles.actionCard}
                onPress={() => navigation.navigate("Shop")}
              >
                <View style={[styles.actionIcon, { backgroundColor: GameColors.accent + "20" }]}>
                  <Feather name="shopping-bag" size={24} color={GameColors.accent} />
                </View>
                <View style={styles.actionContent}>
                  <ThemedText style={styles.actionTitle}>Avatar Shop</ThemedText>
                  <ThemedText style={styles.actionDesc}>
                    Purchase new avatars with your coins
                  </ThemedText>
                </View>
                <Feather name="chevron-right" size={20} color={GameColors.textSecondary} />
              </Pressable>

              <Pressable
                style={styles.actionCard}
                onPress={() => navigation.navigate("Settings")}
              >
                <View style={[styles.actionIcon, { backgroundColor: GameColors.secondary + "20" }]}>
                  <Feather name="settings" size={24} color={GameColors.secondary} />
                </View>
                <View style={styles.actionContent}>
                  <ThemedText style={styles.actionTitle}>Settings</ThemedText>
                  <ThemedText style={styles.actionDesc}>
                    Music, haptics, and preferences
                  </ThemedText>
                </View>
                <Feather name="chevron-right" size={20} color={GameColors.textSecondary} />
              </Pressable>
            </Animated.View>
          </>
        ) : (
          renderProfileForm()
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
  formContainer: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  formTitle: {
    ...Typography.h3,
    color: GameColors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  photoSection: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  photoButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
  },
  photoPreview: {
    width: 100,
    height: 100,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: GameColors.backgroundDark,
    borderWidth: 2,
    borderColor: GameColors.textSecondary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  photoText: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    marginTop: Spacing.xs,
  },
  webNote: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    marginTop: Spacing.sm,
  },
  orText: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: GameColors.backgroundDark,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarSelected: {
    borderWidth: 3,
  },
  avatarIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  nameInput: {
    backgroundColor: GameColors.backgroundDark,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    color: GameColors.textPrimary,
    ...Typography.body,
    marginBottom: Spacing.lg,
  },
  formButtons: {
    gap: Spacing.md,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  cancelText: {
    ...Typography.body,
    color: GameColors.textSecondary,
  },
  currentProfileCard: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  profileName: {
    ...Typography.h3,
    color: GameColors.textPrimary,
  },
  profileStats: {
    ...Typography.body,
    color: GameColors.textSecondary,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GameColors.backgroundDark,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  actionContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  actionTitle: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "600",
  },
  actionDesc: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  switchSection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    color: GameColors.textPrimary,
    marginBottom: Spacing.md,
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  profileItemPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileItemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  profileItemName: {
    ...Typography.body,
    color: GameColors.textPrimary,
    flex: 1,
    marginLeft: Spacing.md,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  addProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: GameColors.primary,
    borderRadius: BorderRadius.md,
    borderStyle: "dashed",
  },
  addProfileText: {
    ...Typography.body,
    color: GameColors.primary,
    marginLeft: Spacing.sm,
  },
  socialSection: {
    marginBottom: Spacing.xl,
  },
  socialTitle: {
    ...Typography.h4,
    color: GameColors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  socialSubtitle: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  socialButtons: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4285F4",
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  facebookButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1877F2",
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  socialIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  socialButtonText: {
    ...Typography.body,
    color: "#ffffff",
    fontWeight: "600",
    marginLeft: Spacing.md,
    flex: 1,
    textAlign: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: GameColors.textSecondary + "40",
  },
  dividerText: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    marginHorizontal: Spacing.md,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.wrong + "20",
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.caption,
    color: GameColors.wrong,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  loader: {
    marginVertical: Spacing.lg,
  },
  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.correct + "20",
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.xs,
  },
  connectedText: {
    ...Typography.caption,
    color: GameColors.correct,
    marginLeft: Spacing.xs,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: GameColors.wrong,
    borderRadius: BorderRadius.md,
  },
  logoutText: {
    ...Typography.body,
    color: GameColors.wrong,
    marginLeft: Spacing.sm,
  },
  connectAccountSection: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  connectTitle: {
    ...Typography.h4,
    color: GameColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  connectSubtitle: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    marginBottom: Spacing.md,
  },
  connectButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  googleConnectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DB4437",
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  facebookConnectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4267B2",
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  connectButtonText: {
    ...Typography.body,
    color: "#ffffff",
    fontWeight: "600",
  },
});
