import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const INTERSTITIAL_AD_UNIT_ID = 'ca-app-pub-9336364822145619/1234567890';

let interstitialInstance: ReturnType<typeof InterstitialAd.createForAdRequest> | null = null;
let isLoaded = false;

function createInterstitial() {
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
  interstitialInstance = createInterstitial();
  if (!interstitialInstance) return;
  
  try {
    interstitialInstance.addAdEventListener(AdEventType.LOADED, () => {
      isLoaded = true;
    });
    
    interstitialInstance.addAdEventListener(AdEventType.CLOSED, () => {
      isLoaded = false;
      interstitialInstance = createInterstitial();
      if (interstitialInstance) {
        interstitialInstance.load();
      }
    });
    
    interstitialInstance.load();
  } catch (e) {
    console.warn('Failed to initialize interstitial ads:', e);
  }
}

export function showInterstitialAd(): boolean {
  if (!interstitialInstance) {
    return false;
  }
  
  if (isLoaded) {
    try {
      interstitialInstance.show();
      return true;
    } catch (e) {
      console.warn('Failed to show interstitial ad:', e);
      return false;
    }
  }
  
  return false;
}

export function isInterstitialReady(): boolean {
  return isLoaded;
}
