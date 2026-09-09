import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { router, useFocusEffect, type Href } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import type { AnalysisRecord, AnalysisStatus } from '@/lib/types';
import {
  Body,
  Button,
  Caption,
  Container,
  EmptyState,
  ErrorState,
  FilterChips,
  Heading,
  Label,
  LoadingState,
  Surface,
} from '@/src/components';
import { listAnalysesByUser } from '@/src/services/analysis.service';

const STATUS_LABEL: Record<AnalysisStatus, string> = {
  pending: 'Pendente',
  uploaded: 'Enviada',
  analyzing: 'Analisando',
  done: 'Concluída',
  failed: 'Falhou',
};

type HistoryFilter =
  | 'all'
  | 'done'
  | 'failed'
  | 'in_progress'
  | 'camera'
  | 'gallery';

const FILTER_OPTIONS: { value: HistoryFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'done', label: 'Concluídas' },
  { value: 'failed', label: 'Falhas' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'camera', label: 'Câmera' },
  { value: 'gallery', label: 'Galeria' },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function summaryTitle(item: AnalysisRecord): string {
  const first = item.result?.risks?.[0]?.title;
  if (item.status === 'failed') return 'Análise incompleta';
  if (first) return `Análise · ${first}`;
  return 'Análise de situação';
}

function matchesFilter(item: AnalysisRecord, filter: HistoryFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'done':
      return item.status === 'done';
    case 'failed':
      return item.status === 'failed';
    case 'in_progress':
      return item.status === 'pending' || item.status === 'uploaded' || item.status === 'analyzing';
    case 'camera':
      return item.source === 'camera';
    case 'gallery':
      return item.source === 'gallery';
    default:
      return true;
  }
}

/**
 * Histórico — listagem com filtros por status e origem.
 */
export function HistoryScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [items, setItems] = useState<AnalysisRecord[]>([]);
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const next = await listAnalysesByUser(user.uid);
      setItems(next);
    } catch {
      setError('Não foi possível carregar o histórico. Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load]),
  );

  const filteredItems = useMemo(
    () => items.filter((item) => matchesFilter(item, filter)),
    [items, filter],
  );

  if (loading) {
    return (
      <Container>
        <LoadingState message="Carregando histórico..." />
      </Container>
    );
  }

  if (error) {
    return (
      <ErrorState
        withContainer
        message={error}
        actionLabel="Tentar novamente"
        onAction={() => {
          setLoading(true);
          void load();
        }}
        secondaryActionLabel="Ir para início"
        onSecondaryAction={() => router.replace('/(app)/' as Href)}
      />
    );
  }

  return (
    <Container scroll>
      <View className="mb-6 mt-2 gap-2">
        <Heading>Histórico</Heading>
        <Body>Suas análises salvas, com status e riscos identificados.</Body>
      </View>

      {items.length > 0 ? (
        <View className="mb-5 gap-3">
          <Label>Filtrar</Label>
          <FilterChips options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
          <Caption>
            {filteredItems.length}{' '}
            {filteredItems.length === 1 ? 'registro' : 'registros'}
            {filter !== 'all' ? ` · ${FILTER_OPTIONS.find((o) => o.value === filter)?.label}` : ''}
          </Caption>
        </View>
      ) : null}

      {items.length === 0 ? (
        <View className="gap-4">
          <EmptyState
            title="Nenhuma análise ainda"
            description="Quando você concluir uma análise, ela aparece aqui."
          />
          <Button label="Nova análise" onPress={() => router.push('/(app)/analysis' as Href)} />
        </View>
      ) : filteredItems.length === 0 ? (
        <View className="gap-4">
          <EmptyState
            title="Nenhum resultado neste filtro"
            description="Tente outro tipo de histórico ou volte para Todas."
          />
          <Button label="Mostrar todas" variant="outline" onPress={() => setFilter('all')} />
        </View>
      ) : (
        <View className="gap-3">
          {filteredItems.map((item) => {
            const riskCount = item.result?.risks?.length ?? 0;
            return (
              <Surface
                key={item.id}
                onPress={() => router.push(`/(app)/history/${item.id}` as Href)}
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Label>{summaryTitle(item)}</Label>
                    <Caption className="mt-1">
                      {item.source === 'camera' ? 'Câmera' : 'Galeria'}
                      {item.localOnly ? ' · sem foto na nuvem' : ''}
                    </Caption>
                  </View>
                  <Caption style={{ color: colors.brandDark }}>
                    {STATUS_LABEL[item.status]}
                  </Caption>
                </View>
                <View className="mt-4 flex-row items-center justify-between">
                  <Caption>{formatDate(item.createdAt)}</Caption>
                  <Caption>
                    {riskCount} {riskCount === 1 ? 'risco' : 'riscos'}
                  </Caption>
                </View>
              </Surface>
            );
          })}
          <Surface
            bordered={false}
            tone="elevated"
            className="mt-2"
            onPress={() => {
              setRefreshing(true);
              void load();
            }}
          >
            <Caption className="text-center" style={{ color: colors.brandDark }}>
              {refreshing ? 'Atualizando…' : 'Atualizar lista'}
            </Caption>
          </Surface>
        </View>
      )}
    </Container>
  );
}
