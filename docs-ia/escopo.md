# Alpha SST — Escopo do Projeto

> Documento vivo (Memory Bank). Índice para agentes: [`README.md`](README.md).  
> Atualizar a cada meeting/requisito novo, separando confirmados, futuros e pendências.

## Objetivo principal

Aplicativo mobile de **Segurança e Saúde no Trabalho (SST)** para uso em campo, especialmente por profissionais iniciantes.

**Diferencial:** o usuário fotografa (câmera) ou seleciona (galéria) um ambiente de trabalho; a **IA** analisa a imagem e retorna:

1. Riscos ocupacionais identificados  
2. Medidas de controle sugeridas  
3. Relação com as **Normas Regulamentadoras (NRs)** aplicáveis  

A análise deve funcionar em **múltiplos ambientes** (postos de combustíveis, áreas industriais e demais cenários com riscos ocupacionais).

Publicação prevista: Google Play (piloto) e, depois, App Store.

---

## Público-alvo

App **aberto ao público** (não restrito à empresa do cliente).

- Profissionais SST / profissionais de Segurança do Trabalho  
- Iniciantes na área  
- Gestores de áreas industriais  
- Outros profissionais que precisem de auxílio na identificação de riscos  

**Cadastro:** o usuário deve poder se cadastrar diretamente pelo aplicativo.

---

## Perfis de usuário

| Perfil | Descrição | Acesso principal |
|--------|-----------|------------------|
| **Usuário comum** | Plano gratuito | Funcionalidades liberadas; possível exibição de anúncios |
| **Usuário assinante** | Premium | Sem anúncios; download de documentos; materiais/funcionalidades extras conforme evolução |
| **Administrador** | Operação do produto | Dashboard informativo de indicadores (sem gestão complexa de usuários no piloto) |

---

## Regras de negócio (confirmadas)

1. Fluxo de análise deve ser **simples e com poucos cliques**.  
2. Entrada da análise: **câmera ou galeria**.  
3. Saída da análise: riscos + medidas de controle + NRs relacionadas.  
4. Biblioteca SST com documentos organizados (visualizar / baixar / transferir conforme tipo — PDF/download é decisão futura, não bloqueia a IA).  
5. Área de **Checklists** (equipamentos, ambientes, atividades, áreas) — lista definitiva com o cliente.  
6. **Ordens de Serviço** disponíveis para download/uso externo — modelos a definir.  
7. Seção de **NRs** com consulta e download de PDF quando disponível (conteúdo oficial pendente).  
8. **Notificações** apenas para **atualizações de NRs** (com permissão do usuário).  
9. Monetização paralela: **gratuito (ads)** + **premium (assinatura)** — provedor de pagamento TBD (ex.: Asaas). **10A:** esqueleto UI (planos, gates, pré-visualização) para validação; **sem cobrança**.  
10. Dashboard admin é **informativo** (métricas/gráficos), não painel complexo de liberação de acessos.  
11. UI prioritária: simples, prática, intuitiva, rápida em campo.  
12. Marca: **Alpha SST** — logo e paleta oficiais aplicadas no design system.  
13. Dados/infra vinculados às contas do cliente sempre que possível.  
14. Arquitetura deve **prever** premium, ads e expansão da biblioteca **sem antecipar** o que não estiver na sprint aprovada.  
15. Não assumir funcionalidades não confirmadas; priorizar o escopo confirmado mais recente.  
16. **Imagem da análise é efêmera:** URI local → IA → descartar. Firestore guarda só o resultado em texto (`localOnly`). **Firebase Storage não é requisito da análise.** Storage só entra se/quando a Biblioteca precisar de PDF (escopo separado). Ver [`roadmap.md`](roadmap.md).  
17. **Aprovação entre sprints:** plano da sprint → aprovação explícita → implementar. Sem plano → sem feature.  
18. **Design system** ([`design_system.md`](design_system.md)) é obrigatório em toda entrega de UI.  

---

## Funcionalidades core (piloto)

### 1. Análise de ambiente com IA
Captura → preview local → análise (mock hoje; GPT na 4B) → riscos → medidas → NRs. Sem persistir a foto.

### 2. Biblioteca SST
Checklists, Ordens de Serviço, NRs, planilhas SST — catálogo/resumos no app (6A).

### 3. Notificações
Avisos de atualização de Normas Regulamentadoras (permissão + device; disparo 9B).

### 4. Usuários
Cadastro e estrutura comum / assinante / administrador.

### 5. Dashboard administrativo
Totais de usuários, acessos, acessos/dia, indicadores e gráficos (11A).

---

## Fluxo principal — Análise com IA

1. Acessar o app  
2. Selecionar análise  
3. Foto (câmera) ou imagem (galeria) — só no aparelho  
4. Confirmar preview  
5. IA analisa (bytes temporários na 4B; mock na 4A)  
6. Retorno dos riscos / controles / NRs  
7. Registro no Firestore **sem** `imageUrl`  
8. Descarte da URI local  

---

## Evoluções previstas (fora do piloto imediato)

- Assinatura premium completa  
- Publicidade no app  
- Expansão da biblioteca (checklists, OS, planilhas)  
- Ampliação de recursos do assinante  
- PDF/download via Storage **somente** se o cliente confirmar essa necessidade  

---

## Pendências com o cliente

- [x] Logo oficial Alpha SST  
- [x] Paleta definitiva baseada na logo  
- [x] Fase 0 — go inicial para continuar o piloto  
- [ ] Confirma que Free/Premium compartilham as mesmas telas?  
- [ ] Anúncios só no Free é suficiente como diferencial nesta fase?  
- [ ] Organização da Biblioteca e do Histórico fazem sentido?  
- [ ] Áreas prioritárias / equipamentos / modelos de checklist  
- [ ] Modelos de Ordens de Serviço  
- [ ] Lista inicial de planilhas SST  
- [ ] Quais documentos são gratuitos vs Premium  
- [ ] Limitações do plano gratuito  
- [ ] Valor, ciclo e regras da assinatura (10B)  
- [ ] Provedor de pagamento definitivo  
- [ ] Estratégia/plataforma de anúncios  
- [ ] Origem e mecanismo de atualização das NRs (9B)  
- [ ] Critérios da IA e formato exato do retorno da análise  
- [x] Chave API OpenAI (ou backend com secret) para Sprint **4B**  
- [ ] Créditos / billing OpenAI ativos (sem saldo a Vision falha com quota)  
- [ ] (Opcional) Billing Firebase Storage — **só** se quiserem PDF/download na Biblioteca  

---

## Stack de referência (decisão técnica da equipe)

Projeto em andamento com **Expo (SDK 57 — travado)** + TypeScript + Firebase (Auth, Firestore; Storage opcional futuro) + NativeWind.

> **SDK Expo:** manter **sempre 57.x**. Versão pinada: `expo@57.0.21` + `overrides.expo`. Conferir com `npm run check:sdk`.

### Pontos de atenção arquiteturais

| Tema | Atenção |
|------|---------|
| Análise de imagem com IA | **4B ativo:** GPT Vision efêmero. Flags: `EXPO_PUBLIC_AI_PROVIDER`, `EXPO_PUBLIC_AI_ANALYZE_URL`, `EXPO_PUBLIC_AI_MODEL`. Segredo: `OPENAI_API_KEY` (Netlify / `.env`, nunca `EXPO_PUBLIC_`). |
| Histórico | Texto/`result` apenas; **5B imageUrl cancelada** no piloto |
| Upload Storage | Código legado existe; **não** faz parte do fluxo oficial de análise (`ENABLE_STORAGE_UPLOAD=false`) |
| Próximas sprints | Ver [`roadmap.md`](roadmap.md): 4B → 11A → conteúdo → 9B → 10B → 12 |
| Pagamentos | **10B** após preço/regras |
| Dashboard admin | **11A** shell; métricas Firestore |
| Push de NRs | Permissão feita; disparo **9B** pendente de fonte |
| PDFs / downloads | Fora do caminho da IA; só com decisão explícita de Biblioteca |

---

## Como atualizar este documento

Sempre separar:

- Requisitos confirmados  
- Regras de negócio  
- Funcionalidades do piloto  
- Funcionalidades futuras  
- Perfis e permissões  
- Dados necessários  
- Integrações  
- Pendências  
- Decisões técnicas  
- Itens a validar com o cliente  
