import { router } from 'expo-router';
import { useEffect } from 'react';

import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? '/(app)' : '/(auth)/login');
  }, [loading, user]);

  if (loading) {
    return <LoadingState message="Iniciando..." />;
  }

  return <LoadingState message="Abrindo o app..." />;
}
