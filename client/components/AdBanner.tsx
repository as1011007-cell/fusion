import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";

// Dynamically import to avoid Metro web bundling errors
let InterstitialAd: any = null;
let AdEventType: any = null;
let TestIds: any = null;

if (Platform.OS !== 'web') {
  try {
    const ads = require('react-native-google-mobile-ads');
    InterstitialAd = ads.InterstitialAd;
    AdEventType = ads.AdEventType;
    TestIds = ads.TestIds;
  } catch (e) {
    console.warn('AdMob native module not found');
  }
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
    if (isAdFree || Platform.OS === 'web' || !InterstitialAd) return;

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

  // Hide completely on web to prevent any native component interference
  if (isAdFree || Platform.OS === 'web') {
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={styles.badge}>
                <Feather name="star" size={10} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={styles.premiumText}>
                    <View style={styles.dot} />
                    <View style={styles.line} />
                  </View>
                  <View style={styles.actionButton}>
                    <Feather name="play" size={12} color="#fff" />
                  </View>
                </View>
                <View style={[styles.line, { width: '60%', marginTop: 4, opacity: 0.3 }]} />
              </View>
            </View>
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
