import { View } from 'react-native';

import { useAppTheme } from '@/contexts/ThemeContext';
import type { AnalysisRisk, RiskSeverity } from '@/lib/types';
import { Caption, Label } from '@/src/components';

type RiskLevelMeterProps = {
  risks: AnalysisRisk[];
  fallbackSeverity?: RiskSeverity;
};

const LEVELS = [
  { label: 'Baixo', color: '#2ECC71' },
  { label: 'Médio', color: '#F1C40F' },
  { label: 'Alto', color: '#E67E22' },
  { label: 'Muito alto', color: '#E74C3C' },
];

function severityScore(severity?: RiskSeverity): number {
  if (severity === 'high') return 2;
  if (severity === 'medium') return 1;
  return 0;
}

function getLevelIndex(risks: AnalysisRisk[], fallbackSeverity?: RiskSeverity): number {
  if (risks.length === 0) return 0;
  const highest = Math.max(...risks.map((risk) => severityScore(risk.severity)));
  const highCount = risks.filter((risk) => risk.severity === 'high').length;
  if (highest === 2 && highCount >= 2) return 3;
  return highest;
}

export function RiskLevelMeter({ risks, fallbackSeverity }: RiskLevelMeterProps) {
  const { colors } = useAppTheme();
  const levelIndex = risks.length > 0 ? getLevelIndex(risks) : severityScore(fallbackSeverity);
  const active = LEVELS[levelIndex];

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Label>Nível de risco</Label>
        <Caption className="font-sansSemi" style={{ color: active.color }}>
          {active.label}
        </Caption>
      </View>
      <View className="flex-row gap-1">
        {LEVELS.map((level, index) => (
          <View key={level.label} className="flex-1 gap-2">
            <View
              style={{
                height: 10,
                borderRadius: 999,
                backgroundColor: level.color,
                opacity: index <= levelIndex ? 1 : 0.28,
              }}
            />
            <Caption
              className="text-center text-[10px]"
              style={{ color: index === levelIndex ? level.color : colors.inkMuted }}
            >
              {level.label}
            </Caption>
          </View>
        ))}
      </View>
    </View>
  );
}

