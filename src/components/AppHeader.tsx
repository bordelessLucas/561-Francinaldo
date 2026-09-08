import { Image, View } from 'react-native';

import { brand } from '@/constants/theme';
import { Caption, Label } from '@/src/components/Typography';

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
};

/** Header de apresentação — sem atalhos que duplicam a tab bar. */
export function AppHeader({
  title = brand.name,
  subtitle,
  showLogo = true,
}: AppHeaderProps) {
  return (
    <View className="mb-6 flex-row items-center justify-between">
      <View className="flex-1 flex-row items-center gap-3">
        {showLogo ? (
          <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-brand-black">
            <Image
              source={brand.logo}
              style={{ width: 44, height: 44 }}
              resizeMode="contain"
              accessibilityLabel="Logo Alpha SST"
            />
          </View>
        ) : null}
        <View className="flex-1">
          <Label className="text-xl text-brand-dark dark:text-brand-accent">{title}</Label>
          {subtitle ? <Caption className="mt-1">{subtitle}</Caption> : null}
        </View>
      </View>
    </View>
  );
}
