import {
  collection,
  doc,
  setDoc,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { AnalysisRecord, AnalysisSource, AnalysisStatus } from '@/lib/types';
import { uploadAnalysisImage } from '@/src/services/storage.service';

function mapAnalysis(id: string, data: DocumentData): AnalysisRecord {
  return {
    id,
    uid: typeof data.uid === 'string' ? data.uid : '',
    imagePath: typeof data.imagePath === 'string' ? data.imagePath : '',
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : '',
    status: (data.status === 'uploaded' ? 'uploaded' : 'pending') as AnalysisStatus,
    source: (data.source === 'gallery' ? 'gallery' : 'camera') as AnalysisSource,
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
  };
}

export type CreateAnalysisFromImageInput = {
  uid: string;
  localUri: string;
  source: AnalysisSource;
};

/**
 * Fluxo Sprint 3: cria doc pendente → upload Storage → marca como enviada.
 * Sem IA (Sprint 4).
 */
export async function createAnalysisFromImage(
  input: CreateAnalysisFromImageInput,
): Promise<AnalysisRecord> {
  const analysisRef = doc(collection(db, 'analyses'));
  const analysisId = analysisRef.id;
  const now = new Date().toISOString();

  await setDoc(analysisRef, {
    uid: input.uid,
    imagePath: '',
    imageUrl: '',
    status: 'pending' satisfies AnalysisStatus,
    source: input.source,
    createdAt: now,
    updatedAt: now,
  });

  try {
    const { imagePath, imageUrl } = await uploadAnalysisImage({
      uid: input.uid,
      analysisId,
      localUri: input.localUri,
    });

    const updatedAt = new Date().toISOString();
    await updateDoc(analysisRef, {
      imagePath,
      imageUrl,
      status: 'uploaded' satisfies AnalysisStatus,
      updatedAt,
    });

    return mapAnalysis(analysisId, {
      uid: input.uid,
      imagePath,
      imageUrl,
      status: 'uploaded',
      source: input.source,
      createdAt: now,
      updatedAt,
    });
  } catch (error) {
    await updateDoc(analysisRef, {
      updatedAt: new Date().toISOString(),
    }).catch(() => undefined);
    throw error;
  }
}
