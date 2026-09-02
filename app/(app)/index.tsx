import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { BrandMark } from '@/components/ui/BrandMark';
import { Button } from '@/components/ui/Button';
import { ProfileBadge } from '@/components/ui/ProfileBadge';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useAuth } from '@/contexts/AuthContext';
import { getFirstName, getRoleLabel } from '@/lib/access';

function QuickLink({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-1 rounded-3xl border border-line bg-white px-4 py-5 active:bg-canvas-elev"
    >
      <Text className="font-sansSemi text-base text-ink">{title}</Text>
      <Text className="mt-2 font-sans text-sm leading-5 text-ink-muted">{description}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { profile } = useAuth();
  const firstName = getFirstName(profile?.name);
  const roleLabel = getRoleLabel(profile?.role);

  return (
    <Screen scroll>
      <View className="mb-6 mt-2 flex-row items-start justify-between">
        <BrandMark size="sm" />
        <ProfileBadge role={profile?.role} />
      </View>

      <View className="mb-8 gap-2">
        <Text className="font-display text-4xl leading-10 text-ink">Olá, {firstName}</Text>
        <Text className="font-sansMedium text-base text-brand-dark">{roleLabel}</Text>
        <Text className="mt-1 font-sans text-base leading-6 text-ink-muted">
          Analise uma situação de risco em poucos passos e registre o que observar em campo.
        </Text>
      </View>

      <View className="mb-8 overflow-hidden rounded-3xl bg-ink px-5 py-6">
        <Text className="font-sansMedium text-xs uppercase tracking-widest text-brand-mist">
          Ação principal
        </Text>
        <Text className="mt-3 font-display text-2xl text-white">Nova análise</Text>
        <Text className="mt-2 font-sans text-sm leading-5 text-white/75">
          Registre uma situação para que o sistema auxilie na identificação de possíveis riscos.
        </Text>
        <Button
          label="Iniciar nova análise"
          className="mt-5"
          onPress={() => router.push('/(app)/analysis')}
        />
      </View>

      <View className="gap-3">
        <SectionHeader title="Acessos rápidos" />
        <View className="flex-row gap-3">
          <QuickLink
            title="Histórico"
            description="Veja análises anteriores"
            onPress={() => router.push('/(app)/history')}
          />
          <QuickLink
            title="Perfil"
            description="Dados da sua conta"
            onPress={() => router.push('/(app)/profile')}
          />
        </View>
      </View>

      <View className="mt-8 rounded-3xl border border-line bg-white/80 px-5 py-5">
        <Text className="font-sansSemi text-base text-ink">Como o Vistora ajuda</Text>
        <Text className="mt-2 font-sans text-sm leading-5 text-ink-muted">
          Em campo, você registra a situação. Depois, o app organiza o caminho para análise,
          consulta de riscos e recomendações — sem planilhas improvisadas.
        </Text>
      </View>
    </Screen>
  );
}
