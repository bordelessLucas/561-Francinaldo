import { ActivityIndicator, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = 'Carregando...' }: LoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-canvas px-6">
      <ActivityIndicator size="large" color={colors.brand} />
      <Text className="mt-4 text-center font-sans text-base text-ink-muted">{message}</Text>
    </View>
  );
}
