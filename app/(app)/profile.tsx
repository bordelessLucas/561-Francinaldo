import { useAuth } from '@/contexts/AuthContext';
import { ProfileScreen } from '@/src/screens/ProfileScreen';

export default function ProfileRoute() {
  const { profile, user, logOut } = useAuth();

  return (
    <ProfileScreen
      profile={profile}
      nameFallback={user?.displayName}
      emailFallback={user?.email}
      onLogout={() => logOut()}
    />
  );
}
