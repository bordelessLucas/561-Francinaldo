/** Paleta light — campo / luz do dia (design system próprio) */
export const lightColors = {
  ink: '#0B1F14',
  inkSoft: '#1A3326',
  inkMuted: '#4F675A',
  canvas: '#F3F7F4',
  canvasElev: '#FAFCFA',
  surface: '#FFFFFF',
  brand: '#0E7A42',
  brandDark: '#084828',
  brandLight: '#14964F',
  brandAccent: '#2F9E57',
  brandMist: '#E8F5EC',
  signal: '#C9780E',
  signalSoft: '#FFF4DE',
  line: '#D7E3DB',
  white: '#FFFFFF',
  brandBlack: '#000000',
  tabBar: '#FFFFFF',
  tabInactive: '#6A7F73',
} as const;

/** Paleta dark — mesma vibe, contraste outdoor */
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

/** @deprecated Prefer useAppTheme().colors */
export const colors = lightColors;

export const brand = {
  name: 'Alpha SST',
  tagline: 'Segurança e saúde no trabalho em campo',
  logo: require('@/assets/brand/alpha-sst-logo.png'),
} as const;

export function getColors(scheme: 'light' | 'dark' | null | undefined): AppColors {
  return scheme === 'dark' ? darkColors : lightColors;
}
