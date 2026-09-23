import { NR_CATALOG } from '../../../src/data/nrs/catalog';

export type NrKnowledgeItem = {
  code: string;
  title: string;
  summary: string;
  status: 'vigente' | 'revogada';
  keywords: string[];
};

export const NR_KNOWLEDGE: NrKnowledgeItem[] = NR_CATALOG.map((nr) => ({
  code: nr.code,
  title: nr.title,
  summary: nr.summary,
  status: nr.status,
  keywords: nr.tags,
}));

