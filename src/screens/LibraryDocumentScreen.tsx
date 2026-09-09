import { View } from 'react-native';
import { useLocalSearchParams, type Href } from 'expo-router';

import { useAppTheme } from '@/contexts/ThemeContext';
import {
  BackLink,
  Body,
  Button,
  Caption,
  Container,
  EmptyState,
  Heading,
  Label,
  Surface,
  safeBack,
} from '@/src/components';
import { getLibraryDocument } from '@/src/data/library-catalog';

/**
 * Detalhe de material da Biblioteca (metadados; sem download Storage).
 */
export function LibraryDocumentScreen() {
  const { colors } = useAppTheme();
  const { categoryId, docId } = useLocalSearchParams<{
    categoryId: string;
    docId: string;
  }>();
  const found = getLibraryDocument(categoryId ?? '', docId ?? '');

  if (!found) {
    return (
      <Container>
        <EmptyState title="Material não encontrado" description="Ele pode ter sido movido ou removido." />
        <BackLink
          className="mt-4 self-center"
          fallbackHref={`/(app)/library/${categoryId ?? ''}` as Href}
        />
      </Container>
    );
  }

  const { category, document } = found;

  return (
    <Container scroll>
      <BackLink
        className="mb-4"
        fallbackHref={`/(app)/library/${categoryId ?? ''}` as Href}
      />

      <Caption style={{ color: colors.brandDark }}>{category.title}</Caption>
      <Heading className="mt-2">{document.title}</Heading>
      <Caption className="mt-2">{document.meta}</Caption>

      <Surface className="mt-6">
        <Label>Resumo</Label>
        <Body className="mt-3">{document.summary}</Body>
        {document.tags?.length ? (
          <View className="mt-4 flex-row flex-wrap gap-2">
            {document.tags.map((tag) => (
              <View
                key={tag}
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: colors.brandMist }}
              >
                <Caption style={{ color: colors.brandDark }}>{tag}</Caption>
              </View>
            ))}
          </View>
        ) : null}
      </Surface>

      <Surface tone="accent" className="mt-4">
        <Caption className="font-sansSemi" style={{ color: colors.brandDark }}>
          Arquivo em breve
        </Caption>
        <Caption className="mt-1" style={{ color: colors.brandDark }}>
          O PDF completo ainda não está disponível. Você está vendo só o resumo do catálogo.
        </Caption>
      </Surface>

      <Button
        label="Voltar à lista"
        variant="secondary"
        onPress={() => safeBack(`/(app)/library/${categoryId ?? ''}` as Href)}
        className="mt-6"
      />
    </Container>
  );
}
