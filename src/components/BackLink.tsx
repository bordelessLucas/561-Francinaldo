import { Pressable } from 'react-native';
import { router, type Href } from 'expo-router';

import { useAppTheme } from '@/contexts/ThemeContext';
import { Caption } from '@/src/components/Typography';

type BackLinkProps = {
  label?: string;
  /** Rota quando não há histórico de navegação (ex.: aba oculta). */
  fallbackHref?: Href;
  className?: string;
  onPress?: () => void;
};

/** Voltar com fallback — evita telas sem saída. */
export function BackLink({
  label = 'Voltar',
  fallbackHref = '/(app)/' as Href,
  className,
  onPress,
}: BackLinkProps) {
  const { colors } = useAppTheme();

  function handlePress() {
    if (onPress) {
      onPress();
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(fallbackHref);
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`self-start py-1 ${className ?? ''}`}
    >
      <Caption className="font-sansSemi" style={{ color: colors.brandDark }}>
        {label}
      </Caption>
    </Pressable>
  );
}
