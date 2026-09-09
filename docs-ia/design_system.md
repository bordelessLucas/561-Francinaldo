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
- Fundo típico da peça: preto (`#000000`) — **não** usar como fundo de cards no app

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
- **Light mode com cards pretos** (copiar o dark literalmente)

---

## Dois design systems (mesmo produto)

O app tem **duas paletas irmãs** com a mesma vibe de campo, tipografia e componentes — não é “dark invertido”.

| | **Light** | **Dark** |
|--|-----------|----------|
| Ideia | Luz do dia / campo aberto | Outdoor noturno / contraste alto |
| Canvas | `#F3F7F4` | `#0B1410` |
| Surface (cards) | `#FFFFFF` | `#15241C` |
| Accent soft | `brandMist` `#E8F5EC` | `brandMist` `#143528` |
| CTA hero | Surface `tone="accent"` (mist) + botão brand | Mesma estrutura, tokens dark |
| Badge Free | Fundo claro + borda `line` | Elevação + borda `line` |
| Tipografia | `ink` / `inkMuted` via `useAppTheme()` | Idem |

### Fonte de verdade no código

1. Tokens: `constants/theme.ts` (`lightColors` / `darkColors`)  
2. Resolução: `ThemeContext` (`preference`: system | light | dark)  
3. Superfícies: componente **`Surface`** (`src/components/Surface.tsx`) — **estilo JS**, não depende só de classes `dark:`  
4. Texto: `Typography` + `PlanTag` + `Button` / `Input` leem `colors` do tema  

**Regra:** cards, inputs, badges e modais de fluxo **não** devem usar `bg-surface-dark` / `dark:bg-*` como única fonte. Preferir `Surface` ou `style={{ backgroundColor: colors.* }}`.

---

## Estilo de UI (diretriz do piloto)

| Aspecto | Diretriz |
|---------|----------|
| Estilo geral | Minimalista funcional (ferramenta de campo) |
| Densidade | Baixa — uma ação principal por tela |
| Hierarquia | CTA principal destacado (ex.: iniciar análise) |
| Navegação | Clara, previsível (tabs / fluxos curtos) |
| Feedback | Estados explícitos: loading, vazio, erro, sucesso |
| Modo | **Light / Dark** com preferência em **Configurações**: Sistema (padrão) · Claro · Escuro (persistido) |
| Tab bar | Ordem: **Início · Biblioteca · Análise · Histórico · Perfil**. Análise central elevada (câmera) |
| Análise / mídia | Foto **efêmera** (sem Storage). Ver [`roadmap.md`](roadmap.md) |

---

## Paleta de cores

### Light (`lightColors`)

| Token | Hex | Uso |
|-------|-----|-----|
| `ink` | `#0B1F14` | Texto principal |
| `inkMuted` | `#4F675A` | Texto secundário |
| `canvas` | `#F3F7F4` | Fundo do app |
| `canvasElev` | `#FAFCFA` | Elevação suave |
| `surface` | `#FFFFFF` | Cards / sheets |
| `brand` | `#0E7A42` | Primário |
| `brandDark` | `#084828` | Ênfase / títulos de marca |
| `brandMist` | `#E8F5EC` | Hero / chips / avisos brand |
| `line` | `#D7E3DB` | Bordas |
| `signal` / `signalSoft` | `#C9780E` / `#FFF4DE` | Alertas |

### Dark (`darkColors`)

| Token | Hex | Uso |
|-------|-----|-----|
| `ink` | `#ECF3EF` | Texto principal |
| `inkMuted` | `#9BB0A4` | Texto secundário |
| `canvas` | `#0B1410` | Fundo |
| `surface` | `#15241C` | Cards |
| `brand` | `#1FA05A` | Primário |
| `brandDark` | `#8CC458` | Ênfase lima |
| `brandMist` | `#143528` | Soft brand |
| `line` | `#2A3F34` | Bordas |

Tailwind (`tailwind.config.js`) espelha tokens para utilitários pontuais; **UI estrutural** usa `Surface` + `useAppTheme`.

---

## Tipografia

| Papel | Diretriz |
|-------|----------|
| Display / títulos | Outfit (semi/bold) |
| Corpo | Source Sans 3 |
| Cores | Sempre via `Typography` / `colors.ink*` — evita texto claro em fundo claro |

---

## Componentes

| Componente | Papel |
|------------|--------|
| `Surface` | Card / bloco (tones: `default` · `elevated` · `accent` · `signal`) |
| `Button` | primary / secondary / outline com cores do tema |
| `PlanTag` | Free (borda suave) · Premium (mist) · Admin (brand) |
| `Container` | Canvas + gradiente mist → canvas |

---

## Logo no produto

| Superfície | Uso |
|------------|-----|
| Login / cadastro | Logo + nome + tagline |
| Header do app | Marca compacta (logo) |
| Splash / ícone | Alinhar progressivamente (Sprint 12) |
| Configurações | Tema Sistema / Claro / Escuro |

---

## Checklist de aderência visual

- [x] Logo oficial aplicada  
- [x] Paleta oficial nos tokens  
- [x] Design system **light** próprio (não cards pretos)  
- [x] Design system **dark** coerente  
- [x] `Surface` / tipografia / PlanTag guiados por `useAppTheme`  
- [ ] Splash / ícone de loja alinhados à marca  
- [ ] Contraste validado outdoor (campo)
