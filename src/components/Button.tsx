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
  secondary: 'bg-white border border-line active:bg-canvas',
  outline: 'bg-transparent border-2 border-brand active:bg-brand-mist',
};

const labelByVariant: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-ink',
  outline: 'text-brand-dark',
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
