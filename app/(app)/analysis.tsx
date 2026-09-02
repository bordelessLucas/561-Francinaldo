import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';

const UPCOMING_STEPS = [
  'Registrar situação',
  'Enviar para análise',
  'Consultar riscos',
  'Visualizar recomendações',
] as const;

/**
 * Estrutura inicial do fluxo de nova análise.
 * Captura de imagem, IA e NRs entram nas próximas sprints.
 */
export default function AnalysisScreen() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <Screen scroll>
      <View className="mb-8 mt-2 gap-2">
        <Text className="font-display text-3xl text-ink">Nova análise</Text>
        <Text className="font-sans text-base leading-6 text-ink-muted">
          Registre uma situação para que o sistema possa auxiliar na identificação de
          possíveis riscos.
        </Text>
      </View>

      <View className="mb-6 rounded-3xl border border-line bg-white px-5 py-5">
        <SectionHeader
          title="Como funcionará"
          subtitle="Visão geral do fluxo. As etapas serão ativadas nas próximas entregas."
        />

        <View className="mt-5 gap-3">
          {UPCOMING_STEPS.map((step, index) => (
            <View key={step} className="flex-row items-start gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-mist">
                <Text className="font-sansSemi text-sm text-brand-dark">{index + 1}</Text>
              </View>
              <View className="flex-1 pt-1">
                <Text className="font-sansSemi text-base text-ink">{step}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="rounded-3xl bg-ink px-5 py-5">
        <Text className="font-sansSemi text-lg text-white">Pronto para começar</Text>
        <Text className="mt-2 font-sans text-sm leading-5 text-white/75">
          A captura da situação (câmera e galeria) será disponibilizada na próxima sprint.
        </Text>
        <Button
          label="Iniciar análise"
          className="mt-5"
          onPress={() =>
            setNotice(
              'Fluxo preparado. A etapa de registro da situação chega na próxima sprint.',
            )
          }
        />
      </View>

      {notice ? (
        <View className="mt-5 rounded-2xl bg-signal-soft px-4 py-3">
          <Text className="font-sans text-sm leading-5 text-ink-soft">{notice}</Text>
        </View>
      ) : null}
    </Screen>
  );
}
