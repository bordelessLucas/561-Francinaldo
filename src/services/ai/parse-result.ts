import type {
  AnalysisComplianceSummary,
  AnalysisConfidence,
  AnalysisResult,
  AnalysisSceneType,
  RiskSeverity,
} from '@/lib/types';

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function asSeverity(value: unknown): RiskSeverity {
  if (value === 'low' || value === 'medium' || value === 'high') return value;
  return 'medium';
}

function asConfidence(value: unknown): AnalysisConfidence | undefined {
  if (value === 'high' || value === 'medium' || value === 'low') return value;
  return undefined;
}

function asSceneType(value: unknown): AnalysisSceneType | undefined {
  if (value === 'workplace' || value === 'non_workplace' || value === 'unclear') {
    return value;
  }
  return undefined;
}

function asComplianceSummary(value: unknown): AnalysisComplianceSummary | undefined {
  if (
    value === 'issues_found' ||
    value === 'no_visible_issue' ||
    value === 'not_applicable' ||
    value === 'needs_more_context'
  ) {
    return value;
  }
  return undefined;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asString(item))
    .filter((item) => item.length > 0);
}

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

/** Normalizes Vision/function payloads to AnalysisResult. */
export function toAnalysisResult(
  raw: unknown,
  meta: { model: string },
): AnalysisResult {
  if (!raw || typeof raw !== 'object') {
    throw new Error('AI_INVALID_PAYLOAD');
  }

  const data = raw as Record<string, unknown>;
  const risksIn = Array.isArray(data.risks) ? data.risks : [];
  const controlsIn = Array.isArray(data.controls) ? data.controls : [];
  const nrsIn = Array.isArray(data.nrs) ? data.nrs : [];
  const retrievalIn = Array.isArray(data.retrievalContext)
    ? data.retrievalContext
    : [];
  const reportIn =
    data.inspectionReport && typeof data.inspectionReport === 'object'
      ? (data.inspectionReport as Record<string, unknown>)
      : null;

  const sceneType = asSceneType(data.sceneType);
  const complianceSummary =
    asComplianceSummary(data.complianceSummary) ??
    (risksIn.length > 0 ? 'issues_found' : undefined);
  const analyzedAt = asString(data.analyzedAt) || new Date().toISOString();
  const inspectorGuidance = asString(data.inspectorGuidance);
  const allowsEmptyRisks =
    complianceSummary === 'no_visible_issue' ||
    complianceSummary === 'not_applicable' ||
    complianceSummary === 'needs_more_context';

  if (risksIn.length === 0 && !allowsEmptyRisks) {
    throw new Error('AI_EMPTY_RISKS');
  }

  const risks = risksIn.map((item, index) => {
    const row = (item ?? {}) as Record<string, unknown>;
    const confidence = asConfidence(row.confidence);
    const uncertaintyNote = asString(row.uncertaintyNote);
    const evidence = asStringList(row.evidence);
    return {
      id: asString(row.id, `risk-${index + 1}`),
      title: asString(row.title, `Risco ${index + 1}`),
      description: asString(row.description, 'Descricao nao informada.'),
      severity: asSeverity(row.severity),
      ...(confidence ? { confidence } : {}),
      ...(uncertaintyNote ? { uncertaintyNote } : {}),
      ...(evidence.length > 0 ? { evidence } : {}),
    };
  });

  const riskIds = new Set(risks.map((r) => r.id));

  const controls = controlsIn
    .map((item) => {
      const row = (item ?? {}) as Record<string, unknown>;
      const riskId = asString(row.riskId);
      const measure = asString(row.measure);
      if (!measure || risks.length === 0) return null;
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
        relevance: asString(row.relevance, 'Relacionada a situacao analisada.'),
      };
    })
    .filter((n): n is { code: string; title: string; relevance: string } => n !== null);

  const retrievalContext = retrievalIn
    .map((item) => {
      const row = (item ?? {}) as Record<string, unknown>;
      const code = asString(row.code);
      const title = asString(row.title);
      const reason = asString(row.reason);
      if (!code || !title) return null;
      return {
        code,
        title,
        reason: reason || 'Recuperada como contexto normativo para a analise.',
      };
    })
    .filter((item): item is { code: string; title: string; reason: string } => item !== null);

  const reportActionsIn = Array.isArray(reportIn?.actions) ? reportIn.actions : [];
  const inspectionReport = reportIn
    ? {
        title: asString(reportIn.title, 'Relatorio Fotografico (Risco Identificado)'),
        inspectionDate: asString(reportIn.inspectionDate, analyzedAt),
        area: asString(reportIn.area, 'Area nao informada'),
        responsible: asString(reportIn.responsible, 'Responsavel nao informado'),
        interdicted: typeof reportIn.interdicted === 'boolean' ? reportIn.interdicted : false,
        severity: asSeverity(reportIn.severity),
        riskDescription: asString(reportIn.riskDescription, inspectorGuidance || 'Sem descricao.'),
        actions: reportActionsIn
          .map((item, index) => {
            const row = (item ?? {}) as Record<string, unknown>;
            const action = asString(row.action);
            if (!action) return null;
            return {
              id: asString(row.id, String(index + 1)),
              action,
              responsible: asString(row.responsible),
              deadline: asString(row.deadline),
              status: asString(row.status),
            };
          })
          .filter(
            (
              item,
            ): item is {
              id: string;
              action: string;
              responsible: string;
              deadline: string;
              status: string;
            } => item !== null,
          ),
      }
    : undefined;

  const overallConfidence = asConfidence(data.overallConfidence);
  const limitations = asStringList(data.limitations);
  const needsInspectorReview =
    typeof data.needsInspectorReview === 'boolean'
      ? data.needsInspectorReview
      : complianceSummary === 'needs_more_context' ||
        sceneType === 'unclear' ||
        overallConfidence === 'low' ||
        risks.some((r) => r.confidence === 'low') ||
        limitations.length > 0;

  return {
    provider: 'openai',
    model: asString(data.model, meta.model),
    analyzedAt,
    risks,
    controls:
      controls.length > 0 || risks.length === 0
        ? controls
        : risks.map((r) => ({
            riskId: r.id,
            measure: 'Avaliar controles aplicaveis com a equipe de SST no local.',
          })),
    nrs,
    ...(sceneType ? { sceneType } : {}),
    ...(complianceSummary ? { complianceSummary } : {}),
    ...(retrievalContext.length > 0 ? { retrievalContext } : {}),
    ...(inspectionReport ? { inspectionReport } : {}),
    ...(overallConfidence ? { overallConfidence } : {}),
    needsInspectorReview,
    ...(inspectorGuidance ? { inspectorGuidance } : {}),
    ...(limitations.length > 0 ? { limitations } : {}),
  };
}
