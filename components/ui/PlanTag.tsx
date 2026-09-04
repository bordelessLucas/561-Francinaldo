import { Text, View } from 'react-native';

type PlanTagProps = {
  plan: 'free' | 'premium' | 'admin';
};

const STYLES = {
  free: {
    label: 'Free',
    box: 'bg-canvas border border-line',
    text: 'text-ink-muted',
  },
  premium: {
    label: 'Premium',
    box: 'bg-brand-mist',
    text: 'text-brand-dark',
  },
  admin: {
    label: 'Admin',
    box: 'bg-ink',
    text: 'text-white',
  },
} as const;

/** Tag de plano — única diferença visual Free vs Premium nas telas comuns. */
export function PlanTag({ plan }: PlanTagProps) {
  const style = STYLES[plan];
  return (
    <View className={`self-start rounded-full px-3 py-1.5 ${style.box}`}>
      <Text className={`font-sansSemi text-xs ${style.text}`}>{style.label}</Text>
    </View>
  );
}
