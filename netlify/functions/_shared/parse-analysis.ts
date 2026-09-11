export type Severity = 'low' | 'medium' | 'high';
export type Confidence = 'high' | 'medium' | 'low';

export type ParsedAnalysisPayload = {
  risks: Array<{
    id: string;
    title: string;
    description: string;
    severity: Severity;
    confidence?: Confidence;
    uncertaintyNote?: string;
  }>;
  controls: Array<{
    riskId: string;
    measure: string;
  }>;
  nrs: Array<{
    code: string;
    title: string;
    relevance: string;
  }>;
  overallConfidence?: Confidence;
  needsInspectorReview?: boolean;
  inspectorGuidance?: string;
  limitations?: string[];
};

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function asSeverity(value: unknown): Severity {
  if (value === 'low' || value === 'medium' || value === 'high') return value;
  return 'medium';
}

function asConfidence(value: unknown): Confidence | undefined {
  if (value === 'high' || value === 'medium' || value === 'low') return value;
  return undefined;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asString(item))
    .filter((item) => item.length > 0);
}

/** Extrai JSON de resposta do modelo (aceita cercas ```json). */
export function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    try {
      const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (fenced?.[1]) {
        return JSON.parse(fenced[1].trim());
      }
      const start = trimmed.indexOf('{');
      const end = trimmed.lastIndexOf('}');
      if (start >= 0 && end > start) {
        return JSON.parse(trimmed.slice(start, end + 1));
      }
    } catch {
      throw new Error('AI_INVALID_JSON');
    }
    throw new Error('AI_INVALID_JSON');
  }
}

export function parseAnalysisPayload(raw: unknown): ParsedAnalysisPayload {
  if (!raw || typeof raw !== 'object') {
    throw new Error('AI_INVALID_PAYLOAD');
  }

  const data = raw as Record<string, unknown>;
  const risksIn = Array.isArray(data.risks) ? data.risks : [];
  const controlsIn = Array.isArray(data.controls) ? data.controls : [];
  const nrsIn = Array.isArray(data.nrs) ? data.nrs : [];

  if (risksIn.length === 0) {
    throw new Error('AI_EMPTY_RISKS');
  }

  const risks = risksIn.map((item, index) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const id = asString(row.id, `risk-${index + 1}`);
    const confidence = asConfidence(row.confidence);
    const uncertaintyNote = asString(row.uncertaintyNote);
    return {
      id,
      title: asString(row.title, `Risco ${index + 1}`),
      description: asString(row.description, 'Descrição não informada.'),
      severity: asSeverity(row.severity),
      ...(confidence ? { confidence } : {}),
      ...(uncertaintyNote ? { uncertaintyNote } : {}),
    };
  });

  const riskIds = new Set(risks.map((r) => r.id));

  const controls = controlsIn
    .map((item) => {
      const row = (item ?? {}) as Record<string, unknown>;
      const riskId = asString(row.riskId);
      const measure = asString(row.measure);
      if (!measure) return null;
      return {
        riskId: riskIds.has(riskId) ? riskId : risks[0].id,
        measure,
      };
    })
    .filter((c): c is { riskId: string; measure: string } => c !== null);

  const nrs = nrsIn
    .map((item) => {
      const row = (item ?? {}) as Record<string, unknown>;
      const code = asString(row.code);
      const title = asString(row.title);
      if (!code && !title) return null;
      return {
        code: code || 'NR',
        title: title || code,
        relevance: asString(row.relevance, 'Relacionada à situação analisada.'),
      };
    })
    .filter((n): n is { code: string; title: string; relevance: string } => n !== null);

  const overallConfidence = asConfidence(data.overallConfidence);
  const inspectorGuidance = asString(data.inspectorGuidance);
  const limitations = asStringList(data.limitations);
  const needsInspectorReview =
    typeof data.needsInspectorReview === 'boolean'
      ? data.needsInspectorReview
      : overallConfidence === 'low' ||
        risks.some((r) => r.confidence === 'low') ||
        limitations.length > 0;

  return {
    risks,
    controls:
      controls.length > 0
        ? controls
        : risks.map((r) => ({
            riskId: r.id,
            measure: 'Avaliar controles aplicáveis com a equipe de SST no local.',
          })),
    nrs,
    ...(overallConfidence ? { overallConfidence } : {}),
    needsInspectorReview,
    ...(inspectorGuidance ? { inspectorGuidance } : {}),
    ...(limitations.length > 0 ? { limitations } : {}),
  };
}
