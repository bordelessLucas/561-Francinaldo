export type LibraryDocKind = 'checklist' | 'os' | 'nr' | 'planilha';

export type LibraryDocument = {
  id: string;
  title: string;
  summary: string;
  meta: string;
  tags?: string[];
};

export type LibraryCategoryId = 'checklists' | 'os' | 'nrs' | 'planilhas';

export type LibraryCategory = {
  id: LibraryCategoryId;
  title: string;
  description: string;
  kind: LibraryDocKind;
  documents: LibraryDocument[];
};

/** Catálogo local (Sprint 6A–8) — metadados sem arquivos no Storage. */
export const LIBRARY_CATALOG: LibraryCategory[] = [
  {
    id: 'checklists',
    title: 'Checklists',
    description: 'Conferências rápidas por equipamento e ambiente',
    kind: 'checklist',
    documents: [
      {
        id: 'cl-extintores',
        title: 'Checklist — Extintores',
        summary: 'Inspeção visual, lacre, manômetro e validade.',
        meta: 'Campo · 8 itens',
        tags: ['prevenção', 'incêndio'],
      },
      {
        id: 'cl-escadas',
        title: 'Checklist — Escadas e andaimes',
        summary: 'Estabilidade, acesso e sinalização antes do uso.',
        meta: 'Campo · 12 itens',
        tags: ['altura'],
      },
      {
        id: 'cl-bombas',
        title: 'Checklist — Área de bombas (posto)',
        summary: 'Derrames, EPI, extintores e isolamento da pista.',
        meta: 'Posto · 10 itens',
        tags: ['combustível', 'NR-20'],
      },
      {
        id: 'cl-eletrica',
        title: 'Checklist — Painel elétrico',
        summary: 'Bloqueio, etiquetagem e condições do quadro.',
        meta: 'Industrial · 9 itens',
        tags: ['elétrica'],
      },
    ],
  },
  {
    id: 'os',
    title: 'Ordens de Serviço',
    description: 'Modelos para orientar atividades em campo',
    kind: 'os',
    documents: [
      {
        id: 'os-altura',
        title: 'OS — Trabalho em altura',
        summary: 'Permissão, EPI anticqueda e supervisão.',
        meta: 'Modelo · uso externo',
        tags: ['NR-35'],
      },
      {
        id: 'os-confinado',
        title: 'OS — Espaço confinado',
        summary: 'Atmosfera, vigia e procedimentos de resgate.',
        meta: 'Modelo · uso externo',
        tags: ['NR-33'],
      },
      {
        id: 'os-bomba',
        title: 'OS — Manutenção de bomba',
        summary: 'LOTO, isolamento e teste pós-manutenção.',
        meta: 'Modelo · posto/indústria',
        tags: ['manutenção'],
      },
    ],
  },
  {
    id: 'nrs',
    title: 'Normas Regulamentadoras',
    description: 'Consulta rápida às NRs mais usadas em campo',
    kind: 'nr',
    documents: [
      {
        id: 'nr-01',
        title: 'NR-01 — Disposições gerais e GRO',
        summary: 'Gerenciamento de riscos ocupacionais e PGR.',
        meta: 'Consulta',
        tags: ['GRO', 'PGR'],
      },
      {
        id: 'nr-06',
        title: 'NR-06 — EPI',
        summary: 'Fornecimento, treinamento e fiscalização do uso.',
        meta: 'Consulta',
        tags: ['EPI'],
      },
      {
        id: 'nr-12',
        title: 'NR-12 — Máquinas e equipamentos',
        summary: 'Proteções e dispositivos de segurança.',
        meta: 'Consulta',
        tags: ['máquinas'],
      },
      {
        id: 'nr-20',
        title: 'NR-20 — Inflamáveis e combustíveis',
        summary: 'Controles em áreas com risco de inflamáveis.',
        meta: 'Consulta',
        tags: ['postos'],
      },
      {
        id: 'nr-35',
        title: 'NR-35 — Trabalho em altura',
        summary: 'Planejamento e proteção contra quedas.',
        meta: 'Consulta',
        tags: ['altura'],
      },
    ],
  },
  {
    id: 'planilhas',
    title: 'Planilhas SST',
    description: 'Controles e registros da rotina de segurança',
    kind: 'planilha',
    documents: [
      {
        id: 'pl-epi',
        title: 'Controle de entrega de EPI',
        summary: 'Registro de entrega e devolução por colaborador.',
        meta: 'Planilha · modelo',
      },
      {
        id: 'pl-riscos',
        title: 'Inventário de riscos — modelo',
        summary: 'Base para alimentar o PGR.',
        meta: 'Planilha · modelo',
      },
      {
        id: 'pl-inspecoes',
        title: 'Registro de inspeções mensais',
        summary: 'Acompanhamento de inspeções periódicas.',
        meta: 'Planilha · modelo',
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
