import { Text, View } from 'react-native';

import { useAppTheme } from '@/contexts/ThemeContext';

type EmptyStateProps = {
  title: string;
  description: string;
};

/** Estado vazio real — sem dados fictícios. */
export function EmptyState({ title, description }: EmptyStateProps) {
  const { colors } = useAppTheme();

  return (
    <View
      className="items-center rounded-3xl border border-dashed px-6 py-10"
      style={{
        backgroundColor: `${colors.surface}B3`,
        borderColor: colors.line,
      }}
    >
      <Text className="text-center font-sansSemi text-lg" style={{ color: colors.ink }}>
        {title}
      </Text>
      <Text
        className="mt-3 max-w-[280px] text-center font-sans text-sm leading-5"
        style={{ color: colors.inkMuted }}
      >
        {description}
      </Text>
    </View>
  );
}
