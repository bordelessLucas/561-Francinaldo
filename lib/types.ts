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

/** uploaded = Storage (standby); fluxo oficial: pending → analyzing → done|failed */
export type AnalysisStatus = 'pending' | 'uploaded' | 'analyzing' | 'done' | 'failed';

export type RiskSeverity = 'low' | 'medium' | 'high';

/** Confiança da leitura visual / inferência. */
export type AnalysisConfidence = 'high' | 'medium' | 'low';

export type AnalysisRisk = {
  id: string;
  title: string;
  description: string;
  severity: RiskSeverity;
  /** Alta = evidência clara na imagem; baixa = inferência / dúvida. */
  confidence?: AnalysisConfidence;
  /** O que o inspetor deve verificar se houver dúvida. */
  uncertaintyNote?: string;
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

/** Provider da análise de foto (somente OpenAI Vision no fluxo oficial). */
export type AnalysisAiProvider = 'openai';

export type AnalysisResult = {
  risks: AnalysisRisk[];
  controls: AnalysisControl[];
  nrs: AnalysisNr[];
  provider: AnalysisAiProvider;
  model?: string;
  analyzedAt: string;
  /** Confiança geral da leitura da cena. */
  overallConfidence?: AnalysisConfidence;
  /** true se a IA pede revisão humana / complementar a foto. */
  needsInspectorReview?: boolean;
  /** Resumo do que o inspetor deve checar ou complementar. */
  inspectorGuidance?: string;
  /** Limitações da análise (ângulo, iluminação, elementos não visíveis). */
  limitations?: string[];
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
  /** Contexto livre do inspetor enviado à IA (opcional). */
  inspectorNote?: string;
};
