import { Text, TextInput, View, type TextInputProps } from 'react-native';

type InputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function Input({ label, error, className, ...props }: InputProps & { className?: string }) {
  return (
    <View className="w-full gap-2">
      <Text className="font-sansMedium text-sm text-ink-soft">{label}</Text>
      <TextInput
        placeholderTextColor="#8A9AA3"
        className={`min-h-14 rounded-2xl border bg-white px-4 font-sans text-base text-ink ${
          error ? 'border-signal' : 'border-line'
        } ${className ?? ''}`}
        {...props}
      />
      {error ? <Text className="font-sans text-sm text-signal">{error}</Text> : null}
    </View>
  );
}
