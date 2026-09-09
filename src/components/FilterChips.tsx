import { Pressable, ScrollView, Text, View } from 'react-native';

import { useAppTheme } from '@/contexts/ThemeContext';

export type FilterChipOption<T extends string> = {
  value: T;
  label: string;
};

type FilterChipsProps<T extends string> = {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/** Filtros horizontais — chips com tokens do tema ativo. */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: FilterChipsProps<T>) {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="grow-0"
      contentContainerStyle={{ gap: 8, paddingRight: 4 }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className="rounded-full px-4 py-2.5 active:opacity-90"
            style={{
              backgroundColor: selected ? colors.brand : colors.surface,
              borderWidth: 1,
              borderColor: selected ? colors.brand : colors.line,
            }}
          >
            <Text
              className="font-sansSemi text-sm"
              style={{ color: selected ? colors.white : colors.ink }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
      <View className="w-1" />
    </ScrollView>
  );
}
