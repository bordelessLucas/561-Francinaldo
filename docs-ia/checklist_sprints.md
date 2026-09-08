# Alpha SST — Checklist de Sprints

> Ordem lógica do piloto. Marcar `- [x]` ao concluir.  
> Roadmap: [`roadmap_desbloqueio.md`](roadmap_desbloqueio.md).

### Processo

`plano da sprint → aprovação → implementar → feedback`

### Fase 0 — Validação

- [x] **Fase 0** — validação inicial / go para continuar sprints 5–9 (aprovação do product owner no chat)  

---

## Sprint 0 — Fundação técnica
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
- [x] Upload da imagem para Storage — **código pronto; Storage em standby (billing)**  
- [x] Registro mínimo da análise (status: pendente / enviada)  

---

## Sprint 4 — Análise com IA (risco + controle + NRs)
- [x] Integração com provedor de visão/IA (definir e documentar) — alvo **GPT**; runtime **mock**  
- [x] Envio da imagem para análise — local/sessão (sem Storage)  
- [x] Retorno estruturado: riscos identificados  
- [x] Medidas de controle por risco  
- [x] Relacionamento com NRs aplicáveis — heurística no mock  
- [x] Tela de resultado clara e acionável  
- [x] Tratamento de falha / timeout / imagem inválida  
- [ ] **4B:** chamada real OpenAI Vision + upload Storage  

---

## Sprint 5 — Histórico de análises
- [x] **5A** Lista de análises do usuário (Firestore)  
- [x] **5A** Detalhe com resultados (riscos / controles / NRs; sem exigir imagem)  
- [x] **5A** Estado vazio / loading / erro reais  
- [ ] **5B** Detalhe com imagem persistente (`imageUrl`)  
- [ ] Regras de acesso conforme perfil (comum / assinante), se houver limite  

---

## Sprint 6 — Biblioteca SST (estrutura)
- [x] **6A** Área Biblioteca com categorias: Checklists, OS, NRs, Planilhas  
- [x] **6A** Listagem e organização de documentos (metadados / catálogo local)  
- [ ] **6B** Visualização in-app de arquivos quando o formato permitir  
- [ ] **6B** Download / compartilhamento para uso externo  
- [ ] Controle básico free vs conteúdo Premium (flags; regras finais com cliente)  

---

## Sprint 7 — Checklists e Ordens de Serviço
- [x] Seção Checklists (estrutura por área/equipamento/atividade) — catálogo  
- [x] Conteúdo inicial de exemplo (substituir pela lista do cliente quando disponível)  
- [x] Modelos de Ordens de Serviço (metadados; download depois)  
- [ ] Categorias/modelos alinhados ao padrão definitivo do cliente  

---

## Sprint 8 — Normas Regulamentadoras (NRs)
- [x] Seção de consulta de NRs (catálogo + detalhe)  
- [ ] Download de PDF quando disponível (Storage)  
- [x] Vínculo das NRs com resultados da análise de IA — via resultado da análise + catálogo  
- [ ] Base de conteúdo oficial (fonte a confirmar com cliente)  

---

## Sprint 9 — Notificações de atualização de NRs
- [x] Permissão de push no dispositivo  
- [x] Cadastro do device / usuário para push (`devices`)  
- [ ] Disparo quando NR for atualizada (fonte/cliente)  
- [x] Conteúdo / escopo preparado: tópico `nr_updates`  
- [x] Escopo limitado a atualizações de NRs (piloto)  

---

## Sprint 10 — Monetização (estrutura)
- [x] Flag de plano: comum vs assinante — helpers + UI de plano  
- [x] Gate / diferenciação Premium — tag Free/Premium  
- [ ] Preparação para anúncios no plano gratuito (sem obrigar go-live)  
- [ ] **10B** Preparação para provedor de pagamento (ex.: Asaas)  
- [ ] **10B** Regras finais de preço/limites após validação com cliente  

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

## Dependências externas

| Item | Impacta |
|------|---------|
| Billing Firebase Storage | Upload, 5B, 6B, PDFs |
| Chave OpenAI | Sprint 4B |
| Lista oficial checklists/OS/planilhas | Sprints 6–7 (refino) |
| Fonte de atualização das NRs | Sprint 9 (disparo) |
| Regras free vs Premium + pagamento | Sprint 10B |
| Contas de loja/Firebase do cliente | Sprint 12 |
