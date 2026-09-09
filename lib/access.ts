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

export const PLAN_LABELS = {
  free: 'Free',
  premium: 'Premium',
  admin: 'Admin',
} as const;


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
  if (!fullName?.trim()) return 'Profissional SST';
  return fullName.trim().split(/\s+/)[0];
}

/** Assinante ou admin têm acesso Premium de fato. */
export function isPremiumRole(role: UserRole | null | undefined): boolean {
  return role === 'subscriber' || role === 'admin';
}

/**
 * Acesso a conteúdo Premium: role real ou pré-visualização de sessão (demo cliente).
 */
export function canAccessPremiumContent(
  role: UserRole | null | undefined,
  demoAsPremium: boolean,
): boolean {
  return isPremiumRole(role) || demoAsPremium;
}

/** Rótulo de plano para UI (não confundir com role técnica). */
export function getPlanLabel(role: UserRole | null | undefined): string {
  if (role === 'admin') return PLAN_LABELS.admin;
  if (role === 'subscriber') return PLAN_LABELS.premium;
  return PLAN_LABELS.free;
}

export function getPlanKind(
  role: UserRole | null | undefined,
): 'free' | 'premium' | 'admin' {
  if (role === 'admin') return 'admin';
  if (role === 'subscriber') return 'premium';
  return 'free';
}
