import { useState } from 'react';
import { Image, View } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { Body, Button, Caption, Container, Heading, Label } from '@/src/components';
import { createAnalysisFromImage } from '@/src/services/analysis.service';
import { pickFromCamera, pickFromGallery, type PickedImage } from '@/src/services/media.service';

type Step = 'idle' | 'preview' | 'success';

function getCaptureErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    switch (error.message) {
      case 'CAMERA_PERMISSION_DENIED':
        return 'Permissão de câmera negada. Ative nas configurações do aparelho.';
      case 'GALLERY_PERMISSION_DENIED':
        return 'Permissão de galeria negada. Ative nas configurações do aparelho.';
      case 'IMAGE_READ_FAILED':
        return 'Não foi possível ler a imagem selecionada.';
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
  if (code.startsWith('permission-denied') || code === 'permission-denied') {
    return 'Sem permissão para registrar a análise. Faça login novamente.';
  }

  return 'Não foi possível enviar a análise. Tente novamente.';
}

/**
 * Sprint 3 — captura (câmera/galeria), preview e upload pré-IA.
 */
export function AnalysisScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('idle');
  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedId, setUploadedId] = useState<string | null>(null);

  async function handlePick(from: 'camera' | 'gallery') {
    if (!user) {
      setError('Faça login para registrar uma análise.');
      return;
    }

    setError(null);
    setPicking(true);
    try {
      const result = from === 'camera' ? await pickFromCamera() : await pickFromGallery();
      if (!result) return;
      setPicked(result);
      setStep('preview');
      setUploadedId(null);
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
    setUploadedId(null);
  }

  async function handleConfirm() {
    if (!user || !picked) {
      setError('Selecione uma imagem antes de confirmar.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const record = await createAnalysisFromImage({
        uid: user.uid,
        localUri: picked.localUri,
        source: picked.source,
      });
      setUploadedId(record.id);
      setStep('success');
    } catch (err) {
      setError(getCaptureErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function handleNewAnalysis() {
    setPicked(null);
    setUploadedId(null);
    setError(null);
    setStep('idle');
  }

  return (
    <Container scroll>
      <View className="mb-8 mt-2 gap-2">
        <Heading>Nova análise</Heading>
        <Body>
          Fotografe ou selecione uma situação de campo. O envio prepara o registro para a análise
          automática na próxima etapa.
        </Body>
      </View>

      {step === 'idle' ? (
        <View className="gap-4">
          <View className="rounded-3xl border border-line bg-white px-5 py-5">
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
          <View className="overflow-hidden rounded-3xl border border-line bg-white">
            <Image
              source={{ uri: picked.localUri }}
              className="h-72 w-full bg-canvas"
              resizeMode="cover"
              accessibilityLabel="Pré-visualização da situação capturada"
            />
            <View className="px-5 py-4">
              <Label>Confirmar imagem</Label>
              <Caption className="mt-2">
                Origem: {picked.source === 'camera' ? 'câmera' : 'galeria'}. Confirme para enviar ou
                troque a foto.
              </Caption>
            </View>
          </View>

          <Button label="Confirmar e enviar" onPress={handleConfirm} loading={submitting} />
          <Button
            label="Trocar imagem"
            variant="outline"
            onPress={handleChangeImage}
            disabled={submitting}
          />
        </View>
      ) : null}

      {step === 'success' ? (
        <View className="rounded-3xl bg-ink px-5 py-5">
          <Label className="text-white">Situação enviada</Label>
          <Body className="mt-2 text-white/75">
            O registro foi salvo com status enviado. A identificação de riscos com IA chega na
            Sprint 4.
          </Body>
          {uploadedId ? (
            <Caption className="mt-3 text-white/55">ID: {uploadedId}</Caption>
          ) : null}
          <Button label="Nova análise" onPress={handleNewAnalysis} className="mt-5" />
        </View>
      ) : null}

      {error ? (
        <View className="mt-5 rounded-2xl bg-signal-soft px-4 py-3">
          <Caption className="text-ink-soft">{error}</Caption>
        </View>
      ) : null}
    </Container>
  );
}
