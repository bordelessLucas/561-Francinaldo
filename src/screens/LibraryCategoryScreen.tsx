import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';

import {
  Body,
  Caption,
  Container,
  EmptyState,
  Heading,
  Label,
} from '@/src/components';
import { getLibraryCategory } from '@/src/data/library-catalog';

/**
 * Lista de documentos de uma categoria da Biblioteca.
 */
export function LibraryCategoryScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const category = getLibraryCategory(categoryId ?? '');

  if (!category) {
    return (
      <Container>
        <EmptyState title="Categoria não encontrada" description="Volte à Biblioteca e escolha outra área." />
        <Pressable onPress={() => router.back()} className="mt-4">
          <Caption className="text-center text-brand-dark">Voltar</Caption>
        </Pressable>
      </Container>
    );
  }

  return (
    <Container scroll>
      <Pressable onPress={() => router.back()} className="mb-4 self-start py-1">
        <Caption className="font-sansSemi text-brand-dark">Voltar</Caption>
      </Pressable>

      <View className="mb-6 gap-2">
        <Heading>{category.title}</Heading>
        <Body>{category.description}</Body>
      </View>

      <View className="gap-3">
        {category.documents.map((doc) => (
          <Pressable
            key={doc.id}
            onPress={() =>
              router.push(`/(app)/library/${category.id}/${doc.id}` as Href)
            }
            className="rounded-3xl border border-line bg-surface px-5 py-5 active:bg-canvas dark:border-line-dark dark:bg-surface-dark dark:active:bg-canvas-dark"
          >
            <Label>{doc.title}</Label>
            <Caption className="mt-2">{doc.summary}</Caption>
            <Caption className="mt-3 text-brand-dark dark:text-brand-accent">
              {doc.meta} · só resumo
            </Caption>
          </Pressable>
        ))}
      </View>
    </Container>
  );
}
