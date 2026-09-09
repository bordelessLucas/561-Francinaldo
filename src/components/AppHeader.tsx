import { Image, View } from 'react-native';

import { brand } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Caption, Label } from '@/src/components/Typography';

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
};

/** Header de apresentação — tipografia com contraste do tema ativo. */
export function AppHeader({
  title = brand.name,
  subtitle,
  showLogo = true,
}: AppHeaderProps) {
  const { colors } = useAppTheme();

  return (
    <View className="mb-6 flex-row items-center justify-between">
      <View className="flex-1 flex-row items-center gap-3">
        {showLogo ? (
          <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-2xl">
            <Image
              source={brand.logo}
              style={{ width: 44, height: 44 }}
              resizeMode="contain"
              accessibilityLabel="Logo Alpha SST"
            />
          </View>
        ) : null}
        <View className="flex-1">
          <Label className="text-xl" style={{ color: colors.brandDark }}>
            {title}
          </Label>
          {subtitle ? <Caption className="mt-1">{subtitle}</Caption> : null}
        </View>
      </View>
    </View>
  );
}
