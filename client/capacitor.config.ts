import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nametag.app',
  appName: 'Nametag',
  webDir: 'dist',
  plugins: {
    Geolocation: {
      // iOS: triggers NSLocationWhenInUseUsageDescription prompt
    },
    Camera: {
      // iOS: triggers NSCameraUsageDescription and NSPhotoLibraryUsageDescription prompts
    },
  },
};

export default config;
