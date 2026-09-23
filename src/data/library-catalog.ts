import { NR_CATALOG } from '@/src/data/nrs';

export type LibraryDocKind = 'checklist' | 'os' | 'nr' | 'planilha';

export type LibraryDocument = {
  id: string;
  title: string;
  summary: string;
  meta: string;
  tags?: string[];
  officialUrl?: string;
};

export type LibraryCategoryId = 'checklists' | 'os' | 'nrs' | 'planilhas';

export type LibraryCategory = {
  id: LibraryCategoryId;
  title: string;
  description: string;
  kind: LibraryDocKind;
  documents: LibraryDocument[];
};

/** Catalogo local (Sprint 6A-8) - metadados sem arquivos no Storage. */
export const LIBRARY_CATALOG: LibraryCategory[] = [
  {
    id: 'checklists',
    title: 'Checklists',
    description: 'Conferencias rapidas por equipamento e ambiente',
    kind: 'checklist',
    documents: [
      {
        id: 'cl-extintores',
        title: 'Checklist - Extintores',
        summary: 'Inspecao visual, lacre, manometro e validade.',
        meta: 'Campo - 8 itens',
        tags: ['prevencao', 'incendio'],
      },
      {
        id: 'cl-escadas',
        title: 'Checklist - Escadas e andaimes',
        summary: 'Estabilidade, acesso e sinalizacao antes do uso.',
        meta: 'Campo - 12 itens',
        tags: ['altura'],
      },
      {
        id: 'cl-bombas',
        title: 'Checklist - Area de bombas (posto)',
        summary: 'Derrames, EPI, extintores e isolamento da pista.',
        meta: 'Posto - 10 itens',
        tags: ['combustivel', 'NR-20'],
      },
      {
        id: 'cl-eletrica',
        title: 'Checklist - Painel eletrico',
        summary: 'Bloqueio, etiquetagem e condicoes do quadro.',
        meta: 'Industrial - 9 itens',
        tags: ['eletrica'],
      },
    ],
  },
  {
    id: 'os',
    title: 'Ordens de Servico',
    description: 'Modelos para orientar atividades em campo',
    kind: 'os',
    documents: [
      {
        id: 'os-altura',
        title: 'OS - Trabalho em altura',
        summary: 'Permissao, EPI antiquedas e supervisao.',
        meta: 'Modelo - uso externo',
        tags: ['NR-35'],
      },
      {
        id: 'os-confinado',
        title: 'OS - Espaco confinado',
        summary: 'Atmosfera, vigia e procedimentos de resgate.',
        meta: 'Modelo - uso externo',
        tags: ['NR-33'],
      },
      {
        id: 'os-bomba',
        title: 'OS - Manutencao de bomba',
        summary: 'LOTO, isolamento e teste pos-manutencao.',
        meta: 'Modelo - posto/industria',
        tags: ['manutencao'],
      },
    ],
  },
  {
    id: 'nrs',
    title: 'Normas Regulamentadoras',
    description: 'Consulta rapida as NRs disponiveis na fonte oficial',
    kind: 'nr',
    documents: NR_CATALOG.map((nr) => ({
      id: nr.code.toLowerCase(),
      title: `${nr.code} - ${nr.title}`,
      summary: nr.summary,
      meta: nr.status === 'revogada' ? 'Consulta - revogada' : 'Consulta',
      tags: nr.tags,
      officialUrl: nr.officialUrl,
    })),
  },
  {
    id: 'planilhas',
    title: 'Planilhas SST',
    description: 'Controles e registros da rotina de seguranca',
    kind: 'planilha',
    documents: [
      {
        id: 'pl-epi',
        title: 'Controle de entrega de EPI',
        summary: 'Registro de entrega e devolucao por colaborador.',
        meta: 'Planilha - modelo',
      },
      {
        id: 'pl-riscos',
        title: 'Inventario de riscos - modelo',
        summary: 'Base para alimentar o PGR.',
        meta: 'Planilha - modelo',
      },
      {
        id: 'pl-inspecoes',
        title: 'Registro de inspecoes mensais',
        summary: 'Acompanhamento de inspecoes periodicas.',
        meta: 'Planilha - modelo',
      },
    ],
  },
];

export function getLibraryCategory(id: string): LibraryCategory | undefined {
  return LIBRARY_CATALOG.find((c) => c.id === id);
}

export function getLibraryDocument(
  categoryId: string,
  docId: string,
): { category: LibraryCategory; document: LibraryDocument } | undefined {
  const category = getLibraryCategory(categoryId);
  if (!category) return undefined;
  const document = category.documents.find((d) => d.id === docId);
  if (!document) return undefined;
  return { category, document };
}
