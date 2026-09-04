import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

import {
  Body,
  Button,
  Caption,
  Container,
  Heading,
  Label,
} from '@/src/components';
import {
  LIBRARY_CATEGORIES,
  type LibraryCategory,
} from '@/src/services/mocks/library.mock';

/**
 * Biblioteca SST — mesmas categorias para Free e Premium.
 */
export function LibraryScreen() {
  const [selected, setSelected] = useState<LibraryCategory | null>(null);

  return (
    <Container scroll>
      <View className="mb-8 mt-2 gap-2">
        <Heading>Biblioteca</Heading>
        <Body>Materiais de SST para consulta rápida em campo.</Body>
      </View>

      <View className="mb-2 gap-3">
        {LIBRARY_CATEGORIES.map((item) => (
          <View key={item.id} className="rounded-3xl border border-line bg-white px-5 py-5">
            <View className="flex-row items-start justify-between gap-2">
              <View className="flex-1">
                <Label>{item.title}</Label>
                <Caption className="mt-2">{item.description}</Caption>
              </View>
              <Caption className="text-brand-dark">{item.documents.length} itens</Caption>
            </View>
            <Button
              label="Ver materiais"
              variant="outline"
              onPress={() => setSelected(item)}
              className="mt-4 min-h-12"
            />
          </View>
        ))}
      </View>

      <Modal
        visible={Boolean(selected)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40 px-4 pb-10"
          onPress={() => setSelected(null)}
        >
          <Pressable
            className="max-h-[70%] w-full rounded-3xl bg-white px-5 py-6"
            onPress={(e) => e.stopPropagation()}
          >
            <Label>{selected?.title}</Label>
            <Caption className="mt-1">{selected?.description}</Caption>

            <View className="mt-5 gap-3">
              {selected?.documents.map((doc) => (
                <View key={doc.id} className="rounded-2xl border border-line px-4 py-3">
                  <Label className="text-base">{doc.title}</Label>
                  <Caption className="mt-1">{doc.meta}</Caption>
                </View>
              ))}
            </View>

            <Body className="mt-4 text-ink-muted">
              Visualização e download dos arquivos serão liberados na sequência. Por agora você
              confere a organização dos materiais.
            </Body>
            <Button label="Fechar" variant="secondary" onPress={() => setSelected(null)} className="mt-4" />
          </Pressable>
        </Pressable>
      </Modal>
    </Container>
  );
}
