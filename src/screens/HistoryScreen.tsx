import { View } from 'react-native';

import { Body, Caption, Container, Heading, Label } from '@/src/components';
import { HISTORY_MOCK_ITEMS } from '@/src/services/mocks/history.mock';

/**
 * Histórico — lista de exemplo para validar UX até a lista real do Firestore.
 */
export function HistoryScreen() {
  return (
    <Container scroll>
      <View className="mb-8 mt-2 gap-2">
        <Heading>Histórico</Heading>
        <Body>Suas análises recentes, com local, setor e quantidade de riscos.</Body>
      </View>

      <View className="gap-3">
        {HISTORY_MOCK_ITEMS.map((item) => (
          <View key={item.id} className="rounded-3xl border border-line bg-white px-5 py-5">
            <View className="flex-row items-start justify-between gap-2">
              <View className="flex-1">
                <Label>{item.title}</Label>
                <Caption className="mt-1">
                  {item.place} · {item.sector}
                </Caption>
              </View>
              <Caption className="text-brand-dark">{item.statusLabel}</Caption>
            </View>
            <View className="mt-4 flex-row items-center justify-between">
              <Caption>{item.dateLabel}</Caption>
              <Caption>
                {item.riskCount} {item.riskCount === 1 ? 'risco' : 'riscos'}
              </Caption>
            </View>
          </View>
        ))}
      </View>

      <Caption className="mt-6 text-ink-muted">
        Exemplos para mostrar como o histórico ficará organizado.
      </Caption>
    </Container>
  );
}
