import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { usePlanPreview } from '@/contexts/PlanPreviewContext';
import { getPlanLabel, isPremiumRole } from '@/lib/access';
import { Body, Button, Caption, Container, Heading, Label } from '@/src/components';

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
  const [checkoutNotice, setCheckoutNotice] = useState(false);

  const realPremium = isPremiumRole(profile?.role);
  const planLabel = getPlanLabel(profile?.role);

  return (
    <Container scroll>
      <Pressable onPress={() => router.back()} className="mb-4 self-start py-1">
        <Caption className="font-sansSemi text-brand-dark">Voltar</Caption>
      </Pressable>

      <View className="mb-6 gap-2">
        <Heading>Planos</Heading>
        <Body>
          Free e Premium usam as mesmas telas. A diferença principal é a ausência de anúncios no
          Premium.
        </Body>
      </View>

      <View className="mb-4 rounded-2xl bg-brand-mist px-4 py-3">
        <Caption className="text-brand-dark">
          Plano atual: {planLabel}
          {effectiveIsPremium && !realPremium ? ' (pré-visualização)' : ''}
        </Caption>
      </View>

      <View className="gap-4">
        <View className="rounded-3xl border border-line bg-surface px-5 py-5 dark:border-line-dark dark:bg-surface-dark">
          <Label>Free</Label>
          <Caption className="mt-1">Acesso completo às funções principais</Caption>
          <View className="mt-4 gap-2">
            {FREE_BENEFITS.map((item) => (
              <Caption key={item}>• {item}</Caption>
            ))}
          </View>
        </View>

        <View className="rounded-3xl border-2 border-brand bg-surface px-5 py-5 dark:bg-surface-dark">
          <Label>Premium</Label>
          <Caption className="mt-1">Mesma experiência, sem anúncios</Caption>
          <View className="mt-4 gap-2">
            {PREMIUM_BENEFITS.map((item) => (
              <Caption key={item}>• {item}</Caption>
            ))}
          </View>

          {realPremium ? (
            <View className="mt-5 rounded-2xl bg-brand-mist px-4 py-3 dark:bg-brand-mist-dark">
              <Caption className="text-brand-dark dark:text-brand-accent">
                Você já está no Premium.
              </Caption>
            </View>
          ) : (
            <Button
              label="Ver diferenças"
              variant="outline"
              onPress={() => setCheckoutNotice(true)}
              className="mt-5"
            />
          )}
        </View>
      </View>

      {checkoutNotice ? (
        <View className="mt-5 rounded-3xl bg-brand-black px-5 py-5">
          <Label className="text-white">Assinatura em breve</Label>
          <Body className="mt-2 text-white/75">
            Ainda não há checkout. Quando a Alpha SST liberar o pagamento, o Premium remove anúncios.
            Até lá, use o app normalmente no plano Free.
          </Body>
          <Button
            label="Entendi"
            variant="secondary"
            onPress={() => setCheckoutNotice(false)}
            className="mt-4"
          />
        </View>
      ) : null}
    </Container>
  );
}
