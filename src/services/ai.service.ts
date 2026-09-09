import { getAiProvider, isAiForceFailEnabled } from '@/lib/featureFlags';
import type { AnalysisResult } from '@/lib/types';
import { readLocalImageAsBase64 } from '@/src/services/ai/image';
import {
  analyzeViaOpenAiDirect,
  analyzeViaRemoteEndpoint,
  getAiModel,
  getAnalyzeUrl,
  hasOpenAiCredentials,
} from '@/src/services/ai/openai';
import { buildMockAnalysisResult } from '@/src/services/mocks/analysis-result.mock';

export type AnalyzeSituationImageInput = {
  /** URI local da sessão — não persistir; descartar após a análise. */
  localUri: string;
};

const MOCK_DELAY_MS = 1500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Análise de situação (imagem efêmera).
 * - mock: fixture local
 * - openai: Vision (Netlify Function preferida; fallback direto no piloto)
 */
export async function analyzeSituationImage(
  input: AnalyzeSituationImageInput,
): Promise<AnalysisResult> {
  if (!input.localUri) {
    throw new Error('AI_MISSING_IMAGE');
  }

  const provider = getAiProvider();

  if (provider === 'openai') {
    if (!hasOpenAiCredentials()) {
      throw new Error('AI_PROVIDER_NOT_READY');
    }

    const image = await readLocalImageAsBase64(input.localUri);
    const model = getAiModel();
    const endpoint = getAnalyzeUrl();

    if (endpoint) {
      return analyzeViaRemoteEndpoint(
        { base64: image.base64, mimeType: image.mimeType, model },
        endpoint,
      );
    }

    return analyzeViaOpenAiDirect({
      base64: image.base64,
      mimeType: image.mimeType,
      model,
    });
  }

  await delay(MOCK_DELAY_MS);

  if (isAiForceFailEnabled()) {
    throw new Error('AI_MOCK_FORCED_FAIL');
  }

  return buildMockAnalysisResult();
}
