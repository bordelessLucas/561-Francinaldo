import { Redirect } from 'expo-router';

import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Iniciando..." />;
  }

  if (user) {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
