import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getAiProvider } from '@/lib/featureFlags';
import type { AnalysisResult, RiskSeverity } from '@/lib/types';
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
import { runAnalysisWithoutUpload } from '@/src/services/analysis.service';
import { pickFromCamera, pickFromGallery, type PickedImage } from '@/src/services/media.service';

type Step = 'idle' | 'preview' | 'analyzing' | 'result' | 'error';

const SEVERITY_LABEL: Record<RiskSeverity, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
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
      case 'AI_MOCK_FORCED_FAIL':
        return 'Não foi possível concluir a análise agora. Tente novamente.';
      case 'AI_MISSING_IMAGE':
        return 'Selecione uma imagem para continuar.';
      case 'AI_PROVIDER_NOT_READY':
        return 'A análise assistida está temporariamente indisponível. Verifique a chave OpenAI ou a URL da API.';
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
        return 'A IA retornou um resultado incompleto. Tente outra foto ou tente de novo.';
      case 'IMAGE_READ_FAILED':
        return 'Não foi possível ler a imagem selecionada.';
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

/**
 * Nova análise — captura efêmera, confirmação e resultado (riscos, controles, NRs).
 * A foto fica só na sessão; ao sair da tela ou iniciar nova análise a URI é descartada.
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
  /** Preview só enquanto a tela mostra o resultado; limpo ao sair / nova análise. */
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const discardEphemeralImage = useCallback(() => {
    setPicked(null);
    setPreviewUri(null);
  }, []);

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
    discardEphemeralImage();
    setStep('idle');
    setResult(null);
    setSavedId(null);
  }

  async function handleConfirm() {
    if (!user || !picked) {
      setError('Selecione uma imagem antes de confirmar.');
      return;
    }

    const sessionUri = picked.localUri;
    const sessionSource = picked.source;

    setError(null);
    setStep('analyzing');
    try {
      const record = await runAnalysisWithoutUpload({
        uid: user.uid,
        localUri: sessionUri,
        source: sessionSource,
      });
      setResult(record.result ?? null);
      setSavedId(record.id);
      setPreviewUri(sessionUri);
      setPicked(null);
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
    discardEphemeralImage();
    setStep('idle');
  }

  function handleNewAnalysis() {
    discardEphemeralImage();
    setResult(null);
    setSavedId(null);
    setError(null);
    setStep('idle');
  }

  function handleLeaveFlow() {
    discardEphemeralImage();
    setResult(null);
    setSavedId(null);
    setError(null);
    setStep('idle');
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(app)/' as Href);
  }

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
          Fotografe ou selecione uma situação de campo. Em seguida, confirme para obter riscos,
          medidas de controle e NRs relacionadas.
        </Body>
      </View>

      {step === 'idle' ? (
        <View className="gap-4">
          <Surface>
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
          </Surface>
        </View>
      ) : null}

      {step === 'preview' && picked ? (
        <View className="gap-4">
          <Surface padding={false}>
            <Image
              source={{ uri: picked.localUri }}
              className="h-72 w-full"
              style={{ backgroundColor: colors.canvas }}
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
          </Surface>

          <Button label="Confirmar e analisar" onPress={handleConfirm} />
          <Button label="Trocar imagem" variant="outline" onPress={handleChangeImage} />
        </View>
      ) : null}

      {step === 'analyzing' ? (
        <Surface className="items-center py-10">
          <ActivityIndicator size="large" color={colors.brand} />
          <Label className="mt-5">Analisando…</Label>
          <Caption className="mt-2 text-center">
            Identificando riscos, medidas de controle e NRs aplicáveis.
          </Caption>
        </Surface>
      ) : null}

      {step === 'result' && result ? (
        <View className="gap-4">
          {isMockAi ? (
            <Surface tone="accent">
              <Caption className="font-sansSemi" style={{ color: colors.brandDark }}>
                Demonstração — resultado simulado
              </Caption>
              <Caption className="mt-1">
                A análise assistida real será ativada quando a IA estiver configurada. O registro já
                foi salvo no histórico. A foto desta sessão não é enviada ao armazenamento na nuvem.
              </Caption>
            </Surface>
          ) : null}

          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              className="h-40 w-full rounded-3xl"
              style={{ backgroundColor: colors.canvas }}
              resizeMode="cover"
              accessibilityLabel="Situação analisada"
            />
          ) : null}

          <Surface>
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
          <Surface tone="signal">
            <Label>Não foi possível analisar</Label>
            <Body className="mt-2">{error ?? 'Tente novamente.'}</Body>
          </Surface>
          <Button label="Tentar novamente" onPress={handleRetry} />
          <Button label="Trocar imagem" variant="outline" onPress={handleChangeImage} />
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
