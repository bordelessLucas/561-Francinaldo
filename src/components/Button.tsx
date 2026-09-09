import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

import { useAppTheme } from '@/contexts/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

type ButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: ButtonVariant;
  className?: string;
};

/** Botão atômico — cores do tema ativo (light/dark). */
export function Button({
  label,
  loading = false,
  variant = 'primary',
  disabled,
  className,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useAppTheme();
  const isDisabled = Boolean(disabled || loading);

  const containerStyle =
    variant === 'primary'
      ? { backgroundColor: colors.brand, borderWidth: 0, borderColor: 'transparent' as const }
      : variant === 'secondary'
        ? { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }
        : { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.brand };

  const labelColor =
    variant === 'primary' ? colors.white : variant === 'secondary' ? colors.ink : colors.brandDark;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={`min-h-14 items-center justify-center rounded-2xl px-5 ${
        isDisabled ? 'opacity-50' : ''
      } ${className ?? ''}`}
      style={
        typeof style === 'function'
          ? (state) => [containerStyle, style(state)]
          : [containerStyle, style]
      }
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.brand} />
      ) : (
        <Text className="font-sansSemi text-base" style={{ color: labelColor }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
