export type UserRole = 'common' | 'subscriber' | 'admin';

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

export type AppModule = 'home' | 'analysis' | 'library' | 'history' | 'profile';

export type AnalysisSource = 'camera' | 'gallery';

export type AnalysisStatus = 'pending' | 'uploaded';

export type AnalysisRecord = {
  id: string;
  uid: string;
  imagePath: string;
  imageUrl: string;
  status: AnalysisStatus;
  source: AnalysisSource;
  createdAt: string;
  updatedAt: string;
};
