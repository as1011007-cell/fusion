import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, ScrollView, Pressable, TextInput, Image, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { FeudFusionBrand } from "@/components/FeudFusionBrand";
import { GradientButton } from "@/components/GradientButton";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useProfile } from "@/context/ProfileContext";
import { useGame } from "@/context/GameContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Profile">;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { currentProfile, profiles, avatars, createProfile, createSocialProfile, updateProfile, selectProfile, deleteProfile, levelInfo, experiencePoints, syncToCloud, loadFromCloud } = useProfile();
  const { totalCoins, reloadPlayerData } = useGame();
  const { starPoints, reloadThemeData } = useTheme();
  const { socialUser, isAuthenticated, loginWithGoogle, logout, isLoading: authLoading, error: authError } = useAuth();

  const [showCreateForm, setShowCreateForm] = useState(!currentProfile && profiles.length === 0);
  const [profileName, setProfileName] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState(avatars[0]?.id || "");
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const prevSocialUserRef = useRef<string | null>(null);

  // Auto-sync from cloud when user logs in with Google
  useEffect(() => {
    const autoSyncOnLogin = async () => {
      if (socialUser && socialUser.id && prevSocialUserRef.current !== socialUser.id) {
        prevSocialUserRef.current = socialUser.id;
        console.log("Auto-syncing from cloud after login for:", socialUser.id);
        setIsSyncing(true);
        
        // Try to load existing cloud data
        const loaded = await loadFromCloud(socialUser.id);
        if (loaded) {
          // Reload all context data from AsyncStorage
          await reloadPlayerData();
          await reloadThemeData();
          console.log("Auto-sync: Loaded data from cloud");
        } else {
          // No cloud data exists, create/link social profile
          createSocialProfile(
            socialUser.name,
            socialUser.picture,
            socialUser.provider,
            socialUser.id,
            socialUser.email
          );
          console.log("Auto-sync: Created new social profile");
        }
        
        setIsSyncing(false);
      }
    };
    
    autoSyncOnLogin();
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

  const handleGoogleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await loginWithGoogle();
  };

  const handleConnectGoogle = async () => {
    setIsSyncing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await loginWithGoogle();
    setIsSyncing(false);
  };

  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSyncProgress = async () => {
    if (!socialUser) return;
    
    setIsSyncing(true);
    setSyncMessage(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log("Attempting to save to cloud with socialUser.id:", socialUser.id);
    
    if (currentProfile && !currentProfile.socialId) {
      updateProfile(currentProfile.id, {
        socialId: socialUser.id,
        socialProvider: socialUser.provider,
      });
    }
    
    const success = await syncToCloud(socialUser.id, socialUser.email);
    console.log("syncToCloud result:", success);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSyncMessage("Progress saved!");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setSyncMessage("Failed to save progress");
    }
    setIsSyncing(false);
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const handleLoadFromCloud = async () => {
    if (!socialUser) return;
    
    setIsSyncing(true);
    setSyncMessage(null);
    console.log("Attempting to load from cloud with socialUser.id:", socialUser.id);
    const success = await loadFromCloud(socialUser.id);
    if (success) {
      // Reload all context data from AsyncStorage
      await reloadPlayerData();
      await reloadThemeData();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSyncMessage("Progress loaded from cloud!");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setSyncMessage("No saved data found. Save first!");
    }
    setIsSyncing(false);
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const ownedAvatars = avatars.filter((a) => a.owned);
  const currentAvatar = avatars.find((a) => a.id === currentProfile?.avatarId);


  const renderProfileForm = () => (
    <Animated.View entering={FadeInDown.springify()} style={styles.formContainer}>
      <ThemedText style={styles.formTitle}>
        {editingProfile ? "Edit Profile" : "Create Profile"}
      </ThemedText>

      {!editingProfile && !isAuthenticated ? (
        <View style={styles.googleSignInSection}>
          <Pressable
            style={styles.googleSignInButton}
            onPress={handleGoogleLogin}
            disabled={authLoading}
          >
            <Feather name="user" size={20} color="#4285F4" />
            <ThemedText style={styles.googleSignInText}>
              {authLoading ? "Connecting..." : "Sign in with Google"}
            </ThemedText>
          </Pressable>
          <ThemedText style={styles.googleSignInDesc}>
            Sign in to save your progress to the cloud
          </ThemedText>
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <ThemedText style={styles.dividerText}>or create manually</ThemedText>
            <View style={styles.divider} />
          </View>
        </View>
      ) : null}

      {isAuthenticated && socialUser && !editingProfile ? (
        <View style={styles.connectedSection}>
          <Feather name="check-circle" size={18} color={GameColors.correct} />
          <ThemedText style={styles.connectedText}>
            Signed in as {socialUser.name}
          </ThemedText>
        </View>
      ) : null}

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
            <Image source={avatar.image} style={styles.avatarImageSmall} />
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

  const renderCurrentProfile = () => {
    const xpProgress = levelInfo.xpForNextLevel > 0 ? levelInfo.currentXP / levelInfo.xpForNextLevel : 0;
    
    return (
      <Animated.View entering={FadeInUp.springify()} style={styles.currentProfileCard}>
        <View style={styles.profileHeaderVertical}>
          <View style={styles.avatarWithLevel}>
            {currentProfile?.customPhoto ? (
              <Image
                source={{ uri: currentProfile.customPhoto }}
                style={styles.profilePhoto}
              />
            ) : currentAvatar ? (
              <View
                style={[
                  styles.profileAvatarContainer,
                  { borderColor: currentAvatar.color },
                ]}
              >
                <Image source={currentAvatar.image} style={styles.profileAvatarImage} />
              </View>
            ) : null}
            
            <LinearGradient
              colors={[GameColors.primary, GameColors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.levelBadge}
            >
              <ThemedText style={styles.levelText}>Lvl {levelInfo.level}</ThemedText>
            </LinearGradient>
          </View>

          <ThemedText style={styles.profileNameCentered}>{currentProfile?.name}</ThemedText>
          <ThemedText style={styles.levelTitle}>{levelInfo.title}</ThemedText>

          <View style={styles.xpContainer}>
            <View style={styles.xpBarBackground}>
              <LinearGradient
                colors={[GameColors.primary, GameColors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.xpBarFill, { width: `${Math.min(xpProgress * 100, 100)}%` }]}
              />
            </View>
            <ThemedText style={styles.xpText}>
              {levelInfo.currentXP} / {levelInfo.xpForNextLevel} XP
            </ThemedText>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Feather name="circle" size={16} color="#FFD700" />
              <ThemedText style={styles.statValue}>{totalCoins}</ThemedText>
              <ThemedText style={styles.statLabel}>Coins</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Feather name="star" size={16} color="#00D4FF" />
              <ThemedText style={styles.statValue}>{starPoints}</ThemedText>
              <ThemedText style={styles.statLabel}>Stars</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Feather name="zap" size={16} color={GameColors.accent} />
              <ThemedText style={styles.statValue}>{experiencePoints}</ThemedText>
              <ThemedText style={styles.statLabel}>Total XP</ThemedText>
            </View>
          </View>

          <Pressable onPress={handleStartEditing} style={styles.editButtonCentered}>
            <Feather name="edit-2" size={16} color={GameColors.textPrimary} />
            <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
          </Pressable>

          {currentProfile?.socialProvider ? (
            <Pressable 
              onPress={async () => {
                const success = await syncToCloud();
                if (success) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              }} 
              style={styles.syncButton}
            >
              <Feather name="cloud" size={16} color={GameColors.correct} />
              <ThemedText style={styles.syncButtonText}>Sync Progress</ThemedText>
            </Pressable>
          ) : null}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: GameColors.backgroundDark }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBack} style={[styles.backButton, { backgroundColor: GameColors.surface }]}>
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

              {isAuthenticated && socialUser ? (
                <View style={styles.cloudSyncCard}>
                  <View style={styles.cloudSyncHeader}>
                    <View style={[styles.actionIcon, { backgroundColor: GameColors.correct + "20" }]}>
                      <Feather name="check-circle" size={24} color={GameColors.correct} />
                    </View>
                    <View style={styles.actionContent}>
                      <ThemedText style={styles.actionTitle}>Connected to Google</ThemedText>
                      <ThemedText style={styles.actionDesc}>
                        {socialUser.email}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.cloudSyncButtons}>
                    <Pressable 
                      style={styles.cloudSyncButton} 
                      onPress={handleSyncProgress}
                      disabled={isSyncing}
                    >
                      <Feather name="upload-cloud" size={18} color={GameColors.primary} />
                      <ThemedText style={styles.cloudSyncButtonText}>
                        {isSyncing ? "Syncing..." : "Save Progress"}
                      </ThemedText>
                    </Pressable>
                    <Pressable 
                      style={styles.cloudSyncButton} 
                      onPress={handleLoadFromCloud}
                      disabled={isSyncing}
                    >
                      <Feather name="download-cloud" size={18} color={GameColors.accent} />
                      <ThemedText style={[styles.cloudSyncButtonText, { color: GameColors.accent }]}>
                        Load Progress
                      </ThemedText>
                    </Pressable>
                  </View>
                  {syncMessage ? (
                    <View style={styles.syncMessageContainer}>
                      <Feather 
                        name={syncMessage.includes("saved") || syncMessage.includes("loaded") ? "check-circle" : "info"} 
                        size={16} 
                        color={syncMessage.includes("saved") || syncMessage.includes("loaded") ? GameColors.correct : syncMessage.includes("Failed") ? GameColors.wrong : GameColors.accent} 
                      />
                      <ThemedText style={[
                        styles.syncMessageText,
                        { color: syncMessage.includes("saved") || syncMessage.includes("loaded") ? GameColors.correct : syncMessage.includes("Failed") ? GameColors.wrong : GameColors.accent }
                      ]}>
                        {syncMessage}
                      </ThemedText>
                    </View>
                  ) : null}
                  <Pressable style={styles.signOutButton} onPress={logout}>
                    <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={styles.actionCard}
                  onPress={handleGoogleLogin}
                  disabled={authLoading}
                >
                  <View style={[styles.actionIcon, { backgroundColor: "#4285F4" + "20" }]}>
                    <Feather name="user" size={24} color="#4285F4" />
                  </View>
                  <View style={styles.actionContent}>
                    <ThemedText style={styles.actionTitle}>
                      {authLoading ? "Connecting..." : "Login with Google"}
                    </ThemedText>
                    <ThemedText style={styles.actionDesc}>
                      Save your progress to the cloud
                    </ThemedText>
                  </View>
                  <Feather name="chevron-right" size={20} color={GameColors.textSecondary} />
                </Pressable>
              )}

              {authError ? (
                <ThemedText style={styles.errorText}>{authError}</ThemedText>
              ) : null}
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
  googleSignInSection: {
    marginBottom: Spacing.lg,
  },
  googleSignInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4285F4" + "15",
    borderWidth: 1,
    borderColor: "#4285F4" + "40",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  googleSignInText: {
    ...Typography.body,
    color: "#4285F4",
    fontWeight: "600",
  },
  googleSignInDesc: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: GameColors.textSecondary + "30",
  },
  dividerText: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  connectedSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GameColors.correct + "15",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  connectedText: {
    ...Typography.caption,
    color: GameColors.correct,
    fontWeight: "600",
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
  avatarImageSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  profileAvatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    overflow: "hidden",
  },
  profileAvatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
  profileHeaderVertical: {
    alignItems: "center",
  },
  avatarWithLevel: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  levelBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.lg,
    marginTop: -Spacing.sm,
  },
  levelText: {
    ...Typography.caption,
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  profileNameCentered: {
    ...Typography.h3,
    color: GameColors.textPrimary,
    textAlign: "center",
  },
  levelTitle: {
    ...Typography.body,
    color: GameColors.accent,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  xpContainer: {
    width: "100%",
    marginBottom: Spacing.lg,
  },
  xpBarBackground: {
    height: 8,
    backgroundColor: GameColors.backgroundDark,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: Spacing.xs,
  },
  xpBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  xpText: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    width: "100%",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    ...Typography.h4,
    color: GameColors.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: GameColors.backgroundDark,
  },
  editButtonCentered: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.backgroundDark,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  editButtonText: {
    ...Typography.caption,
    color: GameColors.textPrimary,
    fontWeight: "600",
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.correct + "20",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  syncButtonText: {
    ...Typography.caption,
    color: GameColors.correct,
    fontWeight: "600",
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
  cloudSyncCard: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cloudSyncHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  cloudSyncButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  cloudSyncButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GameColors.backgroundDark,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  cloudSyncButtonText: {
    ...Typography.caption,
    color: GameColors.primary,
    fontWeight: "600",
  },
  syncMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  syncMessageText: {
    ...Typography.caption,
    fontWeight: "600",
  },
  signOutButton: {
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  signOutText: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    textDecorationLine: "underline",
  },
  errorText: {
    ...Typography.caption,
    color: GameColors.wrong,
    textAlign: "center",
    marginTop: Spacing.sm,
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
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.wrong + "20",
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
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
