import { Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';

/**
 * Estrutura inicial do histórico.
 * Sem mocks: estado vazio real até existirem análises.
 */
export default function HistoryScreen() {
  return (
    <Screen>
      <View className="mb-8 mt-2 gap-2">
        <Text className="font-display text-3xl text-ink">Histórico</Text>
        <Text className="font-sans text-base leading-6 text-ink-muted">
          Suas análises aparecerão aqui com data, local, setor e status.
        </Text>
      </View>

      <EmptyState
        title="Nenhuma análise realizada"
        description="Quando você realizar uma análise, ela aparecerá aqui."
      />
    </Screen>
  );
}
