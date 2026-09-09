import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme, View } from 'react-native';
import { colorScheme as nativewindColorScheme } from 'nativewind';

import {
  darkColors,
  getColors,
  lightColors,
  type AppColors,
} from '@/constants/theme';

const STORAGE_KEY = '@alpha_sst/theme_preference';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (value: ThemePreference) => void;
  scheme: 'light' | 'dark';
  isDark: boolean;
  colors: AppColors;
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveScheme(
  preference: ThemePreference,
  system: string | null | undefined,
): 'light' | 'dark' {
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  return system === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (
          !cancelled &&
          (stored === 'system' || stored === 'light' || stored === 'dark')
        ) {
          setPreferenceState(stored);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback((value: ThemePreference) => {
    setPreferenceState(value);
    void AsyncStorage.setItem(STORAGE_KEY, value);
  }, []);

  const scheme = resolveScheme(preference, systemScheme);
  const isDark = scheme === 'dark';
  const colors = getColors(scheme);

  useEffect(() => {
    nativewindColorScheme.set(preference === 'system' ? 'system' : scheme);
  }, [preference, scheme]);

  const value = useMemo(
    () => ({
      preference,
      setPreference,
      scheme,
      isDark,
      colors,
      ready,
    }),
    [preference, setPreference, scheme, isDark, colors, ready],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View className={`flex-1 ${isDark ? 'dark' : ''}`} style={{ flex: 1 }}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

/** Tema resolvido (preferência + sistema). */
export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme deve ser usado dentro de ThemeProvider');
  }
  return ctx;
}

export { lightColors, darkColors };
