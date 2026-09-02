import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { BrandMark } from '@/components/ui/BrandMark';
import { HomeActionCard } from '@/components/ui/HomeActionCard';
import { ProfileBadge } from '@/components/ui/ProfileBadge';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useAuth } from '@/contexts/AuthContext';
import { getFirstName } from '@/lib/access';

export default function HomeScreen() {
  const { profile } = useAuth();
  const firstName = getFirstName(profile?.name);

  return (
    <Screen scroll>
      <View className="mb-8 mt-2">
        <BrandMark size="sm" />
      </View>

      <View className="mb-8 gap-3">
        <Text className="font-display text-3xl leading-9 text-ink">Olá, {firstName}</Text>
        <ProfileBadge role={profile?.role} />
        <Text className="font-sans text-base leading-6 text-ink-muted">
          Analise uma situação de risco em poucos passos.
        </Text>
      </View>

      <HomeActionCard
        emphasized
        title="Nova análise"
        description="Registre uma situação de campo para receber apoio na identificação de riscos."
        onPress={() => router.push('/(app)/analysis')}
      />

      <View className="mt-8 gap-3">
        <SectionHeader title="Acessos rápidos" />
        <HomeActionCard
          title="Histórico"
          description="Consulte análises realizadas quando estiverem disponíveis."
          onPress={() => router.push('/(app)/history')}
        />
        <HomeActionCard
          title="Perfil"
          description="Veja os dados da sua conta e encerre a sessão com segurança."
          onPress={() => router.push('/(app)/profile')}
        />
      </View>
    </Screen>
  );
}
