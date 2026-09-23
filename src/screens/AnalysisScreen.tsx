import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { router, type Href } from 'expo-router';

import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import type {
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
  InspectionReportCard,
  Label,
  RiskLevelMeter,
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
import { transcribeInspectorNote } from '@/src/services/dictation.service';

type Step = 'idle' | 'preview' | 'analyzing' | 'result' | 'batch_result' | 'error';
const MASCOT_IMAGE = require('@/assets/brand/alpha-mascot-transparent.png');

const BLUE_UI = {
  bg: '#07111B',
  panel: '#101C28',
  panelSoft: '#162637',
  border: '#29435D',
  blue: '#1E88E5',
  text: '#F7FAFC',
  muted: '#AFC3D4',
  warning: '#F7C948',
};

const SEVERITY_LABEL: Record<RiskSeverity, string> = {
  low: 'Baixa',
  medium: 'MÃ©dia',
  high: 'Alta',
};

const QUEUE_STATUS_LABEL: Record<AnalysisQueueItem['status'], string> = {
  queued: 'Na fila',
  analyzing: 'Analisando',
  done: 'ConcluÃ­da',
  failed: 'Falhou',
};

function getComplianceTitle(result: AnalysisResult): string {
  switch (result.complianceSummary) {
    case 'no_visible_issue':
      return 'Sem problema visivel na foto';
    case 'not_applicable':
      return 'Imagem fora do contexto SST';
    case 'needs_more_context':
      return 'Precisa de mais contexto';
    case 'issues_found':
      return 'Riscos identificados';
    default:
      return result.risks.length > 0 ? 'Riscos identificados' : 'Sem riscos listados';
  }
}

function getComplianceBody(result: AnalysisResult): string {
  if (result.inspectorGuidance) return result.inspectorGuidance;
  switch (result.complianceSummary) {
    case 'no_visible_issue':
      return 'A IA nao encontrou nao conformidade visivel nesta imagem. Valide no local e complemente se houver algo fora do enquadramento.';
    case 'not_applicable':
      return 'A imagem nao parece mostrar um ambiente de trabalho ou situacao avaliavel de SST.';
    case 'needs_more_context':
      return 'A imagem nao traz informacao suficiente para um relatorio confiavel. Envie outra foto ou detalhe o contexto.';
    default:
      return 'A ferramenta apoia a inspecao; valide no local antes de decisoes criticas.';
  }
}

function getCaptureErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    switch (error.message) {
      case 'CAMERA_PERMISSION_DENIED':
        return 'PermissÃ£o de cÃ¢mera negada. Ative nas configuraÃ§Ãµes do aparelho.';
      case 'GALLERY_PERMISSION_DENIED':
        return 'PermissÃ£o de galeria negada. Ative nas configuraÃ§Ãµes do aparelho.';
      case 'IMAGE_READ_FAILED':
        return 'NÃ£o foi possÃ­vel ler a imagem selecionada.';
      case 'AI_MISSING_IMAGE':
        return 'Selecione ao menos uma imagem para continuar.';
      case 'AI_PROVIDER_NOT_READY':
        return 'A anÃ¡lise assistida estÃ¡ indisponÃ­vel. Configure OPENAI_API_KEY ou a URL da API Netlify.';
      case 'AI_AUTH_FAILED':
        return 'Falha de autenticaÃ§Ã£o com a IA. Confira a chave OpenAI no ambiente.';
      case 'AI_QUOTA_EXCEEDED':
        return 'A conta OpenAI estÃ¡ sem crÃ©ditos. Adicione saldo em platform.openai.com (Billing) e tente de novo.';
      case 'AI_BAD_IMAGE':
        return 'A imagem nÃ£o pÃ´de ser analisada. Tente outra foto (boa iluminaÃ§Ã£o, JPEG).';
      case 'AI_BAD_REQUEST':
        return 'Pedido de anÃ¡lise invÃ¡lido. Tente novamente com outra foto.';
      case 'AI_NETWORK_ERROR':
        return 'Falha de rede ao falar com a IA. Verifique a conexÃ£o e tente de novo.';
      case 'AI_UPSTREAM_ERROR':
        return 'O provedor de IA nÃ£o respondeu corretamente. Tente novamente em instantes.';
      case 'AI_INVALID_JSON':
      case 'AI_INVALID_PAYLOAD':
      case 'AI_EMPTY_RISKS':
      case 'AI_EMPTY_RESPONSE':
        return 'A IA retornou um resultado incompleto. Tente outra foto, acrescente um contexto ou tente de novo.';
      case 'STORAGE_UPLOAD_DISABLED':
        return 'A anÃ¡lise nÃ£o depende de armazenamento na nuvem. Tente novamente o fluxo local.';
      default:
        break;
    }
  }

  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: string }).code)
      : '';

  if (code.startsWith('storage/')) {
    return 'Falha no envio da imagem. Verifique a conexÃ£o e tente de novo.';
  }
  if (code === 'permission-denied') {
    return 'Sem permissÃ£o para registrar a anÃ¡lise. FaÃ§a login novamente.';
  }

  return 'NÃ£o foi possÃ­vel concluir a anÃ¡lise. Tente novamente.';
}

function getDictationErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    switch (error.message) {
      case 'STT_PROVIDER_NOT_READY':
        return 'Configure a URL da API Netlify para transcrever audio com seguranca.';
      case 'STT_NETWORK_ERROR':
        return 'Falha de rede ao transcrever o audio. Verifique a conexao e tente de novo.';
      case 'STT_MISSING_AUDIO':
      case 'STT_BAD_AUDIO':
        return 'Nao foi possivel ler o audio gravado. Grave novamente mais perto do microfone.';
      case 'AI_AUTH_FAILED':
        return 'Falha de autenticacao com a IA. Confira a chave OpenAI no servidor.';
      case 'AI_QUOTA_EXCEEDED':
        return 'A conta OpenAI esta sem creditos para transcrever agora.';
      case 'STT_EMPTY_RESPONSE':
        return 'Nao identifiquei fala no audio. Tente gravar novamente.';
      default:
        break;
    }
  }
  return 'Nao foi possivel transcrever o audio. Tente novamente ou digite o contexto.';
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
 * AnÃ¡lise em lote â€” vÃ¡rias fotos na UI; fila sequencial (1 Vision por vez).
 */
export function AnalysisScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
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
  const [generateReport, setGenerateReport] = useState(false);
  const [dictationError, setDictationError] = useState<string | null>(null);
  const [transcribingAudio, setTranscribingAudio] = useState(false);
  const [lastInspectorNote, setLastInspectorNote] = useState<string | null>(null);
  const [queueItems, setQueueItems] = useState<AnalysisQueueItem[]>([]);
  const [queueProgress, setQueueProgress] = useState({ index: 0, total: 0 });
  const analysisRunIdRef = useRef(0);

  const remainingSlots = MAX_ANALYSIS_BATCH - batch.length;
  const activePhoto = batch[activeIndex] ?? batch[0] ?? null;
  const isRecordingNote = recorderState.isRecording;

  const batchSummary = useMemo(() => {
    const done = queueItems.filter((item) => item.status === 'done').length;
    const failed = queueItems.filter((item) => item.status === 'failed').length;
    return { done, failed, total: queueItems.length };
  }, [queueItems]);

  const resetSession = useCallback(() => {
    analysisRunIdRef.current += 1;
    setBatch([]);
    setActiveIndex(0);
    setResult(null);
    setSavedId(null);
    setSessionUri(null);
    setInspectorNote('');
    setGenerateReport(false);
    setDictationError(null);
    setTranscribingAudio(false);
    setLastInspectorNote(null);
    setQueueItems([]);
    setQueueProgress({ index: 0, total: 0 });
    setError(null);
  }, []);

  async function handleAddFromCamera() {
    if (!user) {
      setError('FaÃ§a login para registrar uma anÃ¡lise.');
      return;
    }
    if (remainingSlots <= 0) {
      setError(`VocÃª pode enviar atÃ© ${MAX_ANALYSIS_BATCH} fotos por vez.`);
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
      setError('FaÃ§a login para registrar uma anÃ¡lise.');
      return;
    }
    if (remainingSlots <= 0) {
      setError(`VocÃª pode enviar atÃ© ${MAX_ANALYSIS_BATCH} fotos por vez.`);
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
      setError('FaÃ§a login para registrar uma anÃ¡lise.');
      return;
    }
    if (batch.length === 0) {
      setError('Selecione ao menos uma imagem para continuar.');
      return;
    }

    const note = inspectorNote.trim() || undefined;
    const runId = ++analysisRunIdRef.current;
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
        generateReport,
        shouldContinue: () => analysisRunIdRef.current === runId,
        onProgress: ({ index, total, items }) => {
          if (analysisRunIdRef.current !== runId) return;
          setQueueProgress({ index, total });
          setQueueItems(items);
        },
      });

      if (analysisRunIdRef.current !== runId) return;

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
      if (analysisRunIdRef.current !== runId) return;
      setError(getCaptureErrorMessage(err));
      setStep('error');
    }
  }

  async function handleToggleDictation() {
    setDictationError(null);
    try {
      if (isRecordingNote) {
        setTranscribingAudio(true);
        await recorder.stop();
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
        const uri = recorder.uri || recorder.getStatus().url;
        if (!uri) {
          throw new Error('STT_MISSING_AUDIO');
        }
        const text = await transcribeInspectorNote({ localUri: uri });
        setInspectorNote((current) => {
          const prefix = current.trim();
          return prefix ? `${prefix}\n${text}` : text;
        });
        setTranscribingAudio(false);
        return;
      }

      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        throw new Error('MIC_PERMISSION_DENIED');
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record({ forDuration: 90 });
    } catch (err) {
      if (err instanceof Error && err.message === 'MIC_PERMISSION_DENIED') {
        setDictationError('Permissao de microfone negada. Ative nas configuracoes do aparelho.');
      } else {
        setDictationError(getDictationErrorMessage(err));
      }
    } finally {
      setTranscribingAudio(false);
    }
  }

  async function handleReanalyzeSingle() {
    if (!user || !sessionUri) {
      setError('A foto desta sessÃ£o nÃ£o estÃ¡ mais disponÃ­vel. Monte um novo lote.');
      setStep('idle');
      return;
    }
    if (!inspectorNote.trim()) {
      setError('Descreva o que a IA nÃ£o identificou ou o contexto extra para reanalisar.');
      return;
    }

    setError(null);
    const runId = ++analysisRunIdRef.current;
    setStep('analyzing');
    setQueueProgress({ index: 0, total: 1 });
    try {
      const record = await runAnalysisWithoutUpload({
        uid: user.uid,
        localUri: sessionUri,
        source: sessionSource,
        inspectorNote: inspectorNote.trim(),
        generateReport,
      });
      if (analysisRunIdRef.current !== runId) return;
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
      if (analysisRunIdRef.current !== runId) return;
      setError(getCaptureErrorMessage(err));
      setStep('error');
    }
  }

  async function handleRetryFailedInBatch() {
    if (!user) return;
    const failed = queueItems.filter((item) => item.status === 'failed');
    if (failed.length === 0) return;

    const note = inspectorNote.trim() || lastInspectorNote || undefined;
    const runId = ++analysisRunIdRef.current;
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
        generateReport,
        shouldContinue: () => analysisRunIdRef.current === runId,
        onProgress: ({ index, total, items }) => {
          if (analysisRunIdRef.current !== runId) return;
          setQueueProgress({ index, total });
          setQueueItems((prev) => {
            const byUri = new Map(items.map((item) => [item.localUri, item]));
            return prev.map((item) => byUri.get(item.localUri) ?? item);
          });
        },
      });

      if (analysisRunIdRef.current !== runId) return;

      setQueueItems((prev) => {
        const byUri = new Map(finished.map((item) => [item.localUri, item]));
        return prev.map((item) => byUri.get(item.localUri) ?? item);
      });
      setLastInspectorNote(note ?? null);
      setStep('batch_result');
    } catch (err) {
      if (analysisRunIdRef.current !== runId) return;
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
      : 'Analisando com IAâ€¦';

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

      <View className="mb-4 mt-2 flex-row items-center gap-3">
        <Image source={MASCOT_IMAGE} resizeMode="contain" style={{ width: 76, height: 92 }} />
        <View className="flex-1 rounded-2xl px-4 py-3" style={{ backgroundColor: colors.canvasElev }}>
          <Label>Alpha Wolf</Label>
          <Caption className="mt-1">Me diga o contexto e envie a foto para eu analisar.</Caption>
        </View>
      </View>

      <View className="mb-8 mt-2 gap-2">
        <Heading>Nova anÃ¡lise</Heading>
        <Body>
          Envie uma ou vÃ¡rias fotos do campo. O Alpha SST analisa cada situaÃ§Ã£o com a IA e
          organiza o resultado para o inspetor.
        </Body>
      </View>

      {step === 'idle' ? (
        <View
          className="gap-4 rounded-[28px] px-4 py-5"
          style={{ backgroundColor: BLUE_UI.bg, borderWidth: 1, borderColor: BLUE_UI.border }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-sansSemi text-lg" style={{ color: BLUE_UI.text }}>
                SST ALERTA
              </Text>
              <Text className="mt-2 font-sansSemi text-sm" style={{ color: BLUE_UI.text }}>
                ANALISE DE RISCO POR IA
              </Text>
            </View>
            <Image source={MASCOT_IMAGE} resizeMode="contain" style={{ width: 54, height: 64 }} />
          </View>

          <View
            className="rounded-3xl px-4 py-5"
            style={{ backgroundColor: BLUE_UI.panel, borderWidth: 1, borderColor: BLUE_UI.border }}
          >
            <Text className="font-sansSemi text-base" style={{ color: BLUE_UI.text }}>
              Registrar situacoes
            </Text>
            <Text className="mt-2 font-sans text-sm leading-5" style={{ color: BLUE_UI.muted }}>
              Tire uma foto em campo ou escolha imagens da galeria. O Alpha Wolf analisa riscos, controles e NRs.
            </Text>

            <Pressable
              accessibilityRole="button"
              disabled={picking}
              onPress={handleAddFromCamera}
              className="mt-5 min-h-14 flex-row items-center justify-center gap-2 rounded-2xl px-5"
              style={{ backgroundColor: BLUE_UI.blue, opacity: picking ? 0.6 : 1 }}
            >
              {picking ? <ActivityIndicator color={BLUE_UI.text} /> : <Ionicons name="camera" size={20} color={BLUE_UI.text} />}
              <Text className="font-sansSemi text-sm" style={{ color: BLUE_UI.text }}>
                TIRAR FOTO PARA ANALISAR
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={picking}
              onPress={handleAddFromGallery}
              className="mt-3 min-h-14 flex-row items-center justify-center gap-2 rounded-2xl border px-5"
              style={{ borderColor: BLUE_UI.blue, opacity: picking ? 0.6 : 1 }}
            >
              <Ionicons name="images-outline" size={20} color={BLUE_UI.text} />
              <Text className="font-sansSemi text-sm" style={{ color: BLUE_UI.text }}>
                ESCOLHER FOTOS DA GALERIA
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
      {step === 'preview' && batch.length > 0 ? (
        <View
          className="-mx-3 gap-4 rounded-[28px] px-3 py-4"
          style={{ backgroundColor: BLUE_UI.bg, borderWidth: 1, borderColor: BLUE_UI.border }}
        >
          <View className="flex-row items-center justify-between px-1">
            <View>
              <Text className="font-sansSemi text-lg" style={{ color: BLUE_UI.text }}>
                SST ALERTA
              </Text>
              <Text className="mt-2 font-sansSemi text-sm" style={{ color: BLUE_UI.text }}>
                ANALISE DE RISCO POR IA
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Ionicons name="person-outline" size={20} color={BLUE_UI.text} />
              <Ionicons name="menu" size={24} color={BLUE_UI.text} />
            </View>
          </View>

          <View
            className="overflow-hidden rounded-3xl"
            style={{ backgroundColor: BLUE_UI.panel, borderWidth: 1, borderColor: BLUE_UI.border }}
          >
            <View className="relative">
              {activePhoto ? (
                <Image
                  source={{ uri: activePhoto.localUri }}
                  className="h-80 w-full"
                  style={{ backgroundColor: BLUE_UI.panelSoft }}
                  resizeMode="cover"
                  accessibilityLabel="Pre-visualizacao da situacao"
                />
              ) : null}
              <View className="absolute left-4 top-4 h-9 w-9 rounded-tl-2xl border-l-2 border-t-2" style={{ borderColor: BLUE_UI.text }} />
              <View className="absolute right-4 top-4 h-9 w-9 rounded-tr-2xl border-r-2 border-t-2" style={{ borderColor: BLUE_UI.text }} />
              <View className="absolute bottom-4 left-4 h-9 w-9 rounded-bl-2xl border-b-2 border-l-2" style={{ borderColor: BLUE_UI.text }} />
              <View className="absolute bottom-4 right-4 h-9 w-9 rounded-br-2xl border-b-2 border-r-2" style={{ borderColor: BLUE_UI.text }} />
              <View
                className="absolute right-4 top-4 flex-row items-center gap-2 rounded-full px-3 py-2"
                style={{ backgroundColor: 'rgba(7,17,27,0.82)' }}
              >
                <Ionicons name="images-outline" size={16} color={BLUE_UI.warning} />
                <Text className="font-sansSemi text-xs" style={{ color: BLUE_UI.text }}>
                  {batch.length} foto{batch.length === 1 ? '' : 's'}
                </Text>
              </View>
            </View>

            <View className="px-4 pb-4 pt-3">
              <Pressable
                accessibilityRole="button"
                onPress={handleConfirmBatch}
                className="min-h-14 flex-row items-center justify-center gap-2 rounded-2xl px-5"
                style={{ backgroundColor: BLUE_UI.blue }}
              >
                <Ionicons name="camera" size={20} color={BLUE_UI.text} />
                <Text className="font-sansSemi text-sm" style={{ color: BLUE_UI.text }}>
                  {batch.length === 1 ? 'TIRAR FOTO PARA ANALISAR' : `ANALISAR ${batch.length} FOTOS`}
                </Text>
              </Pressable>
              <Caption className="mt-3 text-center" style={{ color: BLUE_UI.muted }}>
                Contexto e relatorio sao opcionais antes do envio.
              </Caption>
            </View>
          </View>

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
                      borderColor: selected ? BLUE_UI.blue : BLUE_UI.border,
                    }}
                  >
                    <Image
                      source={{ uri: item.localUri }}
                      style={{ width: 72, height: 72, backgroundColor: BLUE_UI.panelSoft }}
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
                  style={{ borderColor: BLUE_UI.blue }}
                />
                <Button
                  label="Galeria"
                  variant="outline"
                  onPress={handleAddFromGallery}
                  disabled={picking}
                  className="min-h-12 flex-1"
                  style={{ borderColor: BLUE_UI.blue }}
                />
              </>
            ) : (
              <Caption style={{ color: BLUE_UI.muted }}>Lote completo ({MAX_ANALYSIS_BATCH} fotos).</Caption>
            )}
          </View>

          {activePhoto ? (
            <Button
              label="Remover foto selecionada"
              variant="secondary"
              onPress={() => handleRemovePhoto(activePhoto.localUri)}
              style={{ backgroundColor: BLUE_UI.panel, borderColor: BLUE_UI.border }}
            />
          ) : null}

          <View
            className="rounded-3xl px-4 py-4"
            style={{ backgroundColor: BLUE_UI.panel, borderWidth: 1, borderColor: BLUE_UI.border }}
          >
            <View className="flex-row items-center gap-3">
              <Image source={MASCOT_IMAGE} resizeMode="contain" style={{ width: 46, height: 56 }} />
              <View className="flex-1">
                <Text className="font-sansSemi text-base" style={{ color: BLUE_UI.text }}>
                  Fale com o Alpha Wolf
                </Text>
                <Text className="mt-1 font-sans text-xs" style={{ color: BLUE_UI.muted }}>
                  Diga area, atividade ou algo que a foto nao mostra.
                </Text>
              </View>
            </View>
            <TextInput
              value={inspectorNote}
              onChangeText={setInspectorNote}
              placeholder="Ex.: britagem; turno da manha; possivel falta de EPI..."
              placeholderTextColor={BLUE_UI.muted}
              multiline
              textAlignVertical="top"
              className="mt-3 min-h-[88px] rounded-2xl border px-4 py-3 font-sans text-base"
              style={{
                color: BLUE_UI.text,
                backgroundColor: BLUE_UI.panelSoft,
                borderColor: BLUE_UI.border,
              }}
            />
            <Pressable
              accessibilityRole="button"
              disabled={transcribingAudio}
              onPress={handleToggleDictation}
              className="mt-3 min-h-14 flex-row items-center justify-center gap-2 rounded-2xl px-5"
              style={{
                backgroundColor: isRecordingNote ? '#D92D20' : BLUE_UI.blue,
                opacity: transcribingAudio ? 0.6 : 1,
              }}
            >
              {transcribingAudio ? (
                <ActivityIndicator color={BLUE_UI.text} />
              ) : (
                <Ionicons name={isRecordingNote ? 'stop-circle' : 'mic'} size={20} color={BLUE_UI.text} />
              )}
              <Text className="font-sansSemi text-sm" style={{ color: BLUE_UI.text }}>
                {isRecordingNote ? 'PARAR E TRANSCREVER' : transcribingAudio ? 'TRANSCREVENDO AUDIO...' : 'FALAR CONTEXTO'}
              </Text>
            </Pressable>
            {isRecordingNote ? (
              <Caption className="mt-2" style={{ color: BLUE_UI.warning }}>
                Gravando... toque para parar e inserir o texto no contexto.
              </Caption>
            ) : null}
            {dictationError ? (
              <Caption className="mt-2" style={{ color: '#FFB4AB' }}>
                {dictationError}
              </Caption>
            ) : null}
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: generateReport }}
              onPress={() => setGenerateReport((current) => !current)}
              className="mt-4 flex-row items-center gap-3"
            >
              <View
                className="h-6 w-6 items-center justify-center rounded-md border"
                style={{
                  backgroundColor: generateReport ? BLUE_UI.blue : 'transparent',
                  borderColor: generateReport ? BLUE_UI.blue : BLUE_UI.border,
                }}
              >
                {generateReport ? <Caption style={{ color: colors.white }}>✓</Caption> : null}
              </View>
              <View className="flex-1">
                <Text className="font-sansSemi text-sm" style={{ color: BLUE_UI.text }}>
                  Gerar relatorio fotografico
                </Text>
                <Caption className="mt-1" style={{ color: BLUE_UI.muted }}>
                  Segue o modelo da inspecao: identificacao, descricao do risco e acoes.
                </Caption>
              </View>
            </Pressable>
          </View>

          <Button label="Limpar e recomecar" variant="outline" onPress={handleNewAnalysis} />
        </View>
      ) : null}
      {step === 'analyzing' ? (
        <View className="gap-4">
          <Surface className="items-center py-8">
            <ActivityIndicator size="large" color={colors.brand} />
            <Label className="mt-5">{analyzingLabel}</Label>
            <Caption className="mt-2 text-center">
              {queueProgress.total > 1
                ? 'Processando o lote com seguranÃ§a, uma situaÃ§Ã£o por vez.'
                : 'Identificando riscos, controles, NRs e pontos de dÃºvida.'}
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

          {result.risks.length > 0 || result.inspectionReport ? (
            <Surface>
              <RiskLevelMeter
                risks={result.risks}
                fallbackSeverity={result.inspectionReport?.severity}
              />
            </Surface>
          ) : null}

          <Surface tone={result.risks.length > 0 ? 'elevated' : 'accent'}>
            <Label>{getComplianceTitle(result)}</Label>
            <Body className="mt-2">{getComplianceBody(result)}</Body>
            {result.sceneType ? (
              <Caption className="mt-2">Cena: {result.sceneType}</Caption>
            ) : null}
          </Surface>

          {result.needsInspectorReview ||
          result.inspectorGuidance ||
          (result.limitations && result.limitations.length > 0) ? (
            <Surface tone="signal">
              <Label>AtenÃ§Ã£o do inspetor</Label>
              {result.overallConfidence ? (
                <Caption className="mt-2">
                  RevisÃ£o recomendada pelo Alpha Wolf
                </Caption>
              ) : null}
              {result.inspectorGuidance ? (
                <Body className="mt-2">{result.inspectorGuidance}</Body>
              ) : (
                <Body className="mt-2">
                  A IA sinalizou dÃºvida ou limitaÃ§Ã£o. Complemente com uma mensagem e reanalise.
                </Body>
              )}
              {result.limitations?.map((item) => (
                <Caption key={item} className="mt-1">
                  â€¢ {item}
                </Caption>
              ))}
            </Surface>
          ) : (
            null
          )}

          {lastInspectorNote ? (
            <Surface tone="elevated">
              <Caption className="font-sansSemi">Contexto usado nesta anÃ¡lise</Caption>
              <Body className="mt-2">{lastInspectorNote}</Body>
            </Surface>
          ) : null}

          {result.risks.length > 0 ? (
            <Surface>
              <Label>Riscos identificados</Label>
              <View className="mt-4 gap-4">
                {result.risks.map((risk) => (
                  <View key={risk.id} className="gap-1">
                    <Label>
                      {risk.title} Â· {SEVERITY_LABEL[risk.severity]}
                    </Label>
                    <Caption>{risk.description}</Caption>
                    {risk.evidence?.map((item) => (
                      <Caption key={item}>Evid?ncia: {item}</Caption>
                    ))}
                    {risk.uncertaintyNote ? (
                      <Caption style={{ color: colors.signal }}>
                        Verificar: {risk.uncertaintyNote}
                      </Caption>
                    ) : null}
                  </View>
                ))}
              </View>
            </Surface>

          ) : null}
          {result.controls.length > 0 ? (
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

          ) : null}
          {result.nrs.length > 0 ? (
            <Surface>
              <Label>NRs relacionadas</Label>
              <View className="mt-4 gap-3">
                {result.nrs.map((nr, index) => (
                  <View key={`${nr.code}-${index}`} className="gap-1">
                    <Label>
                      {nr.code} â€” {nr.title}
                    </Label>
                    <Caption>{nr.relevance}</Caption>
                  </View>
                ))}
              </View>
            </Surface>
          ) : null}

          {result.inspectionReport ? (
            <InspectionReportCard report={result.inspectionReport} />
          ) : null}

          {sessionUri ? (
            <Surface>
              <Label>Reanalisar com informaÃ§Ã£o extra</Label>
              <Caption className="mt-2">
                Se a IA nÃ£o identificou algo, descreva o contexto e rode de novo com a mesma foto.
              </Caption>
              <TextInput
                value={inspectorNote}
                onChangeText={setInspectorNote}
                placeholder="Ex.: nÃ£o deu para ver a guarda da correia..."
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
                label="Reanalisar com esta informaÃ§Ã£o"
                variant="secondary"
                onPress={handleReanalyzeSingle}
                className="mt-4"
              />
            </Surface>
          ) : null}

          {savedId ? (
            <Button
              label="Ver no histÃ³rico"
              onPress={() => router.push(`/(app)/history/${savedId}` as Href)}
            />
          ) : null}
          <Button label="Nova anÃ¡lise" variant="outline" onPress={handleNewAnalysis} />
        </View>
      ) : null}

      {step === 'batch_result' ? (
        <View className="gap-4">
          <Surface tone="accent">
            <Label>Lote concluÃ­do</Label>
            <Body className="mt-2">
              {batchSummary.done} concluÃ­da{batchSummary.done === 1 ? '' : 's'}
              {batchSummary.failed > 0
                ? ` Â· ${batchSummary.failed} com falha`
                : ''}{' '}
              de {batchSummary.total}. Cada foto gerou um registro no histÃ³rico.
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
                        ? ` Â· ${item.result.risks.length} risco(s)`
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
                Envie um contexto extra se quiser e rode de novo sÃ³ as fotos que falharam.
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
            label="Ver histÃ³rico"
            onPress={() => router.push('/(app)/history' as Href)}
          />
          <Button label="Nova anÃ¡lise" variant="outline" onPress={handleNewAnalysis} />
        </View>
      ) : null}

      {step === 'error' ? (
        <View className="gap-4">
          <Surface tone="signal">
            <Label>NÃ£o foi possÃ­vel analisar</Label>
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
