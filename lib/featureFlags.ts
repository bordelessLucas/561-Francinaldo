/**
 * Feature flags — sem segredos no código.
 *
 * Análise do piloto: imagem **efêmera** (sem Firebase Storage) + OpenAI Vision.
 * - EXPO_PUBLIC_AI_MODEL: modelo Vision (default gpt-4o-mini)
 * - EXPO_PUBLIC_AI_ANALYZE_URL: URL base da Netlify (ex.: https://site.netlify.app)
 * - OPENAI_API_KEY: só no .env / Netlify (via app.config extra no piloto; ideal só no servidor)
 */

function readFlag(name: string, fallback: string): string {
  const value = process.env[name];
  return typeof value === 'string' && value.length > 0 ? value.trim() : fallback;
}

/**
 * Upload Storage — desligado no piloto (análise efêmera).
 */
export function isStorageUploadEnabled(): boolean {
  return readFlag('EXPO_PUBLIC_ENABLE_STORAGE_UPLOAD', 'false').toLowerCase() === 'true';
}
