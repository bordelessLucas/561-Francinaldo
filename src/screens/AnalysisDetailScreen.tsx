import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect, type Href } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import type { AnalysisRecord, RiskSeverity } from '@/lib/types';
import {
  Body,
  Button,
  Caption,
  Container,
  ErrorState,
  Heading,
  Label,
  LoadingState,
} from '@/src/components';
import { getAnalysisById } from '@/src/services/analysis.service';

const SEVERITY_LABEL: Record<RiskSeverity, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

/**
 * Detalhe de uma análise — resultado textual (Sprint 5A).
 */
export function AnalysisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id || !user) {
      setError('Análise não encontrada.');
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const next = await getAnalysisById(id);
      if (!next || next.uid !== user.uid) {
        setError('Análise não encontrada.');
        setRecord(null);
      } else {
        setRecord(next);
      }
    } catch {
      setError('Não foi possível abrir esta análise.');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load]),
  );

  if (loading) {
    return <LoadingState message="Abrindo análise..." />;
  }

  if (error || !record) {
    return (
      <ErrorState
        message={error ?? 'Análise não encontrada.'}
        actionLabel="Voltar"
        onAction={() => router.back()}
      />
    );
  }

  const result = record.result;

  return (
    <Container scroll>
      <Pressable onPress={() => router.back()} className="mb-4 self-start py-1">
        <Caption className="font-sansSemi text-brand-dark">Voltar</Caption>
      </Pressable>

      <View className="mb-6 gap-2">
        <Heading>Detalhe da análise</Heading>
        <Caption>
          {new Date(record.createdAt).toLocaleString('pt-BR')} ·{' '}
          {record.source === 'camera' ? 'Câmera' : 'Galeria'}
        </Caption>
      </View>

      {record.status === 'failed' ? (
        <View className="mb-4 rounded-3xl bg-signal-soft px-5 py-4">
          <Label>Análise não concluída</Label>
          <Body className="mt-2">{record.errorMessage ?? 'Tente realizar uma nova análise.'}</Body>
        </View>
      ) : null}

      {result ? (
        <View className="gap-4">
          <View className="rounded-3xl border border-line bg-surface px-5 py-5 dark:border-line-dark dark:bg-surface-dark">
            <Label>Riscos identificados</Label>
            <View className="mt-4 gap-4">
              {result.risks.map((risk) => (
                <View key={risk.id} className="gap-1">
                  <Label>
                    {risk.title} · {SEVERITY_LABEL[risk.severity]}
                  </Label>
                  <Caption>{risk.description}</Caption>
                </View>
              ))}
            </View>
          </View>

          <View className="rounded-3xl border border-line bg-surface px-5 py-5 dark:border-line-dark dark:bg-surface-dark">
            <Label>Medidas de controle</Label>
            <View className="mt-4 gap-3">
              {result.controls.map((control, index) => {
                const riskTitle =
                  result.risks.find((r) => r.id === control.riskId)?.title ?? control.riskId;
                return (
                  <View key={`${control.riskId}-${index}`} className="gap-1">
                    <Caption className="font-sansSemi text-brand-dark">{riskTitle}</Caption>
                    <Body>{control.measure}</Body>
                  </View>
                );
              })}
            </View>
          </View>

          <View className="rounded-3xl border border-line bg-surface px-5 py-5 dark:border-line-dark dark:bg-surface-dark">
            <Label>NRs relacionadas</Label>
            <View className="mt-4 gap-3">
              {result.nrs.map((nr) => (
                <View key={nr.code} className="gap-1">
                  <Label>
                    {nr.code} — {nr.title}
                  </Label>
                  <Caption>{nr.relevance}</Caption>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <Body className="text-ink-muted">Nenhum resultado estruturado disponível nesta análise.</Body>
      )}

      <Button
        label="Nova análise"
        onPress={() => router.push('/(app)/analysis' as Href)}
        className="mt-8"
      />
    </Container>
  );
}
