export { NR_CATALOG, type NrCatalogItem, type NrStatus } from './catalog';
import { NR_CATALOG, type NrCatalogItem } from './catalog';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeCode(value: string): string {
  const match = value.toUpperCase().match(/NR\s*-?\s*(\d{1,2})/);
  if (!match) return value.toUpperCase().replace(/\s+/g, '');
  return `NR-${Number(match[1])}`;
}

export function getNrByCode(code: string): NrCatalogItem | undefined {
  const normalized = normalizeCode(code);
  return NR_CATALOG.find((item) => item.code === normalized);
}

export function getActiveNrs(): NrCatalogItem[] {
  return NR_CATALOG.filter((item) => item.status === 'vigente');
}

export function searchNrs(query: string): NrCatalogItem[] {
  const term = normalize(query);
  if (!term) return NR_CATALOG;

  const code = getNrByCode(query);
  if (code) return [code];

  return NR_CATALOG.filter((item) => {
    const haystack = normalize(
      [item.code, item.title, item.summary, item.status, ...item.tags].join(' '),
    );
    return haystack.includes(term);
  });
}
