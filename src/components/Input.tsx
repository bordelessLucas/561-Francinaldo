import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useAppTheme } from '@/contexts/ThemeContext';

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  className?: string;
};

/** Input atômico — contraste do tema ativo. */
export function Input({
  label,
  error,
  leftIcon,
  isPassword = false,
  secureTextEntry,
  className,
  ...props
}: InputProps) {
  const { colors } = useAppTheme();
  const [hidden, setHidden] = useState(true);
  const showSecure = isPassword ? hidden : Boolean(secureTextEntry);

  return (
    <View className="w-full gap-2">
      <Text className="font-sansMedium text-sm" style={{ color: colors.inkSoft }}>
        {label}
      </Text>
      <View
        className={`min-h-14 flex-row items-center rounded-2xl border px-3 ${className ?? ''}`}
        style={{
          backgroundColor: colors.surface,
          borderColor: error ? colors.signal : colors.line,
        }}
      >
        {leftIcon ? (
          <Ionicons name={leftIcon} size={20} color={colors.inkMuted} style={{ marginRight: 8 }} />
        ) : null}
        <TextInput
          placeholderTextColor={colors.inkMuted}
          secureTextEntry={showSecure}
          className="flex-1 py-3 font-sans text-base"
          style={{ color: colors.ink }}
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
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.inkMuted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text className="font-sans text-sm" style={{ color: colors.signal }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
