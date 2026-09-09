import { Text, View } from 'react-native';

import { useAppTheme } from '@/contexts/ThemeContext';
import { Surface } from '@/src/components/Surface';

type HomeActionCardProps = {
  title: string;
  description: string;
  onPress: () => void;
  emphasized?: boolean;
};

export function HomeActionCard({
  title,
  description,
  onPress,
  emphasized = false,
}: HomeActionCardProps) {
  const { colors } = useAppTheme();

  return (
    <Surface tone={emphasized ? 'accent' : 'default'} onPress={onPress} padding>
      <Text
        className="font-sansSemi text-lg"
        style={{ color: emphasized ? colors.brandDark : colors.ink }}
      >
        {title}
      </Text>
      <Text
        className="mt-2 font-sans text-sm leading-5"
        style={{ color: emphasized ? colors.inkSoft : colors.inkMuted }}
      >
        {description}
      </Text>
      {emphasized ? (
        <View className="mt-4 self-start rounded-full px-4 py-2" style={{ backgroundColor: colors.brand }}>
          <Text className="font-sansSemi text-sm" style={{ color: colors.white }}>
            Começar
          </Text>
        </View>
      ) : null}
    </Surface>
  );
}
