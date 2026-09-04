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

/** uploaded = Storage (standby); 4A usa pending → analyzing → done|failed */
export type AnalysisStatus = 'pending' | 'uploaded' | 'analyzing' | 'done' | 'failed';

export type RiskSeverity = 'low' | 'medium' | 'high';

export type AnalysisRisk = {
  id: string;
  title: string;
  description: string;
  severity: RiskSeverity;
};

export type AnalysisControl = {
  riskId: string;
  measure: string;
};

export type AnalysisNr = {
  code: string;
  title: string;
  relevance: string;
};

export type AnalysisAiProvider = 'mock' | 'openai';

export type AnalysisResult = {
  risks: AnalysisRisk[];
  controls: AnalysisControl[];
  nrs: AnalysisNr[];
  provider: AnalysisAiProvider;
  model?: string;
  analyzedAt: string;
};

export type AnalysisRecord = {
  id: string;
  uid: string;
  imagePath: string;
  imageUrl: string;
  status: AnalysisStatus;
  source: AnalysisSource;
  createdAt: string;
  updatedAt: string;
  result?: AnalysisResult;
  errorMessage?: string;
  localOnly?: boolean;
};
