import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import {
  Body,
  Button,
  Caption,
  Container,
  EmptyState,
  Heading,
  Label,
} from '@/src/components';
import { getLibraryDocument } from '@/src/data/library-catalog';

/**
 * Detalhe de material da Biblioteca (metadados; sem download Storage).
 */
export function LibraryDocumentScreen() {
  const { categoryId, docId } = useLocalSearchParams<{
    categoryId: string;
    docId: string;
  }>();
  const found = getLibraryDocument(categoryId ?? '', docId ?? '');

  if (!found) {
    return (
      <Container>
        <EmptyState title="Material não encontrado" description="Ele pode ter sido movido ou removido." />
        <Pressable onPress={() => router.back()} className="mt-4">
          <Caption className="text-center text-brand-dark">Voltar</Caption>
        </Pressable>
      </Container>
    );
  }

  const { category, document } = found;

  return (
    <Container scroll>
      <Pressable onPress={() => router.back()} className="mb-4 self-start py-1">
        <Caption className="font-sansSemi text-brand-dark">Voltar</Caption>
      </Pressable>

      <Caption className="text-brand-dark">{category.title}</Caption>
      <Heading className="mt-2">{document.title}</Heading>
      <Caption className="mt-2">{document.meta}</Caption>

      <View className="mt-6 rounded-3xl border border-line bg-surface px-5 py-5 dark:border-line-dark dark:bg-surface-dark">
        <Label>Resumo</Label>
        <Body className="mt-3">{document.summary}</Body>
        {document.tags?.length ? (
          <View className="mt-4 flex-row flex-wrap gap-2">
            {document.tags.map((tag) => (
              <View key={tag} className="rounded-full bg-brand-mist px-3 py-1 dark:bg-brand-mist-dark">
                <Caption className="text-brand-dark dark:text-brand-accent">{tag}</Caption>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View className="mt-4 rounded-3xl bg-brand-mist px-5 py-4 dark:bg-brand-mist-dark">
        <Caption className="font-sansSemi text-brand-dark dark:text-brand-accent">
          Arquivo em breve
        </Caption>
        <Caption className="mt-1 text-brand-dark dark:text-brand-accent">
          O PDF completo ainda não está disponível. Você está vendo só o resumo do catálogo.
        </Caption>
      </View>

      <Button label="Voltar à lista" variant="secondary" onPress={() => router.back()} className="mt-6" />
    </Container>
  );
}
