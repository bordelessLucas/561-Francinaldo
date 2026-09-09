import { View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';

import { useAppTheme } from '@/contexts/ThemeContext';
import {
  BackLink,
  Body,
  Caption,
  Container,
  EmptyState,
  Heading,
  Label,
  Surface,
} from '@/src/components';
import { getLibraryCategory } from '@/src/data/library-catalog';

/**
 * Lista de documentos de uma categoria da Biblioteca.
 */
export function LibraryCategoryScreen() {
  const { colors } = useAppTheme();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const category = getLibraryCategory(categoryId ?? '');

  if (!category) {
    return (
      <Container>
        <EmptyState title="Categoria não encontrada" description="Volte à Biblioteca e escolha outra área." />
        <BackLink className="mt-4 self-center" fallbackHref={'/(app)/library' as Href} />
      </Container>
    );
  }

  return (
    <Container scroll>
      <BackLink className="mb-4" fallbackHref={'/(app)/library' as Href} />

      <View className="mb-6 gap-2">
        <Heading>{category.title}</Heading>
        <Body>{category.description}</Body>
      </View>

      <View className="gap-3">
        {category.documents.map((doc) => (
          <Surface
            key={doc.id}
            onPress={() =>
              router.push(`/(app)/library/${category.id}/${doc.id}` as Href)
            }
          >
            <Label>{doc.title}</Label>
            <Caption className="mt-2">{doc.summary}</Caption>
            <Caption className="mt-3" style={{ color: colors.brandDark }}>
              {doc.meta} · só resumo
            </Caption>
          </Surface>
        ))}
      </View>
    </Container>
  );
}
