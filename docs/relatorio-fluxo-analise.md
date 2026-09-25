# Relatorio de implementacao: fluxo de analise

Data: 2026-09-25

## Escopo

Reorganizacao do fluxo de nova analise para aproximar a experiencia da captura de fotos do WhatsApp, com camera dentro do aplicativo, selecao de galeria, contexto escrito e ditado por voz.

## Entregas

- Camera embutida com `expo-camera`, permissao, troca de camera, contador de fotos e captura dentro da tela do app.
- Botao circular central para tirar foto e botao menor lateral somente com icone para abrir a galeria.
- Preview das fotos antes do envio, com remocao, selecao e adicao de novas imagens.
- Fluxo de assistente antes da camera, com pergunta opcional para a IA e opcoes de iniciar ou pular.
- Campo de contexto da inspeção com transcricao por voz e contador de gravacao.
- Upload de audio direto para a OpenAI usando multipart nativo via `expo-file-system`, corrigindo o envio instavel de arquivo com `fetch` no Android.
- Botao `Analisar foto com contexto` depois do campo de contexto, bloqueado enquanto o audio esta sendo gravado ou transcrito.
- Navbar inferior ocultada somente na rota de analise, incluindo aplicacao na configuracao da rota e em runtime.
- Botoes de voltar na tela inicial da analise, camera, tela de permissao e etapas de preview, processamento, resultado, lote e erro.
- Remocao dos icones de usuario e menu do cabecalho da preview.
- Fundo azul continuo no fluxo de analise, sem o gradiente global das outras telas.
- Bordas externas removidas das secoes principais e superficies do processamento/resultado deixadas sem borda.
- Ajustes de textos, labels de acessibilidade e fluxo de cancelamento/saida.

## Arquivos principais

- `src/screens/AnalysisScreen.tsx`
- `src/services/dictation.service.ts`
- `app/(app)/_layout.tsx`
- `app.config.js`
- `package.json`
- `package-lock.json`

## Validacoes executadas

- `npm.cmd run typecheck`
- `npm.cmd run check:sdk`
- `git diff --check`

SDK Expo validado: `57.0.21`.

## Configuracao de audio

O `.env` local possui `OPENAI_API_KEY`, mas `EXPO_PUBLIC_AI_ANALYZE_URL` esta vazio. Por isso, o app usa o caminho direto local para transcricao. Para producao, deve ser configurada a URL da Function Netlify e a chave deve permanecer somente no ambiente do servidor.

## Deploy

O repositorio possui perfis EAS para `development`, `preview` e `production`, mas nao possui comando automatico de deploy no `package.json`. Como a camera exige configuracao nativa, a distribuicao em APK/AAB requer um novo build EAS apos este commit. O build nao foi disparado automaticamente nesta etapa.
