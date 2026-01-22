import React from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useProfile } from "@/context/ProfileContext";
import { useGame } from "@/context/GameContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Shop">;

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { avatars, purchaseAvatar, currentProfile, updateProfile } = useProfile();
  const { totalCoins, addCoins } = useGame();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handlePurchase = (avatarId: string, price: number) => {
    if (totalCoins >= price) {
      const success = purchaseAvatar(avatarId, totalCoins);
      if (success) {
        addCoins(-price);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleEquip = (avatarId: string) => {
    if (currentProfile) {
      updateProfile(currentProfile.id, { avatarId, customPhoto: null });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const ownedAvatars = avatars.filter((a) => a.owned);
  const lockedAvatars = avatars.filter((a) => !a.owned);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={GameColors.textPrimary} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Avatar Shop</ThemedText>
        <View style={styles.coinsDisplay}>
          <Feather name="star" size={16} color={GameColors.accent} />
          <ThemedText style={styles.coinsText}>{totalCoins}</ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ThemedText style={styles.sectionTitle}>Your Collection</ThemedText>
          <View style={styles.avatarGrid}>
            {ownedAvatars.map((avatar, index) => {
              const isEquipped = currentProfile?.avatarId === avatar.id;
              return (
                <Animated.View
                  key={avatar.id}
                  entering={FadeInUp.delay(index * 50).springify()}
                >
                  <Pressable
                    style={[
                      styles.avatarCard,
                      isEquipped && styles.avatarCardEquipped,
                    ]}
                    onPress={() => handleEquip(avatar.id)}
                  >
                    <View
                      style={[
                        styles.avatarIconLarge,
                        { backgroundColor: avatar.color + "30" },
                      ]}
                    >
                      <Feather
                        name={avatar.icon as any}
                        size={32}
                        color={avatar.color}
                      />
                    </View>
                    <ThemedText style={styles.avatarName}>{avatar.name}</ThemedText>
                    {isEquipped ? (
                      <View style={styles.equippedBadge}>
                        <ThemedText style={styles.equippedText}>Equipped</ThemedText>
                      </View>
                    ) : (
                      <Pressable style={styles.equipButton}>
                        <ThemedText style={styles.equipText}>Equip</ThemedText>
                      </Pressable>
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {lockedAvatars.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <ThemedText style={styles.sectionTitle}>Available to Purchase</ThemedText>
            <View style={styles.avatarGrid}>
              {lockedAvatars.map((avatar, index) => {
                const canAfford = totalCoins >= avatar.price;
                return (
                  <Animated.View
                    key={avatar.id}
                    entering={FadeInUp.delay(300 + index * 50).springify()}
                  >
                    <Pressable
                      style={[
                        styles.avatarCard,
                        styles.avatarCardLocked,
                        !canAfford && styles.avatarCardDisabled,
                      ]}
                      onPress={() => canAfford && handlePurchase(avatar.id, avatar.price)}
                    >
                      <View
                        style={[
                          styles.avatarIconLarge,
                          { backgroundColor: avatar.color + "20" },
                        ]}
                      >
                        <Feather
                          name={avatar.icon as any}
                          size={32}
                          color={canAfford ? avatar.color : GameColors.textSecondary}
                        />
                      </View>
                      <ThemedText
                        style={[
                          styles.avatarName,
                          !canAfford && styles.textDisabled,
                        ]}
                      >
                        {avatar.name}
                      </ThemedText>
                      <View style={[styles.priceTag, !canAfford && styles.priceTagDisabled]}>
                        <Feather
                          name="star"
                          size={12}
                          color={canAfford ? GameColors.accent : GameColors.textSecondary}
                        />
                        <ThemedText
                          style={[
                            styles.priceText,
                            !canAfford && styles.textDisabled,
                          ]}
                        >
                          {avatar.price}
                        </ThemedText>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        ) : null}
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
  coinsDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  coinsText: {
    ...Typography.body,
    color: GameColors.accent,
    fontWeight: "600",
    marginLeft: Spacing.xs,
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
    marginBottom: Spacing.lg,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  avatarCard: {
    width: 100,
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
  },
  avatarCardEquipped: {
    borderWidth: 2,
    borderColor: GameColors.primary,
  },
  avatarCardLocked: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  avatarCardDisabled: {
    opacity: 0.5,
  },
  avatarIconLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  avatarName: {
    ...Typography.small,
    color: GameColors.textPrimary,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  textDisabled: {
    color: GameColors.textSecondary,
  },
  equippedBadge: {
    backgroundColor: GameColors.primary + "30",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  equippedText: {
    ...Typography.caption,
    color: GameColors.primary,
    fontWeight: "600",
  },
  equipButton: {
    backgroundColor: GameColors.backgroundDark,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  equipText: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  priceTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.backgroundDark,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  priceTagDisabled: {
    backgroundColor: "transparent",
  },
  priceText: {
    ...Typography.caption,
    color: GameColors.accent,
    fontWeight: "600",
    marginLeft: 4,
  },
});
