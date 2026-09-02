import { Text, View } from 'react-native';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View className="gap-1">
      <Text className="font-sansSemi text-lg text-ink">{title}</Text>
      {subtitle ? (
        <Text className="font-sans text-sm leading-5 text-ink-muted">{subtitle}</Text>
      ) : null}
    </View>
  );
}
