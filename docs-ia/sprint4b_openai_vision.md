# Sprint 4B — Análise GPT Vision (efêmera)

> Fluxo oficial de análise de fotos. Índice: [`README.md`](README.md).

## Fluxo

```text
Câmera (1) / Galeria (várias, até 8)
  → lote local + contexto opcional do inspetor
  → fila sequencial (1 Vision call por vez)
    → AnalysisResult por foto → Firestore (texto, localOnly)
  → resumo do lote / detalhe (1 foto) + reanálise com mensagem
```

O usuário envia um **lote**; o sistema analisa **uma a uma** (sem pico de tokens).

## Variáveis

| Variável | Onde | Uso |
|----------|------|-----|
| `EXPO_PUBLIC_AI_MODEL` | `.env` | Default `gpt-4o-mini` |
| `EXPO_PUBLIC_AI_ANALYZE_URL` | `.env` | Base do site Netlify (produção) |
| `OPENAI_API_KEY` | `.env` / Netlify env | **Nunca** `EXPO_PUBLIC_` |

Não há mais provider `mock` no fluxo de análise de fotos.

## Prompt / papel da IA

- Especialista SST BR (mineração + indústrias correlatas)
- Público: inspetores, técnicos e gestores
- Deve declarar incerteza (`needsInspectorReview`, `limitations`, `confidence`, `uncertaintyNote`)
- Aceita **contexto adicional do inspetor** na reanálise

Arquivos: `src/services/ai/prompt.ts` e `netlify/functions/_shared/analysis-prompt.ts` (manter espelhados).

## Produção (recomendado)

1. Deploy da function [`netlify/functions/analyze-situation.ts`](../netlify/functions/analyze-situation.ts)
2. Em Netlify: `OPENAI_API_KEY=...`
3. No app: `EXPO_PUBLIC_AI_ANALYZE_URL=https://seu-site.netlify.app`

## Piloto local

Com `EXPO_PUBLIC_AI_ANALYZE_URL` vazio, o app usa a chave via `app.config.js` → `extra.openaiApiKey`. **Não** faça build de loja com esse fallback.

## Aceite

- Foto real muda riscos/controles/NRs  
- Aviso quando a IA tem dúvida / não identifica algo  
- Reanálise com mensagem do inspetor gera novo registro no histórico  
- **Lote:** várias fotos na UI; progresso 1 a 1; cada foto → registro no histórico  
- Histórico sem foto  
- Nenhuma escrita no Firebase Storage  

## Billing OpenAI

A chave precisa de **créditos ativos** em [platform.openai.com billing](https://platform.openai.com/settings/organization/billing/).  
Sem saldo → `AI_QUOTA_EXCEEDED`.
