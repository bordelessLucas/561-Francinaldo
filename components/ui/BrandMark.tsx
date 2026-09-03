import { Image, Text, View } from 'react-native';

import { brand } from '@/constants/theme';

type BrandMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  showName?: boolean;
  /** Fundo preto da peça oficial; use em telas claras se quiser o bloco completo */
  onDarkPlate?: boolean;
};

const LOGO_SIZE = {
  sm: 40,
  md: 72,
  lg: 128,
} as const;

/** Marca Alpha SST — logo oficial + tipografia. */
export function BrandMark({
  size = 'lg',
  showTagline = false,
  showName = true,
  onDarkPlate = false,
}: BrandMarkProps) {
  const logoSize = LOGO_SIZE[size];
  const isLarge = size === 'lg';

  return (
    <View className={isLarge ? 'items-center gap-3' : 'flex-row items-center gap-3'}>
      <View
        className={onDarkPlate ? 'items-center rounded-3xl bg-brand-black p-4' : 'items-center'}
      >
        <Image
          source={brand.logo}
          style={{ width: logoSize, height: logoSize }}
          resizeMode="contain"
          accessibilityLabel="Logo Alpha SST"
        />
      </View>

      {showName || showTagline ? (
        <View className={isLarge ? 'items-center gap-1' : 'flex-1 gap-0.5'}>
          {showName ? (
            <Text
              className={`font-displayBold tracking-tight text-brand-dark ${
                isLarge ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-lg'
              }`}
            >
              {brand.name}
            </Text>
          ) : null}
          {showTagline ? (
            <Text
              className={`font-sans text-ink-muted ${
                isLarge ? 'max-w-[280px] text-center text-base leading-6' : 'text-sm leading-5'
              }`}
            >
              {brand.tagline}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
