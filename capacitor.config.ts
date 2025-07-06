import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.buildcore.teamfinder',
  appName: 'TeamFinder',
  webDir: 'dist',
  plugins: {
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK',
      backgroundColor: '#00000000'
    }
  }
};

export default config;
