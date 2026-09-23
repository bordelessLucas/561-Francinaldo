import type { AnalysisResult } from '@/lib/types';
import { readLocalImageAsBase64 } from '@/src/services/ai/image';
import {
  analyzeViaOpenAiDirect,
  analyzeViaRemoteEndpoint,
  getAiModel,
  getAnalyzeUrl,
  hasOpenAiCredentials,
} from '@/src/services/ai/openai';

export type AnalyzeSituationImageInput = {
  /** URI local da sessão — não persistir; descartar após a análise. */
  localUri: string;
  /** Contexto livre do inspetor para refinar a Vision. */
  inspectorNote?: string;
  generateReport?: boolean;
};

/**
 * Análise de situação (imagem efêmera) via OpenAI Vision.
 * Prefere Netlify Function; fallback direto no piloto local.
 */
export async function analyzeSituationImage(
  input: AnalyzeSituationImageInput,
): Promise<AnalysisResult> {
  if (!input.localUri) {
    throw new Error('AI_MISSING_IMAGE');
  }

  if (!hasOpenAiCredentials()) {
    throw new Error('AI_PROVIDER_NOT_READY');
  }

  const image = await readLocalImageAsBase64(input.localUri);
  const model = getAiModel();
  const endpoint = getAnalyzeUrl();
  const inspectorNote = input.inspectorNote?.trim() || undefined;
  const payload = {
    base64: image.base64,
    mimeType: image.mimeType,
    model,
    inspectorNote,
    generateReport: Boolean(input.generateReport),
  };

  if (endpoint) {
    return analyzeViaRemoteEndpoint(payload, endpoint);
  }

  return analyzeViaOpenAiDirect(payload);
}
