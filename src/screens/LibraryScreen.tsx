import { Pressable, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { Body, Caption, Container, Heading, Label } from '@/src/components';
import { LIBRARY_CATALOG } from '@/src/data/library-catalog';

/**
 * Biblioteca — hub de categorias (Sprints 6A–8).
 */
export function LibraryScreen() {
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
          <Pressable
            key={item.id}
            onPress={() => router.push(`/(app)/library/${item.id}` as Href)}
            className="rounded-3xl border border-line bg-surface px-5 py-5 active:bg-canvas dark:border-line-dark dark:bg-surface-dark dark:active:bg-canvas-dark"
          >
            <View className="flex-row items-start justify-between gap-2">
              <View className="flex-1">
                <Label>{item.title}</Label>
                <Caption className="mt-2">{item.description}</Caption>
              </View>
              <Caption className="text-brand-dark dark:text-brand-accent">
                {item.documents.length}{' '}
                {item.documents.length === 1 ? 'resumo' : 'resumos'}
              </Caption>
            </View>
            <Caption className="mt-4 font-sansSemi text-brand-dark dark:text-brand-accent">
              Abrir →
            </Caption>
          </Pressable>
        ))}
      </View>

      <Caption className="mt-6 text-ink-muted dark:text-ink-muted-inverse">
        Por enquanto você consulta títulos e resumos no app — sem download de PDF.
      </Caption>
    </Container>
  );
}
