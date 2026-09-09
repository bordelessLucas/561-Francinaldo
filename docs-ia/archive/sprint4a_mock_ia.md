# Sprint 4A — Análise IA (mock GPT)

> **Arquivado.** Fonte de verdade: [`../escopo.md`](../escopo.md), [`../checklist_sprints.md`](../checklist_sprints.md), [`../roadmap.md`](../roadmap.md).

## Decisões

- Provedor **alvo:** GPT (OpenAI Vision) — integração real na **4B**
- Runtime **atual:** mock/fixture (`EXPO_PUBLIC_AI_PROVIDER=mock`)
- **Storage upload:** desligado (`EXPO_PUBLIC_ENABLE_STORAGE_UPLOAD=false`)
- Demo para aprovação do cliente sem billing/chaves

## Fluxo

Captura (câmera/galeria) → preview → confirm → `analyzing` → `done` (resultado) ou `failed`

Persistência Firestore `analyses/{id}`: `status`, `result`, `localOnly: true`, sem `imageUrl`.

## Flags (`.env`)

```
EXPO_PUBLIC_AI_PROVIDER=mock
EXPO_PUBLIC_ENABLE_STORAGE_UPLOAD=false
EXPO_PUBLIC_AI_FORCE_FAIL=false
```

`EXPO_PUBLIC_AI_FORCE_FAIL=true` simula erro na análise (aceite de falha).

## Arquivos

- `lib/types.ts` — `AnalysisResult`, status estendido
- `lib/featureFlags.ts`
- `src/services/ai.service.ts`
- `src/services/mocks/analysis-result.mock.ts`
- `src/services/analysis.service.ts` — `runAnalysisWithoutUpload`
- `src/screens/AnalysisScreen.tsx`

## Quando o cliente liberar

1. Ativar Firebase Storage + deploy `storage.rules`
2. `EXPO_PUBLIC_ENABLE_STORAGE_UPLOAD=true`
3. Implementar adapter OpenAI em `ai.service` + `EXPO_PUBLIC_AI_PROVIDER=openai` (+ chave segura, preferencialmente backend)
