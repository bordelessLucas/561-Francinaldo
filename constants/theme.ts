export const colors = {
  /** Texto principal — verde quase preto da marca */
  ink: '#0A1A12',
  inkSoft: '#163326',
  inkMuted: '#5A6F62',
  /** Fundo claro com subtinta verde (uso em campo / luz do dia) */
  canvas: '#F0F5F1',
  canvasElev: '#F7FAF8',
  /** Verde médio da logo (setas + “ALPHA SST”) */
  brand: '#0E7A42',
  /** Verde profundo (cruz / estados pressionados) */
  brandDark: '#084828',
  brandLight: '#14964F',
  /** Lima da borda da cruz — destaque / sucesso */
  brandAccent: '#8CC458',
  /** Fundo suave derivado do brand */
  brandMist: '#E3F3E9',
  signal: '#D97706',
  signalSoft: '#FEF3C7',
  line: '#D0DED5',
  white: '#FFFFFF',
  /** Fundo escuro da peça de marca */
  brandBlack: '#000000',
} as const;

export const brand = {
  name: 'Alpha SST',
  tagline: 'Segurança e saúde no trabalho em campo',
  /** Caminho da logo oficial fornecida pelo cliente */
  logo: require('@/assets/brand/alpha-sst-logo.png'),
} as const;
