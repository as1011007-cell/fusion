import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable, TextInput, Image, Platform } from "react-native";
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Profile">;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { currentProfile, profiles, avatars, createProfile, updateProfile, selectProfile, deleteProfile } = useProfile();
  const { totalCoins } = useGame();

  const [showCreateForm, setShowCreateForm] = useState(!currentProfile && profiles.length === 0);
  const [profileName, setProfileName] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState(avatars[0]?.id || "");
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);

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

  const renderProfileForm = () => (
    <Animated.View entering={FadeInDown.springify()} style={styles.formContainer}>
      <ThemedText style={styles.formTitle}>
        {editingProfile ? "Edit Profile" : "Create Profile"}
      </ThemedText>

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
        </View>

        <Pressable onPress={handleStartEditing} style={styles.editButton}>
          <Feather name="edit-2" size={20} color={GameColors.textPrimary} />
        </Pressable>
      </View>
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

            {profiles.length > 1 ? (
              <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.switchSection}>
                <ThemedText style={styles.sectionTitle}>Switch Profile</ThemedText>
                {profiles
                  .filter((p) => p.id !== currentProfile?.id)
                  .map((profile) => {
                    const avatar = avatars.find((a) => a.id === profile.avatarId);
                    return (
                      <Pressable
                        key={profile.id}
                        style={styles.profileItem}
                        onPress={() => handleSelectProfile(profile.id)}
                      >
                        {profile.customPhoto ? (
                          <Image
                            source={{ uri: profile.customPhoto }}
                            style={styles.profileItemPhoto}
                          />
                        ) : avatar ? (
                          <View
                            style={[
                              styles.profileItemAvatar,
                              { backgroundColor: avatar.color + "30" },
                            ]}
                          >
                            <Feather
                              name={avatar.icon as any}
                              size={20}
                              color={avatar.color}
                            />
                          </View>
                        ) : null}
                        <ThemedText style={styles.profileItemName}>
                          {profile.name}
                        </ThemedText>
                        <Pressable
                          onPress={() => handleDeleteProfile(profile.id)}
                          style={styles.deleteButton}
                        >
                          <Feather name="trash-2" size={16} color={GameColors.wrong} />
                        </Pressable>
                      </Pressable>
                    );
                  })}
              </Animated.View>
            ) : null}

            <Pressable
              style={styles.addProfileButton}
              onPress={() => {
                setShowCreateForm(true);
                setProfileName("");
                setSelectedAvatarId(avatars[0]?.id || "");
                setCustomPhoto(null);
              }}
            >
              <Feather name="plus" size={20} color={GameColors.primary} />
              <ThemedText style={styles.addProfileText}>Add New Profile</ThemedText>
            </Pressable>
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
});
