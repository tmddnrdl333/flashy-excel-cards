import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.14bdc55cdeac4aac9dba8f448528d16d',
  appName: 'flashy-excel-cards',
  webDir: 'dist',
  server: {
    url: 'https://14bdc55c-deac-4aac-9dba-8f448528d16d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;