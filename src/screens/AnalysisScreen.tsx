import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { router, type Href } from 'expo-router';

import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import type {
  AnalysisConfidence,
  AnalysisResult,
  AnalysisSource,
  RiskSeverity,
} from '@/lib/types';
import {
  BackLink,
  Body,
  Button,
  Caption,
  Container,
  Heading,
  Label,
  Surface,
} from '@/src/components';
import {
  runAnalysisQueue,
  type AnalysisQueueItem,
} from '@/src/services/analysis-queue.service';
import { runAnalysisWithoutUpload } from '@/src/services/analysis.service';
import {
  MAX_ANALYSIS_BATCH,
  pickFromCamera,
  pickMultipleFromGallery,
  type PickedImage,
} from '@/src/services/media.service';

type Step = 'idle' | 'preview' | 'analyzing' | 'result' | 'batch_result' | 'error';

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

const QUEUE_STATUS_LABEL: Record<AnalysisQueueItem['status'], string> = {
  queued: 'Na fila',
  analyzing: 'Analisando',
  done: 'Concluída',
  failed: 'Falhou',
};

function getCaptureErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    switch (error.message) {
      case 'CAMERA_PERMISSION_DENIED':
        return 'Permissão de câmera negada. Ative nas configurações do aparelho.';
      case 'GALLERY_PERMISSION_DENIED':
        return 'Permissão de galeria negada. Ative nas configurações do aparelho.';
      case 'IMAGE_READ_FAILED':
        return 'Não foi possível ler a imagem selecionada.';
      case 'AI_MISSING_IMAGE':
        return 'Selecione ao menos uma imagem para continuar.';
      case 'AI_PROVIDER_NOT_READY':
        return 'A análise assistida está indisponível. Configure OPENAI_API_KEY ou a URL da API Netlify.';
      case 'AI_AUTH_FAILED':
        return 'Falha de autenticação com a IA. Confira a chave OpenAI no ambiente.';
      case 'AI_QUOTA_EXCEEDED':
        return 'A conta OpenAI está sem créditos. Adicione saldo em platform.openai.com (Billing) e tente de novo.';
      case 'AI_BAD_IMAGE':
        return 'A imagem não pôde ser analisada. Tente outra foto (boa iluminação, JPEG).';
      case 'AI_UPSTREAM_ERROR':
        return 'O provedor de IA não respondeu corretamente. Tente novamente em instantes.';
      case 'AI_INVALID_JSON':
      case 'AI_INVALID_PAYLOAD':
      case 'AI_EMPTY_RISKS':
      case 'AI_EMPTY_RESPONSE':
        return 'A IA retornou um resultado incompleto. Tente outra foto, acrescente um contexto ou tente de novo.';
      case 'STORAGE_UPLOAD_DISABLED':
        return 'A análise não depende de armazenamento na nuvem. Tente novamente o fluxo local.';
      default:
        break;
    }
  }

  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: string }).code)
      : '';

  if (code.startsWith('storage/')) {
    return 'Falha no envio da imagem. Verifique a conexão e tente de novo.';
  }
  if (code === 'permission-denied') {
    return 'Sem permissão para registrar a análise. Faça login novamente.';
  }

  return 'Não foi possível concluir a análise. Tente novamente.';
}

function mergeBatch(current: PickedImage[], incoming: PickedImage[]): PickedImage[] {
  const seen = new Set(current.map((item) => item.localUri));
  const next = [...current];
  for (const item of incoming) {
    if (seen.has(item.localUri)) continue;
    if (next.length >= MAX_ANALYSIS_BATCH) break;
    seen.add(item.localUri);
    next.push(item);
  }
  return next;
}

/**
 * Análise em lote — várias fotos na UI; fila sequencial (1 Vision por vez).
 */
export function AnalysisScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [step, setStep] = useState<Step>('idle');
  const [batch, setBatch] = useState<PickedImage[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [sessionUri, setSessionUri] = useState<string | null>(null);
  const [sessionSource, setSessionSource] = useState<AnalysisSource>('camera');
  const [inspectorNote, setInspectorNote] = useState('');
  const [lastInspectorNote, setLastInspectorNote] = useState<string | null>(null);
  const [queueItems, setQueueItems] = useState<AnalysisQueueItem[]>([]);
  const [queueProgress, setQueueProgress] = useState({ index: 0, total: 0 });

  const remainingSlots = MAX_ANALYSIS_BATCH - batch.length;
  const activePhoto = batch[activeIndex] ?? batch[0] ?? null;

  const batchSummary = useMemo(() => {
    const done = queueItems.filter((item) => item.status === 'done').length;
    const failed = queueItems.filter((item) => item.status === 'failed').length;
    return { done, failed, total: queueItems.length };
  }, [queueItems]);

  const resetSession = useCallback(() => {
    setBatch([]);
    setActiveIndex(0);
    setResult(null);
    setSavedId(null);
    setSessionUri(null);
    setInspectorNote('');
    setLastInspectorNote(null);
    setQueueItems([]);
    setQueueProgress({ index: 0, total: 0 });
    setError(null);
  }, []);

  async function handleAddFromCamera() {
    if (!user) {
      setError('Faça login para registrar uma análise.');
      return;
    }
    if (remainingSlots <= 0) {
      setError(`Você pode enviar até ${MAX_ANALYSIS_BATCH} fotos por vez.`);
      return;
    }

    setError(null);
    setPicking(true);
    try {
      const next = await pickFromCamera();
      if (!next) return;
      setBatch((prev) => {
        const merged = mergeBatch(prev, [next]);
        setActiveIndex(merged.length - 1);
        return merged;
      });
      setStep('preview');
      setResult(null);
      setSavedId(null);
      setQueueItems([]);
    } catch (err) {
      setError(getCaptureErrorMessage(err));
    } finally {
      setPicking(false);
    }
  }

  async function handleAddFromGallery() {
    if (!user) {
      setError('Faça login para registrar uma análise.');
      return;
    }
    if (remainingSlots <= 0) {
      setError(`Você pode enviar até ${MAX_ANALYSIS_BATCH} fotos por vez.`);
      return;
    }

    setError(null);
    setPicking(true);
    try {
      const next = await pickMultipleFromGallery(remainingSlots);
      if (!next.length) return;
      setBatch((prev) => {
        const merged = mergeBatch(prev, next);
        setActiveIndex(Math.max(0, merged.length - next.length));
        return merged;
      });
      setStep('preview');
      setResult(null);
      setSavedId(null);
      setQueueItems([]);
    } catch (err) {
      setError(getCaptureErrorMessage(err));
    } finally {
      setPicking(false);
    }
  }

  function handleRemovePhoto(uri: string) {
    setBatch((prev) => {
      const next = prev.filter((item) => item.localUri !== uri);
      setActiveIndex((current) => {
        if (next.length === 0) return 0;
        return Math.min(current, next.length - 1);
      });
      if (next.length === 0) {
        setStep('idle');
      }
      return next;
    });
  }

  async function handleConfirmBatch() {
    if (!user) {
      setError('Faça login para registrar uma análise.');
      return;
    }
    if (batch.length === 0) {
      setError('Selecione ao menos uma imagem para continuar.');
      return;
    }

    const note = inspectorNote.trim() || undefined;
    setError(null);
    setStep('analyzing');
    setQueueProgress({ index: 0, total: batch.length });
    setQueueItems(
      batch.map((item, index) => ({
        id: `local-${index}`,
        localUri: item.localUri,
        source: item.source,
        status: 'queued',
      })),
    );

    try {
      const finished = await runAnalysisQueue({
        uid: user.uid,
        items: batch,
        inspectorNote: note,
        onProgress: ({ index, total, items }) => {
          setQueueProgress({ index, total });
          setQueueItems(items);
        },
      });

      setQueueItems(finished);
      setLastInspectorNote(note ?? null);

      if (finished.length === 1 && finished[0].status === 'done') {
        setResult(finished[0].result ?? null);
        setSavedId(finished[0].analysisId ?? null);
        setSessionUri(finished[0].localUri);
        setSessionSource(finished[0].source);
        setStep('result');
        return;
      }

      if (finished.every((item) => item.status === 'failed')) {
        setError(
          getCaptureErrorMessage(
            new Error(finished[0]?.errorMessage ?? 'AI_UPSTREAM_ERROR'),
          ),
        );
        setStep('error');
        return;
      }

      setStep('batch_result');
    } catch (err) {
      setError(getCaptureErrorMessage(err));
      setStep('error');
    }
  }

  async function handleReanalyzeSingle() {
    if (!user || !sessionUri) {
      setError('A foto desta sessão não está mais disponível. Monte um novo lote.');
      setStep('idle');
      return;
    }
    if (!inspectorNote.trim()) {
      setError('Descreva o que a IA não identificou ou o contexto extra para reanalisar.');
      return;
    }

    setError(null);
    setStep('analyzing');
    setQueueProgress({ index: 0, total: 1 });
    try {
      const record = await runAnalysisWithoutUpload({
        uid: user.uid,
        localUri: sessionUri,
        source: sessionSource,
        inspectorNote: inspectorNote.trim(),
      });
      setResult(record.result ?? null);
      setSavedId(record.id);
      setLastInspectorNote(inspectorNote.trim());
      setQueueItems([
        {
          id: record.id,
          localUri: sessionUri,
          source: sessionSource,
          status: 'done',
          analysisId: record.id,
          result: record.result,
        },
      ]);
      setStep('result');
    } catch (err) {
      setError(getCaptureErrorMessage(err));
      setStep('error');
    }
  }

  async function handleRetryFailedInBatch() {
    if (!user) return;
    const failed = queueItems.filter((item) => item.status === 'failed');
    if (failed.length === 0) return;

    const note = inspectorNote.trim() || lastInspectorNote || undefined;
    setError(null);
    setStep('analyzing');

    const retryInput = failed.map((item) => ({
      localUri: item.localUri,
      source: item.source,
    }));

    try {
      const finished = await runAnalysisQueue({
        uid: user.uid,
        items: retryInput,
        inspectorNote: note,
        onProgress: ({ index, total, items }) => {
          setQueueProgress({ index, total });
          setQueueItems((prev) => {
            const byUri = new Map(items.map((item) => [item.localUri, item]));
            return prev.map((item) => byUri.get(item.localUri) ?? item);
          });
        },
      });

      setQueueItems((prev) => {
        const byUri = new Map(finished.map((item) => [item.localUri, item]));
        return prev.map((item) => byUri.get(item.localUri) ?? item);
      });
      setLastInspectorNote(note ?? null);
      setStep('batch_result');
    } catch (err) {
      setError(getCaptureErrorMessage(err));
      setStep('error');
    }
  }

  function handleNewAnalysis() {
    resetSession();
    setStep('idle');
  }

  function handleLeaveFlow() {
    resetSession();
    setStep('idle');
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(app)/' as Href);
  }

  const analyzingLabel =
    queueProgress.total > 1
      ? `Analisando foto ${Math.min(queueProgress.index + 1, queueProgress.total)} de ${queueProgress.total}`
      : 'Analisando com IA…';

  return (
    <Container scroll>
      {step !== 'idle' ? (
        <BackLink
          className="mb-2 mt-2"
          label={step === 'analyzing' ? 'Cancelar' : 'Voltar'}
          fallbackHref={'/(app)/' as Href}
          onPress={handleLeaveFlow}
        />
      ) : null}

      <View className="mb-8 mt-2 gap-2">
        <Heading>Nova análise</Heading>
        <Body>
          Envie uma ou várias fotos do campo. O Alpha SST analisa cada situação com a IA e
          organiza o resultado para o inspetor.
        </Body>
      </View>

      {step === 'idle' ? (
        <View className="gap-4">
          <Surface>
            <Label>Registrar situações</Label>
            <Caption className="mt-2">
              Tire fotos com a câmera ou selecione várias da galeria (até {MAX_ANALYSIS_BATCH}).
              Cada imagem recebe uma análise completa de riscos, controles e NRs.
            </Caption>

            <Button
              label="Fotografar com a câmera"
              onPress={handleAddFromCamera}
              loading={picking}
              className="mt-5"
            />
            <Button
              label="Escolher fotos da galeria"
              variant="secondary"
              onPress={handleAddFromGallery}
              disabled={picking}
              className="mt-3"
            />
          </Surface>
        </View>
      ) : null}

      {step === 'preview' && batch.length > 0 ? (
        <View className="gap-4">
          <Surface padding={false}>
            {activePhoto ? (
              <Image
                source={{ uri: activePhoto.localUri }}
                className="h-72 w-full"
                style={{ backgroundColor: colors.canvas }}
                resizeMode="cover"
                accessibilityLabel="Pré-visualização da situação"
              />
            ) : null}
            <View className="px-5 py-4">
              <Label>
                {batch.length === 1
                  ? 'Confirmar foto'
                  : `${batch.length} fotos prontas para análise`}
              </Label>
              <Caption className="mt-2">
                {batch.length === 1
                  ? 'Confirme para analisar ou adicione mais fotos ao lote.'
                  : 'As fotos serão analisadas em sequência — você acompanha o progresso de cada uma.'}
              </Caption>
            </View>
          </Surface>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3 px-1">
              {batch.map((item, index) => {
                const selected = index === activeIndex;
                return (
                  <Pressable
                    key={item.localUri}
                    onPress={() => setActiveIndex(index)}
                    className="overflow-hidden rounded-2xl"
                    style={{
                      borderWidth: 2,
                      borderColor: selected ? colors.brand : colors.line,
                    }}
                  >
                    <Image
                      source={{ uri: item.localUri }}
                      style={{ width: 72, height: 72, backgroundColor: colors.canvas }}
                    />
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View className="flex-row flex-wrap gap-2">
            {remainingSlots > 0 ? (
              <>
                <Button
                  label="Adicionar foto"
                  variant="outline"
                  onPress={handleAddFromCamera}
                  loading={picking}
                  className="min-h-12 flex-1"
                />
                <Button
                  label="Galeria"
                  variant="outline"
                  onPress={handleAddFromGallery}
                  disabled={picking}
                  className="min-h-12 flex-1"
                />
              </>
            ) : (
              <Caption>Lote completo ({MAX_ANALYSIS_BATCH} fotos).</Caption>
            )}
          </View>

          {activePhoto ? (
            <Button
              label="Remover foto selecionada"
              variant="secondary"
              onPress={() => handleRemovePhoto(activePhoto.localUri)}
            />
          ) : null}

          <Surface>
            <Label>Contexto opcional do lote</Label>
            <Caption className="mt-2">
              Vale para todas as fotos deste envio (atividade, área, o que a câmera não mostra).
            </Caption>
            <TextInput
              value={inspectorNote}
              onChangeText={setInspectorNote}
              placeholder="Ex.: britagem; turno da manhã; possível falta de EPI..."
              placeholderTextColor={colors.inkMuted}
              multiline
              textAlignVertical="top"
              className="mt-3 min-h-[88px] rounded-2xl border px-4 py-3 font-sans text-base"
              style={{
                color: colors.ink,
                backgroundColor: colors.canvasElev,
                borderColor: colors.line,
              }}
            />
          </Surface>

          <Button
            label={
              batch.length === 1
                ? 'Confirmar e analisar'
                : `Analisar ${batch.length} fotos`
            }
            onPress={handleConfirmBatch}
          />
          <Button label="Limpar e recomeçar" variant="outline" onPress={handleNewAnalysis} />
        </View>
      ) : null}

      {step === 'analyzing' ? (
        <View className="gap-4">
          <Surface className="items-center py-8">
            <ActivityIndicator size="large" color={colors.brand} />
            <Label className="mt-5">{analyzingLabel}</Label>
            <Caption className="mt-2 text-center">
              {queueProgress.total > 1
                ? 'Processando o lote com segurança, uma situação por vez.'
                : 'Identificando riscos, controles, NRs e pontos de dúvida.'}
            </Caption>
          </Surface>

          {queueItems.length > 0 ? (
            <Surface>
              <Label>Progresso do lote</Label>
              <View className="mt-4 gap-3">
                {queueItems.map((item, index) => (
                  <View key={item.id} className="flex-row items-center gap-3">
                    <Image
                      source={{ uri: item.localUri }}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        backgroundColor: colors.canvas,
                      }}
                    />
                    <View className="flex-1">
                      <Caption className="font-sansSemi">Foto {index + 1}</Caption>
                      <Caption style={{ color: colors.brandDark }}>
                        {QUEUE_STATUS_LABEL[item.status]}
                      </Caption>
                    </View>
                  </View>
                ))}
              </View>
            </Surface>
          ) : null}
        </View>
      ) : null}

      {step === 'result' && result ? (
        <View className="gap-4">
          {sessionUri ? (
            <Image
              source={{ uri: sessionUri }}
              className="h-40 w-full rounded-3xl"
              style={{ backgroundColor: colors.canvas }}
              resizeMode="cover"
            />
          ) : null}

          {result.needsInspectorReview ||
          result.overallConfidence === 'low' ||
          result.overallConfidence === 'medium' ||
          (result.limitations && result.limitations.length > 0) ? (
            <Surface tone="signal">
              <Label>Atenção do inspetor</Label>
              {result.overallConfidence ? (
                <Caption className="mt-2">
                  Confiança geral da leitura: {CONFIDENCE_LABEL[result.overallConfidence]}
                </Caption>
              ) : null}
              {result.inspectorGuidance ? (
                <Body className="mt-2">{result.inspectorGuidance}</Body>
              ) : (
                <Body className="mt-2">
                  A IA sinalizou dúvida ou limitação. Complemente com uma mensagem e reanalise.
                </Body>
              )}
              {result.limitations?.map((item) => (
                <Caption key={item} className="mt-1">
                  • {item}
                </Caption>
              ))}
            </Surface>
          ) : (
            <Surface tone="accent">
              <Caption className="font-sansSemi" style={{ color: colors.brandDark }}>
                Leitura com boa confiança
              </Caption>
              <Caption className="mt-1">
                A ferramenta apoia a inspeção; valide no local antes de decisões críticas.
              </Caption>
            </Surface>
          )}

          {lastInspectorNote ? (
            <Surface tone="elevated">
              <Caption className="font-sansSemi">Contexto usado nesta análise</Caption>
              <Body className="mt-2">{lastInspectorNote}</Body>
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

          {sessionUri ? (
            <Surface>
              <Label>Reanalisar com informação extra</Label>
              <Caption className="mt-2">
                Se a IA não identificou algo, descreva o contexto e rode de novo com a mesma foto.
              </Caption>
              <TextInput
                value={inspectorNote}
                onChangeText={setInspectorNote}
                placeholder="Ex.: não deu para ver a guarda da correia..."
                placeholderTextColor={colors.inkMuted}
                multiline
                textAlignVertical="top"
                className="mt-3 min-h-[88px] rounded-2xl border px-4 py-3 font-sans text-base"
                style={{
                  color: colors.ink,
                  backgroundColor: colors.canvasElev,
                  borderColor: colors.line,
                }}
              />
              <Button
                label="Reanalisar com esta informação"
                variant="secondary"
                onPress={handleReanalyzeSingle}
                className="mt-4"
              />
            </Surface>
          ) : null}

          {savedId ? (
            <Button
              label="Ver no histórico"
              onPress={() => router.push(`/(app)/history/${savedId}` as Href)}
            />
          ) : null}
          <Button label="Nova análise" variant="outline" onPress={handleNewAnalysis} />
        </View>
      ) : null}

      {step === 'batch_result' ? (
        <View className="gap-4">
          <Surface tone="accent">
            <Label>Lote concluído</Label>
            <Body className="mt-2">
              {batchSummary.done} concluída{batchSummary.done === 1 ? '' : 's'}
              {batchSummary.failed > 0
                ? ` · ${batchSummary.failed} com falha`
                : ''}{' '}
              de {batchSummary.total}. Cada foto gerou um registro no histórico.
            </Body>
          </Surface>

          <Surface>
            <Label>Resultados por foto</Label>
            <View className="mt-4 gap-3">
              {queueItems.map((item, index) => (
                <View
                  key={item.id}
                  className="flex-row items-center gap-3 rounded-2xl border px-3 py-3"
                  style={{ borderColor: colors.line }}
                >
                  <Image
                    source={{ uri: item.localUri }}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      backgroundColor: colors.canvas,
                    }}
                  />
                  <View className="flex-1">
                    <Label className="text-base">Foto {index + 1}</Label>
                    <Caption style={{ color: colors.brandDark }}>
                      {QUEUE_STATUS_LABEL[item.status]}
                      {item.result?.risks?.length
                        ? ` · ${item.result.risks.length} risco(s)`
                        : ''}
                    </Caption>
                    {item.status === 'failed' ? (
                      <Caption style={{ color: colors.signal }}>
                        {getCaptureErrorMessage(new Error(item.errorMessage ?? ''))}
                      </Caption>
                    ) : null}
                  </View>
                  {item.analysisId && item.status === 'done' ? (
                    <Pressable
                      onPress={() =>
                        router.push(`/(app)/history/${item.analysisId}` as Href)
                      }
                    >
                      <Caption className="font-sansSemi" style={{ color: colors.brandDark }}>
                        Abrir
                      </Caption>
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </View>
          </Surface>

          {batchSummary.failed > 0 ? (
            <Surface>
              <Label>Retentar falhas</Label>
              <Caption className="mt-2">
                Envie um contexto extra se quiser e rode de novo só as fotos que falharam.
              </Caption>
              <TextInput
                value={inspectorNote}
                onChangeText={setInspectorNote}
                placeholder="Contexto opcional para as fotos que falharam..."
                placeholderTextColor={colors.inkMuted}
                multiline
                textAlignVertical="top"
                className="mt-3 min-h-[72px] rounded-2xl border px-4 py-3 font-sans text-base"
                style={{
                  color: colors.ink,
                  backgroundColor: colors.canvasElev,
                  borderColor: colors.line,
                }}
              />
              <Button
                label="Analisar novamente as que falharam"
                variant="secondary"
                onPress={handleRetryFailedInBatch}
                className="mt-4"
              />
            </Surface>
          ) : null}

          <Button
            label="Ver histórico"
            onPress={() => router.push('/(app)/history' as Href)}
          />
          <Button label="Nova análise" variant="outline" onPress={handleNewAnalysis} />
        </View>
      ) : null}

      {step === 'error' ? (
        <View className="gap-4">
          <Surface tone="signal">
            <Label>Não foi possível analisar</Label>
            <Body className="mt-2">{error ?? 'Tente novamente.'}</Body>
          </Surface>
          {batch.length > 0 ? (
            <Button label="Tentar o lote de novo" onPress={handleConfirmBatch} />
          ) : null}
          <Button label="Montar novo lote" variant="outline" onPress={handleNewAnalysis} />
        </View>
      ) : null}

      {error && step !== 'error' ? (
        <Surface tone="signal" className="mt-5">
          <Caption style={{ color: colors.inkSoft }}>{error}</Caption>
        </Surface>
      ) : null}
    </Container>
  );
}
