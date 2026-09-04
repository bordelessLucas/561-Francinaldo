export type LibraryDocument = {
  id: string;
  title: string;
  meta: string;
};

export type LibraryCategory = {
  id: string;
  title: string;
  description: string;
  documents: LibraryDocument[];
};

/** Catálogo de exemplo para validação da Biblioteca com o cliente. */
export const LIBRARY_CATEGORIES: LibraryCategory[] = [
  {
    id: 'checklists',
    title: 'Checklists',
    description: 'Conferências rápidas por equipamento e ambiente',
    documents: [
      { id: 'c1', title: 'Checklist — Extintores', meta: 'PDF · 2 páginas' },
      { id: 'c2', title: 'Checklist — Escadas e andaimes', meta: 'PDF · 3 páginas' },
      { id: 'c3', title: 'Checklist — Área de bombas (posto)', meta: 'PDF · 4 páginas' },
    ],
  },
  {
    id: 'os',
    title: 'Ordens de Serviço',
    description: 'Modelos para orientar atividades em campo',
    documents: [
      { id: 'o1', title: 'OS — Trabalho em altura', meta: 'DOCX · modelo' },
      { id: 'o2', title: 'OS — Espaço confinado', meta: 'DOCX · modelo' },
      { id: 'o3', title: 'OS — Manutenção de bomba', meta: 'DOCX · modelo' },
    ],
  },
  {
    id: 'nrs',
    title: 'NRs',
    description: 'Consulta rápida às normas mais usadas',
    documents: [
      { id: 'n1', title: 'NR-01 — Disposições gerais e GRO', meta: 'PDF' },
      { id: 'n2', title: 'NR-06 — EPI', meta: 'PDF' },
      { id: 'n3', title: 'NR-12 — Máquinas e equipamentos', meta: 'PDF' },
      { id: 'n4', title: 'NR-20 — Inflamáveis e combustíveis', meta: 'PDF' },
    ],
  },
  {
    id: 'planilhas',
    title: 'Planilhas SST',
    description: 'Controles e registros da rotina de segurança',
    documents: [
      { id: 'p1', title: 'Controle de entrega de EPI', meta: 'XLSX' },
      { id: 'p2', title: 'Inventário de riscos — modelo', meta: 'XLSX' },
      { id: 'p3', title: 'Registro de inspeções mensais', meta: 'XLSX' },
    ],
  },
];
