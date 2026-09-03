import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from '@/lib/firebase';

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('IMAGE_READ_FAILED');
  }
  return response.blob();
}

export function buildAnalysisImagePath(uid: string, analysisId: string): string {
  return `analyses/${uid}/${analysisId}.jpg`;
}

export type UploadAnalysisImageInput = {
  uid: string;
  analysisId: string;
  localUri: string;
};

export type UploadAnalysisImageResult = {
  imagePath: string;
  imageUrl: string;
};

/** Upload da imagem da análise para Storage (owner-only path). */
export async function uploadAnalysisImage(
  input: UploadAnalysisImageInput,
): Promise<UploadAnalysisImageResult> {
  const imagePath = buildAnalysisImagePath(input.uid, input.analysisId);
  const storageRef = ref(storage, imagePath);
  const blob = await uriToBlob(input.localUri);

  await uploadBytes(storageRef, blob, {
    contentType: 'image/jpeg',
  });

  const imageUrl = await getDownloadURL(storageRef);
  return { imagePath, imageUrl };
}
