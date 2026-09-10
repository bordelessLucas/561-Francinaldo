import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect, type Href } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import type { AnalysisConfidence, AnalysisRecord, RiskSeverity } from '@/lib/types';
import {
  BackLink,
  Body,
  Button,
  Caption,
  Container,
  ErrorState,
  Heading,
  Label,
  LoadingState,
  Surface,
  safeBack,
} from '@/src/components';
import { getAnalysisById } from '@/src/services/analysis.service';

const SEVERITY_LABEL: Record<RiskSeverity, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

const CONFIDENCE_LABEL: Record<AnalysisConfidence, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

/**
 * Detalhe de uma análise — resultado textual (Sprint 5A).
 */
export function AnalysisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { colors } = useAppTheme();
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
    return (
      <Container>
        <BackLink className="mb-4" fallbackHref={'/(app)/history' as Href} />
        <LoadingState message="Abrindo análise..." />
      </Container>
    );
  }

  if (error || !record) {
    return (
      <ErrorState
        withContainer
        message={error ?? 'Análise não encontrada.'}
        actionLabel="Voltar ao histórico"
        onAction={() => safeBack('/(app)/history' as Href)}
        secondaryActionLabel="Ir para início"
        onSecondaryAction={() => router.replace('/(app)/' as Href)}
      />
    );
  }

  const result = record.result;

  return (
    <Container scroll>
      <BackLink className="mb-4" fallbackHref={'/(app)/history' as Href} />

      <View className="mb-6 gap-2">
        <Heading>Detalhe da análise</Heading>
        <Caption>
          {new Date(record.createdAt).toLocaleString('pt-BR')} ·{' '}
          {record.source === 'camera' ? 'Câmera' : 'Galeria'}
        </Caption>
      </View>

      {record.status === 'failed' ? (
        <Surface tone="signal" className="mb-4">
          <Label>Análise não concluída</Label>
          <Body className="mt-2">{record.errorMessage ?? 'Tente realizar uma nova análise.'}</Body>
        </Surface>
      ) : null}

      {record.inspectorNote ? (
        <Surface tone="elevated" className="mb-4">
          <Caption className="font-sansSemi">Contexto do inspetor</Caption>
          <Body className="mt-2">{record.inspectorNote}</Body>
        </Surface>
      ) : null}

      {result ? (
        <View className="gap-4">
          {result.needsInspectorReview ||
          result.inspectorGuidance ||
          (result.limitations && result.limitations.length > 0) ? (
            <Surface tone="signal">
              <Label>Atenção do inspetor</Label>
              {result.overallConfidence ? (
                <Caption className="mt-2">
                  Confiança geral: {CONFIDENCE_LABEL[result.overallConfidence]}
                </Caption>
              ) : null}
              {result.inspectorGuidance ? (
                <Body className="mt-2">{result.inspectorGuidance}</Body>
              ) : null}
              {result.limitations?.map((item) => (
                <Caption key={item} className="mt-1">
                  • {item}
                </Caption>
              ))}
            </Surface>
          ) : null}

          <Surface>
            <Label>Riscos identificados</Label>
            <View className="mt-4 gap-4">
              {result.risks.map((risk) => (
                <View key={risk.id} className="gap-1">
                  <Label>
                    {risk.title} · {SEVERITY_LABEL[risk.severity]}
                    {risk.confidence ? ` · conf. ${CONFIDENCE_LABEL[risk.confidence]}` : ''}
                  </Label>
                  <Caption>{risk.description}</Caption>
                  {risk.uncertaintyNote ? (
                    <Caption style={{ color: colors.signal }}>
                      Verificar: {risk.uncertaintyNote}
                    </Caption>
                  ) : null}
                </View>
              ))}
            </View>
          </Surface>

          <Surface>
            <Label>Medidas de controle</Label>
            <View className="mt-4 gap-3">
              {result.controls.map((control, index) => {
                const riskTitle =
                  result.risks.find((r) => r.id === control.riskId)?.title ?? control.riskId;
                return (
                  <View key={`${control.riskId}-${index}`} className="gap-1">
                    <Caption className="font-sansSemi" style={{ color: colors.brandDark }}>
                      {riskTitle}
                    </Caption>
                    <Body>{control.measure}</Body>
                  </View>
                );
              })}
            </View>
          </Surface>

          <Surface>
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
          </Surface>
        </View>
      ) : (
        <Body>Nenhum resultado estruturado disponível nesta análise.</Body>
      )}

      <Button
        label="Nova análise"
        onPress={() => router.push('/(app)/analysis' as Href)}
        className="mt-8"
      />
    </Container>
  );
}
