import { NR_KNOWLEDGE, type NrKnowledgeItem } from './nr-knowledge';

export type RetrievedNrContext = {
  code: string;
  title: string;
  reason: string;
};

type RetrieveNrContextInput = {
  inspectorNote?: string;
  maxItems?: number;
};

const DEFAULT_CODES = ['NR-1', 'NR-6', 'NR-9', 'NR-12', 'NR-17', 'NR-23'];

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function scoreItem(item: NrKnowledgeItem, input: string): number {
  const normalized = normalize(input);
  let score = 0;

  const codePattern = new RegExp(`\\b${item.code.replace('-', '\\s*-?\\s*')}\\b`, 'i');
  if (codePattern.test(input)) score += 50;

  for (const keyword of item.keywords) {
    const key = normalize(keyword);
    if (key && normalized.includes(key)) score += 8;
  }

  const titleWords = normalize(item.title)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 5);
  for (const word of titleWords) {
    if (normalized.includes(word)) score += 2;
  }

  return score;
}

function toContext(item: NrKnowledgeItem, reason: string): RetrievedNrContext {
  return {
    code: item.code,
    title: item.title,
    reason,
  };
}

export function retrieveNrContext({
  inspectorNote,
  maxItems = 8,
}: RetrieveNrContextInput): RetrievedNrContext[] {
  const note = inspectorNote?.trim() ?? '';
  const ranked = NR_KNOWLEDGE.map((item) => ({
    item,
    score: scoreItem(item, note),
  }))
    .filter(({ item, score }) => item.status === 'vigente' && score > 0)
    .sort((a, b) => b.score - a.score || a.item.code.localeCompare(b.item.code))
    .map(({ item, score }) =>
      toContext(item, `Selecionada por correspondencia com contexto do inspetor (score ${score}).`),
    );

  const selected = ranked.slice(0, maxItems);
  if (selected.length >= Math.min(3, maxItems)) return selected;

  for (const code of DEFAULT_CODES) {
    if (selected.length >= maxItems) break;
    if (selected.some((item) => item.code === code)) continue;
    const item = NR_KNOWLEDGE.find((candidate) => candidate.code === code);
    if (!item || item.status !== 'vigente') continue;
    selected.push(toContext(item, 'Contexto SST geral para reduzir resposta sem base normativa.'));
  }

  return selected;
}

export function formatNrContextForPrompt(context: RetrievedNrContext[]): string {
  if (context.length === 0) return '';
  return context
    .map((item) => `- ${item.code}: ${item.title}. Motivo: ${item.reason}`)
    .join('\n');
}
