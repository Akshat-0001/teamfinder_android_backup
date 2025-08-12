import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.buildcore.teamfinder',
  appName: 'TeamFinder',
  webDir: 'dist',
  android: {
    scheme: 'teamfinder'
  },
  plugins: {
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
    StatusBar: {
      backgroundColor: '#00000000',
      overlaysWebView: true
    },
    PushNotifications: {
      presentationOptions: []
    }
  }
};

export default config;
