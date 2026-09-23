import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InactiveAccess } from '@/components/access/InactiveAccess';
import { ProfileIssue } from '@/components/access/ProfileIssue';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/src/components';

function TabIcon({
  name,
  focused,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
}) {
  return (
    <View className="items-center pt-1">
      <Ionicons name={name} size={22} color={color} />
      {focused ? (
        <View
          style={{
            marginTop: 4,
            height: 3,
            width: 16,
            borderRadius: 999,
            backgroundColor: color,
          }}
        />
      ) : (
        <View style={{ marginTop: 4, height: 3, width: 16 }} />
      )}
    </View>
  );
}

function TabLabel({ label, focused, color }: { label: string; focused: boolean; color: string }) {
  return (
    <Text
      style={{ color, marginTop: 2 }}
      className={`font-sansMedium text-[11px] ${focused ? '' : ''}`}
    >
      {label}
    </Text>
  );
}

function AnalysisTabIcon({ focused, brand, brandDark }: { focused: boolean; brand: string; brandDark: string }) {
  return (
    <View
      style={{
        marginTop: -22,
        height: 58,
        width: 58,
        borderRadius: 29,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? brandDark : brand,
        borderWidth: 4,
        borderColor: focused ? brand : brandDark,
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
      }}
    >
      <Ionicons name="camera" size={26} color="#FFFFFF" />
    </View>
  );
}

export default function AppLayout() {
  const { user, profile, loading, profileError } = useAuth();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/(auth)/login');
    }
  }, [loading, user]);

  if (loading) {
    return <LoadingState message="Carregando sua sessão..." />;
  }

  if (!user) {
    return <LoadingState message="Redirecionando..." />;
  }

  if (profileError || !profile) {
    return (
      <ProfileIssue message={profileError ?? 'Não encontramos seu perfil no sistema.'} />
    );
  }

  if (profile.status === 'inactive') {
    return <InactiveAccess />;
  }

  const active = colors.brand;
  const inactive = colors.tabInactive;
  // Extra margem além do inset: Samsung/nav clássica às vezes colide com a tab bar.
  const tabBarBottomPad = Math.max(insets.bottom, 12) + 10;
  const tabBarHeight = 64 + tabBarBottomPad;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingTop: 6,
          paddingBottom: tabBarBottomPad,
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'home' : 'home-outline'}
              focused={focused}
              color={String(color)}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <TabLabel label="Início" focused={focused} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Biblioteca',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'folder' : 'folder-outline'}
              focused={focused}
              color={String(color)}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <TabLabel label="Biblioteca" focused={focused} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Análise',
          tabBarIcon: ({ focused }) => (
            <AnalysisTabIcon focused={focused} brand={colors.brand} brandDark={colors.brandDark} />
          ),
          tabBarLabel: ({ focused, color }) => (
            <TabLabel
              label="Análise"
              focused={focused}
              color={focused ? String(color) : inactive}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'time' : 'time-outline'}
              focused={focused}
              color={String(color)}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <TabLabel label="Histórico" focused={focused} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'person' : 'person-outline'}
              focused={focused}
              color={String(color)}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <TabLabel label="Perfil" focused={focused} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          href: null,
          title: 'Planos',
        }}
      />
      <Tabs.Screen
        name="nr-alerts"
        options={{
          href: null,
          title: 'Avisos de NRs',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          title: 'Configurações',
        }}
      />
    </Tabs>
  );
}
