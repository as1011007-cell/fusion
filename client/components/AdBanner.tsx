import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-9336364822145619~7648226398';

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  keywords: ['fashion', 'clothing'],
});

type AdBannerProps = {
  style?: object;
};

export function AdBanner({ style }: AdBannerProps) {
  const { isAdFree } = useTheme();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isAdFree) return;

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
  }, [isAdFree]);

  const showInterstitial = () => {
    if (loaded) {
      interstitial.show();
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
