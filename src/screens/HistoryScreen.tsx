import { View } from 'react-native';

import { Body, Container, EmptyState, Heading } from '@/src/components';

/** Histórico — estado vazio real até existirem análises. */
export function HistoryScreen() {
  return (
    <Container>
      <View className="mb-8 mt-2 gap-2">
        <Heading>Histórico</Heading>
        <Body>Suas análises aparecerão aqui com data, local, setor e status.</Body>
      </View>

      <EmptyState
        title="Nenhuma análise realizada"
        description="Quando você realizar uma análise, ela aparecerá aqui."
      />
    </Container>
  );
}
