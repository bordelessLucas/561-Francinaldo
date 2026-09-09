const appJson = require('./app.json');

/**
 * Expo config — injeta extras a partir do .env (não versionar segredos).
 * OPENAI_API_KEY nunca deve ser EXPO_PUBLIC_*; em produção prefira Netlify Function.
 */
module.exports = () => ({
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra ?? {}),
      aiAnalyzeUrl: process.env.EXPO_PUBLIC_AI_ANALYZE_URL ?? '',
      openaiApiKey: process.env.OPENAI_API_KEY ?? '',
    },
  },
});
