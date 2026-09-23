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

/** uploaded = Storage (standby); official flow: pending -> analyzing -> done|failed */
export type AnalysisStatus = 'pending' | 'uploaded' | 'analyzing' | 'done' | 'failed';

export type RiskSeverity = 'low' | 'medium' | 'high';

/** Confidence of the visual reading or inference. */
export type AnalysisConfidence = 'high' | 'medium' | 'low';

export type AnalysisSceneType = 'workplace' | 'non_workplace' | 'unclear';

export type AnalysisComplianceSummary =
  | 'issues_found'
  | 'no_visible_issue'
  | 'not_applicable'
  | 'needs_more_context';

export type AnalysisRetrievalContext = {
  code: string;
  title: string;
  reason: string;
};

export type InspectionReportAction = {
  id: string;
  action: string;
  responsible?: string;
  deadline?: string;
  status?: string;
};

export type InspectionReport = {
  title: string;
  inspectionDate: string;
  area: string;
  responsible: string;
  interdicted: boolean;
  severity: RiskSeverity;
  riskDescription: string;
  actions: InspectionReportAction[];
};

export type AnalysisRisk = {
  id: string;
  title: string;
  description: string;
  severity: RiskSeverity;
  /** High means clear image evidence; low means inference or uncertainty. */
  confidence?: AnalysisConfidence;
  /** What the inspector should verify when there is uncertainty. */
  uncertaintyNote?: string;
  /** Visual evidence used to support this risk. */
  evidence?: string[];
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

/** Photo analysis provider: only OpenAI Vision in the official flow. */
export type AnalysisAiProvider = 'openai';

export type AnalysisResult = {
  risks: AnalysisRisk[];
  controls: AnalysisControl[];
  nrs: AnalysisNr[];
  provider: AnalysisAiProvider;
  model?: string;
  analyzedAt: string;
  /** Overall scene classification. */
  sceneType?: AnalysisSceneType;
  /** Executive summary for risk/no-risk/not-applicable states. */
  complianceSummary?: AnalysisComplianceSummary;
  /** NRs retrieved as grounding context for the report. */
  retrievalContext?: AnalysisRetrievalContext[];
  /** Optional photographic inspection report, generated only when requested. */
  inspectionReport?: InspectionReport;
  /** Overall confidence for the scene reading. */
  overallConfidence?: AnalysisConfidence;
  /** true when the AI requests human review or more context. */
  needsInspectorReview?: boolean;
  /** Summary of what the inspector should check or add. */
  inspectorGuidance?: string;
  /** Analysis limitations such as angle, lighting, or invisible elements. */
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
  /** Free context sent by the inspector to the AI. */
  inspectorNote?: string;
  /** User requested a report based on this photo. */
  reportRequested?: boolean;
};
