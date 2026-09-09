import { View } from 'react-native';
import { router, type Href } from 'expo-router';

import { useAppTheme } from '@/contexts/ThemeContext';
import { Body, Caption, Container, Heading, Label, Surface } from '@/src/components';
import { LIBRARY_CATALOG } from '@/src/data/library-catalog';

/**
 * Biblioteca — hub de categorias (Sprints 6A–8).
 */
export function LibraryScreen() {
  const { colors } = useAppTheme();

  return (
    <Container scroll>
      <View className="mb-8 mt-2 gap-2">
        <Heading>Biblioteca</Heading>
        <Body>
          Catálogo de checklists, OS e NRs em resumo. O arquivo completo para download chega quando o
          armazenamento estiver ativo.
        </Body>
      </View>

      <View className="gap-3">
        {LIBRARY_CATALOG.map((item) => (
          <Surface
            key={item.id}
            onPress={() => router.push(`/(app)/library/${item.id}` as Href)}
          >
            <View className="flex-row items-start justify-between gap-2">
              <View className="flex-1">
                <Label>{item.title}</Label>
                <Caption className="mt-2">{item.description}</Caption>
              </View>
              <Caption style={{ color: colors.brandDark }}>
                {item.documents.length}{' '}
                {item.documents.length === 1 ? 'resumo' : 'resumos'}
              </Caption>
            </View>
            <Caption className="mt-4 font-sansSemi" style={{ color: colors.brandDark }}>
              Abrir →
            </Caption>
          </Surface>
        ))}
      </View>

      <Caption className="mt-6">
        Por enquanto você consulta títulos e resumos no app — sem download de PDF.
      </Caption>
    </Container>
  );
}
