import { ActivityIndicator, Text, View } from 'react-native';

import { useAppTheme } from '@/contexts/ThemeContext';

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = 'Carregando...' }: LoadingStateProps) {
  const { colors } = useAppTheme();

  return (
    <View className="flex-1 items-center justify-center bg-canvas px-6 dark:bg-canvas-dark">
      <ActivityIndicator size="large" color={colors.brand} />
      <Text className="mt-4 text-center font-sans text-base text-ink-muted dark:text-ink-muted-inverse">
        {message}
      </Text>
    </View>
  );
}
