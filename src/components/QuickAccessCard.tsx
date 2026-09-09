import { View } from 'react-native';

import { Button, Caption, Label, Surface } from '@/src/components';

type QuickAccessCardProps = {
  title: string;
  description: string;
  onPress: () => void;
};

/**
 * Card de atalho — botão "Abrir" alinhado na base, independente do texto.
 */
export function QuickAccessCard({ title, description, onPress }: QuickAccessCardProps) {
  return (
    <Surface className="flex-1" style={{ minHeight: 168 }}>
      <View className="flex-1 justify-between">
        <View>
          <Label>{title}</Label>
          <Caption className="mt-2">{description}</Caption>
        </View>
        <Button label="Abrir" variant="outline" onPress={onPress} className="mt-4 min-h-12" />
      </View>
    </Surface>
  );
}
