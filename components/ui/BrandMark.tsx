import { Image, ImageSourcePropType, Text, View } from 'react-native';

import { brand } from '@/constants/theme';

type BrandMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  showName?: boolean;
  /** Override do asset (ex.: logo_v2 só no login). Default: logo oficial completa. */
  logoSource?: ImageSourcePropType;
  /** Compat legado: mantido por API, sem forcar fundo escuro na UI atual. */
  onDarkPlate?: boolean;
};

const LOGO_SIZE = {
  sm: 40,
  md: 72,
  lg: 128,
  /** Login: símbolo um pouco maior (logo_v2 sem texto). */
  login: 148,
} as const;

/** Marca Alpha SST — logo oficial + tipografia. */
export function BrandMark({
  size = 'lg',
  showTagline = false,
  showName = true,
  logoSource,
  onDarkPlate: _onDarkPlate = false,
}: BrandMarkProps) {
  const logoSize = size === 'lg' && logoSource ? LOGO_SIZE.login : LOGO_SIZE[size];
  const isLarge = size === 'lg';

  return (
    <View className={isLarge ? 'items-center gap-3' : 'flex-row items-center gap-3'}>
      <View className="items-center">
        <Image
          source={logoSource ?? brand.logo}
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
