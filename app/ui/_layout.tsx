import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';

/** Stack pública só para preview de UI (sem auth). */
export default function UiPreviewLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.canvas },
        animation: 'fade',
      }}
    />
  );
}
