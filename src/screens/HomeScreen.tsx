import { View } from 'react-native';

import { PlanTag } from '@/components/ui/PlanTag';
import { AppHeader, Body, Button, Caption, Container, Heading, Label } from '@/src/components';

type HomeScreenProps = {
  userName?: string;
  planKind?: 'free' | 'premium' | 'admin';
  onStartAnalysis?: () => void;
  onOpenLibrary?: () => void;
  onOpenHistory?: () => void;
};

/**
 * Home — saudação, CTA de análise e atalhos (mesma UX Free/Premium).
 */
export function HomeScreen({
  userName = 'profissional',
  planKind = 'free',
  onStartAnalysis = () => {},
  onOpenLibrary = () => {},
  onOpenHistory = () => {},
}: HomeScreenProps) {
  return (
    <Container scroll>
      <AppHeader subtitle="Segurança e saúde no trabalho" />

      <View className="mb-6 flex-row items-center justify-between gap-3">
        <View className="flex-1 gap-1">
          <Heading>Olá, {userName}</Heading>
          <Body>Registre uma situação e receba riscos, controles e NRs.</Body>
        </View>
        <PlanTag plan={planKind} />
      </View>

      <View className="mb-6 overflow-hidden rounded-3xl bg-brand-black px-5 py-6">
        <Caption className="uppercase tracking-widest text-brand-accent">Começar</Caption>
        <Label className="mt-3 text-2xl text-white">Nova análise</Label>
        <Body className="mt-2 text-white/75">
          Tire uma foto ou escolha da galeria. Em poucos passos você vê os riscos e as medidas
          sugeridas.
        </Body>
        <Button label="Iniciar análise" onPress={onStartAnalysis} className="mt-5" />
      </View>

      <Label className="mb-3">Acessos rápidos</Label>
      <View className="mb-6 flex-row gap-3">
        <View className="flex-1 rounded-3xl border border-line bg-surface px-4 py-5 dark:border-line-dark dark:bg-surface-dark">
          <Label>Biblioteca</Label>
          <Caption className="mt-2">Catálogo SST (resumos)</Caption>
          <Button label="Abrir" variant="outline" onPress={onOpenLibrary} className="mt-4 min-h-12" />
        </View>
        <View className="flex-1 rounded-3xl border border-line bg-surface px-4 py-5 dark:border-line-dark dark:bg-surface-dark">
          <Label>Histórico</Label>
          <Caption className="mt-2">Análises anteriores</Caption>
          <Button label="Abrir" variant="outline" onPress={onOpenHistory} className="mt-4 min-h-12" />
        </View>
      </View>

      <View className="rounded-3xl border border-line bg-surface px-5 py-5 dark:border-line-dark dark:bg-surface-dark">
        <Label>Dica de campo</Label>
        <Caption className="mt-2">
          Prefira fotos bem iluminadas, com o risco no centro da imagem. Isso melhora a leitura da
          situação e das NRs relacionadas.
        </Caption>
      </View>
    </Container>
  );
}
