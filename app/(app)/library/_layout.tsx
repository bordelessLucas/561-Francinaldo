import { Stack } from 'expo-router';

import { useAppTheme } from '@/contexts/ThemeContext';

export default function LibraryStackLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[categoryId]/index" />
      <Stack.Screen name="[categoryId]/[docId]" />
    </Stack>
  );
}
