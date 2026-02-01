const { withAppBuildGradle } = require('@expo/config-plugins');

const withPlayBilling = (config) => {
  return withAppBuildGradle(config, async (config) => {
    const buildGradle = config.modResults.contents;
    
    if (!buildGradle.includes('billing-ktx')) {
      const dependenciesRegex = /dependencies\s*\{/;
      if (dependenciesRegex.test(buildGradle)) {
        config.modResults.contents = buildGradle.replace(
          dependenciesRegex,
          `dependencies {
    implementation 'com.android.billingclient:billing-ktx:7.0.0'`
        );
      }
    }
    
    return config;
  });
};

module.exports = withPlayBilling;
