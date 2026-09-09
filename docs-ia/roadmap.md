# Alpha SST — Roadmap

> Documento vivo. Índice: [`README.md`](README.md). Design: [`design_system.md`](design_system.md).  
> Processo: **plano → aprovação → implementação**.

## Princípios

1. Sem plano aprovado → sem código de feature.
2. **Imagem da análise é efêmera** — sem Firebase Storage no fluxo de IA.
3. Flags: `EXPO_PUBLIC_AI_PROVIDER=mock` (default), `EXPO_PUBLIC_ENABLE_STORAGE_UPLOAD=false`.
4. Contratos estáveis (`AnalysisResult`, `analyses`, Free/Premium) — credenciais trocam adapter, não a UI.

## Política de mídia (confirmada)

| Item | Decisão |
|------|---------|
| Foto da análise | Temporária (URI local → IA → descartar) |
| Persistência | Firestore: só `result` / status (`localOnly: true`) |
| Firebase Storage na análise | **Não usar** no piloto |
| 5B `imageUrl` permanente | **Cancelada** no piloto |
| Storage no futuro | Só se Biblioteca precisar de PDF/download (escopo separado) |

```text
Camera/Galeria → Preview local → IA (mock|GPT) → Firestore (texto)
                              ↘ Descartar URI local
```

## Status do piloto (atual)

| Bloco | Status | Observação |
|-------|--------|------------|
| 0–2 Fundação / auth / shell + marca | Feito | SDK 57 |
| 3 Captura + registro | Feito | Upload Storage **não** usado no fluxo oficial |
| 4A Análise mock | Feito | Contrato JSON estável |
| 5A Histórico Firestore (texto) | Feito | Sem foto |
| 6A Catálogo Biblioteca | Feito | Metadados / resumos |
| 7–8 Checklists / OS / NRs (estrutura) | Feito | Conteúdo oficial pendente do cliente |
| 9 Push NRs (permissão + device) | Feito | Disparo (9B) pendente |
| 10A Premium UI | Feito | Sem cobrança |
| UI tema + Configurações | Feito | Sistema / Claro / Escuro |
| Fase 0 validação inicial | Aprovada | Go do product owner |

## Próximas sprints (ordem)

| Ordem | Sprint | Depende de |
|-------|--------|------------|
| **Agora** | **4B** — GPT Vision efêmero (sem Storage) | Chave no `.env`; produção: Netlify `/api/analyze-situation` |
| **1** | **11A** — Admin shell (métricas básicas) | Role admin |
| **2** | **11A** — Admin shell (métricas básicas) | Role admin |
| **3** | Conteúdo cliente (checklists/OS/NRs oficiais) | Lista do cliente |
| **4** | **9B** — Disparo push quando NR atualizar | Fonte do cliente + preferencialmente dev build |
| **5** | **10B** — Pagamento Premium | Preço/regras + provedor |
| Final | **12** — Polimento + Play | Contas do cliente |

### Sprint 4B — GPT Vision efêmero

**Status:** implementada (ligar com `EXPO_PUBLIC_AI_PROVIDER=openai` + `OPENAI_API_KEY`).

- Foto local → base64 → Vision → `AnalysisResult` → Firestore só texto  
- Preferência produção: Netlify Function [`/api/analyze-situation`](../netlify/functions/analyze-situation.ts) + `EXPO_PUBLIC_AI_ANALYZE_URL`  
- Fallback piloto: chamada direta OpenAI via `app.config.js` extra (chave **não** é `EXPO_PUBLIC_`)  
- Default pode voltar a `mock` a qualquer momento pela flag  

**Segurança:** nunca commitar `.env`. Se a chave vazou em chat/log, **rotacione** no painel OpenAI.

### Fora do piloto (sob a política atual)

- 5B imageUrl permanente  
- Upload Storage na análise  
- 6B/8 PDF via Storage — só com nova decisão de Biblioteca  

## Dependências externas

| Item | Impacta |
|------|---------|
| Chave OpenAI / backend | **4B** |
| Lista oficial checklists/OS/planilhas | Conteúdo 6–8 |
| Fonte de atualização das NRs | **9B** |
| Preço + pagamento | **10B** |
| Contas loja/Firebase do cliente | **12** |
| Storage billing | Só Biblioteca PDF (se aprovado depois) — **não bloqueia 4B** |

## Processo entre sprints

```text
Plano da sprint N → aprovação explícita
→ Implementar + atualizar escopo/checklist/roadmap
→ Demo / feedback
→ Próxima sprint só com novo plano aprovado
```
