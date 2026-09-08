import {
  Outfit_600SemiBold,
  Outfit_700Bold,
  useFonts as useOutfit,
} from '@expo-google-fonts/outfit';
import {
  SourceSans3_400Regular,
  SourceSans3_500Medium,
  SourceSans3_600SemiBold,
  useFonts as useSourceSans,
} from '@expo-google-fonts/source-sans-3';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import '../global.css';

import { lightColors } from '@/constants/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { PlanPreviewProvider } from '@/contexts/PlanPreviewContext';
import { ThemeProvider, useAppTheme } from '@/contexts/ThemeContext';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { colors } = useAppTheme();

  return (
    <AuthProvider>
      <PlanPreviewProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.canvas },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="ui" />
        </Stack>
      </PlanPreviewProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  const [outfitLoaded] = useOutfit({
    Outfit_600SemiBold,
    Outfit_700Bold,
  });
  const [sourceLoaded] = useSourceSans({
    SourceSans3_400Regular,
    SourceSans3_500Medium,
    SourceSans3_600SemiBold,
  });

  const loaded = outfitLoaded && sourceLoaded;

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <View className="flex-1" style={{ backgroundColor: lightColors.canvas }} />;
  }

  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}
