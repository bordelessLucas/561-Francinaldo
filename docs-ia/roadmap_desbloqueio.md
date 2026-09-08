# Alpha SST — Roadmap sem Storage / OpenAI

> Documento vivo. Desenvolvimento **não para** por falta de Firebase Storage ou chave OpenAI.
> Design system: [`design_system.md`](design_system.md). Processo: **plano → aprovação → implementação**.

## Princípios

1. Validar telas/fluxos atuais **antes** de novas features (Fase 0).
2. Sem plano aprovado → sem código de feature.
3. Flags: `EXPO_PUBLIC_AI_PROVIDER=mock`, `EXPO_PUBLIC_ENABLE_STORAGE_UPLOAD=false`.
4. Contratos estáveis (`AnalysisResult`, `analyses`, Free/Premium) — credenciais trocam adapter, não a UI.

## Restrições atuais

| Bloqueado agora | Continua possível |
|-----------------|-------------------|
| Upload Storage / `imageUrl` permanente | Auth, Firestore, UI, catálogos, mocks |
| OpenAI Vision real (4B) | Análise mock + resultado estruturado (4A feito) |
| Download PDF na nuvem | Listas/metadados de Biblioteca |
| Asaas / ads produção | Esqueleto Premium (10A feito) |

## Fase 0 — Validação (em andamento)

**Status:** `aprovada` — go para sprints 5–9 no chat do product owner.

Roteiro de aceite (Expo Go / web):

1. Login / cadastro / logout / recuperação  
2. Home (CTA, tag Free/Premium, atalhos)  
3. Análise: captura → preview → analisando → riscos / controles / NRs  
4. Biblioteca: categorias + materiais  
5. Histórico: lista real Firestore + detalhe  
6. Perfil + Planos + Avisos de NRs  

Checklist de feedback:

- [x] Fluxo principal faz sentido em campo? *(go para continuar desenvolvimento)*  
- [ ] Free/Premium só com tag + “sem anúncios” ok?  
- [ ] Organização Biblioteca / Histórico ok?  
- [ ] Ajustes de copy/UI antes da próxima sprint?  

## Ordem do piloto

| Bloco | Status | Precisa Storage/OpenAI? |
|-------|--------|-------------------------|
| 0–2 Fundação / auth / shell + marca | Feito | Não |
| 3 Captura + registro | Feito (upload standby) | Upload sim |
| 4A Análise mock | Feito | Não |
| 4B GPT real | Standby | Sim |
| **Fase 0 Validação** | **Agora** | Não |
| **5A Histórico Firestore (texto/`result`)** | Próxima após Fase 0 + plano 5A | Não |
| 5B Miniatura/imagem no histórico | Depois | Sim (ou sessão) |
| 6A Catálogo Biblioteca | Depois de 5A | Não |
| 6B/7/8 PDFs e conteúdo oficial | Depois | Em geral sim + conteúdo cliente |
| 9 Push NRs | Depois | Fonte do cliente |
| 10A Premium UI | Feito | Não |
| 10B Pagamento | Standby | Billing/provedor |
| 11A Admin shell | Opcional após 6A | Não (métricas básicas) |
| 12 Publicação | Final | Contas do cliente |

## Sequência após Fase 0

1. Sprint **5A** — histórico real (ver [`sprint5a_historico.md`](sprint5a_historico.md))  
2. Sprint **6A** — catálogo Biblioteca (metadados; sem PDF no Storage)  
3. Ajustes UX do feedback (design system)  
4. Sprint **11A** admin shell (opcional)  
5. **Pacote desbloqueio** (quando Storage + chave GPT):  
   - Ativar Storage + `storage.rules`  
   - `EXPO_PUBLIC_ENABLE_STORAGE_UPLOAD=true`  
   - 4B OpenAI (preferência: backend; chave fora do app)  
   - Histórico com imagem; downloads Biblioteca  
   - 10B pagamento quando preço/regras fechados  

## Processo entre sprints

```text
Validar app → aprovar Fase 0
→ Plano da sprint N → aprovação explícita
→ Implementar + atualizar docs-ia
→ Demo / feedback
→ Próxima sprint só com novo plano aprovado
```

## Critérios de sucesso

- Desenvolvimento não para por falta de Storage/OpenAI  
- Cliente valida UX do núcleo antes de novas features  
- Cada sprint tem aceite testável e escopo fechado  
- Credenciais encaixam via flags/adapters, sem redesenhar o produto  
