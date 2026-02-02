import { Platform } from "react-native";

let InterstitialAd: any = null;
let AdEventType: any = null;
let TestIds: any = null;
let interstitialInstance: any = null;
let isLoaded = false;

const INTERSTITIAL_AD_UNIT_ID = 'ca-app-pub-9336364822145619/1234567890';

// Initialize the ads module only on native platforms
if (Platform.OS !== 'web') {
  try {
    const ads = require('react-native-google-mobile-ads');
    InterstitialAd = ads.InterstitialAd;
    AdEventType = ads.AdEventType;
    TestIds = ads.TestIds;
  } catch (e) {
    console.warn('AdMob native module not available');
  }
}

function createInterstitial() {
  if (!InterstitialAd || Platform.OS === 'web') return null;
  
  try {
    const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : INTERSTITIAL_AD_UNIT_ID;
    return InterstitialAd.createForAdRequest(adUnitId, {
      keywords: ['games', 'trivia', 'entertainment'],
    });
  } catch (e) {
    console.warn('Failed to create interstitial ad:', e);
    return null;
  }
}

export function initInterstitialAd() {
  if (Platform.OS === 'web' || !InterstitialAd) return;
  
  interstitialInstance = createInterstitial();
  if (!interstitialInstance) return;
  
  interstitialInstance.addAdEventListener(AdEventType.LOADED, () => {
    isLoaded = true;
  });
  
  interstitialInstance.addAdEventListener(AdEventType.CLOSED, () => {
    isLoaded = false;
    // Preload next ad
    interstitialInstance = createInterstitial();
    if (interstitialInstance) {
      interstitialInstance.load();
    }
  });
  
  interstitialInstance.load();
}

export function showInterstitialAd(): boolean {
  if (Platform.OS === 'web' || !interstitialInstance) {
    return false;
  }
  
  if (isLoaded) {
    interstitialInstance.show();
    return true;
  }
  
  return false;
}

export function isInterstitialReady(): boolean {
  return isLoaded && Platform.OS !== 'web';
}
