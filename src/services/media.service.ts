import * as ImagePicker from 'expo-image-picker';

import type { AnalysisSource } from '@/lib/types';

export type PickedImage = {
  localUri: string;
  source: AnalysisSource;
};

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
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

  const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return { localUri: result.assets[0].uri, source: 'camera' };
}

export async function pickFromGallery(): Promise<PickedImage | null> {
  const granted = await ensureGalleryPermission();
  if (!granted) {
    throw new Error('GALLERY_PERMISSION_DENIED');
  }

  const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return { localUri: result.assets[0].uri, source: 'gallery' };
}
