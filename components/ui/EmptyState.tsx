import { Text, View } from 'react-native';

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View className="items-center rounded-3xl border border-dashed border-line bg-white/70 px-6 py-10">
      <Text className="text-center font-sansSemi text-lg text-ink">{title}</Text>
      <Text className="mt-3 max-w-[280px] text-center font-sans text-sm leading-5 text-ink-muted">
        {description}
      </Text>
    </View>
  );
}
