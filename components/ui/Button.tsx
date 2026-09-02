import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand active:bg-brand-dark',
  secondary: 'bg-white border border-line active:bg-canvas',
  ghost: 'bg-transparent active:bg-brand-mist/60',
};

const labelClasses: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-ink',
  ghost: 'text-brand-dark',
};

export function Button({
  label,
  loading = false,
  variant = 'primary',
  disabled,
  className,
  ...props
}: ButtonProps & { className?: string }) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`min-h-14 items-center justify-center rounded-2xl px-5 ${variantClasses[variant]} ${
        isDisabled ? 'opacity-50' : ''
      } ${className ?? ''}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#146C6A'} />
      ) : (
        <Text className={`font-sansSemi text-base ${labelClasses[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
