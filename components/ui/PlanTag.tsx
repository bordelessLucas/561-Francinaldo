import { Text, View } from 'react-native';

import { useAppTheme } from '@/contexts/ThemeContext';

type PlanTagProps = {
  plan: 'free' | 'premium' | 'admin';
};

/** Tag de plano — contraste correto em light e dark. */
export function PlanTag({ plan }: PlanTagProps) {
  const { colors, isDark } = useAppTheme();

  const styles =
    plan === 'premium'
      ? {
          label: 'Premium',
          backgroundColor: colors.brandMist,
          color: colors.brandDark,
          borderColor: 'transparent',
          borderWidth: 0,
        }
      : plan === 'admin'
        ? {
            label: 'Admin',
            backgroundColor: colors.brand,
            color: colors.white,
            borderColor: 'transparent',
            borderWidth: 0,
          }
        : {
            label: 'Free',
            backgroundColor: isDark ? colors.canvasElev : colors.canvasElev,
            color: colors.inkMuted,
            borderColor: colors.line,
            borderWidth: 1,
          };

  return (
    <View
      className="self-start rounded-full px-3 py-1.5"
      style={{
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        borderWidth: styles.borderWidth,
      }}
    >
      <Text className="font-sansSemi text-xs" style={{ color: styles.color }}>
        {styles.label}
      </Text>
    </View>
  );
}
