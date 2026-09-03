import { View } from 'react-native';

import { ProfileBadge } from '@/components/ui/ProfileBadge';
import { getStatusLabel } from '@/lib/access';
import type { UserProfile } from '@/lib/types';
import { Body, Button, Caption, Container, Heading, Label } from '@/src/components';

type ProfileScreenProps = {
  profile: UserProfile | null;
  emailFallback?: string | null;
  nameFallback?: string | null;
  onLogout: () => void;
};

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Caption>{label}</Caption>
      <Label className="mt-1 text-lg">{value}</Label>
    </View>
  );
}

export function ProfileScreen({
  profile,
  emailFallback,
  nameFallback,
  onLogout,
}: ProfileScreenProps) {
  return (
    <Container>
      <View className="mb-8 mt-2 gap-2">
        <Heading>Perfil</Heading>
        <Body>Dados da conta no Alpha SST.</Body>
      </View>

      <View className="rounded-3xl border border-line bg-white px-5 py-5">
        <ProfileField label="Nome" value={profile?.name || nameFallback || '—'} />
        <View className="my-4 h-px bg-line" />
        <ProfileField label="E-mail" value={profile?.email || emailFallback || '—'} />
        <View className="my-4 h-px bg-line" />
        <Caption>Perfil</Caption>
        <View className="mt-2">
          <ProfileBadge role={profile?.role} />
        </View>
        <View className="my-4 h-px bg-line" />
        <ProfileField label="Status" value={getStatusLabel(profile?.status)} />
      </View>

      <View className="mt-auto pt-8">
        <Button label="Sair" variant="secondary" onPress={onLogout} />
      </View>
    </Container>
  );
}
