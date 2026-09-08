# Alpha SST — Design System

> Documento vivo. Identidade oficial alinhada à logo enviada pelo cliente.

## Marca

| Item | Status |
|------|--------|
| Nome do produto | **Alpha SST** |
| Logo oficial | Entregue — `assets/brand/alpha-sst-logo.png` |
| Materiais oficiais | Parcial (logo); demais materiais ainda pendentes |

A UI deve seguir a **logo** e a **paleta extraída da logo**.

### Símbolo

- Cruz de segurança (verde profundo) com contorno lima  
- Anel de setas no sentido horário (verde médio) — ciclo / processo contínuo  
- Tipografia da marca: “ALPHA SST” em sans geométrica bold, verde médio  
- Fundo típico da peça: preto (`#000000`)

---

## Princípios de UX (confirmados)

Prioridade do cliente:

- Simples  
- Prática  
- Intuitiva  
- **Poucos cliques**  
- Fácil de usar **em campo**  
- Velocidade > elaborações visuais  

Evitar:

- Experiência excessivamente complexa  
- Telas densas / excesso de informação  
- Fluxos longos para a análise de imagem  

---

## Estilo de UI (diretriz do piloto)

| Aspecto | Diretriz |
|---------|----------|
| Estilo geral | Minimalista funcional (ferramenta de campo) |
| Densidade | Baixa — uma ação principal por tela |
| Hierarquia | CTA principal destacado (ex.: iniciar análise) |
| Navegação | Clara, previsível (tabs / fluxos curtos) |
| Feedback | Estados explícitos: loading, vazio, erro, sucesso |
| Modo | **Light / Dark** com preferência em Configurações: Sistema (padrão) · Claro · Escuro (persistido). Tokens em `constants/theme.ts`; resolução em `ThemeContext`. Superfícies de marca (hero preto, splash) permanecem escuras nos dois modos. |
| Tab bar | Ordem: **Início · Biblioteca · Análise · Histórico · Perfil**. Análise central elevada (câmera). Aba ativa com cor brand + indicador; inativas muted. Configurações acessíveis por **Perfil → Configurações** (sem 6ª tab). |

---

## Paleta de cores

### Oficial (extraída da logo)

Amostragem a partir de `assets/brand/alpha-sst-logo.png`:

| Token | Hex | Origem / uso |
|-------|-----|----------------|
| `brand` | `#0E7A42` | Verde médio (setas + texto da logo) — ações primárias |
| `brand-dark` | `#084828` | Verde profundo (preenchimento da cruz) — pressionado / tabs ativas |
| `brand-light` | `#14964F` | Verde médio mais claro — hovers / ênfase |
| `brand-accent` | `#8CC458` | Lima (contorno da cruz) — destaques, sucesso, chips |
| `brand-mist` | `#E3F3E9` | Tinta clara do brand — fundos suaves / badges |
| `brand-black` | `#000000` | Fundo da peça de marca |
| `ink` | `#0A1A12` | Texto principal (verde-preto) |
| `ink-muted` | `#5A6F62` | Texto secundário |
| `canvas` | `#F0F5F1` / dark `#0B1410` | Fundo do app |
| `canvas-elev` | `#F7FAF8` / dark `#101C16` | Superfície elevada |
| `surface` | `#FFFFFF` / dark `#15241C` | Cards |
| `signal` | `#D97706` | Alertas / atenção (fora da logo; contraste funcional) |
| `signal-soft` | `#FEF3C7` / dark `#3D2E12` | Fundo de aviso |
| `line` | `#D0DED5` / dark `#2A3F34` | Bordas |
| `white` | `#FFFFFF` | Texto em botões brand / superfícies fixas |

Fonte de verdade no código: `constants/theme.ts` (`useAppTheme`) + `tailwind.config.js` (`darkMode: 'media'`).

---

## Tipografia

| Papel | Diretriz |
|-------|----------|
| Display / títulos | Outfit (semi/bold) — sans geométrica próxima ao peso da marca |
| Corpo | Source Sans 3 — legível em tela pequena |
| Tamanhos | Hierarquia clara: título → subtítulo → corpo → meta |
| Campo | Contraste alto; evitar texto muito fino |

---

## Logo no produto

| Superfície | Uso |
|------------|-----|
| Login / cadastro | Logo + nome + tagline |
| Header do app | Marca compacta (logo) |
| Splash / ícone | Alinhar progressivamente à peça oficial (Sprint 12) |

Componente: `BrandMark` (`components/ui/BrandMark.tsx` e uso nas telas `src/`).

---

## Componentes e padrões de informação

- Botões com área de toque generosa (uso com luvas / pressa em campo)  
- Cards só quando ajudam ação (não decorativos)  
- Estados vazios reais (sem dados fictícios permanentes)  
- Loading visível em análises e downloads  
- Fluxo de análise: progresso perceptível (captura → envio → resultado)  

---

## Referências visuais

1. Logo do cliente (Alpha SST) — **recebida** (`assets/brand/alpha-sst-logo.png`)  
2. Paleta derivada da logo — **aplicada**  
3. Materiais oficiais adicionais — **a receber** (se houver)  

---

## Checklist de aderência visual

- [x] Logo oficial aplicada no design system e no app (login / header)  
- [x] Paleta oficial substituindo tokens provisórios  
- [ ] Splash / ícone de loja alinhados à marca  
- [ ] Contraste validado para uso outdoor  
- [x] CTA de análise como elemento dominante da Home  
