import { ActivityIndicator, Text, View } from 'react-native';

import { useAppTheme } from '@/contexts/ThemeContext';

type LoadingStateProps = {
  message?: string;
};

/** Estado de carregamento — fundo e texto do tema ativo. */
export function LoadingState({ message = 'Carregando...' }: LoadingStateProps) {
  const { colors } = useAppTheme();

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: colors.canvas }}
    >
      <ActivityIndicator size="large" color={colors.brand} />
      <Text className="mt-4 text-center font-sans text-base" style={{ color: colors.inkMuted }}>
        {message}
      </Text>
    </View>
  );
}
