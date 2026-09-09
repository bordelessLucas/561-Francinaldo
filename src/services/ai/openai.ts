import Constants from 'expo-constants';

import type { AnalysisResult } from '@/lib/types';
import { ANALYSIS_SYSTEM_PROMPT, ANALYSIS_USER_TEXT } from '@/src/services/ai/prompt';
import { extractJsonObject, toAnalysisResult } from '@/src/services/ai/parse-result';

type AnalyzeWithOpenAiInput = {
  base64: string;
  mimeType: string;
  model: string;
};

type OpenAiErrorBody = {
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
};

export function mapOpenAiHttpError(status: number, bodyText: string): Error {
  let parsed: OpenAiErrorBody | null = null;
  try {
    parsed = JSON.parse(bodyText) as OpenAiErrorBody;
  } catch {
    parsed = null;
  }

  const code = parsed?.error?.code ?? '';
  const type = parsed?.error?.type ?? '';
  const message = (parsed?.error?.message ?? '').toLowerCase();

  if (status === 401 || status === 403) {
    return new Error('AI_AUTH_FAILED');
  }
  if (
    status === 429 ||
    code === 'insufficient_quota' ||
    code === 'credit_balance_exhausted' ||
    type === 'insufficient_quota' ||
    message.includes('credit') ||
    message.includes('quota') ||
    message.includes('billing')
  ) {
    return new Error('AI_QUOTA_EXCEEDED');
  }
  if (status === 400 && (message.includes('image') || message.includes('invalid'))) {
    return new Error('AI_BAD_IMAGE');
  }
  if (status >= 500) {
    return new Error('AI_UPSTREAM_ERROR');
  }
  return new Error('AI_UPSTREAM_ERROR');
}

function getClientApiKey(): string {
  const extra = Constants.expoConfig?.extra as { openaiApiKey?: string } | undefined;
  const fromExtra = typeof extra?.openaiApiKey === 'string' ? extra.openaiApiKey.trim() : '';
  if (fromExtra) return fromExtra.replace(/^\uFEFF/, '');
  // Fallback: alguns setups Expo exportam no process.env do bundle
  const fromEnv = process.env.OPENAI_API_KEY?.trim() ?? '';
  return fromEnv.replace(/^\uFEFF/, '');
}

export function getAnalyzeUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_AI_ANALYZE_URL?.trim() ?? '';
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const extra = Constants.expoConfig?.extra as { aiAnalyzeUrl?: string } | undefined;
  return typeof extra?.aiAnalyzeUrl === 'string'
    ? extra.aiAnalyzeUrl.trim().replace(/\/$/, '')
    : '';
}

export function getAiModel(): string {
  return process.env.EXPO_PUBLIC_AI_MODEL?.trim() || 'gpt-4o-mini';
}

export function hasOpenAiCredentials(): boolean {
  return Boolean(getAnalyzeUrl() || getClientApiKey());
}

/** Preferência: Netlify Function /api/analyze-situation (chave só no servidor). */
export async function analyzeViaRemoteEndpoint(
  input: AnalyzeWithOpenAiInput,
  endpoint: string,
): Promise<AnalysisResult> {
  const url = endpoint.endsWith('/analyze-situation')
    ? endpoint
    : `${endpoint}/api/analyze-situation`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64: input.base64,
      mimeType: input.mimeType,
      model: input.model,
    }),
  });

  const raw = await res.text();
  let payload: unknown = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = {};
  }

  if (!res.ok) {
    const errCode =
      payload &&
      typeof payload === 'object' &&
      typeof (payload as { error?: string }).error === 'string'
        ? (payload as { error: string }).error
        : '';
    if (
      errCode === 'AI_PROVIDER_NOT_READY' ||
      errCode === 'AI_MISSING_IMAGE' ||
      errCode === 'AI_QUOTA_EXCEEDED' ||
      errCode === 'AI_AUTH_FAILED' ||
      errCode === 'AI_BAD_IMAGE'
    ) {
      throw new Error(errCode);
    }
    throw mapOpenAiHttpError(res.status, raw);
  }

  return toAnalysisResult(payload, { model: input.model });
}

/**
 * Fallback de desenvolvimento: chama OpenAI direto do app.
 * A chave entra via app.config extra (OPENAI_API_KEY) — não use em build de loja.
 */
export async function analyzeViaOpenAiDirect(
  input: AnalyzeWithOpenAiInput,
): Promise<AnalysisResult> {
  const apiKey = getClientApiKey();
  if (!apiKey) {
    throw new Error('AI_PROVIDER_NOT_READY');
  }

  const dataUrl = `data:${input.mimeType};base64,${input.base64}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: input.model,
      temperature: 0.2,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: ANALYSIS_USER_TEXT },
            { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
          ],
        },
      ],
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    console.warn('OpenAI direct error', res.status, raw.slice(0, 400));
    throw mapOpenAiHttpError(res.status, raw);
  }

  let completion: { choices?: Array<{ message?: { content?: string } }> };
  try {
    completion = JSON.parse(raw) as typeof completion;
  } catch {
    throw new Error('AI_EMPTY_RESPONSE');
  }

  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI_EMPTY_RESPONSE');
  }

  return toAnalysisResult(extractJsonObject(content), { model: input.model });
}
