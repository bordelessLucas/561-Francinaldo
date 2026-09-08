import { useState } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getAiProvider } from '@/lib/featureFlags';
import type { AnalysisResult, RiskSeverity } from '@/lib/types';
import { Body, Button, Caption, Container, Heading, Label } from '@/src/components';
import { runAnalysisWithoutUpload } from '@/src/services/analysis.service';
import { pickFromCamera, pickFromGallery, type PickedImage } from '@/src/services/media.service';

type Step = 'idle' | 'preview' | 'analyzing' | 'result' | 'error';

const SEVERITY_LABEL: Record<RiskSeverity, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

const CARD =
  'rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark';

function getCaptureErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    switch (error.message) {
      case 'CAMERA_PERMISSION_DENIED':
        return 'Permissão de câmera negada. Ative nas configurações do aparelho.';
      case 'GALLERY_PERMISSION_DENIED':
        return 'Permissão de galeria negada. Ative nas configurações do aparelho.';
      case 'IMAGE_READ_FAILED':
        return 'Não foi possível ler a imagem selecionada.';
      case 'AI_MOCK_FORCED_FAIL':
        return 'Não foi possível concluir a análise agora. Tente novamente.';
      case 'AI_MISSING_IMAGE':
        return 'Selecione uma imagem para continuar.';
      case 'AI_PROVIDER_NOT_READY':
        return 'A análise assistida está temporariamente indisponível. Tente novamente em instantes.';
      case 'STORAGE_UPLOAD_DISABLED':
        return 'O envio da imagem ficará disponível em breve. A análise local continua funcionando.';
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

/**
 * Nova análise — captura, confirmação e resultado (riscos, controles, NRs).
 */
export function AnalysisScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const isMockAi = getAiProvider() === 'mock';
  const [step, setStep] = useState<Step>('idle');
  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function handlePick(from: 'camera' | 'gallery') {
    if (!user) {
      setError('Faça login para registrar uma análise.');
      return;
    }

    setError(null);
    setPicking(true);
    try {
      const next = from === 'camera' ? await pickFromCamera() : await pickFromGallery();
      if (!next) return;
      setPicked(next);
      setStep('preview');
      setResult(null);
      setSavedId(null);
    } catch (err) {
      setError(getCaptureErrorMessage(err));
    } finally {
      setPicking(false);
    }
  }

  function handleChangeImage() {
    setError(null);
    setPicked(null);
    setStep('idle');
    setResult(null);
    setSavedId(null);
  }

  async function handleConfirm() {
    if (!user || !picked) {
      setError('Selecione uma imagem antes de confirmar.');
      return;
    }

    setError(null);
    setStep('analyzing');
    try {
      const record = await runAnalysisWithoutUpload({
        uid: user.uid,
        localUri: picked.localUri,
        source: picked.source,
      });
      setResult(record.result ?? null);
      setSavedId(record.id);
      setStep('result');
    } catch (err) {
      setError(getCaptureErrorMessage(err));
      setStep('error');
    }
  }

  function handleRetry() {
    setError(null);
    if (picked) {
      void handleConfirm();
      return;
    }
    setStep('idle');
  }

  function handleNewAnalysis() {
    setPicked(null);
    setResult(null);
    setSavedId(null);
    setError(null);
    setStep('idle');
  }

  return (
    <Container scroll>
      <View className="mb-8 mt-2 gap-2">
        <Heading>Nova análise</Heading>
        <Body>
          Fotografe ou selecione uma situação de campo. Em seguida, confirme para obter riscos,
          medidas de controle e NRs relacionadas.
        </Body>
      </View>

      {step === 'idle' ? (
        <View className="gap-4">
          <View className={`px-5 py-5 ${CARD}`}>
            <Label>Registrar situação</Label>
            <Caption className="mt-2">
              Use a câmera no local ou escolha uma foto já salva na galeria.
            </Caption>

            <Button
              label="Fotografar com a câmera"
              onPress={() => handlePick('camera')}
              loading={picking}
              className="mt-5"
            />
            <Button
              label="Escolher da galeria"
              variant="secondary"
              onPress={() => handlePick('gallery')}
              disabled={picking}
              className="mt-3"
            />
          </View>
        </View>
      ) : null}

      {step === 'preview' && picked ? (
        <View className="gap-4">
          <View className={`overflow-hidden ${CARD}`}>
            <Image
              source={{ uri: picked.localUri }}
              className="h-72 w-full bg-canvas dark:bg-canvas-dark"
              resizeMode="cover"
              accessibilityLabel="Pré-visualização da situação capturada"
            />
            <View className="px-5 py-4">
              <Label>Confirmar imagem</Label>
              <Caption className="mt-2">
                Origem: {picked.source === 'camera' ? 'câmera' : 'galeria'}. Confirme para analisar
                ou troque a foto.
              </Caption>
            </View>
          </View>

          <Button label="Confirmar e analisar" onPress={handleConfirm} />
          <Button label="Trocar imagem" variant="outline" onPress={handleChangeImage} />
        </View>
      ) : null}

      {step === 'analyzing' ? (
        <View className={`items-center px-5 py-10 ${CARD}`}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Label className="mt-5">Analisando…</Label>
          <Caption className="mt-2 text-center">
            Identificando riscos, medidas de controle e NRs aplicáveis.
          </Caption>
        </View>
      ) : null}

      {step === 'result' && result ? (
        <View className="gap-4">
          {isMockAi ? (
            <View className="rounded-2xl bg-brand-mist px-4 py-3 dark:bg-brand-mist-dark">
              <Caption className="font-sansSemi text-brand-dark dark:text-brand-accent">
                Demonstração — resultado simulado
              </Caption>
              <Caption className="mt-1">
                A análise assistida real será ativada quando a IA estiver configurada. O registro já
                foi salvo no histórico.
              </Caption>
            </View>
          ) : null}

          {picked ? (
            <Image
              source={{ uri: picked.localUri }}
              className="h-40 w-full rounded-3xl bg-canvas dark:bg-canvas-dark"
              resizeMode="cover"
              accessibilityLabel="Situação analisada"
            />
          ) : null}

          <View className={`px-5 py-5 ${CARD}`}>
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

          <View className={`px-5 py-5 ${CARD}`}>
            <Label>Medidas de controle</Label>
            <View className="mt-4 gap-3">
              {result.controls.map((control, index) => {
                const riskTitle =
                  result.risks.find((r) => r.id === control.riskId)?.title ?? control.riskId;
                return (
                  <View key={`${control.riskId}-${index}`} className="gap-1">
                    <Caption className="font-sansSemi text-brand-dark dark:text-brand-accent">
                      {riskTitle}
                    </Caption>
                    <Body>{control.measure}</Body>
                  </View>
                );
              })}
            </View>
          </View>

          <View className={`px-5 py-5 ${CARD}`}>
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

          {savedId ? (
            <Button
              label="Ver no histórico"
              onPress={() => router.push(`/(app)/history/${savedId}` as Href)}
            />
          ) : null}
          <Button
            label="Nova análise"
            variant="outline"
            onPress={handleNewAnalysis}
            className="mb-2"
          />
        </View>
      ) : null}

      {step === 'error' ? (
        <View className="gap-4">
          <View className="rounded-3xl bg-signal-soft px-5 py-5 dark:bg-signal-soft-dark">
            <Label>Não foi possível analisar</Label>
            <Body className="mt-2">{error ?? 'Tente novamente.'}</Body>
          </View>
          <Button label="Tentar novamente" onPress={handleRetry} />
          <Button label="Trocar imagem" variant="outline" onPress={handleChangeImage} />
        </View>
      ) : null}

      {error && step !== 'error' ? (
        <View className="mt-5 rounded-2xl bg-signal-soft px-4 py-3 dark:bg-signal-soft-dark">
          <Caption className="text-ink-soft dark:text-ink-inverse">{error}</Caption>
        </View>
      ) : null}
    </Container>
  );
}
