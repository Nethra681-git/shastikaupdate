import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shastika.shastikaapp',
  appName: 'Shastika',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
