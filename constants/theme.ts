/** Paleta light — uso em campo / luz do dia */
export const lightColors = {
  ink: '#0A1A12',
  inkSoft: '#163326',
  inkMuted: '#5A6F62',
  canvas: '#F0F5F1',
  canvasElev: '#F7FAF8',
  surface: '#FFFFFF',
  brand: '#0E7A42',
  brandDark: '#084828',
  brandLight: '#14964F',
  brandAccent: '#8CC458',
  brandMist: '#E3F3E9',
  signal: '#D97706',
  signalSoft: '#FEF3C7',
  line: '#D0DED5',
  white: '#FFFFFF',
  brandBlack: '#000000',
  tabBar: '#FFFFFF',
  tabInactive: '#5A6F62',
} as const;

/** Paleta dark — segue Appearance do sistema */
export const darkColors = {
  ink: '#ECF3EF',
  inkSoft: '#D5E4DB',
  inkMuted: '#9BB0A4',
  canvas: '#0B1410',
  canvasElev: '#101C16',
  surface: '#15241C',
  brand: '#1FA05A',
  brandDark: '#8CC458',
  brandLight: '#14964F',
  brandAccent: '#8CC458',
  brandMist: '#143528',
  signal: '#FBBF24',
  signalSoft: '#3D2E12',
  line: '#2A3F34',
  white: '#FFFFFF',
  brandBlack: '#000000',
  tabBar: '#101C16',
  tabInactive: '#9BB0A4',
} as const;

export type AppColors = {
  ink: string;
  inkSoft: string;
  inkMuted: string;
  canvas: string;
  canvasElev: string;
  surface: string;
  brand: string;
  brandDark: string;
  brandLight: string;
  brandAccent: string;
  brandMist: string;
  signal: string;
  signalSoft: string;
  line: string;
  white: string;
  brandBlack: string;
  tabBar: string;
  tabInactive: string;
};

/** @deprecated Prefer useAppTheme().colors — alias light para imports legados */
export const colors = lightColors;

export const brand = {
  name: 'Alpha SST',
  tagline: 'Segurança e saúde no trabalho em campo',
  logo: require('@/assets/brand/alpha-sst-logo.png'),
} as const;

export function getColors(scheme: 'light' | 'dark' | null | undefined): AppColors {
  return scheme === 'dark' ? darkColors : lightColors;
}
