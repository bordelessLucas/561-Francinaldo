export type UserRole = 'technician' | 'manager';

export type UserStatus = 'active' | 'inactive';

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
};

export type AppModule = 'home' | 'analysis' | 'history' | 'profile';
