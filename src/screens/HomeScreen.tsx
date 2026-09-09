import { View } from 'react-native';

import { PlanTag } from '@/components/ui/PlanTag';
import { useAppTheme } from '@/contexts/ThemeContext';
import {
  AppHeader,
  Body,
  Button,
  Caption,
  Container,
  Heading,
  Label,
  QuickAccessCard,
  Surface,
} from '@/src/components';

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
  userName = 'Profissional SST',
  planKind = 'free',
  onStartAnalysis = () => {},
  onOpenLibrary = () => {},
  onOpenHistory = () => {},
}: HomeScreenProps) {
  const { colors } = useAppTheme();

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

      <Surface tone="accent" className="mb-6">
        <Caption className="uppercase tracking-widest" style={{ color: colors.brand }}>
          Começar
        </Caption>
        <Label className="mt-3 text-2xl" style={{ color: colors.brandDark }}>
          Nova análise
        </Label>
        <Body className="mt-2">
          Tire uma foto ou escolha da galeria. Em poucos passos você vê os riscos e as medidas
          sugeridas.
        </Body>
        <Button label="Iniciar análise" onPress={onStartAnalysis} className="mt-5" />
      </Surface>

      <Label className="mb-3">Acessos rápidos</Label>
      <View className="mb-6 flex-row items-stretch gap-3">
        <QuickAccessCard
          title="Biblioteca"
          description="Catálogo SST (resumos)"
          onPress={onOpenLibrary}
        />
        <QuickAccessCard
          title="Histórico"
          description="Análises anteriores"
          onPress={onOpenHistory}
        />
      </View>

      <Surface>
        <Label>Dica de campo</Label>
        <Caption className="mt-2">
          Prefira fotos bem iluminadas, com o risco no centro da imagem. Isso melhora a leitura da
          situação e das NRs relacionadas.
        </Caption>
      </Surface>
    </Container>
  );
}
