import { doc, getDoc, setDoc, type DocumentData } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { UserProfile, UserRole, UserStatus } from '@/lib/types';

function normalizeRole(value: unknown): UserRole {
  if (value === 'admin') return 'admin';
  if (value === 'subscriber') return 'subscriber';
  // Legado Francinaldo (technician/manager) e default do piloto → common
  return 'common';
}

function normalizeStatus(value: unknown): UserStatus {
  return value === 'inactive' ? 'inactive' : 'active';
}

export function mapUserProfile(uid: string, data: DocumentData): UserProfile {
  return {
    uid,
    name: typeof data.name === 'string' ? data.name : '',
    email: typeof data.email === 'string' ? data.email : '',
    role: normalizeRole(data.role),
    status: normalizeStatus(data.status),
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
  };
}

export async function getUserProfile(uid: string): Promise<UserProfile> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) {
    throw new Error('PROFILE_NOT_FOUND');
  }
  return mapUserProfile(uid, snap.data());
}

export type CreateUserProfileInput = {
  uid: string;
  name: string;
  email: string;
};

/** Cadastro público: sempre role common + status active. */
export async function createUserProfile(input: CreateUserProfileInput): Promise<UserProfile> {
  const now = new Date().toISOString();
  const profile: UserProfile = {
    uid: input.uid,
    name: input.name.trim(),
    // Manter o e-mail do Auth (token.email) para passar nas Security Rules
    email: input.email.trim(),
    role: 'common',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, 'users', input.uid), profile);
  return profile;
}
