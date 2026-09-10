import * as ImagePicker from 'expo-image-picker';

import type { AnalysisSource } from '@/lib/types';

export type PickedImage = {
  localUri: string;
  source: AnalysisSource;
};

/** Limite de lote — fila processa 1 a 1 (UX de várias fotos sem pico de tokens). */
export const MAX_ANALYSIS_BATCH = 8;

const BASE_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: false,
  quality: 0.8,
  exif: false,
};

export async function ensureCameraPermission(): Promise<boolean> {
  const current = await ImagePicker.getCameraPermissionsAsync();
  if (current.granted) return true;
  const requested = await ImagePicker.requestCameraPermissionsAsync();
  return requested.granted;
}

export async function ensureGalleryPermission(): Promise<boolean> {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) return true;
  const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return requested.granted;
}

export async function pickFromCamera(): Promise<PickedImage | null> {
  const granted = await ensureCameraPermission();
  if (!granted) {
    throw new Error('CAMERA_PERMISSION_DENIED');
  }

  const result = await ImagePicker.launchCameraAsync(BASE_OPTIONS);
  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return { localUri: result.assets[0].uri, source: 'camera' };
}

/** Uma foto da galeria (compat). */
export async function pickFromGallery(): Promise<PickedImage | null> {
  const items = await pickMultipleFromGallery(1);
  return items[0] ?? null;
}

/**
 * Seleção múltipla na galeria.
 * @param remainingSlots quantas fotos ainda cabem no lote
 */
export async function pickMultipleFromGallery(
  remainingSlots: number = MAX_ANALYSIS_BATCH,
): Promise<PickedImage[]> {
  const granted = await ensureGalleryPermission();
  if (!granted) {
    throw new Error('GALLERY_PERMISSION_DENIED');
  }

  const limit = Math.max(1, Math.min(remainingSlots, MAX_ANALYSIS_BATCH));
  const result = await ImagePicker.launchImageLibraryAsync({
    ...BASE_OPTIONS,
    allowsMultipleSelection: true,
    selectionLimit: limit,
  });

  if (result.canceled || !result.assets?.length) {
    return [];
  }

  return result.assets
    .filter((asset) => Boolean(asset.uri))
    .slice(0, limit)
    .map((asset) => ({
      localUri: asset.uri,
      source: 'gallery' as const,
    }));
}
