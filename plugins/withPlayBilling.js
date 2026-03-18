const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const REPLACEMENT_BUILD_GRADLE = `
apply plugin: "com.android.library"
apply plugin: "kotlin-android"

def isNewArchitectureEnabled() {
  return rootProject.hasProperty("newArchEnabled") && rootProject.getProperty("newArchEnabled") == "true"
}

if (isNewArchitectureEnabled()) {
  apply plugin: "com.facebook.react"
}

def safeExtGet(prop, fallback) {
  return rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback
}

android {
  compileSdk safeExtGet("compileSdkVersion", 36)
  namespace "com.dooboolab.rniap"

  defaultConfig {
    minSdk safeExtGet("minSdkVersion", 24)
    targetSdk safeExtGet("targetSdkVersion", 36)
    buildConfigField "boolean", "IS_NEW_ARCHITECTURE_ENABLED", isNewArchitectureEnabled().toString()
    buildConfigField "boolean", "IS_AMAZON_DRM_ENABLED", "true"
  }

  buildFeatures {
    buildConfig true
  }

  buildTypes {
    release {
      minifyEnabled false
    }
  }

  lint {
    abortOnError false
    disable "GradleCompatible"
  }

  compileOptions {
    sourceCompatibility JavaVersion.VERSION_17
    targetCompatibility JavaVersion.VERSION_17
  }

  kotlinOptions {
    jvmTarget = "17"
    apiVersion = "1.9"
    languageVersion = "1.9"
  }

  flavorDimensions += "store"

  productFlavors {
    amazon {
      dimension "store"
    }

    play {
      dimension "store"
    }
  }

  testOptions {
    unitTests.all {
      jvmArgs '-noverify'
    }
    unitTests.returnDefaultValues = true
  }
}

repositories {
  mavenCentral()
  google()
}

def kotlinVersion = safeExtGet("kotlinVersion", "2.1.20")

dependencies {
  implementation "com.facebook.react:react-native:+"
  implementation "org.jetbrains.kotlin:kotlin-stdlib:$kotlinVersion"

  testImplementation "junit:junit:4.13.2"
  testImplementation "io.mockk:mockk:1.13.5"

  playImplementation "com.android.billingclient:billing-ktx:6.2.1"
  playImplementation "com.google.android.gms:play-services-base:18.1.0"

  amazonImplementation "com.amazon.device:amazon-appstore-sdk:3.0.7"

  implementation "androidx.annotation:annotation:1.2.0"
  implementation "androidx.browser:browser:1.2.0"
}

if (isNewArchitectureEnabled()) {
  react {
    jsRootDir = file("../src/")
    libraryName = "RNIap"
    codegenJavaPackageName = "com.reactnativeiap"
  }
}
`;

const withPlayBilling = (config) => {
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
        fs.writeFileSync(iapBuildGradlePath, REPLACEMENT_BUILD_GRADLE.trim(), 'utf8');
        console.log('[withPlayBilling] Replaced react-native-iap build.gradle with Gradle 9 / Kotlin 2.x compatible version');
      } else {
        console.log('[withPlayBilling] react-native-iap build.gradle not found at: ' + iapBuildGradlePath);
      }

      return config;
    },
  ]);

  return config;
};

module.exports = withPlayBilling;
