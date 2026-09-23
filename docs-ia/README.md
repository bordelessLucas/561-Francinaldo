# docs-ia — guia para agentes e humanos

> Fonte canônica do piloto **Alpha SST**. Atualizar a cada sprint aprovada.

## Ordem de leitura (obrigatória)

1. [`escopo.md`](escopo.md) — produto, regras de negócio, pendências do cliente, stack  
2. [`checklist_sprints.md`](checklist_sprints.md) — o que está feito / pendente  
3. [`roadmap.md`](roadmap.md) — sequência das **próximas** sprints  
4. [`design_system.md`](design_system.md) — lei de UI (obrigatório em entrega visual)
5. [`sprint4b_openai_vision.md`](sprint4b_openai_vision.md) — como ligar GPT Vision (efêmero)

## Política de imagem (análise)

A foto da análise é **efêmera**: só na sessão (e, na 4B, no request à IA).  
**Não** se grava no Firebase Storage. Histórico persiste só o **resultado em texto** (`localOnly`).  
Storage só volta a ser tema se o cliente pedir **PDF/download** da Biblioteca — decisão **separada** da IA.

## Processo

`plano da sprint → aprovação explícita → implementar → atualizar estes docs → feedback`

Sem plano aprovado → sem código de feature.

## Sprint atual

Plano aprovado/pendente de aprovação: [`sprint_atual_ia_rag_nrs.md`](sprint_atual_ia_rag_nrs.md).

Prioridade: assertividade da IA, base completa de NRs e RAG. Voz antes do envio e ajustes de UI do cliente entram depois que esta base estiver estabilizada.

## Archive

[`archive/`](archive/) — notas de sprint históricas (4A, 5A, 10A, roadmap antigo).  
**Não** usar como fonte de verdade; só contexto histórico.
