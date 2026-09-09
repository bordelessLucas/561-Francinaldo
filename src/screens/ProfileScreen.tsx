import { Switch, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { PlanTag } from '@/components/ui/PlanTag';
import { usePlanPreview } from '@/contexts/PlanPreviewContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { getPlanKind, getStatusLabel, isPremiumRole } from '@/lib/access';
import type { UserProfile } from '@/lib/types';
import { Body, Button, Caption, Container, Heading, Label, Surface } from '@/src/components';

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
  const { colors } = useAppTheme();
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

      <Surface className="mb-4">
        <ProfileField label="Nome" value={profile?.name || nameFallback || '—'} />
        <View className="my-4 h-px" style={{ backgroundColor: colors.line }} />
        <ProfileField label="E-mail" value={profile?.email || emailFallback || '—'} />
        <View className="my-4 h-px" style={{ backgroundColor: colors.line }} />
        <ProfileField label="Status" value={getStatusLabel(profile?.status)} />
      </Surface>

      <Surface className="mb-4">
        <Caption>Plano</Caption>
        <View className="mt-3 flex-row items-center gap-3">
          <PlanTag plan={planKind} />
          <Body className="flex-1">
            {realPremium
              ? 'Experiência sem anúncios quando a publicidade estiver ativa.'
              : 'Mesmas telas do Premium. Anúncios poderão aparecer no plano Free no futuro.'}
          </Body>
        </View>
      </Surface>

      <Surface className="mb-4">
        <Caption>App</Caption>
        <Body className="mt-2">
          Tema, avisos de NRs, planos e informações do aplicativo.
        </Body>
        <Button
          label="Configurações"
          variant="outline"
          onPress={() => router.push('/(app)/settings' as Href)}
          className="mt-4"
        />
      </Surface>

      {__DEV__ && !isRealPremium ? (
        <Surface className="mb-4" style={{ borderStyle: 'dashed' }}>
          <View className="flex-row items-center justify-between gap-3">
            <Caption className="flex-1">
              Dev: prévia visual da tag Premium (não muda funções)
            </Caption>
            <Switch
              value={demoAsPremium}
              onValueChange={setDemoAsPremium}
              trackColor={{ false: colors.line, true: colors.brandLight }}
              thumbColor={demoAsPremium ? colors.brandDark : colors.white}
            />
          </View>
        </Surface>
      ) : null}

      <Button label="Sair" variant="secondary" onPress={onLogout} />
    </Container>
  );
}
