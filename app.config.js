const appJson = require('./app.json');

/**
 * Expo config — injeta extras a partir do .env / EAS env (não versionar segredos).
 * OPENAI_API_KEY nunca deve ser EXPO_PUBLIC_*; em produção prefira Netlify Function.
 */
module.exports = () => {
  const baseExtra = appJson.expo.extra ?? {};
  return {
    expo: {
      ...appJson.expo,
      extra: {
        ...baseExtra,
        aiAnalyzeUrl: process.env.EXPO_PUBLIC_AI_ANALYZE_URL ?? baseExtra.aiAnalyzeUrl ?? '',
        openaiApiKey: process.env.OPENAI_API_KEY ?? baseExtra.openaiApiKey ?? '',
        eas: {
          ...(baseExtra.eas ?? {}),
          projectId:
            baseExtra.eas?.projectId ?? 'f9b70406-8803-4e80-aa9a-403732ef3c68',
        },
      },
    },
  };
};
