import { Pressable, Text, View } from 'react-native';

type HomeActionCardProps = {
  title: string;
  description: string;
  onPress: () => void;
  emphasized?: boolean;
};

export function HomeActionCard({
  title,
  description,
  onPress,
  emphasized = false,
}: HomeActionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`rounded-3xl px-5 py-5 active:opacity-90 ${
        emphasized ? 'bg-ink' : 'border border-line bg-white'
      }`}
    >
      <Text className={`font-sansSemi text-lg ${emphasized ? 'text-white' : 'text-ink'}`}>
        {title}
      </Text>
      <Text
        className={`mt-2 font-sans text-sm leading-5 ${
          emphasized ? 'text-white/75' : 'text-ink-muted'
        }`}
      >
        {description}
      </Text>
      {emphasized ? (
        <View className="mt-4 self-start rounded-full bg-brand px-4 py-2">
          <Text className="font-sansSemi text-sm text-white">Começar</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
