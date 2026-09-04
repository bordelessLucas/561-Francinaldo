/**
 * Feature flags Sprint 4A — sem segredos.
 * Storage e OpenAI reais ficam desligados até billing/chaves do cliente.
 */
export type AiProviderFlag = 'mock' | 'openai';

function readFlag(name: string, fallback: string): string {
  const value = process.env[name];
  return typeof value === 'string' && value.length > 0 ? value.trim() : fallback;
}

export function getAiProvider(): AiProviderFlag {
  const raw = readFlag('EXPO_PUBLIC_AI_PROVIDER', 'mock').toLowerCase();
  return raw === 'openai' ? 'openai' : 'mock';
}

/** Upload Storage — false enquanto billing do cliente não liberar. */
export function isStorageUploadEnabled(): boolean {
  return readFlag('EXPO_PUBLIC_ENABLE_STORAGE_UPLOAD', 'false').toLowerCase() === 'true';
}

/** Força falha no mock (demo de erro / aceite). */
export function isAiForceFailEnabled(): boolean {
  return readFlag('EXPO_PUBLIC_AI_FORCE_FAIL', 'false').toLowerCase() === 'true';
}
