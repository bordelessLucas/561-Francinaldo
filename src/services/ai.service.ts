import { getAiProvider, isAiForceFailEnabled } from '@/lib/featureFlags';
import type { AnalysisResult } from '@/lib/types';
import { buildMockAnalysisResult } from '@/src/services/mocks/analysis-result.mock';

export type AnalyzeSituationImageInput = {
  localUri: string;
};

const MOCK_DELAY_MS = 1500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Análise de situação — Sprint 4A: apenas mock.
 * Assinatura estável para trocar por GPT (openai) quando houver chave.
 */
export async function analyzeSituationImage(
  input: AnalyzeSituationImageInput,
): Promise<AnalysisResult> {
  if (!input.localUri) {
    throw new Error('AI_MISSING_IMAGE');
  }

  const provider = getAiProvider();

  if (provider === 'openai') {
    // 4B: OpenAI Vision — não implementar até chave/billing do cliente.
    throw new Error('AI_PROVIDER_NOT_READY');
  }

  await delay(MOCK_DELAY_MS);

  if (isAiForceFailEnabled()) {
    throw new Error('AI_MOCK_FORCED_FAIL');
  }

  return buildMockAnalysisResult();
}
