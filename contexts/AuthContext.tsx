import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { auth } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import {
  getCurrentUser,
  registerWithEmail,
  sendPasswordReset,
  signInWithEmail,
  signOutCurrentUser,
  updateAuthDisplayName,
} from '@/src/services/auth.service';
import { createUserProfile, getUserProfile } from '@/src/services/user.service';

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (params: { name: string; email: string; password: string }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadProfile = useCallback(async (uid: string) => {
    try {
      const nextProfile = await getUserProfile(uid);
      setProfile(nextProfile);
      setProfileError(null);
    } catch (error) {
      setProfile(null);
      if (error instanceof Error && error.message === 'PROFILE_NOT_FOUND') {
        setProfileError('Perfil não encontrado. Contate o administrador.');
      } else {
        setProfileError('Não foi possível carregar seu perfil. Tente novamente.');
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setLoading(true);
      setUser(nextUser);

      if (nextUser) {
        await loadProfile(nextUser.uid);
      } else {
        setProfile(null);
        setProfileError(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmail(email, password);
  }, []);

  const signUp = useCallback(async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const credential = await registerWithEmail(email, password);
    await updateAuthDisplayName(credential.user, name);

    const profileData = await createUserProfile({
      uid: credential.user.uid,
      name,
      email: credential.user.email ?? email,
    });

    setProfile(profileData);
    setProfileError(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordReset(email);
  }, []);

  const logOut = useCallback(async () => {
    await signOutCurrentUser();
  }, []);

  const refreshProfile = useCallback(async () => {
    const current = getCurrentUser();
    if (!current) return;
    setLoading(true);
    await loadProfile(current.uid);
    setLoading(false);
  }, [loadProfile]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      profileError,
      signIn,
      signUp,
      resetPassword,
      logOut,
      refreshProfile,
    }),
    [user, profile, loading, profileError, signIn, signUp, resetPassword, logOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
