/**
 * Feature flags — sem segredos no código.
 *
 * Análise do piloto: imagem **efêmera** (sem Firebase Storage).
 * - EXPO_PUBLIC_AI_PROVIDER: mock | openai
 * - EXPO_PUBLIC_AI_ANALYZE_URL: URL base da Netlify (ex.: https://site.netlify.app)
 * - EXPO_PUBLIC_AI_MODEL: modelo Vision (default gpt-4o-mini)
 * - OPENAI_API_KEY: só no .env / Netlify (via app.config extra no piloto; ideal só no servidor)
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

/**
 * Upload Storage — desligado no piloto (análise efêmera).
 */
export function isStorageUploadEnabled(): boolean {
  return readFlag('EXPO_PUBLIC_ENABLE_STORAGE_UPLOAD', 'false').toLowerCase() === 'true';
}

/** Força falha no mock (demo de erro / aceite). */
export function isAiForceFailEnabled(): boolean {
  return readFlag('EXPO_PUBLIC_AI_FORCE_FAIL', 'false').toLowerCase() === 'true';
}
