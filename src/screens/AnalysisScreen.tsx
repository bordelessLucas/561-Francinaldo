import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { StatusBar } from 'expo-status-bar';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import {
  CameraView,
  type CameraType,
  useCameraPermissions,
} from 'expo-camera';
import { router, type Href, useNavigation } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import type {
  AnalysisResult,
  AnalysisSource,
  RiskSeverity,
} from '@/lib/types';
import { getNrByCode } from '@/src/data/nrs';
import {
  BackLink,
  Body,
  Button,
  Caption,
  InspectionReportCard,
  Label,
  RiskLevelMeter,
  Surface,
} from '@/src/components';
import { askAnalysisQuestion } from '@/src/services/analysis-assistant.service';
import {
  runAnalysisQueue,
  type AnalysisQueueItem,
} from '@/src/services/analysis-queue.service';
import { runAnalysisWithoutUpload } from '@/src/services/analysis.service';
import {
  MAX_ANALYSIS_BATCH,
  pickMultipleFromGallery,
  type PickedImage,
} from '@/src/services/media.service';
import { transcribeInspectorNote } from '@/src/services/dictation.service';

type Step = 'assistant' | 'camera' | 'preview' | 'analyzing' | 'result' | 'batch_result' | 'error';

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
  medium: 'Média',
  high: 'Alta',
};

const QUEUE_STATUS_LABEL: Record<AnalysisQueueItem['status'], string> = {
  queued: 'Na fila',
  analyzing: 'Analisando',
  done: 'Concluída',
  failed: 'Falhou',
};

function getComplianceTitle(result: AnalysisResult): string {
  switch (result.complianceSummary) {
    case 'no_visible_issue':
      return 'Sem problema visível na foto';
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
      return 'A IA não encontrou não conformidade visível nesta imagem. Valide no local e complemente se houver algo fora do enquadramento.';
    case 'not_applicable':
      return 'A imagem não parece mostrar um ambiente de trabalho ou situação avaliável de SST.';
    case 'needs_more_context':
      return 'A imagem não traz informação suficiente para um relatório confiável. Envie outra foto ou detalhe o contexto.';
    default:
      return 'A ferramenta apoia a inspeção; valide no local antes de decisões críticas.';
  }
}

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
      case 'AI_BAD_REQUEST':
        return 'Pedido de análise inválido. Tente novamente com outra foto.';
      case 'AI_NETWORK_ERROR':
        return 'Falha de rede ao falar com a IA. Verifique a conexão e tente de novo.';
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

function getDictationErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    switch (error.message) {
      case 'STT_PROVIDER_NOT_READY':
        return 'Configure a URL da API Netlify para transcrever áudio com segurança.';
      case 'STT_NETWORK_ERROR':
        return 'Falha de rede ao transcrever o áudio. Verifique a conexão e tente de novo.';
      case 'STT_MISSING_AUDIO':
      case 'STT_BAD_AUDIO':
        return 'Não foi possível ler o áudio gravado. Grave novamente mais perto do microfone.';
      case 'AI_AUTH_FAILED':
        return 'Falha de autenticação com a IA. Confira a chave OpenAI no servidor.';
      case 'AI_QUOTA_EXCEEDED':
        return 'A conta OpenAI está sem créditos para transcrever agora.';
      case 'STT_EMPTY_RESPONSE':
        return 'Não identifiquei fala no áudio. Tente gravar novamente.';
      default:
        break;
    }
  }
  return 'Não foi possível transcrever o áudio. Tente novamente ou digite o contexto.';
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

async function waitForRecordingUri(
  recorder: ReturnType<typeof useAudioRecorder>,
): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const uri = recorder.uri || recorder.getStatus().url;
    if (uri) return uri;
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  throw new Error('STT_MISSING_AUDIO');
}

/**
 * Análise em lote - várias fotos na UI; fila sequencial (1 Vision por vez).
 */
export function AnalysisScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [step, setStep] = useState<Step>('assistant');
  const [batch, setBatch] = useState<PickedImage[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [picking, setPicking] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<CameraType>('back');
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
  const [preQuestion, setPreQuestion] = useState('');
  const [preAnswer, setPreAnswer] = useState<string | null>(null);
  const [askingAssistant, setAskingAssistant] = useState(false);
  const [queueItems, setQueueItems] = useState<AnalysisQueueItem[]>([]);
  const [queueProgress, setQueueProgress] = useState({ index: 0, total: 0 });
  const analysisRunIdRef = useRef(0);

  const remainingSlots = MAX_ANALYSIS_BATCH - batch.length;
  const activePhoto = batch[activeIndex] ?? batch[0] ?? null;
  const isRecordingNote = recorderState.isRecording;
  const recordingSeconds = Math.max(0, Math.round((recorderState.durationMillis ?? 0) / 1000));
  const recordingLabel = `${String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:${String(recordingSeconds % 60).padStart(2, '0')}`;

  const batchSummary = useMemo(() => {
    const done = queueItems.filter((item) => item.status === 'done').length;
    const failed = queueItems.filter((item) => item.status === 'failed').length;
    return { done, failed, total: queueItems.length };
  }, [queueItems]);

  useEffect(() => {
    navigation.setOptions({ tabBarStyle: { display: 'none' } });
  }, [navigation]);

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
    setCapturing(false);
    setCameraFacing('back');
    setLastInspectorNote(null);
    setPreQuestion('');
    setPreAnswer(null);
    setAskingAssistant(false);
    setQueueItems([]);
    setQueueProgress({ index: 0, total: 0 });
    setError(null);
  }, []);

  function buildInspectorContext(): string | undefined {
    const parts: string[] = [];
    const question = preQuestion.trim();
    const answer = preAnswer?.trim();
    const note = inspectorNote.trim();
    if (question || answer) {
      parts.push(
        [
          'Dúvida respondida antes da foto:',
          question ? `Pergunta do inspetor: ${question}` : '',
          answer ? `Resposta da IA: ${answer}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      );
    }
    if (note) {
      parts.push(`Contexto adicional do inspetor: ${note}`);
    }
    return parts.length > 0 ? parts.join('\n\n') : undefined;
  }

  async function handleAskAssistant() {
    const question = preQuestion.trim();
    if (!question) {
      setError('Digite sua dúvida antes de perguntar para a IA.');
      return;
    }

    setError(null);
    setAskingAssistant(true);
    try {
      const answer = await askAnalysisQuestion({ question });
      setPreAnswer(answer);
    } catch (err) {
      setError(getCaptureErrorMessage(err));
    } finally {
      setAskingAssistant(false);
    }
  }

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
    try {
      const permission =
        cameraPermission?.granted ? cameraPermission : await requestCameraPermission();
      if (!permission.granted) {
        throw new Error('CAMERA_PERMISSION_DENIED');
      }
      setStep('camera');
    } catch (err) {
      setError(getCaptureErrorMessage(err));
    }
  }

  async function handleTakeEmbeddedPhoto() {
    if (!user) {
      setError('Faça login para registrar uma análise.');
      return;
    }
    if (remainingSlots <= 0) {
      setError(`Você pode enviar até ${MAX_ANALYSIS_BATCH} fotos por vez.`);
      return;
    }

    setError(null);
    setCapturing(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.82,
        exif: false,
        shutterSound: true,
      });
      if (!photo?.uri) {
        throw new Error('IMAGE_READ_FAILED');
      }
      const next: PickedImage = { localUri: photo.uri, source: 'camera' };
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
      setCapturing(false);
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
        setStep('camera');
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

    const note = buildInspectorContext();
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
        const uri = await waitForRecordingUri(recorder);
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
        setDictationError('Permissão de microfone negada. Ative nas configurações do aparelho.');
      } else {
        setDictationError(getDictationErrorMessage(err));
      }
    } finally {
      setTranscribingAudio(false);
    }
  }

  async function handleReanalyzeSingle() {
    if (!user || !sessionUri) {
      setError('A foto desta sessão não está mais disponível. Monte um novo lote.');
      setStep('camera');
      return;
    }
    if (!inspectorNote.trim()) {
      setError('Descreva o que a IA não identificou ou o contexto extra para reanalisar.');
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

    const note = buildInspectorContext() || lastInspectorNote || undefined;
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
    setStep('assistant');
  }

  function handleLeaveFlow() {
    resetSession();
    setStep('assistant');
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(app)/' as Href);
  }

  const analyzingLabel =
    queueProgress.total > 1
      ? `Analisando foto ${Math.min(queueProgress.index + 1, queueProgress.total)} de ${queueProgress.total}`
      : 'Analisando com IA...';

  if (step === 'camera') {
    return (
      <View className="flex-1" style={{ backgroundColor: '#02070B' }}>
        {cameraPermission?.granted ? (
          <CameraView
            ref={cameraRef}
            active
            animateShutter
            facing={cameraFacing}
            mode="picture"
            style={{ flex: 1 }}
            onMountError={() => setError('Não foi possível iniciar a câmera neste aparelho.')}
          >
            <View
              className="flex-1 justify-between"
              style={{
                paddingTop: Math.max(insets.top, 16),
                paddingBottom: Math.max(insets.bottom, 18),
              }}
            >
              <View className="flex-row items-center justify-between px-4">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Voltar"
                  onPress={() => setStep('assistant')}
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(2,7,11,0.72)' }}
                >
                  <Ionicons name="chevron-back" size={24} color={BLUE_UI.text} />
                </Pressable>

                <View className="rounded-full px-3 py-2" style={{ backgroundColor: 'rgba(2,7,11,0.72)' }}>
                  <Text className="font-sansSemi text-xs" style={{ color: BLUE_UI.text }}>
                    {batch.length}/{MAX_ANALYSIS_BATCH}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Alternar câmera"
                  onPress={() => setCameraFacing((current) => (current === 'back' ? 'front' : 'back'))}
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(2,7,11,0.72)' }}
                >
                  <Ionicons name="camera-reverse-outline" size={23} color={BLUE_UI.text} />
                </Pressable>
              </View>

              <View pointerEvents="none" className="absolute inset-x-8 bottom-36 top-24">
                <View className="absolute left-0 top-0 h-10 w-10 rounded-tl-2xl border-l-2 border-t-2" style={{ borderColor: BLUE_UI.text }} />
                <View className="absolute right-0 top-0 h-10 w-10 rounded-tr-2xl border-r-2 border-t-2" style={{ borderColor: BLUE_UI.text }} />
                <View className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-2xl border-b-2 border-l-2" style={{ borderColor: BLUE_UI.text }} />
                <View className="absolute bottom-0 right-0 h-10 w-10 rounded-br-2xl border-b-2 border-r-2" style={{ borderColor: BLUE_UI.text }} />
              </View>

              <View className="relative h-28 justify-center px-5">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Escolher foto da galeria"
                  disabled={picking}
                  onPress={handleAddFromGallery}
                  className="absolute left-6 h-14 w-14 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: 'rgba(2,7,11,0.78)',
                    borderWidth: 1,
                    borderColor: 'rgba(247,250,252,0.28)',
                    opacity: picking ? 0.55 : 1,
                  }}
                >
                  {picking ? (
                    <ActivityIndicator color={BLUE_UI.text} />
                  ) : (
                    <Ionicons name="images-outline" size={24} color={BLUE_UI.text} />
                  )}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Tirar foto"
                  disabled={capturing}
                  onPress={handleTakeEmbeddedPhoto}
                  className="self-center h-20 w-20 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: 'rgba(247,250,252,0.18)',
                    borderWidth: 4,
                    borderColor: BLUE_UI.text,
                    opacity: capturing ? 0.65 : 1,
                  }}
                >
                  {capturing ? (
                    <ActivityIndicator color={BLUE_UI.text} />
                  ) : (
                    <View className="h-14 w-14 rounded-full" style={{ backgroundColor: BLUE_UI.text }} />
                  )}
                </Pressable>
              </View>
            </View>
          </CameraView>
        ) : (
          <View
            className="flex-1 items-center justify-center px-6"
            style={{
              paddingTop: Math.max(insets.top, 20),
              paddingBottom: Math.max(insets.bottom, 24),
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              onPress={handleLeaveFlow}
              className="absolute left-4 h-11 w-11 items-center justify-center rounded-full"
              style={{ top: Math.max(insets.top, 16), backgroundColor: 'rgba(2,7,11,0.72)' }}
            >
              <Ionicons name="chevron-back" size={24} color={BLUE_UI.text} />
            </Pressable>
            <Ionicons name="camera" size={64} color={BLUE_UI.text} />
            <Text className="mt-6 text-center font-sansSemi text-2xl" style={{ color: BLUE_UI.text }}>
              Permita a câmera
            </Text>
            <Text className="mt-3 text-center font-sans text-sm leading-6" style={{ color: BLUE_UI.muted }}>
              A foto acontece dentro do app, com preview antes da análise.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={handleAddFromCamera}
              className="mt-6 h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: BLUE_UI.blue }}
            >
              <Ionicons name="camera" size={24} color={BLUE_UI.text} />
            </Pressable>
          </View>
        )}

        {error ? (
          <View
            className="absolute left-4 right-4 rounded-2xl px-4 py-3"
            style={{
              bottom: Math.max(insets.bottom, 18) + 116,
              backgroundColor: 'rgba(70,20,20,0.88)',
              borderWidth: 1,
              borderColor: 'rgba(255,180,171,0.4)',
            }}
          >
            <Text className="font-sans text-sm" style={{ color: '#FFDED8' }}>
              {error}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: BLUE_UI.bg }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: Math.max(insets.bottom, 24),
          }}
        >
      <BackLink
        className="mb-2 mt-2"
        label={step === 'analyzing' ? 'Cancelar' : 'Voltar'}
        fallbackHref={'/(app)/' as Href}
        onPress={handleLeaveFlow}
      />

      {step === 'assistant' ? (
        <View className="gap-4">
          <View
            className="gap-6 px-0 py-1"
            style={{ backgroundColor: BLUE_UI.bg }}
          >
            <View className="gap-5">
              <View className="flex-row items-start gap-4">
                <Image source={MASCOT_IMAGE} className="h-24 w-20" resizeMode="contain" />
                <View className="flex-1 rounded-3xl px-4 py-4" style={{ backgroundColor: BLUE_UI.panel }}>
                  <Text className="font-sansSemi text-lg" style={{ color: BLUE_UI.text }}>
                    Alpha Wolf
                  </Text>
                  <Text className="mt-2 font-sans text-sm leading-5" style={{ color: BLUE_UI.muted }}>
                    Tire sua dúvida antes da foto. Depois toque em iniciar para abrir a câmera.
                  </Text>
                </View>
              </View>

              <View>
                <Text className="font-sansSemi text-4xl" style={{ color: BLUE_UI.text }}>
                  Nova análise
                </Text>
                <Text className="mt-3 font-sans text-base leading-7" style={{ color: BLUE_UI.muted }}>
                  Pergunte algo para a IA antes de registrar a situação ou vá direto para a câmera, como no fluxo de captura do WhatsApp.
                </Text>
              </View>

              <TextInput
                value={preQuestion}
                onChangeText={setPreQuestion}
                placeholder="Ex.: o que devo observar em painel elétrico aberto?"
                placeholderTextColor={BLUE_UI.muted}
                multiline
                textAlignVertical="top"
                className="min-h-[120px] rounded-2xl border px-4 py-3 font-sans text-base"
                style={{
                  color: BLUE_UI.text,
                  backgroundColor: BLUE_UI.panelSoft,
                  borderColor: BLUE_UI.border,
                }}
              />
              <Pressable
                accessibilityRole="button"
                disabled={!preQuestion.trim() || askingAssistant}
                onPress={handleAskAssistant}
                className="min-h-14 flex-row items-center justify-center gap-2 rounded-2xl px-5"
                style={{ backgroundColor: BLUE_UI.blue, opacity: !preQuestion.trim() || askingAssistant ? 0.6 : 1 }}
              >
                {askingAssistant ? (
                  <ActivityIndicator color={BLUE_UI.text} />
                ) : (
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color={BLUE_UI.text} />
                )}
                <Text className="font-sansSemi text-sm" style={{ color: BLUE_UI.text }}>
                  Perguntar para a IA
                </Text>
              </Pressable>

              {preAnswer ? (
                <View
                  className="rounded-[24px] px-5 py-4"
                  style={{ backgroundColor: BLUE_UI.panel, borderWidth: 1, borderColor: BLUE_UI.border }}
                >
                  <Text className="font-sansSemi text-base" style={{ color: BLUE_UI.text }}>
                    Resposta da IA
                  </Text>
                  <Text className="mt-2 font-sans text-sm leading-5" style={{ color: BLUE_UI.muted }}>
                    {preAnswer}
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="gap-3">
              <Pressable
                accessibilityRole="button"
                disabled={picking}
                onPress={() => {
                  setError(null);
                  handleAddFromCamera();
                }}
                className="min-h-16 flex-row items-center justify-center gap-3 rounded-2xl px-5"
                style={{ backgroundColor: BLUE_UI.blue, opacity: picking ? 0.6 : 1 }}
              >
                <Ionicons name="camera" size={22} color={BLUE_UI.text} />
                <Text className="font-sansSemi text-sm" style={{ color: BLUE_UI.text }}>
                  {preAnswer ? 'Iniciar análise com foto' : 'Pular e iniciar análise'}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={picking}
                onPress={handleAddFromGallery}
                className="min-h-14 flex-row items-center justify-center gap-2 rounded-2xl border px-5"
                style={{ borderColor: BLUE_UI.blue, opacity: picking ? 0.6 : 1 }}
              >
                <Ionicons name="images-outline" size={20} color={BLUE_UI.text} />
                <Text className="font-sansSemi text-sm" style={{ color: BLUE_UI.text }}>
                  Escolher fotos da galeria
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      {step === 'preview' && batch.length > 0 ? (
        <View
          className="gap-4 px-0 py-1"
          style={{ backgroundColor: BLUE_UI.bg }}
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
                  accessibilityLabel="Pre-visualizacao da situação"
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
              <Caption className="mt-3 text-center" style={{ color: BLUE_UI.muted }}>
                Contexto e relatório são opcionais antes de analisar.
              </Caption>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3 px-1">
              {batch.map((item, index) => {
                const selected = index === activeIndex;
                return (
                  <View
                    key={item.localUri}
                    className="relative"
                    style={{
                      width: 82,
                      height: 82,
                    }}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Selecionar foto ${index + 1}`}
                      onPress={() => setActiveIndex(index)}
                      className="absolute bottom-0 left-0 overflow-hidden rounded-2xl"
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
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remover foto ${index + 1}`}
                      onPress={() => handleRemovePhoto(item.localUri)}
                      className="absolute right-0 top-0 h-7 w-7 items-center justify-center rounded-full border"
                      style={{ backgroundColor: BLUE_UI.bg, borderColor: BLUE_UI.border }}
                    >
                      <Ionicons name="close" size={15} color={BLUE_UI.text} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          <View className="flex-row flex-wrap gap-2">
            {remainingSlots > 0 ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleAddFromCamera}
                  disabled={picking}
                  className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border px-4"
                  style={{ borderColor: BLUE_UI.blue, opacity: picking ? 0.6 : 1 }}
                >
                  {picking ? <ActivityIndicator color={BLUE_UI.text} /> : <Ionicons name="camera-outline" size={18} color={BLUE_UI.text} />}
                  <Text className="font-sansSemi text-sm" style={{ color: BLUE_UI.text }}>
                    Adicionar foto
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleAddFromGallery}
                  disabled={picking}
                  className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border px-4"
                  style={{ borderColor: BLUE_UI.blue, opacity: picking ? 0.6 : 1 }}
                >
                  <Ionicons name="images-outline" size={18} color={BLUE_UI.text} />
                  <Text className="font-sansSemi text-sm" style={{ color: BLUE_UI.text }}>
                    Galeria
                  </Text>
                </Pressable>
              </>
            ) : (
              <Caption style={{ color: BLUE_UI.muted }}>Lote completo ({MAX_ANALYSIS_BATCH} fotos).</Caption>
            )}
          </View>

          <View
            className="rounded-3xl px-4 py-4"
            style={{ backgroundColor: BLUE_UI.panel, borderWidth: 1, borderColor: BLUE_UI.border }}
          >
            <View>
              <Text className="font-sansSemi text-base" style={{ color: BLUE_UI.text }}>
                Contexto da inspeção
              </Text>
              <Text className="mt-1 font-sans text-xs" style={{ color: BLUE_UI.muted }}>
                Informe área, atividade ou algo importante que a foto não mostra.
              </Text>
            </View>
            <TextInput
              value={inspectorNote}
              onChangeText={setInspectorNote}
              placeholder="Ex.: britagem; turno da manhã; possível falta de EPI..."
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
                {isRecordingNote ? `PARAR E TRANSCREVER ${recordingLabel}` : transcribingAudio ? 'TRANSCREVENDO AUDIO...' : 'FALAR POR VOZ'}
              </Text>
            </Pressable>
            {isRecordingNote ? (
              <Caption className="mt-2" style={{ color: BLUE_UI.warning }}>
                Gravando {recordingLabel}. Toque para parar; a transcrição entra no contexto.
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
                  Gerar relatório fotográfico
                </Text>
                <Caption className="mt-1" style={{ color: BLUE_UI.muted }}>
                  Segue o modelo da inspeção: identificação, descrição do risco e ações.
                </Caption>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Analisar foto com contexto"
              disabled={transcribingAudio || isRecordingNote}
              onPress={handleConfirmBatch}
              className="mt-5 min-h-14 flex-row items-center justify-center gap-2 rounded-2xl px-5"
              style={{
                backgroundColor: BLUE_UI.blue,
                opacity: transcribingAudio || isRecordingNote ? 0.55 : 1,
              }}
            >
              <Ionicons name="sparkles" size={20} color={BLUE_UI.text} />
              <Text className="font-sansSemi text-sm" style={{ color: BLUE_UI.text }}>
                {batch.length === 1 ? 'Analisar foto com contexto' : `Analisar ${batch.length} fotos com contexto`}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
      {step === 'analyzing' ? (
        <View className="gap-4">
          <Surface bordered={false} className="items-center py-8">
            <ActivityIndicator size="large" color={colors.brand} />
            <Label className="mt-5">{analyzingLabel}</Label>
            <Caption className="mt-2 text-center">
              {queueProgress.total > 1
                ? 'Processando o lote com segurança, uma situação por vez.'
                : 'Identificando riscos, controles, NRs e pontos de dúvida.'}
            </Caption>
          </Surface>

          {queueItems.length > 0 ? (
            <Surface bordered={false}>
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
            <Surface bordered={false}>
              <RiskLevelMeter
                risks={result.risks}
                fallbackSeverity={result.inspectionReport?.severity}
              />
            </Surface>
          ) : null}

          <Surface bordered={false} tone={result.risks.length > 0 ? 'elevated' : 'accent'}>
            <Label>{getComplianceTitle(result)}</Label>
            <Body className="mt-2">{getComplianceBody(result)}</Body>
            {result.sceneType ? (
              <Caption className="mt-2">Cena: {result.sceneType}</Caption>
            ) : null}
          </Surface>

          {result.needsInspectorReview ||
          result.inspectorGuidance ||
          (result.limitations && result.limitations.length > 0) ? (
            <Surface bordered={false} tone="signal">
              <Label>Atenção do inspetor</Label>
              {result.overallConfidence ? (
                <Caption className="mt-2">
                  Revisão recomendada pelo Alpha Wolf
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
          ) : null}

          {lastInspectorNote ? (
            <Surface bordered={false} tone="elevated">
              <Caption className="font-sansSemi">Contexto usado nesta análise</Caption>
              <Body className="mt-2">{lastInspectorNote}</Body>
            </Surface>
          ) : null}

          {result.risks.length > 0 ? (
            <Surface bordered={false}>
              <Label>Riscos identificados</Label>
              <View className="mt-4 gap-4">
                {result.risks.map((risk) => (
                  <View key={risk.id} className="gap-1">
                    <Label>
                      {risk.title} · {SEVERITY_LABEL[risk.severity]}
                    </Label>
                    <Caption>{risk.description}</Caption>
                    {risk.evidence?.map((item) => (
                      <Caption key={item}>Evidência: {item}</Caption>
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
            <Surface bordered={false}>
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
            <Surface bordered={false}>
              <Label>NRs relacionadas</Label>
              <View className="mt-4 gap-3">
                {result.nrs.map((nr, index) => {
                  const catalogNr = getNrByCode(nr.code);
                  return (
                    <Pressable
                      accessibilityRole={catalogNr ? 'button' : undefined}
                      key={`${nr.code}-${index}`}
                      className="rounded-2xl px-3 py-3"
                      style={{
                        backgroundColor: colors.canvasElev,
                        borderWidth: 1,
                        borderColor: colors.line,
                      }}
                      onPress={
                        catalogNr
                          ? () =>
                              router.push(
                                `/(app)/library/nrs/${catalogNr.code.toLowerCase()}` as Href,
                              )
                          : undefined
                      }
                    >
                      <Label>
                        {nr.code} - {nr.title}
                      </Label>
                      <Caption className="mt-1">{nr.relevance}</Caption>
                      {catalogNr ? (
                        <Caption className="mt-2" style={{ color: colors.brandDark }}>
                          Abrir norma completa
                        </Caption>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </Surface>
          ) : null}

          {result.inspectionReport ? (
            <InspectionReportCard report={result.inspectionReport} />
          ) : null}

          {sessionUri ? (
            <Surface bordered={false}>
              <Label>Reanalisar esta foto</Label>
              <Caption className="mt-2">
                Use este campo quando faltou contexto ou quando a IA deixou passar algo. A reanálise usa a mesma foto, sem abrir a galeria.
              </Caption>
              <TextInput
                value={inspectorNote}
                onChangeText={setInspectorNote}
                placeholder="Ex.: a proteção da correia está fora do enquadramento..."
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
                label="Reanalisar esta foto"
                variant="primary"
                disabled={!inspectorNote.trim()}
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
          <Surface bordered={false} tone="accent">
            <Label>Lote concluído</Label>
            <Body className="mt-2">
              {batchSummary.done} concluída{batchSummary.done === 1 ? '' : 's'}
              {batchSummary.failed > 0
                ? ` · ${batchSummary.failed} com falha`
                : ''}{' '}
              de {batchSummary.total}. Cada foto gerou um registro no histórico.
            </Body>
          </Surface>

          <Surface bordered={false}>
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
            <Surface bordered={false}>
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
          <Surface bordered={false} tone="signal">
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
        <Surface bordered={false} tone="signal" className="mt-5">
          <Caption style={{ color: colors.inkSoft }}>{error}</Caption>
        </Surface>
      ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
