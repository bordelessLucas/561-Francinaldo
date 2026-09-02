import type { AppModule, UserRole, UserStatus } from '@/lib/types';

export const ROLE_LABELS: Record<UserRole, string> = {
  technician: 'Técnico',
  manager: 'Gestor',
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
};

const SHARED_MODULES: AppModule[] = ['home', 'analysis', 'history', 'profile'];

/** Módulos liberados por perfil — base comum; gestores ganharão áreas futuras aqui. */
export function getModulesForRole(role: UserRole): AppModule[] {
  if (role === 'manager') {
    return [...SHARED_MODULES];
  }

  return [...SHARED_MODULES];
}

export function canAccessModule(role: UserRole, module: AppModule): boolean {
  return getModulesForRole(role).includes(module);
}

export function getRoleLabel(role: UserRole | null | undefined): string {
  if (!role) return 'Perfil não definido';
  return ROLE_LABELS[role];
}

export function getStatusLabel(status: UserStatus | null | undefined): string {
  if (!status) return '—';
  return STATUS_LABELS[status];
}

export function getFirstName(fullName: string | null | undefined): string {
  if (!fullName?.trim()) return 'profissional';
  return fullName.trim().split(/\s+/)[0];
}
