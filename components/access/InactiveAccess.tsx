import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/contexts/AuthContext';

export function InactiveAccess() {
  const { profile, logOut } = useAuth();

  return (
    <Screen>
      <View className="flex-1 justify-center gap-4">
        <Text className="font-display text-3xl text-ink">Acesso inativo</Text>
        <Text className="font-sans text-base leading-6 text-ink-muted">
          {profile?.name
            ? `${profile.name}, sua conta está inativa e não pode utilizar os módulos do aplicativo no momento.`
            : 'Sua conta está inativa e não pode utilizar os módulos do aplicativo no momento.'}{' '}
          Fale com o administrador da área.
        </Text>
        <Button label="Sair" variant="secondary" onPress={() => logOut()} className="mt-4" />
      </View>
    </Screen>
  );
}
