import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  className?: string;
};

/** Input atômico — sem regra de negócio. */
export function Input({
  label,
  error,
  leftIcon,
  isPassword = false,
  secureTextEntry,
  className,
  ...props
}: InputProps) {
  const [hidden, setHidden] = useState(true);
  const showSecure = isPassword ? hidden : Boolean(secureTextEntry);

  return (
    <View className="w-full gap-2">
      <Text className="font-sansMedium text-sm text-ink-soft dark:text-ink-muted-inverse">{label}</Text>
      <View
        className={`min-h-14 flex-row items-center rounded-2xl border bg-surface px-3 dark:bg-surface-dark ${
          error ? 'border-signal' : 'border-line dark:border-line-dark'
        } ${className ?? ''}`}
      >
        {leftIcon ? (
          <Ionicons name={leftIcon} size={20} color="#5B6B75" style={{ marginRight: 8 }} />
        ) : null}
        <TextInput
          placeholderTextColor="#8A9AA3"
          secureTextEntry={showSecure}
          className="flex-1 py-3 font-sans text-base text-ink dark:text-ink-inverse"
          {...props}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
            onPress={() => setHidden((value) => !value)}
            hitSlop={8}
            className="px-1 py-2"
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color="#5B6B75" />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="font-sans text-sm text-signal">{error}</Text> : null}
    </View>
  );
}
