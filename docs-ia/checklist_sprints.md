# Alpha SST — Checklist de Sprints

> Ordem lógica do piloto. Marcar `- [x]` ao concluir. Não antecipar itens futuros sem sprint/escopo aprovado.

---

## Sprint 0 — Fundação técnica
*(base do app; não recriar o que já estiver estável)*

- [x] App Expo + TypeScript + navegação base  
- [x] Estilo / design system provisório  
- [x] Firebase Auth + Firestore + Storage configurados  
- [x] Ambientes e variáveis de configuração  
- [x] Estrutura de pastas e documentação `docs-ia/`  

---

## Sprint 1 — Autenticação e perfis
- [x] Cadastro público pelo app  
- [x] Login / logout / recuperação de senha  
- [x] Modelo de usuário: comum | assinante | administrador  
- [x] Persistência de sessão  
- [x] Rotas protegidas por autenticação  
- [x] Tratamento de conta/perfil inválido ou inativo (se aplicável)  

---

## Sprint 2 — Shell do app e navegação principal
- [x] Home com CTA principal de análise  
- [x] Menu / tabs: Análise, Biblioteca, Perfil (e demais módulos do piloto)  
- [x] UI simples, poucos cliques, otimizada para campo  
- [x] Estados de loading / vazio / erro padronizados  
- [x] Aplicação da marca oficial (logo + paleta Alpha SST)  

---

## Sprint 3 — Captura de situação (pré-IA)
- [x] Permissões de câmera e galeria  
- [x] Captura pela câmera  
- [x] Seleção pela galeria  
- [x] Preview e confirmação da imagem  
- [x] Upload da imagem para Storage  
- [x] Registro mínimo da análise (status: pendente / enviada)  

---

## Sprint 4 — Análise com IA (risco + controle + NRs)

> **4A (atual):** mock GPT + fluxo UI + Firestore — Storage e OpenAI reais em standby.  
> **4B (depois):** chave GPT + Storage quando o cliente liberar billing.

- [x] Integração com provedor de visão/IA (definir e documentar) — alvo **GPT**; runtime **mock** na 4A  
- [x] Envio da imagem para análise — local/sessão (sem Storage); mock processa a confirmação  
- [x] Retorno estruturado: riscos identificados  
- [x] Medidas de controle por risco  
- [x] Relacionamento com NRs aplicáveis — heurística no mock; base oficial na Sprint 8  
- [x] Tela de resultado clara e acionável  
- [x] Tratamento de falha / timeout / imagem inválida — falha simulável via `EXPO_PUBLIC_AI_FORCE_FAIL`  
- [ ] **4B:** chamada real OpenAI Vision + upload Storage  

---

## Sprint 5 — Histórico de análises
- [ ] Lista de análises do usuário  
- [ ] Detalhe de uma análise (imagem + resultados)  
- [ ] Estado vazio real (sem mocks permanentes)  
- [ ] Regras de acesso conforme perfil (comum / assinante), se houver limite  

---

## Sprint 6 — Biblioteca SST (estrutura)
- [ ] Área Biblioteca com categorias: Checklists, OS, NRs, Planilhas  
- [ ] Listagem e organização de documentos  
- [ ] Visualização in-app quando o formato permitir  
- [ ] Download / compartilhamento para uso externo  
- [ ] Controle básico free vs conteúdo Premium (flags; regras finais com cliente)  

---

## Sprint 7 — Checklists e Ordens de Serviço
- [ ] Seção Checklists (estrutura por área/equipamento/atividade)  
- [ ] Conteúdo inicial conforme lista do cliente (quando disponível)  
- [ ] Modelos de Ordens de Serviço para download  
- [ ] Categorias/modelos alinhados ao padrão do cliente  

---

## Sprint 8 — Normas Regulamentadoras (NRs)
- [ ] Seção de consulta de NRs  
- [ ] Download de PDF quando disponível  
- [ ] Vínculo das NRs com resultados da análise de IA  
- [ ] Base de conteúdo inicial (fonte a confirmar com cliente)  

---

## Sprint 9 — Notificações de atualização de NRs
- [ ] Permissão de push no dispositivo  
- [ ] Cadastro do device / usuário para push  
- [ ] Disparo quando NR for atualizada  
- [ ] Conteúdo da notificação: norma + informação da atualização  
- [ ] Escopo limitado a atualizações de NRs (piloto)  

---

## Sprint 10 — Monetização (estrutura)

> **10A (atual):** esqueleto UI/UX Premium para validação com o cliente (sem pagamento).  
> **10B (depois):** Asaas/pagamento real + regras finais de preço/limites.

- [x] Flag de plano: comum vs assinante — helpers + UI de plano / pré-visualização  
- [x] Gate de download/materiais Premium — gates visuais na Biblioteca (sem download real)  
- [ ] Preparação para anúncios no plano gratuito (sem obrigar go-live) — só placeholder de copy na 10A  
- [ ] Preparação para provedor de pagamento (ex.: Asaas) via backend/Functions  
- [ ] Regras finais de preço/limites após validação com cliente  

---

## Sprint 11 — Dashboard administrativo
- [ ] Acesso restrito ao perfil administrador  
- [ ] Métricas: usuários cadastrados, acessos, acessos/dia  
- [ ] Indicadores de utilização + gráficos  
- [ ] Painel informativo (sem gestão complexa de usuários no piloto)  

---

## Sprint 12 — Polimento e publicação piloto
- [ ] Logo e paleta oficiais aplicadas  
- [ ] Testes de fluxo principal em campo (poucos cliques)  
- [ ] Revisão de pendências críticas com o cliente  
- [ ] Build de loja (Google Play)  
- [ ] Contas/infra vinculadas ao cliente  
- [ ] Checklist de segurança (Auth, Storage, rules)  

---

## Backlog futuro (não implementar sem aprovação)

- [ ] Assinatura premium completa em produção  
- [ ] Anúncios em produção  
- [ ] Expansão massiva da biblioteca  
- [ ] Novos checklists / OS / planilhas  
- [ ] Recursos extras exclusivos do assinante  
- [ ] App Store  

---

## Dependências externas (bloqueiam ou condicionam sprints)

| Item | Impacta |
|------|---------|
| Logo + paleta | Sprint 2 (parcial) e Sprint 12 |
| Critérios/formato da IA | Sprint 4 |
| Lista de checklists / OS / planilhas | Sprints 6–7 |
| Fonte de atualização das NRs | Sprints 8–9 |
| Regras free vs Premium + pagamento | Sprint 10 |
| Contas de loja/Firebase do cliente | Sprint 12 |
