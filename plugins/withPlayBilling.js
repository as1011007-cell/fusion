const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withPlayBilling = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const iapBuildGradlePath = path.join(
        config.modRequest.projectRoot,
        'node_modules',
        'react-native-iap',
        'android',
        'build.gradle'
      );

      if (fs.existsSync(iapBuildGradlePath)) {
        let buildGradle = fs.readFileSync(iapBuildGradlePath, 'utf8');

        const oldKotlinResolution = `def kotlinVersion = rootProject.ext.has("kotlinVersion") ? rootProject.ext.get("kotlinVersion") : project.properties["RNIap_kotlinVersion"]`;

        if (buildGradle.includes(oldKotlinResolution)) {
          buildGradle = buildGradle.replace(
            oldKotlinResolution,
            `def kotlinVersion = project.properties["RNIap_kotlinVersion"] ?: "1.9.24"`
          );
          console.log('[withPlayBilling] Patched react-native-iap to use Kotlin 1.9.24 instead of root project version');
        }

        const oldKotlinDef = `def kotlinVersion = getExtOrDefault("kotlinVersion")`;
        if (buildGradle.includes(oldKotlinDef)) {
          buildGradle = buildGradle.replace(
            oldKotlinDef,
            `def kotlinVersion = "1.9.24"`
          );
          console.log('[withPlayBilling] Patched react-native-iap dependencies to use Kotlin 1.9.24');
        }

        const oldCompileSdk = /compileSdkVersion\s+getExtOrIntDefault\("compileSdkVersion",\s*\d+\)/;
        if (oldCompileSdk.test(buildGradle)) {
          buildGradle = buildGradle.replace(
            oldCompileSdk,
            'compileSdkVersion 35'
          );
          console.log('[withPlayBilling] Updated react-native-iap compileSdkVersion to 35');
        }

        fs.writeFileSync(iapBuildGradlePath, buildGradle, 'utf8');
      } else {
        console.log('[withPlayBilling] react-native-iap android/build.gradle not found, skipping patch');
      }

      return config;
    },
  ]);
};

module.exports = withPlayBilling;
