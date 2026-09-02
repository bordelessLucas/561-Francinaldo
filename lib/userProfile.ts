import type { DocumentData } from 'firebase/firestore';

import type { UserProfile, UserRole, UserStatus } from '@/lib/types';

function normalizeRole(value: unknown): UserRole {
  return value === 'manager' ? 'manager' : 'technician';
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
