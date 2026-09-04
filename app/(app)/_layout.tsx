import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { Text, View } from 'react-native';

import { InactiveAccess } from '@/components/access/InactiveAccess';
import { ProfileIssue } from '@/components/access/ProfileIssue';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/src/components';

function TabIcon({
  name,
  focused,
  emphasized = false,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  emphasized?: boolean;
}) {
  const color = focused ? colors.brandDark : emphasized ? colors.brand : colors.inkMuted;
  return <Ionicons name={name} size={emphasized ? 24 : 22} color={color} />;
}

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
    <Text
      className={`mt-0.5 font-sansMedium text-xs ${
        focused ? 'text-brand-dark' : emphasized ? 'text-brand' : 'text-ink-muted'
      }`}
    >
      {label}
    </Text>
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
      <ProfileIssue message={profileError ?? 'Não encontramos seu perfil no sistema.'} />
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
          height: 72,
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
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home-outline" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Análise',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="camera-outline" focused={focused} emphasized />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Análise" focused={focused} emphasized />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Biblioteca',
          tabBarIcon: ({ focused }) => <TabIcon name="folder-outline" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Biblioteca" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ focused }) => <TabIcon name="time-outline" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Histórico" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon name="person-outline" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Perfil" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          href: null,
          title: 'Planos',
        }}
      />
    </Tabs>
  );
}
