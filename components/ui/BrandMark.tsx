import { Text, View } from 'react-native';

import { brand } from '@/constants/theme';

type BrandMarkProps = {
  size?: 'sm' | 'lg';
  showTagline?: boolean;
};

export function BrandMark({ size = 'lg', showTagline = false }: BrandMarkProps) {
  const isLarge = size === 'lg';

  return (
    <View className={isLarge ? 'gap-3' : 'gap-1'}>
      <Text
        className={`font-displayBold tracking-tight text-ink ${
          isLarge ? 'text-5xl' : 'text-2xl'
        }`}
      >
        {brand.name}
      </Text>
      {showTagline ? (
        <Text className="max-w-[280px] font-sans text-base leading-6 text-ink-muted">
          {brand.tagline}
        </Text>
      ) : null}
    </View>
  );
}
