import type { AnalysisResult, RiskSeverity } from '@/lib/types';

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function asSeverity(value: unknown): RiskSeverity {
  if (value === 'low' || value === 'medium' || value === 'high') return value;
  return 'medium';
}

export function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      return JSON.parse(fenced[1].trim());
    }
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error('AI_INVALID_JSON');
  }
}

/** Normaliza payload da Vision / Function para AnalysisResult. */
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

  if (risksIn.length === 0) {
    throw new Error('AI_EMPTY_RISKS');
  }

  const risks = risksIn.map((item, index) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      id: asString(row.id, `risk-${index + 1}`),
      title: asString(row.title, `Risco ${index + 1}`),
      description: asString(row.description, 'Descrição não informada.'),
      severity: asSeverity(row.severity),
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

  const analyzedAt =
    asString(data.analyzedAt) || new Date().toISOString();

  return {
    provider: 'openai',
    model: asString(data.model, meta.model),
    analyzedAt,
    risks,
    controls:
      controls.length > 0
        ? controls
        : risks.map((r) => ({
            riskId: r.id,
            measure: 'Avaliar controles aplicáveis com a equipe de SST no local.',
          })),
    nrs,
  };
}
