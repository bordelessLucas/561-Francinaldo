import type { AnalysisResult } from '@/lib/types';

/** Resultado de análise assistida — cenário típico de área industrial / posto. */
export function buildMockAnalysisResult(): AnalysisResult {
  return {
    provider: 'mock',
    model: 'alpha-sst-assistida-v1',
    analyzedAt: new Date().toISOString(),
    risks: [
      {
        id: 'risk-1',
        title: 'Queda de mesmo nível',
        description:
          'Piso molhado próximo à área de abastecimento/circulação, com risco de escorregão e queda.',
        severity: 'medium',
      },
      {
        id: 'risk-2',
        title: 'Contato com partes móveis',
        description:
          'Equipamento com transmissão ou peças móveis sem proteção completa visível na cena.',
        severity: 'high',
      },
      {
        id: 'risk-3',
        title: 'EPI incompleto',
        description:
          'Atividade em andamento sem evidência clara de capacete, óculos ou luvas adequados.',
        severity: 'medium',
      },
    ],
    controls: [
      {
        riskId: 'risk-1',
        measure:
          'Sinalizar o trecho, conter o derrame e liberar a circulação somente após limpeza e secagem.',
      },
      {
        riskId: 'risk-2',
        measure:
          'Interromper o uso até instalar/repor as proteções; aplicar bloqueio/etiquetagem se necessário.',
      },
      {
        riskId: 'risk-3',
        measure:
          'Disponibilizar o EPI da atividade, orientar o uso e registrar a conferência no checklist.',
      },
    ],
    nrs: [
      {
        code: 'NR-06',
        title: 'Equipamento de Proteção Individual',
        relevance: 'Define fornecimento, treinamento e fiscalização do uso de EPI.',
      },
      {
        code: 'NR-12',
        title: 'Segurança em Máquinas e Equipamentos',
        relevance: 'Exige proteções e dispositivos que impeçam o contato com partes móveis.',
      },
      {
        code: 'NR-20',
        title: 'Segurança e Saúde com Inflamáveis e Combustíveis',
        relevance: 'Orienta controles em áreas com risco de inflamáveis, comum em postos e tanques.',
      },
    ],
  };
}
