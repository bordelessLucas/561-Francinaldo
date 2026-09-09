import { Pressable, View, type PressableProps, type ViewProps } from 'react-native';

import { useAppTheme } from '@/contexts/ThemeContext';

type SurfaceTone = 'default' | 'elevated' | 'accent' | 'signal';

type SurfaceProps = ViewProps & {
  children: React.ReactNode;
  tone?: SurfaceTone;
  bordered?: boolean;
  className?: string;
  padding?: boolean;
  onPress?: PressableProps['onPress'];
  accessibilityLabel?: string;
};

/**
 * Superfície temática (JS) — fonte de verdade do light/dark.
 * Evita cards pretos no modo claro por falha de sync das classes `dark:`.
 */
export function Surface({
  children,
  tone = 'default',
  bordered = true,
  className,
  padding = true,
  style,
  onPress,
  accessibilityLabel,
  ...props
}: SurfaceProps) {
  const { colors } = useAppTheme();

  const backgroundColor =
    tone === 'elevated'
      ? colors.canvasElev
      : tone === 'accent'
        ? colors.brandMist
        : tone === 'signal'
          ? colors.signalSoft
          : colors.surface;

  const borderColor = tone === 'accent' ? `${colors.brand}33` : colors.line;

  const sharedClass = `overflow-hidden rounded-3xl ${padding ? 'px-5 py-5' : ''} ${className ?? ''}`;
  const sharedStyle = [
    {
      backgroundColor,
      borderWidth: bordered ? 1 : 0,
      borderColor: bordered ? borderColor : 'transparent',
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        className={`${sharedClass} active:opacity-90`}
        style={sharedStyle}
        {...(props as PressableProps)}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={sharedClass} style={sharedStyle} {...props}>
      {children}
    </View>
  );
}
