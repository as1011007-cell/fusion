import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

let InterstitialAd: any = null;
let AdEventType: any = null;
let TestIds: any = null;

if (!isExpoGo) {
  try {
    const mobileAds = require('react-native-google-mobile-ads');
    InterstitialAd = mobileAds.InterstitialAd;
    AdEventType = mobileAds.AdEventType;
    TestIds = mobileAds.TestIds;
  } catch (e) {
    console.warn('Google Mobile Ads not available:', e);
  }
}

const INTERSTITIAL_AD_UNIT_ID = 'ca-app-pub-9336364822145619/1234567890';

let interstitialInstance: any = null;
let isLoaded = false;

function createInterstitial() {
  if (isExpoGo || !InterstitialAd) {
    return null;
  }
  
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
  if (isExpoGo || !InterstitialAd) {
    console.log('Ads not available in Expo Go');
    return;
  }
  
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
  if (isExpoGo || !interstitialInstance) {
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
