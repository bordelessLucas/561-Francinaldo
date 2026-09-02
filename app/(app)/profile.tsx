import { Text, View } from 'react-native';

import { ProfileBadge } from '@/components/ui/ProfileBadge';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/contexts/AuthContext';
import { getStatusLabel } from '@/lib/access';

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="font-sansMedium text-sm text-ink-muted">{label}</Text>
      <Text className="mt-1 font-sansSemi text-lg text-ink">{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { profile, user, logOut } = useAuth();

  return (
    <Screen>
      <View className="mb-8 mt-2 gap-2">
        <Text className="font-display text-3xl text-ink">Perfil</Text>
        <Text className="font-sans text-base text-ink-muted">
          Dados da conta obtidos do Firebase Authentication e Firestore.
        </Text>
      </View>

      <View className="rounded-3xl border border-line bg-white px-5 py-5">
        <ProfileField label="Nome" value={profile?.name || user?.displayName || '—'} />
        <View className="my-4 h-px bg-line" />
        <ProfileField label="E-mail" value={profile?.email || user?.email || '—'} />
        <View className="my-4 h-px bg-line" />
        <Text className="font-sansMedium text-sm text-ink-muted">Perfil</Text>
        <View className="mt-2">
          <ProfileBadge role={profile?.role} />
        </View>
        <View className="my-4 h-px bg-line" />
        <ProfileField label="Status" value={getStatusLabel(profile?.status)} />
      </View>

      <View className="mt-auto pt-8">
        <Button label="Sair" variant="secondary" onPress={() => logOut()} />
      </View>
    </Screen>
  );
}
