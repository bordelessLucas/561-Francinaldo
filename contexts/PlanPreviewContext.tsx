import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { canAccessPremiumContent, isPremiumRole } from '@/lib/access';

type PlanPreviewContextValue = {
  /** Toggle de sessão para demo — não grava no Firestore. */
  demoAsPremium: boolean;
  setDemoAsPremium: (value: boolean) => void;
  toggleDemoAsPremium: () => void;
  /** true se role real já é Premium/admin. */
  isRealPremium: boolean;
  /** true se UI deve tratar como Premium (role ou demo). */
  effectiveIsPremium: boolean;
};

const PlanPreviewContext = createContext<PlanPreviewContextValue | undefined>(undefined);

export function PlanPreviewProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [demoAsPremium, setDemoAsPremium] = useState(false);

  const isRealPremium = isPremiumRole(profile?.role);
  const effectiveIsPremium = canAccessPremiumContent(profile?.role, demoAsPremium);

  const toggleDemoAsPremium = useCallback(() => {
    setDemoAsPremium((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      demoAsPremium,
      setDemoAsPremium,
      toggleDemoAsPremium,
      isRealPremium,
      effectiveIsPremium,
    }),
    [demoAsPremium, toggleDemoAsPremium, isRealPremium, effectiveIsPremium],
  );

  return <PlanPreviewContext.Provider value={value}>{children}</PlanPreviewContext.Provider>;
}

export function usePlanPreview() {
  const context = useContext(PlanPreviewContext);
  if (!context) {
    throw new Error('usePlanPreview must be used within PlanPreviewProvider');
  }
  return context;
}
