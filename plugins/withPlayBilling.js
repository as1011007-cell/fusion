const { withDangerousMod, withProjectBuildGradle } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const COMPATIBLE_KOTLIN = '1.9.24';

const withPlayBilling = (config) => {
  config = withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes('languageVersion = "1.9"')) {
      const kotlinCompilerFix = `
subprojects { subproject ->
    afterEvaluate {
        subproject.tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
            kotlinOptions {
                jvmTarget = "17"
                apiVersion = "1.9"
                languageVersion = "1.9"
            }
        }
        if (subproject.hasProperty("android")) {
            subproject.android {
                if (subproject.android.compileOptions) {
                    subproject.android.compileOptions.sourceCompatibility = JavaVersion.VERSION_17
                    subproject.android.compileOptions.targetCompatibility = JavaVersion.VERSION_17
                }
            }
        }
    }
}
`;
      contents += kotlinCompilerFix;
      console.log('[withPlayBilling] Added Kotlin 1.9 compatibility fix to root build.gradle');
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

        const buildscriptKotlinRegex = /def\s+kotlinVersion\s*=\s*rootProject\.ext\.has\("kotlinVersion"\)\s*\?\s*rootProject\.ext\.get\("kotlinVersion"\)\s*:\s*project\.properties\["RNIap_kotlinVersion"\]/;
        if (buildscriptKotlinRegex.test(content)) {
          content = content.replace(
            buildscriptKotlinRegex,
            `def kotlinVersion = "${COMPATIBLE_KOTLIN}"`
          );
          patched = true;
          console.log(`[withPlayBilling] Patched buildscript kotlinVersion to ${COMPATIBLE_KOTLIN}`);
        }

        const depsKotlinRegex = /def\s+kotlinVersion\s*=\s*getExtOrDefault\("kotlinVersion"\)/;
        if (depsKotlinRegex.test(content)) {
          content = content.replace(
            depsKotlinRegex,
            `def kotlinVersion = "${COMPATIBLE_KOTLIN}"`
          );
          patched = true;
          console.log(`[withPlayBilling] Patched dependencies kotlinVersion to ${COMPATIBLE_KOTLIN}`);
        }

        const agpRegex = /classpath\s+"com\.android\.tools\.build:gradle:7\.4\.\d+"/;
        if (agpRegex.test(content)) {
          content = content.replace(
            agpRegex,
            'classpath "com.android.tools.build:gradle:8.2.1"'
          );
          patched = true;
          console.log('[withPlayBilling] Updated Android Gradle Plugin to 8.2.1');
        }

        const compileSdkRegex = /compileSdkVersion\s+getExtOrIntegerDefault\("compileSdkVersion"\)/;
        if (compileSdkRegex.test(content)) {
          content = content.replace(
            compileSdkRegex,
            'compileSdkVersion 35'
          );
          patched = true;
          console.log('[withPlayBilling] Updated compileSdkVersion to 35');
        }

        const targetSdkRegex = /targetSdkVersion\s+getExtOrIntegerDefault\("targetSdkVersion"\)/;
        if (targetSdkRegex.test(content)) {
          content = content.replace(
            targetSdkRegex,
            'targetSdkVersion 35'
          );
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
              match[0] + `\n\n  kotlinOptions {\n    jvmTarget = "17"\n  }`
            );
            patched = true;
            console.log('[withPlayBilling] Added kotlinOptions with jvmTarget 17');
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
