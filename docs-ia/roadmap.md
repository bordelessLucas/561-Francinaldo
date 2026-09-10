# Alpha SST — Roadmap

> Documento vivo. Índice: [`README.md`](README.md). Design: [`design_system.md`](design_system.md).  
> Processo: **plano → aprovação → implementação**.

## Princípios

1. Sem plano aprovado → sem código de feature.
2. **Imagem da análise é efêmera** — sem Firebase Storage no fluxo de IA.
3. Flags: `EXPO_PUBLIC_ENABLE_STORAGE_UPLOAD=false`; análise de foto **somente OpenAI Vision**.
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
Camera/Galeria → Preview (+ contexto opcional) → OpenAI Vision → Firestore (texto)
                              ↘ Descartar URI local / reanálise com nota do inspetor
```

## Status do piloto (atual)

| Bloco | Status | Observação |
|-------|--------|------------|
| 0–2 Fundação / auth / shell + marca | Feito | SDK 57 |
| 3 Captura + registro | Feito | Upload Storage **não** usado no fluxo oficial |
| 4A Contrato JSON análise | Feito | Evoluiu para confiança + reanálise |
| 4B OpenAI Vision efêmera | Feito | Sem mock; prompt SST mineração/correlatas |
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
| **Agora** | Validar fotos reais em campo + afinar prompt | Créditos OpenAI |
| **1** | **11A** — Admin shell (métricas básicas) | Role admin |
| **2** | Conteúdo cliente (checklists/OS/NRs oficiais) | Lista do cliente |
| **3** | **9B** — Disparo push quando NR atualizar | Fonte do cliente + preferencialmente dev build |
| **4** | **10B** — Pagamento Premium | Preço/regras + provedor |
| Final | **12** — Polimento + Play | Contas do cliente |

### Sprint 4B — GPT Vision efêmera

**Status:** fluxo oficial ativo (sem mock). Requer `OPENAI_API_KEY` (+ créditos).

- Foto local → base64 → Vision → `AnalysisResult` (riscos/controles/NRs/confiança) → Firestore só texto  
- Reanálise com mensagem do inspetor  
- Preferência produção: Netlify Function [`/api/analyze-situation`](../netlify/functions/analyze-situation.ts) + `EXPO_PUBLIC_AI_ANALYZE_URL`  
- Fallback piloto: chamada direta OpenAI via `app.config.js` extra (chave **não** é `EXPO_PUBLIC_`)  

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
