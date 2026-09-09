import Constants from 'expo-constants';
import { Pressable, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  useAppTheme,
  type ThemePreference,
} from '@/contexts/ThemeContext';
import { brand } from '@/constants/theme';
import {
  BackLink,
  Body,
  Caption,
  Container,
  Heading,
  Label,
  Surface,
} from '@/src/components';

const THEME_OPTIONS: {
  value: ThemePreference;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: 'system',
    title: 'Sistema',
    description: 'Segue o claro/escuro do aparelho',
    icon: 'phone-portrait-outline',
  },
  {
    value: 'light',
    title: 'Claro',
    description: 'Melhor para uso sob luz do dia',
    icon: 'sunny-outline',
  },
  {
    value: 'dark',
    title: 'Escuro',
    description: 'Reduz brilho em ambientes com pouca luz',
    icon: 'moon-outline',
  },
];

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  trailing,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: string;
}) {
  const { colors } = useAppTheme();
  const content = (
    <View className="flex-row items-center gap-3 px-5 py-4">
      <View
        className="h-10 w-10 items-center justify-center rounded-2xl"
        style={{ backgroundColor: colors.brandMist }}
      >
        <Ionicons name={icon} size={20} color={colors.brandDark} />
      </View>
      <View className="flex-1">
        <Label>{title}</Label>
        {subtitle ? <Caption className="mt-1">{subtitle}</Caption> : null}
      </View>
      {trailing ? (
        <Caption style={{ color: colors.brandDark }}>{trailing}</Caption>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
      ) : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({
      backgroundColor: pressed ? colors.canvas : 'transparent',
    })}>
      {content}
    </Pressable>
  );
}

/**
 * Configurações — tema e atalhos de preferências do app.
 */
export function SettingsScreen() {
  const { preference, setPreference, scheme, colors } = useAppTheme();
  const appVersion =
    Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0';

  return (
    <Container scroll>
      <BackLink className="mb-4" fallbackHref={'/(app)/profile' as Href} />

      <View className="mb-6 gap-2">
        <Heading>Configurações</Heading>
        <Body>Aparência, avisos e informações do aplicativo.</Body>
      </View>

      <Label className="mb-3">Aparência</Label>
      <Surface className="mb-6" padding={false}>
        {THEME_OPTIONS.map((option, index) => {
          const selected = preference === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setPreference(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              className="flex-row items-center gap-3 px-5 py-4"
              style={{
                borderTopWidth: index > 0 ? 1 : 0,
                borderTopColor: colors.line,
              }}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: selected ? colors.brand : colors.brandMist }}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={selected ? colors.white : colors.brandDark}
                />
              </View>
              <View className="flex-1">
                <Label>{option.title}</Label>
                <Caption className="mt-1">{option.description}</Caption>
              </View>
              <Ionicons
                name={selected ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={selected ? colors.brand : colors.inkMuted}
              />
            </Pressable>
          );
        })}
      </Surface>

      <Caption className="mb-6">
        Tema em uso agora: {scheme === 'dark' ? 'escuro' : 'claro'}
        {preference === 'system' ? ' (pelo sistema)' : ''}.
      </Caption>

      <Label className="mb-3">Preferências</Label>
      <Surface className="mb-6" padding={false}>
        <SettingsRow
          icon="notifications-outline"
          title="Avisos de NRs"
          subtitle="Permissão e cadastro deste aparelho"
          onPress={() => router.push('/(app)/nr-alerts' as Href)}
        />
        <View className="h-px" style={{ backgroundColor: colors.line }} />
        <SettingsRow
          icon="diamond-outline"
          title="Planos"
          subtitle="Free, Premium e o que muda em cada um"
          onPress={() => router.push('/(app)/plans' as Href)}
        />
      </Surface>

      <Label className="mb-3">Sobre</Label>
      <Surface padding={false}>
        <SettingsRow
          icon="shield-checkmark-outline"
          title={brand.name}
          subtitle={brand.tagline}
          trailing={`v${appVersion}`}
        />
      </Surface>
    </Container>
  );
}
