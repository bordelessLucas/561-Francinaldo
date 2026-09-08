import { Text, View } from 'react-native';

type PlanTagProps = {
  plan: 'free' | 'premium' | 'admin';
};

const STYLES = {
  free: {
    label: 'Free',
    box: 'bg-canvas border border-line dark:bg-canvas-dark dark:border-line-dark',
    text: 'text-ink-muted dark:text-ink-muted-inverse',
  },
  premium: {
    label: 'Premium',
    box: 'bg-brand-mist dark:bg-brand-mist-dark',
    text: 'text-brand-dark dark:text-brand-accent',
  },
  admin: {
    label: 'Admin',
    box: 'bg-ink dark:bg-brand-black',
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
