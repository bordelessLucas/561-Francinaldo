import { View } from 'react-native';

import { AppHeader, Body, Button, Caption, Container, Heading, Label } from '@/src/components';

type HomeScreenProps = {
  userName?: string;
  onStartAnalysis?: () => void;
  onOpenLibrary?: () => void;
  onOpenHistory?: () => void;
  onOpenProfile?: () => void;
  onOpenMenu?: () => void;
};

/**
 * Home estrutural — saudação + CTA de análise.
 * Navegação via callbacks (rotas conectam a lógica).
 */
export function HomeScreen({
  userName = 'profissional',
  onStartAnalysis = () => {},
  onOpenLibrary = () => {},
  onOpenHistory = () => {},
  onOpenProfile = () => {},
  onOpenMenu = () => {},
}: HomeScreenProps) {
  return (
    <Container scroll>
      <AppHeader
        subtitle="Segurança em campo"
        onPressMenu={onOpenMenu}
        onPressProfile={onOpenProfile}
      />

      <View className="mb-8 gap-2">
        <Heading>Olá, {userName}</Heading>
        <Body>Analise um ambiente de trabalho em poucos passos.</Body>
      </View>

      <View className="mb-6 overflow-hidden rounded-3xl bg-brand-black px-5 py-6">
        <Caption className="uppercase tracking-widest text-brand-accent">Ação principal</Caption>
        <Label className="mt-3 text-2xl text-white">Nova análise</Label>
        <Body className="mt-2 text-white/75">
          Fotografe ou selecione uma situação. A IA identificará riscos, medidas de controle e NRs.
        </Body>
        <Button label="Iniciar análise" onPress={onStartAnalysis} className="mt-5" />
      </View>

      <View className="mb-4">
        <Label>Acessos rápidos</Label>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1 rounded-3xl border border-line bg-white px-4 py-5">
          <Label>Biblioteca</Label>
          <Caption className="mt-2">Checklists, OS e NRs</Caption>
          <Button
            label="Abrir"
            variant="outline"
            onPress={onOpenLibrary}
            className="mt-4 min-h-12"
          />
        </View>
        <View className="flex-1 rounded-3xl border border-line bg-white px-4 py-5">
          <Label>Histórico</Label>
          <Caption className="mt-2">Suas análises</Caption>
          <Button
            label="Ver"
            variant="secondary"
            onPress={onOpenHistory}
            className="mt-4 min-h-12"
          />
        </View>
      </View>

      <View className="mt-6 rounded-3xl border border-dashed border-line bg-white/70 px-5 py-6">
        <Label>Próximo conteúdo</Label>
        <Caption className="mt-2">
          Área reservada para resumo de análises e atalhos. Sem dados fictícios permanentes.
        </Caption>
      </View>
    </Container>
  );
}
