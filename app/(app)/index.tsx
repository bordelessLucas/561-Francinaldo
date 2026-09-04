import { router, type Href } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { getFirstName, getPlanKind } from '@/lib/access';
import { HomeScreen } from '@/src/screens/HomeScreen';

export default function AppHomeRoute() {
  const { profile, user } = useAuth();
  const userName = getFirstName(profile?.name ?? user?.displayName ?? undefined);

  return (
    <HomeScreen
      userName={userName}
      planKind={getPlanKind(profile?.role)}
      onStartAnalysis={() => router.push('/(app)/analysis')}
      onOpenHistory={() => router.push('/(app)/history')}
      onOpenProfile={() => router.push('/(app)/profile')}
      onOpenLibrary={() => router.push('/(app)/library' as Href)}
      onOpenMenu={() => router.push('/(app)/library' as Href)}
    />
  );
}
