import Constants from 'expo-constants';
import { Pressable, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  useAppTheme,
  type ThemePreference,
} from '@/contexts/ThemeContext';
import { brand } from '@/constants/theme';
import { Body, Caption, Container, Heading, Label } from '@/src/components';

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
      <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brand-mist dark:bg-brand-mist-dark">
        <Ionicons name={icon} size={20} color={colors.brandDark} />
      </View>
      <View className="flex-1">
        <Label>{title}</Label>
        {subtitle ? <Caption className="mt-1">{subtitle}</Caption> : null}
      </View>
      {trailing ? (
        <Caption className="text-brand-dark dark:text-brand-accent">{trailing}</Caption>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
      ) : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="active:bg-canvas dark:active:bg-canvas-dark"
    >
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
      <Pressable onPress={() => router.back()} className="mb-4 self-start py-1">
        <Caption className="font-sansSemi text-brand-dark dark:text-brand-accent">Voltar</Caption>
      </Pressable>

      <View className="mb-6 gap-2">
        <Heading>Configurações</Heading>
        <Body>Aparência, avisos e informações do aplicativo.</Body>
      </View>

      <Label className="mb-3">Aparência</Label>
      <View className="mb-6 overflow-hidden rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
        {THEME_OPTIONS.map((option, index) => {
          const selected = preference === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setPreference(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              className={`flex-row items-center gap-3 px-5 py-4 active:bg-canvas dark:active:bg-canvas-dark ${
                index > 0 ? 'border-t border-line dark:border-line-dark' : ''
              }`}
            >
              <View
                className={`h-10 w-10 items-center justify-center rounded-2xl ${
                  selected
                    ? 'bg-brand'
                    : 'bg-brand-mist dark:bg-brand-mist-dark'
                }`}
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
      </View>

      <Caption className="mb-6">
        Tema em uso agora: {scheme === 'dark' ? 'escuro' : 'claro'}
        {preference === 'system' ? ' (pelo sistema)' : ''}.
      </Caption>

      <Label className="mb-3">Preferências</Label>
      <View className="mb-6 overflow-hidden rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
        <SettingsRow
          icon="notifications-outline"
          title="Avisos de NRs"
          subtitle="Permissão e cadastro deste aparelho"
          onPress={() => router.push('/(app)/nr-alerts' as Href)}
        />
        <View className="h-px bg-line dark:bg-line-dark" />
        <SettingsRow
          icon="diamond-outline"
          title="Planos"
          subtitle="Free, Premium e o que muda em cada um"
          onPress={() => router.push('/(app)/plans' as Href)}
        />
      </View>

      <Label className="mb-3">Sobre</Label>
      <View className="overflow-hidden rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
        <SettingsRow
          icon="shield-checkmark-outline"
          title={brand.name}
          subtitle={brand.tagline}
          trailing={`v${appVersion}`}
        />
      </View>
    </Container>
  );
}
