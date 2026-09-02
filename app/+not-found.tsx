import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Não encontrado', headerShown: true }} />
      <View className="flex-1 items-center justify-center bg-canvas px-6">
        <Text className="font-display text-2xl text-ink">Tela não encontrada</Text>
        <Link href="/" className="mt-4 font-sansSemi text-brand-dark">
          Voltar ao início
        </Link>
      </View>
    </>
  );
}
