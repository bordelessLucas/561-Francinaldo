import { Switch, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { PlanTag } from '@/components/ui/PlanTag';
import { usePlanPreview } from '@/contexts/PlanPreviewContext';
import { colors } from '@/constants/theme';
import { getPlanKind, getStatusLabel, isPremiumRole } from '@/lib/access';
import type { UserProfile } from '@/lib/types';
import { Body, Button, Caption, Container, Heading, Label } from '@/src/components';

const PLANS_HREF = '/(app)/plans' as Href;

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
  const { demoAsPremium, setDemoAsPremium, isRealPremium, effectiveIsPremium } = usePlanPreview();
  const planKind = effectiveIsPremium && !isRealPremium ? 'premium' : getPlanKind(profile?.role);
  const realPremium = isPremiumRole(profile?.role);

  return (
    <Container scroll>
      <View className="mb-6 mt-2 flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Heading>Perfil</Heading>
          <Body>Sua conta no Alpha SST.</Body>
        </View>
        <PlanTag plan={planKind} />
      </View>

      <View className="mb-4 rounded-3xl border border-line bg-white px-5 py-5">
        <ProfileField label="Nome" value={profile?.name || nameFallback || '—'} />
        <View className="my-4 h-px bg-line" />
        <ProfileField label="E-mail" value={profile?.email || emailFallback || '—'} />
        <View className="my-4 h-px bg-line" />
        <ProfileField label="Status" value={getStatusLabel(profile?.status)} />
      </View>

      <View className="mb-4 rounded-3xl border border-line bg-white px-5 py-5">
        <Caption>Plano</Caption>
        <View className="mt-3 flex-row items-center gap-3">
          <PlanTag plan={planKind} />
          <Body className="flex-1 text-ink-muted">
            {realPremium
              ? 'Experiência sem anúncios quando a publicidade estiver ativa.'
              : 'Mesmas telas do Premium. Anúncios poderão aparecer no plano Free no futuro.'}
          </Body>
        </View>
        <Button
          label={realPremium ? 'Detalhes do plano' : 'Conhecer Premium'}
          variant="outline"
          onPress={() => router.push(PLANS_HREF)}
          className="mt-5"
        />
      </View>

      {__DEV__ && !isRealPremium ? (
        <View className="mb-4 rounded-3xl border border-dashed border-line bg-white px-5 py-4">
          <View className="flex-row items-center justify-between gap-3">
            <Caption className="flex-1">Dev: pré-visualizar tag Premium</Caption>
            <Switch
              value={demoAsPremium}
              onValueChange={setDemoAsPremium}
              trackColor={{ false: colors.line, true: colors.brandLight }}
              thumbColor={demoAsPremium ? colors.brandDark : colors.white}
            />
          </View>
        </View>
      ) : null}

      <Button label="Sair" variant="secondary" onPress={onLogout} />
    </Container>
  );
}
