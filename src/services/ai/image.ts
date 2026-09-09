import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

export type LocalImagePayload = {
  base64: string;
  mimeType: string;
};

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.7;

/**
 * Converte a foto da sessão para JPEG compactado + base64.
 * Evita HEIC/WebP e payloads enormes que a OpenAI rejeita.
 */
export async function readLocalImageAsBase64(localUri: string): Promise<LocalImagePayload> {
  if (!localUri) {
    throw new Error('AI_MISSING_IMAGE');
  }

  try {
    const manipulated = await ImageManipulator.manipulateAsync(
      localUri,
      [{ resize: { width: MAX_EDGE } }],
      {
        compress: JPEG_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      },
    );

    let base64 = manipulated.base64?.trim() ?? '';

    if (!base64) {
      base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    if (!base64 || base64.length < 32) {
      throw new Error('AI_MISSING_IMAGE');
    }

    return {
      base64,
      mimeType: 'image/jpeg',
    };
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('AI_')) {
      throw err;
    }
    throw new Error('IMAGE_READ_FAILED');
  }
}
