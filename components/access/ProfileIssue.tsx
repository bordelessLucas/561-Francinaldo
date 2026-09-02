import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/contexts/AuthContext';

type ProfileIssueProps = {
  message: string;
};

export function ProfileIssue({ message }: ProfileIssueProps) {
  const { refreshProfile, logOut } = useAuth();

  return (
    <Screen>
      <View className="flex-1 justify-center gap-4">
        <Text className="font-display text-3xl text-ink">Perfil indisponível</Text>
        <Text className="font-sans text-base leading-6 text-ink-muted">{message}</Text>
        <View className="mt-4 gap-3">
          <Button label="Tentar novamente" onPress={() => refreshProfile()} />
          <Button label="Sair" variant="secondary" onPress={() => logOut()} />
        </View>
      </View>
    </Screen>
  );
}
