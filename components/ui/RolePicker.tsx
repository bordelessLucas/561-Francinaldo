import { Text, Pressable, View } from 'react-native';

import type { UserRole } from '@/lib/types';

const options: { value: UserRole; label: string; description: string }[] = [
  {
    value: 'technician',
    label: 'Técnico',
    description: 'Registro e vistoria em campo',
  },
  {
    value: 'manager',
    label: 'Gestor',
    description: 'Acompanhamento da área',
  },
];

type RolePickerProps = {
  value: UserRole;
  onChange: (role: UserRole) => void;
};

export function RolePicker({ value, onChange }: RolePickerProps) {
  return (
    <View className="gap-2">
      <Text className="font-sansMedium text-sm text-ink-soft">Perfil de uso</Text>
      <View className="flex-row gap-3">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              className={`flex-1 rounded-2xl border px-3 py-4 ${
                selected ? 'border-brand bg-brand-mist' : 'border-line bg-white'
              }`}
            >
              <Text className="font-sansSemi text-base text-ink">{option.label}</Text>
              <Text className="mt-1 font-sans text-xs leading-4 text-ink-muted">
                {option.description}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
