const { withDangerousMod, withProjectBuildGradle } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withPlayBilling = (config) => {
  config = withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes('languageVersion = "1.9"')) {
      const kotlinCompilerFix = `
subprojects { subproject ->
    if (subproject.name == "react-native-iap") {
        subproject.plugins.withId("org.jetbrains.kotlin.android") {
            subproject.tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
                kotlinOptions {
                    jvmTarget = "17"
                    apiVersion = "1.9"
                    languageVersion = "1.9"
                }
            }
        }
    }
}
`;
      contents += kotlinCompilerFix;
      console.log('[withPlayBilling] Added targeted Kotlin 1.9 compatibility fix for react-native-iap in root build.gradle');
    }

    config.modResults.contents = contents;
    return config;
  });

  config = withDangerousMod(config, [
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
        let content = fs.readFileSync(iapBuildGradlePath, 'utf8');
        let patched = false;

        const removeOwnBuildscript = /^buildscript\s*\{[\s\S]*?\n\}\s*\n/m;
        if (removeOwnBuildscript.test(content)) {
          content = content.replace(removeOwnBuildscript, '');
          patched = true;
          console.log('[withPlayBilling] Removed react-native-iap buildscript block (will use root project Kotlin plugin)');
        }

        const compileSdkRegex = /compileSdkVersion\s+getExtOrIntegerDefault\("compileSdkVersion"\)/;
        if (compileSdkRegex.test(content)) {
          content = content.replace(compileSdkRegex, 'compileSdkVersion 35');
          patched = true;
          console.log('[withPlayBilling] Updated compileSdkVersion to 35');
        }

        const targetSdkRegex = /targetSdkVersion\s+getExtOrIntegerDefault\("targetSdkVersion"\)/;
        if (targetSdkRegex.test(content)) {
          content = content.replace(targetSdkRegex, 'targetSdkVersion 35');
          patched = true;
          console.log('[withPlayBilling] Updated targetSdkVersion to 35');
        }

        const javaCompatRegex = /sourceCompatibility\s+JavaVersion\.VERSION_1_8\s*\n\s*targetCompatibility\s+JavaVersion\.VERSION_1_8/;
        if (javaCompatRegex.test(content)) {
          content = content.replace(
            javaCompatRegex,
            'sourceCompatibility JavaVersion.VERSION_17\n    targetCompatibility JavaVersion.VERSION_17'
          );
          patched = true;
          console.log('[withPlayBilling] Updated Java compatibility to VERSION_17');
        }

        const lintRegex = /lintOptions\s*\{/;
        if (lintRegex.test(content)) {
          content = content.replace(lintRegex, 'lint {');
          patched = true;
          console.log('[withPlayBilling] Updated deprecated lintOptions to lint block');
        }

        if (!content.includes('kotlinOptions')) {
          const compileOptionsEnd = /compileOptions\s*\{[^}]*\}/;
          const match = content.match(compileOptionsEnd);
          if (match) {
            content = content.replace(
              match[0],
              match[0] + `\n\n  kotlinOptions {\n    jvmTarget = "17"\n    apiVersion = "1.9"\n    languageVersion = "1.9"\n  }`
            );
            patched = true;
            console.log('[withPlayBilling] Added kotlinOptions with jvmTarget 17, apiVersion 1.9, languageVersion 1.9');
          }
        }

        if (patched) {
          fs.writeFileSync(iapBuildGradlePath, content, 'utf8');
          console.log('[withPlayBilling] All patches applied to react-native-iap build.gradle');
        } else {
          console.log('[withPlayBilling] No patches needed for react-native-iap build.gradle');
        }
      } else {
        console.log('[withPlayBilling] react-native-iap build.gradle not found, skipping node_modules patch');
      }

      return config;
    },
  ]);

  return config;
};

module.exports = withPlayBilling;
