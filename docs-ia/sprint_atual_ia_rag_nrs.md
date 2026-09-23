# Sprint Atual - IA assertiva, base de NRs e RAG

> Fonte: pedido de sprint em 23/09/2026 + doc viva `docs-ia/`.
> Status: implementacao iniciada em 23/09/2026.

## Objetivo

Melhorar a assertividade da analise com IA para que o app Alpha SST deixe de produzir relatorios ilusorios, passe a usar uma base completa de Normas Regulamentadoras e entregue respostas mais concretas, relevantes e honestas para o usuario em campo.

## Diagnostico da doc viva

- O fluxo OpenAI Vision efemero ja existe e esta documentado em `sprint4b_openai_vision.md`.
- O catalogo de NRs no app existe, mas hoje contem apenas algumas NRs de exemplo.
- A doc viva marcava a "base de conteudo oficial" como pendente do cliente; esta sprint muda a prioridade: a base NR passa a ser requisito imediato.
- O prompt atual exige "2 a 6 riscos", o que incentiva falso positivo: mesmo quando a foto nao mostra problema, a IA e pressionada a listar riscos.
- O contrato `AnalysisResult` ainda nao separa bem os casos "ambiente SST sem nao conformidade visivel" e "imagem fora de contexto de trabalho".
- As features de voz antes do envio e ajustes de UI ficam como fase posterior da mesma trilha, depois da base IA/RAG.

## Fonte oficial das NRs

Usar como fonte primaria a pagina do Ministerio do Trabalho e Emprego:

`https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/ctpp-nrs/normas-regulamentadoras-nrs`

Em 23/09/2026, a pagina lista os textos vigentes de NR-1 a NR-38, com NR-2 e NR-27 revogadas. A ingestao deve registrar status `vigente` ou `revogada` e preservar URL oficial por norma.

## Criterios de aceite

1. O app lista todas as NRs disponiveis na fonte oficial, incluindo NRs revogadas marcadas como tal quando aparecerem na fonte.
2. Cada NR tem codigo, titulo, resumo curto, status, fonte oficial e tags de busca.
3. A analise de IA pode retornar zero riscos quando nao houver nao conformidade visivel.
4. A analise de IA pode classificar imagem como fora de contexto SST/ambiente de trabalho e deve explicar isso sem inventar cenario.
5. Cada risco retornado deve ter evidencia visual ou declaracao explicita de inferencia.
6. O relatorio deve diferenciar riscos confirmados, pontos que precisam de verificacao, cena sem problemas visiveis e imagem inadequada para analise SST.
7. A selecao de NRs na analise deve vir de trechos recuperados da base local/RAG, nao apenas da memoria do modelo.
8. O backend deve registrar quais NRs/trechos foram usados como contexto da resposta.
9. O historico continua sem salvar a foto, mantendo a politica de imagem efemera.
10. O fluxo de reanalise deve aceitar contexto escrito e, depois, contexto por voz transcrito.
11. Devem existir testes com imagens/casos sinteticos cobrindo falso positivo, foto fora de contexto e cenario sem problema visivel.

## Arquitetura proposta

### 1. Base NR local e versionada

Criar uma fonte estruturada no repositorio para metadados das NRs:

- `src/data/nrs/catalog.ts`: lista de todas as NRs com codigo, titulo, status, resumo, tags e URL oficial.
- `src/data/nrs/index.ts`: helpers de busca por codigo/tag/texto.
- `scripts/sync-nrs.mjs`: script para validar/atualizar metadados a partir da fonte oficial quando necessario.

Nesta sprint, priorizar metadados e resumos curtos revisaveis. Texto integral/PDF pode ficar como URL oficial ate a decisao de download/PDF da Biblioteca.

### 2. RAG server-side

Adicionar recuperacao de contexto antes da chamada Vision:

- `netlify/functions/_shared/nr-knowledge.ts`: base compacta de NRs para uso na function.
- `netlify/functions/_shared/retrieve-nr-context.ts`: ranking deterministico por palavras-chave, codigo de NR e termos do contexto do inspetor.
- `netlify/functions/analyze-situation.ts`: incluir os trechos recuperados no prompt e devolver `retrievalContext` no JSON normalizado.

Observacao: como a entrada principal e imagem, a primeira versao do RAG deve combinar tags/termos SST comuns, texto do inspetor, uma etapa textual curta do modelo pedindo descricao objetiva da cena e fallback para um conjunto amplo de NRs quando a cena for ambigua.

Embeddings podem entrar depois se a base integral das NRs for incorporada. Para esta sprint, ranking lexical auditavel e suficiente para reduzir alucinacao sem aumentar muito custo/complexidade.

### 3. Contrato de analise honesta

Evoluir `AnalysisResult`:

- `sceneType`: `workplace` | `non_workplace` | `unclear`
- `complianceSummary`: `issues_found` | `no_visible_issue` | `not_applicable` | `needs_more_context`
- `evidence`: lista curta por risco com o que foi visto na imagem
- `retrievalContext`: NRs usadas pelo RAG

Alterar parser para aceitar `risks: []` como resposta valida quando `complianceSummary` for `no_visible_issue` ou `not_applicable`.

### 4. Prompt e relatorio

Remover a regra "Identifique de 2 a 6 riscos" e substituir por:

- "Retorne de 0 a 6 riscos."
- "Nao crie risco se nao houver evidencia visual ou contexto do inspetor."
- "Se a imagem nao parecer ambiente de trabalho, retorne `not_applicable`."
- "Se a cena parecer adequada e sem nao conformidade visivel, retorne `no_visible_issue`."

Atualizar UI de resultado para exibir estados positivos e nao aplicaveis, nao apenas listas de riscos.

### 5. Voz antes do envio

Depois da assertividade da IA:

- adicionar captura/transcricao de voz no preview;
- preencher `inspectorNote` com a transcricao;
- permitir editar texto antes de enviar;
- manter alternativa manual para quem nao quiser voz.

### 6. Ajustes de UI pedidos pelo cliente

Entram apos a base IA/RAG, com `design_system.md` como regra. Registrar cada pedido visual numa lista objetiva antes de implementar.

## Plano de implementacao

### Fase 1 - Base NR completa

1. Criar `src/data/nrs/catalog.ts` com NR-1 a NR-38, incluindo NR-2 e NR-27 como revogadas.
2. Atualizar `src/data/library-catalog.ts` para consumir o catalogo de NRs em vez de manter cinco itens hardcoded.
3. Criar helpers `getNrByCode`, `searchNrs` e `getActiveNrs`.
4. Atualizar telas da Biblioteca/NRs para mostrar status, resumo e fonte oficial.
5. Rodar `npm run typecheck`.

### Fase 2 - Contrato de IA sem falso positivo

1. Atualizar tipos em `lib/types.ts`.
2. Atualizar parsers `src/services/ai/parse-result.ts` e `netlify/functions/_shared/parse-analysis.ts`.
3. Permitir `risks: []` quando o resumo indicar cena sem problema ou nao aplicavel.
4. Adicionar labels na tela de resultado e detalhe historico para os novos estados.
5. Rodar typecheck.

### Fase 3 - RAG NR no backend

1. Criar base compacta server-side `netlify/functions/_shared/nr-knowledge.ts`.
2. Criar recuperador `retrieve-nr-context.ts`.
3. Injetar contexto recuperado no prompt da Netlify Function.
4. Retornar `retrievalContext` no payload final.
5. Garantir que o app continue funcionando com fallback direto local, mas documentar que RAG completo e preferencialmente server-side.

### Fase 4 - Prompt e avaliacao

1. Atualizar `src/services/ai/prompt.ts` e `netlify/functions/_shared/analysis-prompt.ts`.
2. Criar uma bateria manual de casos: risco claro, ambiente regular, foto fora de contexto, foto ruim e contexto adicional.
3. Registrar resultados esperados neste documento.
4. Ajustar prompt ate passar nos criterios de aceite.

### Fase 5 - Voz antes do envio

1. Escolher dependencia Expo compativel com SDK 57 para gravacao de audio.
2. Criar controle no preview para gravar, parar, transcrever e editar.
3. Enviar transcricao como `inspectorNote`.
4. Testar permissao negada, audio vazio e edicao manual.

### Fase 6 - UI cliente

1. Listar pedidos exatos do cliente.
2. Aplicar mudancas seguindo `docs-ia/design_system.md`.
3. Validar telas principais em tema claro/escuro.

## Riscos e decisoes

- "Treinar o modelo" nao deve significar fine-tuning nesta sprint. Para Vision + conformidade normativa, o caminho mais seguro e RAG + prompt + avaliacao. Fine-tuning so depois, com dataset rotulado e criterio tecnico claro.
- Texto integral das NRs pode ser grande e mudar. Para o piloto, manter metadados, resumos e links oficiais; se for necessario responder com base em itens especificos, evoluir para ingestao integral chunked.
- A IA nao deve emitir laudo. O texto deve continuar posicionando a ferramenta como apoio ao inspetor.

## Definicao de pronto

- Documentacao viva atualizada.
- Base NR completa visivel no app.
- Prompt nao forca riscos.
- Relatorio tem estado positivo/sem problema e fora de contexto.
- RAG server-side inclui contexto NR e registra fontes.
- Typecheck passa.
- Evidencias de teste manual registradas.

## Registro de implementacao

| Data | Item | Status | Observacao |
|------|------|--------|------------|
| 23/09/2026 | Base NR-1 a NR-38 | Implementado | `src/data/nrs/catalog.ts`; NR-2 e NR-27 como revogadas |
| 23/09/2026 | Biblioteca usando catalogo NR | Implementado | Categoria NRs agora deriva de `NR_CATALOG` |
| 23/09/2026 | Contrato de analise honesta | Implementado | `sceneType`, `complianceSummary`, `evidence`, `retrievalContext` |
| 23/09/2026 | Parser aceita zero riscos | Implementado | Valido para `no_visible_issue`, `not_applicable` e `needs_more_context` |
| 23/09/2026 | RAG server-side NR | Implementado | Recuperacao lexical deterministica na Netlify Function |
| 23/09/2026 | Prompt sem falso positivo forcado | Implementado | Regra alterada para 0 a 6 riscos |
| 23/09/2026 | UI para sem problema/nao aplicavel | Implementado | Resultado e detalhe do historico mostram resumo executivo |
| 23/09/2026 | Validacao automatica | Passou | `npm run typecheck` |
| 23/09/2026 | Voz antes do envio | Implementado | `expo-audio` grava contexto no preview e envia para `/api/transcribe-inspector-note` |
| 23/09/2026 | Relatorio fotografico opcional | Implementado | Checkbox antes do envio; resultado recebe `inspectionReport` apenas quando solicitado |
| 23/09/2026 | UI cliente / mascote | Implementado parcial | Mascote Alpha Wolf em Home e Analise; cards de risco sem "conf. media" |
| 23/09/2026 | Polimento do resultado | Implementado | Medidor verde-amarelo-laranja-vermelho; cards vazios escondidos |
| 23/09/2026 | Voz em desenvolvimento | Implementado | Sem Netlify URL, STT usa fallback direto local igual ao Vision dev |

## Avaliacao manual pendente

Executar em ambiente com `OPENAI_API_KEY` e billing ativo:

| Caso | Esperado | Status |
|------|----------|--------|
| Ambiente de trabalho com risco claro | `issues_found`, risco com evidencia visual e NR pertinente | Pendente |
| Ambiente de trabalho aparentemente regular | `no_visible_issue`, `risks: []` | Pendente |
| Foto fora de contexto SST | `not_applicable`, `risks: []`, sem cenario inventado | Pendente |
| Foto escura/cortada | `needs_more_context`, baixa confianca e limitacoes | Pendente |
| Reanalise com contexto escrito | Resultado refinado sem contradizer a imagem | Pendente |
| Ditado por voz antes do envio | Audio transcrito entra no campo de contexto antes da analise | Pendente em dispositivo/Netlify |
| Relatorio opcional | Checkbox gera bloco no modelo de relatorio fotografico | Pendente validar com foto real |
| UI limpa do resultado | Sem cards de riscos/controles/NRs quando nao houver conteudo | Implementado |
| Medidor de risco | Escala visual de baixo a muito alto no resultado | Implementado |
