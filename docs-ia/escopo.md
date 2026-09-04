# Alpha SST — Escopo do Projeto

> Documento vivo (Memory Bank). Atualizar a cada meeting/requisito novo, separando confirmados, futuros e pendências.

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

- Técnicos / profissionais de Segurança do Trabalho  
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
4. Biblioteca SST com documentos organizados (visualizar / baixar / transferir conforme tipo).  
5. Área de **Checklists** (equipamentos, ambientes, atividades, áreas) — lista definitiva com o cliente.  
6. **Ordens de Serviço** disponíveis para download/uso externo — modelos a definir.  
7. Seção de **NRs** com consulta e download de PDF quando disponível.  
8. **Notificações** apenas para **atualizações de NRs** (com permissão do usuário).  
9. Monetização paralela: **gratuito (ads)** + **premium (assinatura)** — provedor de pagamento TBD (ex.: Asaas). **10A:** esqueleto UI (planos, gates, pré-visualização) para validação; **sem cobrança**.  
10. Dashboard admin é **informativo** (métricas/gráficos), não painel complexo de liberação de acessos.  
11. UI prioritária: simples, prática, intuitiva, rápida em campo.  
12. Marca: **Alpha SST** — logo e paleta oficiais aplicadas no design system.  
13. Dados/infra vinculados às contas do cliente sempre que possível.  
14. Arquitetura deve **prever** premium, ads e expansão da biblioteca **sem antecipar** o que não estiver na sprint aprovada.  
15. Não assumir funcionalidades não confirmadas; priorizar o escopo confirmado mais recente.

---

## Funcionalidades core (piloto)

### 1. Análise de ambiente com IA
Captura/envio → análise → riscos → medidas de controle → NRs.

### 2. Biblioteca SST
Checklists, Ordens de Serviço, NRs, planilhas SST — organizadas no app.

### 3. Notificações
Avisos de atualização de Normas Regulamentadoras.

### 4. Usuários
Cadastro e estrutura comum / assinante / administrador.

### 5. Dashboard administrativo
Totais de usuários, acessos, acessos/dia, indicadores e gráficos.

---

## Fluxo principal — Análise com IA

1. Acessar o app  
2. Selecionar análise  
3. Foto (câmera) ou imagem (galeria)  
4. Envio para análise  
5. IA analisa o ambiente  
6. Retorno dos riscos  
7. Medidas de controle  
8. Relação com NRs  

---

## Evoluções previstas (fora do piloto imediato)

- Assinatura premium completa  
- Publicidade no app  
- Expansão da biblioteca (checklists, OS, planilhas)  
- Ampliação de recursos do assinante  

---

## Pendências com o cliente

- [x] Logo oficial Alpha SST  
- [x] Paleta definitiva baseada na logo
- [ ] Áreas prioritárias / equipamentos / modelos de checklist  
- [ ] Modelos de Ordens de Serviço  
- [ ] Lista inicial de planilhas SST  
- [ ] Quais documentos são gratuitos vs Premium  
- [ ] Limitações do plano gratuito  
- [ ] Valor e regras da assinatura  
- [ ] Provedor de pagamento definitivo  
- [ ] Estratégia/plataforma de anúncios  
- [ ] Origem e mecanismo de atualização das NRs  
- [ ] Critérios da IA e formato exato do retorno da análise  

---

## Stack de referência (decisão técnica da equipe)

Projeto já em andamento com **Expo (SDK 54) + TypeScript + Firebase (Auth, Firestore, Storage) + NativeWind**.

### Pontos de atenção arquiteturais

| Tema | Atenção |
|------|---------|
| Análise de imagem com IA | **Alvo:** GPT (visão). **4A:** mock/fixture + contrato JSON no Firestore. **Standby:** Storage upload + chave OpenAI até billing do cliente. Flags: `EXPO_PUBLIC_AI_PROVIDER`, `EXPO_PUBLIC_ENABLE_STORAGE_UPLOAD` |
| Pagamentos (Asaas etc.) | Webhooks e assinaturas pedem backend/Cloud Functions |
| Dashboard admin | Preferencialmente web (Expo web ou app separado); métricas via Firestore/Analytics |
| Push de NRs | Expo Notifications + FCM compatível; origem dos dados de atualização ainda pendente |
| Anúncios (gratuito) | AdMob ou similar; política de lojas e UX em campo |
| PDFs / downloads | Storage + visualização/compartilhamento nativo; controle Premium vs free |
| Publicação | Contas de loja e Firebase do **cliente** |

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
