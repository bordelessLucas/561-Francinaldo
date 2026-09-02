import { Redirect, Tabs } from 'expo-router';
import { Text, View } from 'react-native';

import { InactiveAccess } from '@/components/access/InactiveAccess';
import { ProfileIssue } from '@/components/access/ProfileIssue';
import { LoadingState } from '@/components/ui/LoadingState';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

function TabLabel({
  label,
  focused,
  emphasized = false,
}: {
  label: string;
  focused: boolean;
  emphasized?: boolean;
}) {
  return (
    <View className="items-center">
      {emphasized ? (
        <View
          className={`mb-1 h-1.5 w-1.5 rounded-full ${focused ? 'bg-brand' : 'bg-brand/40'}`}
        />
      ) : null}
      <Text
        className={`font-sansMedium text-xs ${
          focused ? 'text-brand-dark' : emphasized ? 'text-brand' : 'text-ink-muted'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function AppLayout() {
  const { user, profile, loading, profileError } = useAuth();

  if (loading) {
    return <LoadingState message="Carregando sua sessão..." />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (profileError || !profile) {
    return (
      <ProfileIssue
        message={profileError ?? 'Não encontramos seu perfil no sistema.'}
      />
    );
  }

  if (profile.status === 'inactive') {
    return <InactiveAccess />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.line,
          height: 68,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: colors.brandDark,
        tabBarInactiveTintColor: colors.inkMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarLabel: ({ focused }) => <TabLabel label="Início" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Nova Análise',
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Análise" focused={focused} emphasized />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarLabel: ({ focused }) => <TabLabel label="Histórico" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarLabel: ({ focused }) => <TabLabel label="Perfil" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
