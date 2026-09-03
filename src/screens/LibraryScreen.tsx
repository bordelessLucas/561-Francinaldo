import { View } from 'react-native';

import {
  Body,
  Button,
  Caption,
  Container,
  EmptyState,
  Heading,
  Label,
} from '@/src/components';

const CATEGORIES = [
  { title: 'Checklists', description: 'Equipamentos, ambientes e atividades' },
  { title: 'Ordens de Serviço', description: 'Modelos para download e uso externo' },
  { title: 'NRs', description: 'Consulta e PDFs das normas' },
  { title: 'Planilhas SST', description: 'Controles e materiais da rotina' },
] as const;

/**
 * Shell da Biblioteca SST — estrutura visual sem conteúdo/Firebase ainda.
 */
export function LibraryScreen() {
  return (
    <Container scroll>
      <View className="mb-8 mt-2 gap-2">
        <Heading>Biblioteca</Heading>
        <Body>Materiais de SST organizados para uso em campo.</Body>
      </View>

      <View className="mb-6 gap-3">
        {CATEGORIES.map((item) => (
          <View key={item.title} className="rounded-3xl border border-line bg-white px-5 py-5">
            <Label>{item.title}</Label>
            <Caption className="mt-2">{item.description}</Caption>
            <Button label="Em breve" variant="outline" disabled className="mt-4 min-h-12" />
          </View>
        ))}
      </View>

      <EmptyState
        title="Conteúdo em preparação"
        description="Documentos, checklists e NRs serão adicionados nas próximas sprints. Sem arquivos fictícios aqui."
      />
    </Container>
  );
}
