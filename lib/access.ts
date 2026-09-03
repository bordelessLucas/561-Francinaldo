import type { AppModule, UserRole, UserStatus } from '@/lib/types';

export const ROLE_LABELS: Record<UserRole, string> = {
  common: 'Comum',
  subscriber: 'Assinante',
  admin: 'Administrador',
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
};

const SHARED_MODULES: AppModule[] = ['home', 'analysis', 'library', 'history', 'profile'];

/** Módulos liberados por perfil — base do piloto; Premium/admin ampliam depois. */
export function getModulesForRole(_role: UserRole): AppModule[] {
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
