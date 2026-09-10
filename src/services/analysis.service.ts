import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';

import { isStorageUploadEnabled } from '@/lib/featureFlags';
import { db } from '@/lib/firebase';
import type {
  AnalysisRecord,
  AnalysisResult,
  AnalysisSource,
  AnalysisStatus,
} from '@/lib/types';
import { analyzeSituationImage } from '@/src/services/ai.service';
import { uploadAnalysisImage } from '@/src/services/storage.service';

function normalizeStatus(value: unknown): AnalysisStatus {
  if (
    value === 'uploaded' ||
    value === 'analyzing' ||
    value === 'done' ||
    value === 'failed' ||
    value === 'pending'
  ) {
    return value;
  }
  return 'pending';
}

export function mapAnalysis(id: string, data: DocumentData): AnalysisRecord {
  return {
    id,
    uid: typeof data.uid === 'string' ? data.uid : '',
    imagePath: typeof data.imagePath === 'string' ? data.imagePath : '',
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : '',
    status: normalizeStatus(data.status),
    source: data.source === 'gallery' ? 'gallery' : 'camera',
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
    result: data.result as AnalysisResult | undefined,
    errorMessage: typeof data.errorMessage === 'string' ? data.errorMessage : undefined,
    localOnly: typeof data.localOnly === 'boolean' ? data.localOnly : undefined,
    inspectorNote:
      typeof data.inspectorNote === 'string' && data.inspectorNote.trim()
        ? data.inspectorNote.trim()
        : undefined,
  };
}

export async function listAnalysesByUser(uid: string): Promise<AnalysisRecord[]> {
  const q = query(
    collection(db, 'analyses'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapAnalysis(d.id, d.data()));
}

export async function getAnalysisById(analysisId: string): Promise<AnalysisRecord | null> {
  const snap = await getDoc(doc(db, 'analyses', analysisId));
  if (!snap.exists()) return null;
  return mapAnalysis(snap.id, snap.data());
}

export type CreateAnalysisFromImageInput = {
  uid: string;
  localUri: string;
  source: AnalysisSource;
};

/**
 * Legado / fora do fluxo oficial do piloto (análise efêmera).
 * Só corre se EXPO_PUBLIC_ENABLE_STORAGE_UPLOAD=true — não usar para Vision/4B.
 */
export async function createAnalysisFromImage(
  input: CreateAnalysisFromImageInput,
): Promise<AnalysisRecord> {
  if (!isStorageUploadEnabled()) {
    throw new Error('STORAGE_UPLOAD_DISABLED');
  }

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
    localOnly: false,
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
      localOnly: false,
    });
  } catch (error) {
    await updateDoc(analysisRef, {
      updatedAt: new Date().toISOString(),
    }).catch(() => undefined);
    throw error;
  }
}

export type RunAnalysisWithoutUploadInput = {
  uid: string;
  localUri: string;
  source: AnalysisSource;
  /** Contexto livre do inspetor (reanálise / complemento). */
  inspectorNote?: string;
};

/**
 * Fluxo oficial: pending → analyzing → OpenAI Vision → done|failed.
 * Imagem efêmera (`localOnly: true`); sem upload Storage; Firestore só texto/`result`.
 */
export async function runAnalysisWithoutUpload(
  input: RunAnalysisWithoutUploadInput,
): Promise<AnalysisRecord> {
  const analysisRef = doc(collection(db, 'analyses'));
  const analysisId = analysisRef.id;
  const now = new Date().toISOString();
  const inspectorNote = input.inspectorNote?.trim() || undefined;

  await setDoc(analysisRef, {
    uid: input.uid,
    imagePath: '',
    imageUrl: '',
    status: 'pending' satisfies AnalysisStatus,
    source: input.source,
    createdAt: now,
    updatedAt: now,
    localOnly: true,
    ...(inspectorNote ? { inspectorNote } : {}),
  });

  await updateDoc(analysisRef, {
    status: 'analyzing' satisfies AnalysisStatus,
    updatedAt: new Date().toISOString(),
  });

  try {
    const result = await analyzeSituationImage({
      localUri: input.localUri,
      inspectorNote,
    });
    const updatedAt = new Date().toISOString();

    await updateDoc(analysisRef, {
      status: 'done' satisfies AnalysisStatus,
      result,
      errorMessage: null,
      updatedAt,
      ...(inspectorNote ? { inspectorNote } : {}),
    });

    return mapAnalysis(analysisId, {
      uid: input.uid,
      imagePath: '',
      imageUrl: '',
      status: 'done',
      source: input.source,
      createdAt: now,
      updatedAt,
      result,
      localOnly: true,
      ...(inspectorNote ? { inspectorNote } : {}),
    });
  } catch (error) {
    const updatedAt = new Date().toISOString();
    const errorMessage =
      error instanceof Error ? error.message : 'AI_ANALYSIS_FAILED';

    await updateDoc(analysisRef, {
      status: 'failed' satisfies AnalysisStatus,
      errorMessage,
      updatedAt,
    }).catch(() => undefined);

    const failed: AnalysisRecord = {
      id: analysisId,
      uid: input.uid,
      imagePath: '',
      imageUrl: '',
      status: 'failed',
      source: input.source,
      createdAt: now,
      updatedAt,
      errorMessage,
      localOnly: true,
      ...(inspectorNote ? { inspectorNote } : {}),
    };

    throw Object.assign(error instanceof Error ? error : new Error(errorMessage), {
      analysis: failed,
    });
  }
}
