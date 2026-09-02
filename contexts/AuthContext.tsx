import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { auth, db } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/lib/types';
import { mapUserProfile } from '@/lib/userProfile';

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (params: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(uid: string): Promise<UserProfile> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) {
    throw new Error('PROFILE_NOT_FOUND');
  }
  return mapUserProfile(uid, snap.data());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadProfile = useCallback(async (uid: string) => {
    try {
      const nextProfile = await fetchProfile(uid);
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
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUp = useCallback(
    async ({
      name,
      email,
      password,
      role,
    }: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
    }) => {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      await updateProfile(credential.user, { displayName: name.trim() });

      const now = new Date().toISOString();
      const profileData: UserProfile = {
        uid: credential.user.uid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, 'users', credential.user.uid), profileData);
      setProfile(profileData);
      setProfileError(null);
    },
    [],
  );

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const logOut = useCallback(async () => {
    await signOut(auth);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    await loadProfile(auth.currentUser.uid);
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
    [
      user,
      profile,
      loading,
      profileError,
      signIn,
      signUp,
      resetPassword,
      logOut,
      refreshProfile,
    ],
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
