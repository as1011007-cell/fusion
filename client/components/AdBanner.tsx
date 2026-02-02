import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";

let InterstitialAd: any = null;
let AdEventType: any = null;
let TestIds: any = null;

try {
  const ads = require('react-native-google-mobile-ads');
  InterstitialAd = ads.InterstitialAd;
  AdEventType = ads.AdEventType;
  TestIds = ads.TestIds;
} catch (e) {
  // Module not available (Expo Go / Web)
}

const INTERSTITIAL_AD_UNIT_ID = 'ca-app-pub-9336364822145619/1234567890';

type AdBannerProps = {
  style?: object;
};

export function AdBanner({ style }: AdBannerProps) {
  const { isAdFree } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [adsAvailable, setAdsAvailable] = useState(false);
  const interstitialRef = useRef<any>(null);

  useEffect(() => {
    if (isAdFree) return;
    if (!InterstitialAd || Platform.OS === 'web') return;

    try {
      const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : INTERSTITIAL_AD_UNIT_ID;
      const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
        keywords: ['games', 'trivia', 'entertainment'],
      });
      interstitialRef.current = interstitial;
      setAdsAvailable(true);

      const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
        setLoaded(true);
      });

      const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        setLoaded(false);
        interstitial.load();
      });

      interstitial.load();

      return () => {
        unsubscribeLoaded();
        unsubscribeClosed();
      };
    } catch (e) {
      console.log('Ads not available:', e);
    }
  }, [isAdFree]);

  const showInterstitial = () => {
    if (loaded && interstitialRef.current) {
      interstitialRef.current.show();
    }
  };

  if (isAdFree) {
    return null;
  }

  return (
    <Pressable style={[styles.container, style]} onPress={showInterstitial}>
      <LinearGradient
        colors={["#1a1a2e", "#16213e"]}
        style={styles.adContent}
      >
        <View style={styles.adLabel}>
          <View style={styles.adLabelInner}>
            <Feather name="zap" size={12} color={GameColors.secondary} />
          </View>
        </View>
        <View style={styles.placeholderContent}>
          <Feather name="gift" size={24} color={GameColors.secondary} />
          <View style={styles.textContainer}>
            <ThemedText style={styles.adTitle}>Go Ad-Free!</ThemedText>
            <ThemedText style={styles.adSubtitle}>
              {adsAvailable && loaded ? "Tap to watch ad" : "Remove all ads for $5.99"}
            </ThemedText>
          </View>
          <View style={styles.actionButton}>
            <Feather name={adsAvailable && loaded ? "play" : "arrow-right"} size={14} color="#fff" />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
  },
  adContent: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    position: "relative",
    overflow: 'hidden',
  },
  adLabel: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
  },
  adLabelInner: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 6,
    borderBottomLeftRadius: 12,
  },
  placeholderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: GameColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GameColors.secondary,
  },
  line: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    width: '100%',
    opacity: 0.5,
  },
  actionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GameColors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
