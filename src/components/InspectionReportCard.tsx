import { View } from 'react-native';

import { useAppTheme } from '@/contexts/ThemeContext';
import type { InspectionReport } from '@/lib/types';
import { Body, Caption, Label, Surface } from '@/src/components';

const SEVERITY_LABEL: Record<InspectionReport['severity'], string> = {
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
};

type InspectionReportCardProps = {
  report: InspectionReport;
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR');
}

export function InspectionReportCard({ report }: InspectionReportCardProps) {
  const { colors } = useAppTheme();

  return (
    <Surface>
      <Caption className="font-sansSemi uppercase" style={{ color: colors.brandDark }}>
        Relatório fotográfico
      </Caption>
      <Label className="mt-2">{report.title}</Label>

      <View className="mt-4 gap-2 rounded-2xl border p-3" style={{ borderColor: colors.line }}>
        <Caption>Data: {formatDate(report.inspectionDate)}</Caption>
        <Caption>Área: {report.area}</Caption>
        <Caption>Responsável: {report.responsible}</Caption>
        <Caption>Posto interditado: {report.interdicted ? 'SIM' : 'NÃO'}</Caption>
        <Caption>Classificação: {SEVERITY_LABEL[report.severity]}</Caption>
      </View>

      <View className="mt-4 gap-2">
        <Label>Descrição do risco identificado</Label>
        <Body>{report.riskDescription}</Body>
      </View>

      <View className="mt-4 gap-3">
        <Label>Ações recomendadas</Label>
        {report.actions.length > 0 ? (
          report.actions.map((item) => (
            <View key={item.id} className="gap-1 rounded-2xl p-3" style={{ backgroundColor: colors.canvasElev }}>
              <Caption className="font-sansSemi">
                {item.id}. {item.action}
              </Caption>
              <Caption>
                {item.responsible || 'Responsável não informado'}
                {item.deadline ? ` · ${item.deadline}` : ''}
                {item.status ? ` · ${item.status}` : ''}
              </Caption>
            </View>
          ))
        ) : (
          <Caption>Nenhuma ação foi gerada para este relatório.</Caption>
        )}
      </View>
    </Surface>
  );
}

