import { useState } from 'react';
import { View } from 'react-native';
import { type Href } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { usePlanPreview } from '@/contexts/PlanPreviewContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { getPlanLabel, isPremiumRole } from '@/lib/access';
import {
  BackLink,
  Body,
  Button,
  Caption,
  Container,
  Heading,
  Label,
  Surface,
} from '@/src/components';

const FREE_BENEFITS = [
  'Análise de situações em campo',
  'Biblioteca SST e histórico',
  'Mesma experiência de telas do Premium',
  'Anúncios poderão aparecer no futuro',
] as const;

const PREMIUM_BENEFITS = [
  'Tudo do plano Free',
  'Sem anúncios',
  'Prioridade em novos materiais e melhorias',
] as const;

/**
 * Comparação Free vs Premium — diferença principal: anúncios (futuro).
 */
export function PlansScreen() {
  const { profile } = useAuth();
  const { effectiveIsPremium } = usePlanPreview();
  const { colors } = useAppTheme();
  const [checkoutNotice, setCheckoutNotice] = useState(false);

  const realPremium = isPremiumRole(profile?.role);
  const planLabel = getPlanLabel(profile?.role);

  return (
    <Container scroll>
      <BackLink className="mb-4" fallbackHref={'/(app)/settings' as Href} />

      <View className="mb-6 gap-2">
        <Heading>Planos</Heading>
        <Body>
          Free e Premium usam as mesmas telas. A diferença principal é a ausência de anúncios no
          Premium.
        </Body>
      </View>

      <Surface tone="accent" className="mb-4" padding>
        <Caption style={{ color: colors.brandDark }}>
          Plano atual: {planLabel}
          {effectiveIsPremium && !realPremium ? ' (pré-visualização)' : ''}
        </Caption>
      </Surface>

      <View className="gap-4">
        <Surface>
          <Label>Free</Label>
          <Caption className="mt-1">Acesso completo às funções principais</Caption>
          <View className="mt-4 gap-2">
            {FREE_BENEFITS.map((item) => (
              <Caption key={item}>• {item}</Caption>
            ))}
          </View>
        </Surface>

        <Surface style={{ borderWidth: 2, borderColor: colors.brand }}>
          <Label>Premium</Label>
          <Caption className="mt-1">Mesma experiência, sem anúncios</Caption>
          <View className="mt-4 gap-2">
            {PREMIUM_BENEFITS.map((item) => (
              <Caption key={item}>• {item}</Caption>
            ))}
          </View>

          {realPremium ? (
            <Surface tone="accent" className="mt-5" bordered={false}>
              <Caption style={{ color: colors.brandDark }}>Você já está no Premium.</Caption>
            </Surface>
          ) : (
            <Button
              label="Ver diferenças"
              variant="outline"
              onPress={() => setCheckoutNotice(true)}
              className="mt-5"
            />
          )}
        </Surface>
      </View>

      {checkoutNotice ? (
        <Surface tone="accent" className="mt-5">
          <Label style={{ color: colors.brandDark }}>Assinatura em breve</Label>
          <Body className="mt-2">
            Ainda não há checkout. Quando a Alpha SST liberar o pagamento, o Premium remove anúncios.
            Até lá, use o app normalmente no plano Free.
          </Body>
          <Button
            label="Entendi"
            variant="secondary"
            onPress={() => setCheckoutNotice(false)}
            className="mt-4"
          />
        </Surface>
      ) : null}
    </Container>
  );
}
