# Sprint 4B — Análise GPT Vision (efêmera)

> Como ligar a IA real. Índice: [`README.md`](README.md).

## Fluxo

```text
Câmera/Galeria → URI local → base64 (memória)
  → OpenAI Vision (via Netlify Function OU fallback direto)
  → AnalysisResult JSON
  → Firestore (só texto, localOnly)
  → descartar URI
```

## Variáveis

| Variável | Onde | Uso |
|----------|------|-----|
| `EXPO_PUBLIC_AI_PROVIDER=openai` | `.env` | Liga o provider real |
| `EXPO_PUBLIC_AI_MODEL` | `.env` | Default `gpt-4o-mini` |
| `EXPO_PUBLIC_AI_ANALYZE_URL` | `.env` | Base do site Netlify (produção) |
| `OPENAI_API_KEY` | `.env` / Netlify env | **Nunca** `EXPO_PUBLIC_` |

## Produção (recomendado)

1. Deploy da function [`netlify/functions/analyze-situation.ts`](../netlify/functions/analyze-situation.ts)
2. Em Netlify: `OPENAI_API_KEY=...`
3. No app: `EXPO_PUBLIC_AI_ANALYZE_URL=https://seu-site.netlify.app`

## Piloto local (agora)

Com `EXPO_PUBLIC_AI_ANALYZE_URL` vazio, o app usa a chave via `app.config.js` → `extra.openaiApiKey` só para desenvolvimento. **Rotacione a chave** se ela apareceu em chat/log. Não faça build de loja com esse fallback.

## Aceite

- Foto real muda riscos/controles/NRs vs mock  
- Histórico sem foto  
- Nenhuma escrita no Firebase Storage  

## Billing OpenAI

A chave precisa de **créditos ativos** em [platform.openai.com/settings/organization/billing](https://platform.openai.com/settings/organization/billing/).  
Sem saldo a API retorna `insufficient_quota` / `credit_balance_exhausted` e o app mostra **AI_QUOTA_EXCEEDED**.
