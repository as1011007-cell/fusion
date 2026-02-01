const { withAndroidManifest, withAppBuildGradle } = require('@expo/config-plugins');

const withPlayGamesServices = (config, { appId } = {}) => {
  if (!appId) {
    console.warn('withPlayGamesServices: No appId provided. Please set your Google Play Games App ID.');
  }

  config = withAndroidManifest(config, async (config) => {
    const mainApplication = config.modResults.manifest.application[0];
    
    if (!mainApplication['meta-data']) {
      mainApplication['meta-data'] = [];
    }

    const existingAppId = mainApplication['meta-data'].find(
      (item) => item.$['android:name'] === 'com.google.android.gms.games.APP_ID'
    );
    
    if (!existingAppId && appId) {
      mainApplication['meta-data'].push({
        $: {
          'android:name': 'com.google.android.gms.games.APP_ID',
          'android:value': appId,
        },
      });
    }

    const existingVersion = mainApplication['meta-data'].find(
      (item) => item.$['android:name'] === 'com.google.android.gms.version'
    );
    
    if (!existingVersion) {
      mainApplication['meta-data'].push({
        $: {
          'android:name': 'com.google.android.gms.version',
          'android:value': '@integer/google_play_services_version',
        },
      });
    }

    return config;
  });

  config = withAppBuildGradle(config, async (config) => {
    const buildGradle = config.modResults.contents;
    
    if (!buildGradle.includes('play-services-games-v2')) {
      const dependenciesRegex = /dependencies\s*\{/;
      if (dependenciesRegex.test(buildGradle)) {
        config.modResults.contents = buildGradle.replace(
          dependenciesRegex,
          `dependencies {
    implementation 'com.google.android.gms:play-services-games-v2:20.1.2'
    implementation 'com.google.android.gms:play-services-auth:21.0.0'`
        );
      }
    }
    
    return config;
  });

  return config;
};

module.exports = withPlayGamesServices;
