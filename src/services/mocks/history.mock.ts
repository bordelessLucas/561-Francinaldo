export type HistoryMockItem = {
  id: string;
  title: string;
  place: string;
  sector: string;
  dateLabel: string;
  statusLabel: string;
  riskCount: number;
};

/** Exemplos de histórico para validação de UX com o cliente (até a lista real). */
export const HISTORY_MOCK_ITEMS: HistoryMockItem[] = [
  {
    id: 'ex-1',
    title: 'Pista de abastecimento',
    place: 'Posto Horizonte',
    sector: 'Área de bombas',
    dateLabel: 'Hoje, 09:14',
    statusLabel: 'Concluída',
    riskCount: 3,
  },
  {
    id: 'ex-2',
    title: 'Oficina de manutenção',
    place: 'Unidade Industrial Norte',
    sector: 'Manutenção mecânica',
    dateLabel: 'Ontem, 16:40',
    statusLabel: 'Concluída',
    riskCount: 2,
  },
  {
    id: 'ex-3',
    title: 'Depósito de embalagens',
    place: 'Centro de distribuição',
    sector: 'Armazém',
    dateLabel: '02 set, 11:05',
    statusLabel: 'Concluída',
    riskCount: 4,
  },
];
