import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useFocusEffect, type Href } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import type { AnalysisRecord, AnalysisStatus } from '@/lib/types';
import {
  Body,
  Button,
  Caption,
  Container,
  EmptyState,
  ErrorState,
  Heading,
  Label,
  LoadingState,
} from '@/src/components';
import { listAnalysesByUser } from '@/src/services/analysis.service';

const STATUS_LABEL: Record<AnalysisStatus, string> = {
  pending: 'Pendente',
  uploaded: 'Enviada',
  analyzing: 'Analisando',
  done: 'Concluída',
  failed: 'Falhou',
};

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

/**
 * Sprint 5A — histórico real do Firestore (sem exigir imagem).
 */
export function HistoryScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<AnalysisRecord[]>([]);
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

  if (loading) {
    return <LoadingState message="Carregando histórico..." />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onAction={() => {
          setLoading(true);
          void load();
        }}
      />
    );
  }

  return (
    <Container scroll>
      <View className="mb-8 mt-2 gap-2">
        <Heading>Histórico</Heading>
        <Body>Suas análises salvas, com status e riscos identificados.</Body>
      </View>

      {items.length === 0 ? (
        <View className="gap-4">
          <EmptyState
            title="Nenhuma análise ainda"
            description="Quando você concluir uma análise, ela aparece aqui."
          />
          <Button label="Nova análise" onPress={() => router.push('/(app)/analysis' as Href)} />
        </View>
      ) : (
        <View className="gap-3">
          {items.map((item) => {
            const riskCount = item.result?.risks?.length ?? 0;
            return (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/(app)/history/${item.id}` as Href)}
                className="rounded-3xl border border-line bg-surface px-5 py-5 active:bg-canvas dark:border-line-dark dark:bg-surface-dark dark:active:bg-canvas-dark"
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Label>{summaryTitle(item)}</Label>
                    <Caption className="mt-1">
                      {item.source === 'camera' ? 'Câmera' : 'Galeria'}
                      {item.localOnly ? ' · sem foto na nuvem' : ''}
                    </Caption>
                  </View>
                  <Caption className="text-brand-dark dark:text-brand-accent">
                    {STATUS_LABEL[item.status]}
                  </Caption>
                </View>
                <View className="mt-4 flex-row items-center justify-between">
                  <Caption>{formatDate(item.createdAt)}</Caption>
                  <Caption>
                    {riskCount} {riskCount === 1 ? 'risco' : 'riscos'}
                  </Caption>
                </View>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => {
              setRefreshing(true);
              void load();
            }}
            className="mt-2 py-3"
          >
            <Caption className="text-center text-brand-dark">
              {refreshing ? 'Atualizando…' : 'Atualizar lista'}
            </Caption>
          </Pressable>
        </View>
      )}
    </Container>
  );
}
