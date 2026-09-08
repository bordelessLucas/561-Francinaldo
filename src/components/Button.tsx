import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

type ButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: ButtonVariant;
  className?: string;
};

const containerByVariant: Record<ButtonVariant, string> = {
  primary: 'bg-brand active:bg-brand-dark',
  secondary:
    'bg-surface border border-line active:bg-canvas dark:bg-surface-dark dark:border-line-dark dark:active:bg-canvas-dark',
  outline: 'bg-transparent border-2 border-brand active:bg-brand-mist dark:active:bg-brand-mist-dark',
};

const labelByVariant: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-ink dark:text-ink-inverse',
  outline: 'text-brand-dark dark:text-brand-accent',
};

/** Botão atômico — sem regra de negócio. */
export function Button({
  label,
  loading = false,
  variant = 'primary',
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={`min-h-14 items-center justify-center rounded-2xl px-5 ${containerByVariant[variant]} ${
        isDisabled ? 'opacity-50' : ''
      } ${className ?? ''}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#0E7A42'} />
      ) : (
        <Text className={`font-sansSemi text-base ${labelByVariant[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
