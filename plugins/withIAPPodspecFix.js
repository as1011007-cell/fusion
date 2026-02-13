const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withIAPPodspecFix = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podspecPath = path.join(
        config.modRequest.projectRoot,
        'node_modules',
        'react-native-iap',
        'RNIap.podspec'
      );

      if (fs.existsSync(podspecPath)) {
        let podspec = fs.readFileSync(podspecPath, 'utf8');

        if (podspec.includes('"RCT-Folly"')) {
          podspec = podspec.replace(
            /\s*s\.dependency\s+"RCT-Folly"\s*\n/,
            '\n'
          );
          fs.writeFileSync(podspecPath, podspec, 'utf8');
          console.log('[withIAPPodspecFix] Removed RCT-Folly dependency from RNIap.podspec (provided by React-Core in RN 0.76+)');
        }
      }

      return config;
    },
  ]);
};

module.exports = withIAPPodspecFix;
