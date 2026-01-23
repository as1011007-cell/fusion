import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable, ActivityIndicator, Image, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useProfile } from "@/context/ProfileContext";
import { useGame } from "@/context/GameContext";
import { useTheme } from "@/context/ThemeContext";
import { getApiUrl } from "@/lib/query-client";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Shop">;
type TabType = "avatars" | "themes" | "powerups" | "premium";

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { avatars, purchaseAvatar, currentProfile, updateProfile } = useProfile();
  const { totalCoins, addCoins, gameState, purchasePowerCards, canClaimWeeklyPowerCards, claimWeeklyPowerCards } = useGame();
  const { themes, currentTheme, setCurrentTheme, purchaseTheme, starPoints, addStarPoints, spendStarPoints, isAdFree, setAdFree, hasSupported, setHasSupported } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("avatars");
  const [loading, setLoading] = useState<string | null>(null);

  const { settings } = useProfile();
  const colors = currentTheme.colors;

  const handleBack = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.goBack();
  };

  const handlePurchaseAvatar = (avatarId: string, price: number, useStarPoints: boolean) => {
    if (useStarPoints && starPoints >= price) {
      const success = purchaseAvatar(avatarId, starPoints);
      if (success) {
        spendStarPoints(price);
        if (settings.hapticsEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } else if (!useStarPoints && totalCoins >= price) {
      const success = purchaseAvatar(avatarId, totalCoins);
      if (success) {
        addCoins(-price);
        if (settings.hapticsEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } else {
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const handleEquipAvatar = (avatarId: string) => {
    if (currentProfile) {
      updateProfile(currentProfile.id, { avatarId, customPhoto: null });
      if (settings.hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  const handlePurchaseTheme = (themeId: string) => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const success = purchaseTheme(themeId as any);
    if (success) {
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const handleSelectTheme = (themeId: string) => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentTheme(themeId as any);
  };

  const handlePurchasePowerCards = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const success = spendStarPoints(500);
    if (success) {
      purchasePowerCards();
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const handleClaimWeeklyPowerCards = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const success = claimWeeklyPowerCards();
    if (success) {
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const verifyPayment = async (sessionId: string): Promise<boolean> => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/stripe/verify-payment/${sessionId}`);
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  };

  const handlePurchaseStarPoints = async () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setLoading("starPoints");
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/stripe/products`);
      const data = await response.json();

      const starProduct = data.products?.find((p: any) => 
        p.name?.toLowerCase().includes('star') || p.metadata?.category === 'currency'
      );

      if (starProduct?.prices?.[0]?.id) {
        const successUrl = `${apiUrl}/payment-success?type=starpoints`;
        const cancelUrl = `${apiUrl}/payment-cancel`;

        const checkoutResponse = await fetch(`${apiUrl}/api/stripe/create-checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: starProduct.prices[0].id,
            successUrl,
            cancelUrl,
          }),
        });
        const checkoutData = await checkoutResponse.json();

        if (checkoutData.url && checkoutData.sessionId) {
          await WebBrowser.openBrowserAsync(checkoutData.url);
          const paymentSuccess = await verifyPayment(checkoutData.sessionId);
          if (paymentSuccess) {
            if (settings.hapticsEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Alert.alert(
              "Thank You!",
              "Your purchase was successful! You've received 5,000 Star Points.",
              [{ text: "Awesome!", onPress: () => addStarPoints(5000) }]
            );
          } else {
            if (settings.hapticsEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            Alert.alert(
              "Payment Incomplete",
              "Your payment was not completed. Please try again.",
              [{ text: "OK", onPress: () => navigation.navigate("Home") }]
            );
          }
        }
      } else {
        console.error('Star Points product not found in Stripe');
        if (settings.hapticsEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(null);
    }
  };

  const handlePurchaseAdFree = async () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setLoading("adFree");
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/stripe/products`);
      const data = await response.json();

      const adFreeProduct = data.products?.find((p: any) => 
        p.name?.toLowerCase().includes('ad-free') || p.metadata?.category === 'upgrade'
      );

      if (adFreeProduct?.prices?.[0]?.id) {
        const successUrl = `${apiUrl}/payment-success?type=adfree`;
        const cancelUrl = `${apiUrl}/payment-cancel`;

        const checkoutResponse = await fetch(`${apiUrl}/api/stripe/create-checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: adFreeProduct.prices[0].id,
            successUrl,
            cancelUrl,
          }),
        });
        const checkoutData = await checkoutResponse.json();

        if (checkoutData.url && checkoutData.sessionId) {
          await WebBrowser.openBrowserAsync(checkoutData.url);
          const paymentSuccess = await verifyPayment(checkoutData.sessionId);
          if (paymentSuccess) {
            if (settings.hapticsEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Alert.alert(
              "Thank You!",
              "Your purchase was successful! Enjoy your ad-free experience.",
              [{ text: "Awesome!", onPress: () => setAdFree(true) }]
            );
          } else {
            if (settings.hapticsEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            Alert.alert(
              "Payment Incomplete",
              "Your payment was not completed. Please try again.",
              [{ text: "OK", onPress: () => navigation.navigate("Home") }]
            );
          }
        }
      } else {
        console.error('Ad-Free product not found in Stripe');
        if (settings.hapticsEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleSupportDeveloper = async () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setLoading("support");
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/stripe/products`);
      const data = await response.json();

      const coffeeProduct = data.products?.find((p: any) => 
        p.name?.toLowerCase().includes('coffee') || 
        p.name?.toLowerCase().includes('support') ||
        p.metadata?.category === 'tip'
      );

      if (coffeeProduct?.prices?.[0]?.id) {
        const successUrl = `${apiUrl}/payment-success?type=support`;
        const cancelUrl = `${apiUrl}/payment-cancel`;

        const checkoutResponse = await fetch(`${apiUrl}/api/stripe/create-checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: coffeeProduct.prices[0].id,
            successUrl,
            cancelUrl,
          }),
        });
        const checkoutData = await checkoutResponse.json();

        if (checkoutData.url && checkoutData.sessionId) {
          await WebBrowser.openBrowserAsync(checkoutData.url);
          const paymentSuccess = await verifyPayment(checkoutData.sessionId);
          if (paymentSuccess) {
            if (settings.hapticsEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Alert.alert(
              "Thank You!",
              "Your support means the world to us! You're now a Developer Supporter.",
              [{ text: "Happy to help!", onPress: () => setHasSupported(true) }]
            );
          } else {
            if (settings.hapticsEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            Alert.alert(
              "Payment Incomplete",
              "Your payment was not completed. Please try again.",
              [{ text: "OK", onPress: () => navigation.navigate("Home") }]
            );
          }
        }
      } else {
        console.error('Support product not found in Stripe');
        if (settings.hapticsEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (error) {
      console.error('Support purchase error:', error);
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(null);
    }
  };

  const ownedAvatars = avatars.filter((a) => a.owned);
  const lockedAvatars = avatars.filter((a) => !a.owned);
  const powerCards = gameState.powerCards;

  const renderAvatarsTab = () => (
    <>
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <ThemedText style={styles.sectionTitle}>Your Collection</ThemedText>
        <View style={styles.avatarGrid}>
          {ownedAvatars.map((avatar, index) => {
            const isEquipped = currentProfile?.avatarId === avatar.id;
            return (
              <Animated.View key={avatar.id} entering={FadeInUp.delay(index * 50).springify()}>
                <Pressable
                  style={[styles.avatarCard, isEquipped && styles.avatarCardEquipped]}
                  onPress={() => handleEquipAvatar(avatar.id)}
                >
                  <View style={[styles.avatarImageContainer, { borderColor: avatar.color }]}>
                    <Image source={avatar.image} style={styles.avatarImage} />
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
              const canAffordCoins = totalCoins >= avatar.price;
              const canAffordStars = starPoints >= avatar.price;
              const canAfford = canAffordCoins || canAffordStars;
              return (
                <Animated.View key={avatar.id} entering={FadeInUp.delay(300 + index * 50).springify()}>
                  <View style={[styles.avatarCard, styles.avatarCardLocked, !canAfford && styles.avatarCardDisabled]}>
                    <View style={[styles.avatarImageContainer, { borderColor: canAfford ? avatar.color : GameColors.textSecondary, opacity: canAfford ? 1 : 0.5 }]}>
                      <Image source={avatar.image} style={styles.avatarImage} />
                    </View>
                    <ThemedText style={[styles.avatarName, !canAfford && styles.textDisabled]}>
                      {avatar.name}
                    </ThemedText>
                    <View style={styles.avatarPriceButtons}>
                      <Pressable
                        style={[styles.avatarBuyButton, !canAffordStars && styles.avatarBuyButtonDisabled]}
                        onPress={() => canAffordStars && handlePurchaseAvatar(avatar.id, avatar.price, true)}
                        disabled={!canAffordStars}
                      >
                        <Feather name="star" size={10} color={canAffordStars ? GameColors.accent : GameColors.textSecondary} />
                        <ThemedText style={[styles.avatarBuyText, !canAffordStars && styles.textDisabled]}>
                          {avatar.price}
                        </ThemedText>
                      </Pressable>
                      <Pressable
                        style={[styles.avatarBuyButton, !canAffordCoins && styles.avatarBuyButtonDisabled]}
                        onPress={() => canAffordCoins && handlePurchaseAvatar(avatar.id, avatar.price, false)}
                        disabled={!canAffordCoins}
                      >
                        <Feather name="dollar-sign" size={10} color={canAffordCoins ? GameColors.secondary : GameColors.textSecondary} />
                        <ThemedText style={[styles.avatarBuyText, !canAffordCoins && styles.textDisabled]}>
                          {avatar.price}
                        </ThemedText>
                      </Pressable>
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>
      ) : null}
    </>
  );

  const renderThemesTab = () => (
    <Animated.View entering={FadeInDown.springify()}>
      <ThemedText style={styles.sectionTitle}>UI Themes</ThemedText>
      <ThemedText style={styles.sectionDesc}>Customize your game with unique color themes</ThemedText>

      {themes.map((theme, index) => (
        <Animated.View key={theme.id} entering={FadeInUp.delay(index * 100).springify()}>
          <Pressable
            style={[styles.themeCard, currentTheme.id === theme.id && styles.selectedThemeCard]}
            onPress={() => theme.owned ? handleSelectTheme(theme.id) : handlePurchaseTheme(theme.id)}
          >
            <View style={styles.themePreview}>
              <View style={[styles.colorDot, { backgroundColor: theme.colors.primary }]} />
              <View style={[styles.colorDot, { backgroundColor: theme.colors.secondary }]} />
              <View style={[styles.colorDot, { backgroundColor: theme.colors.accent }]} />
            </View>

            <View style={styles.themeInfo}>
              <ThemedText style={styles.themeName}>{theme.name}</ThemedText>
              <ThemedText style={styles.themeDesc}>{theme.description}</ThemedText>
            </View>

            {theme.owned ? (
              currentTheme.id === theme.id ? (
                <View style={styles.themeBadge}>
                  <Feather name="check" size={16} color={GameColors.correct} />
                </View>
              ) : (
                <Pressable style={styles.useButton} onPress={() => handleSelectTheme(theme.id)}>
                  <ThemedText style={styles.useButtonText}>Use</ThemedText>
                </Pressable>
              )
            ) : (
              <Pressable
                style={[styles.buyButton, starPoints < theme.price && styles.buyButtonDisabled]}
                onPress={() => handlePurchaseTheme(theme.id)}
                disabled={starPoints < theme.price}
              >
                <Feather name="star" size={14} color={GameColors.accent} />
                <ThemedText style={styles.buyButtonText}>{theme.price}</ThemedText>
              </Pressable>
            )}
          </Pressable>
        </Animated.View>
      ))}
    </Animated.View>
  );

  const renderPowerupsTab = () => {
    const canClaim = canClaimWeeklyPowerCards();
    
    return (
      <Animated.View entering={FadeInDown.springify()}>
        <ThemedText style={styles.sectionTitle}>Power Cards</ThemedText>
        <ThemedText style={styles.sectionDesc}>Get more power cards for gameplay</ThemedText>

        <View style={styles.bundleCard}>
          <View style={styles.bundleHeader}>
            <View style={[styles.bundleIcon, { backgroundColor: GameColors.correct + "20" }]}>
              <Feather name="gift" size={32} color={GameColors.correct} />
            </View>
            <View style={styles.bundleInfo}>
              <ThemedText style={styles.bundleTitle}>Weekly Free Cards</ThemedText>
              <ThemedText style={styles.bundleDesc}>
                {canClaim ? "Claim your free power cards!" : "Come back next week for more"}
              </ThemedText>
            </View>
          </View>

          <Pressable
            style={[styles.weeklyClaimButton, !canClaim && styles.purchaseButtonDisabled]}
            onPress={handleClaimWeeklyPowerCards}
            disabled={!canClaim}
            accessibilityLabel={canClaim ? "Claim free weekly power cards" : "Weekly power cards already claimed"}
            accessibilityRole="button"
            accessibilityHint="Get one free power card of each type once per week"
          >
            {canClaim ? (
              <>
                <Feather name="gift" size={18} color="#fff" />
                <ThemedText style={styles.weeklyClaimText}>Claim Free Cards</ThemedText>
              </>
            ) : (
              <>
                <Feather name="clock" size={18} color={GameColors.textSecondary} />
                <ThemedText style={styles.weeklyClaimTextDisabled}>Already Claimed</ThemedText>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.bundleCard}>
          <View style={styles.bundleHeader}>
            <View style={styles.bundleIcon}>
              <Feather name="package" size={32} color={GameColors.primary} />
            </View>
            <View style={styles.bundleInfo}>
              <ThemedText style={styles.bundleTitle}>Power Card Bundle</ThemedText>
              <ThemedText style={styles.bundleDesc}>+2 Skip, +2 Steal, +2 Double Bluff</ThemedText>
            </View>
          </View>

          <View style={styles.bundleCards}>
            {powerCards.map((card) => (
              <View key={card.id} style={styles.cardPreview}>
                <Feather name={card.icon as any} size={20} color={GameColors.secondary} />
                <ThemedText style={styles.cardName}>{card.name}</ThemedText>
                <ThemedText style={styles.cardCount}>+2</ThemedText>
              </View>
            ))}
          </View>

          <Pressable
            style={[styles.purchaseButton, starPoints < 500 && styles.purchaseButtonDisabled]}
            onPress={handlePurchasePowerCards}
            disabled={starPoints < 500}
            accessibilityLabel={`Buy power card bundle for 500 star points. You have ${starPoints} star points`}
            accessibilityRole="button"
            accessibilityHint="Purchase extra power cards using star points"
          >
            <Feather name="star" size={18} color={GameColors.accent} />
            <ThemedText style={styles.purchaseButtonText}>500 Star Points</ThemedText>
          </Pressable>
        </View>

        <View style={styles.currentCards}>
          <ThemedText style={styles.currentCardsTitle}>Your Current Cards</ThemedText>
          {powerCards.map((card) => (
            <View 
              key={card.id} 
              style={styles.currentCardRow}
              accessibilityLabel={`${card.name}: ${card.count} cards available`}
            >
              <Feather name={card.icon as any} size={20} color={GameColors.textSecondary} />
              <ThemedText style={styles.currentCardName}>{card.name}</ThemedText>
              <ThemedText style={styles.currentCardCount}>x{card.count}</ThemedText>
            </View>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderPremiumTab = () => (
    <Animated.View entering={FadeInDown.springify()}>
      <ThemedText style={styles.sectionTitle}>Premium Purchases</ThemedText>
      <ThemedText style={styles.sectionDesc}>Enhance your experience with real money</ThemedText>

      <View style={styles.premiumCard}>
        <View style={styles.premiumHeader}>
          <View style={[styles.premiumIcon, { backgroundColor: GameColors.accent + "20" }]}>
            <Feather name="star" size={32} color={GameColors.accent} />
          </View>
          <View style={styles.premiumInfo}>
            <ThemedText style={styles.premiumTitle}>5000 Star Points</ThemedText>
            <ThemedText style={styles.premiumDesc}>Unlock themes and power cards</ThemedText>
          </View>
        </View>

        <Pressable
          style={styles.realMoneyButton}
          onPress={handlePurchaseStarPoints}
          disabled={loading === "starPoints"}
        >
          {loading === "starPoints" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <ThemedText style={styles.realMoneyText}>$5.00</ThemedText>
              <Feather name="external-link" size={16} color="#fff" />
            </>
          )}
        </Pressable>
      </View>

      <View style={styles.premiumCard}>
        <View style={styles.premiumHeader}>
          <View style={[styles.premiumIcon, { backgroundColor: GameColors.correct + "20" }]}>
            <Feather name="zap-off" size={32} color={GameColors.correct} />
          </View>
          <View style={styles.premiumInfo}>
            <ThemedText style={styles.premiumTitle}>Ad-Free Version</ThemedText>
            <ThemedText style={styles.premiumDesc}>Remove all ads forever</ThemedText>
          </View>
        </View>

        {isAdFree ? (
          <View style={styles.purchasedBadge}>
            <Feather name="check-circle" size={20} color={GameColors.correct} />
            <ThemedText style={styles.purchasedText}>Purchased</ThemedText>
          </View>
        ) : (
          <Pressable
            style={styles.realMoneyButton}
            onPress={handlePurchaseAdFree}
            disabled={loading === "adFree"}
          >
            {loading === "adFree" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <ThemedText style={styles.realMoneyText}>$5.00</ThemedText>
                <Feather name="external-link" size={16} color="#fff" />
              </>
            )}
          </Pressable>
        )}
      </View>

      <View style={styles.premiumCard}>
        <View style={styles.premiumHeader}>
          <View style={[styles.premiumIcon, { backgroundColor: "#8B4513" + "20" }]}>
            <Feather name="coffee" size={32} color="#8B4513" />
          </View>
          <View style={styles.premiumInfo}>
            <ThemedText style={styles.premiumTitle}>Support the Developer</ThemedText>
            <ThemedText style={styles.premiumDesc}>Buy me a coffee!</ThemedText>
          </View>
        </View>

        {hasSupported ? (
          <View style={styles.purchasedBadge}>
            <Feather name="heart" size={20} color={GameColors.primary} />
            <ThemedText style={styles.purchasedText}>Thank You!</ThemedText>
          </View>
        ) : (
          <Pressable
            style={[styles.realMoneyButton, { backgroundColor: "#8B4513" }]}
            onPress={handleSupportDeveloper}
            disabled={loading === "support"}
          >
            {loading === "support" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <ThemedText style={styles.realMoneyText}>$3.00</ThemedText>
                <Feather name="external-link" size={16} color="#fff" />
              </>
            )}
          </Pressable>
        )}
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundDark }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleBack} style={[styles.backButton, { backgroundColor: colors.surface }]}>
          <Feather name="arrow-left" size={24} color={GameColors.textPrimary} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Shop</ThemedText>
        <View style={styles.currencyDisplay}>
          <View style={styles.coinBadge}>
            <Feather name="disc" size={14} color={GameColors.accent} />
            <ThemedText style={styles.coinText}>{totalCoins}</ThemedText>
          </View>
          <View style={styles.starBadge}>
            <Feather name="star" size={14} color={GameColors.secondary} />
            <ThemedText style={styles.starText}>{starPoints}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        {(["avatars", "themes", "powerups", "premium"] as TabType[]).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <ThemedText style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === "avatars" ? "Avatars" : tab === "themes" ? "Themes" : tab === "powerups" ? "Power" : "Premium"}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "avatars" && renderAvatarsTab()}
        {activeTab === "themes" && renderThemesTab()}
        {activeTab === "powerups" && renderPowerupsTab()}
        {activeTab === "premium" && renderPremiumTab()}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GameColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...Typography.h4,
    color: GameColors.textPrimary,
  },
  currencyDisplay: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  coinText: {
    ...Typography.caption,
    color: GameColors.accent,
    fontWeight: "600",
    marginLeft: 4,
  },
  starBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  starText: {
    ...Typography.caption,
    color: GameColors.secondary,
    fontWeight: "600",
    marginLeft: 4,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: GameColors.primary,
  },
  tabText: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  activeTabText: {
    color: GameColors.textPrimary,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h4,
    color: GameColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionDesc: {
    ...Typography.body,
    color: GameColors.textSecondary,
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
  avatarImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
  avatarPriceButtons: {
    flexDirection: "row",
    gap: 4,
  },
  avatarBuyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.backgroundDark,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    gap: 2,
  },
  avatarBuyButtonDisabled: {
    opacity: 0.4,
  },
  avatarBuyText: {
    ...Typography.caption,
    color: GameColors.textPrimary,
    fontWeight: "600",
  },
  priceText: {
    ...Typography.caption,
    color: GameColors.accent,
    fontWeight: "600",
    marginLeft: 4,
  },
  themeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedThemeCard: {
    borderColor: GameColors.primary,
  },
  themePreview: {
    flexDirection: "row",
    marginRight: Spacing.md,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 4,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "600",
  },
  themeDesc: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  themeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GameColors.correct + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  useButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: GameColors.primary + "20",
    borderRadius: BorderRadius.sm,
  },
  useButtonText: {
    ...Typography.caption,
    color: GameColors.primary,
    fontWeight: "600",
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: GameColors.accent + "20",
    borderRadius: BorderRadius.sm,
  },
  buyButtonDisabled: {
    opacity: 0.5,
  },
  buyButtonText: {
    ...Typography.caption,
    color: GameColors.accent,
    fontWeight: "600",
    marginLeft: Spacing.xs,
  },
  bundleCard: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  bundleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  bundleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: GameColors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  bundleInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  bundleTitle: {
    ...Typography.h4,
    color: GameColors.textPrimary,
  },
  bundleDesc: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  bundleCards: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.lg,
  },
  cardPreview: {
    alignItems: "center",
  },
  cardName: {
    ...Typography.caption,
    color: GameColors.textSecondary,
    marginTop: Spacing.xs,
  },
  cardCount: {
    ...Typography.caption,
    color: GameColors.correct,
    fontWeight: "700",
  },
  purchaseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GameColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  purchaseButtonDisabled: {
    opacity: 0.5,
  },
  purchaseButtonText: {
    ...Typography.body,
    color: "#fff",
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  weeklyClaimButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GameColors.correct,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  weeklyClaimText: {
    ...Typography.body,
    color: "#fff",
    fontWeight: "600",
  },
  weeklyClaimTextDisabled: {
    ...Typography.body,
    color: GameColors.textSecondary,
    fontWeight: "600",
  },
  currentCards: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  currentCardsTitle: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  currentCardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  currentCardName: {
    ...Typography.body,
    color: GameColors.textSecondary,
    flex: 1,
    marginLeft: Spacing.md,
  },
  currentCardCount: {
    ...Typography.body,
    color: GameColors.textPrimary,
    fontWeight: "600",
  },
  premiumCard: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  premiumHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  premiumIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  premiumTitle: {
    ...Typography.h4,
    color: GameColors.textPrimary,
  },
  premiumDesc: {
    ...Typography.caption,
    color: GameColors.textSecondary,
  },
  realMoneyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GameColors.correct,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  realMoneyText: {
    ...Typography.body,
    color: "#fff",
    fontWeight: "700",
  },
  purchasedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  purchasedText: {
    ...Typography.body,
    color: GameColors.correct,
    fontWeight: "600",
  },
});
