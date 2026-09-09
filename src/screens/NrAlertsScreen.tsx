import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, type Href } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import {
  BackLink,
  Body,
  Button,
  Caption,
  Container,
  Heading,
  Label,
  Surface,
} from '@/src/components';
import {
  getNrPushPermissionStatus,
  registerForNrPush,
} from '@/src/services/notifications.service';

/**
 * Sprint 9 — permissão e cadastro para avisos de atualização de NRs.
 */
export function NrAlertsScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [status, setStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const next = await getNrPushPermissionStatus();
    setStatus(next);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  async function handleEnable() {
    if (!user) {
      setError('Faça login para ativar os avisos.');
      return;
    }
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const result = await registerForNrPush(user.uid);
      await refresh();
      if (result.granted) {
        setInfo(result.message ?? 'Avisos ativados.');
      } else {
        setError(result.message ?? 'Não foi possível ativar os avisos.');
      }
    } catch {
      setError('Falha ao registrar o dispositivo. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  const statusLabel =
    status === 'granted' ? 'Ativado' : status === 'denied' ? 'Negado' : 'Não configurado';

  return (
    <Container scroll>
      <BackLink className="mb-4" fallbackHref={'/(app)/settings' as Href} />

      <View className="mb-6 gap-2">
        <Heading>Avisos de NRs</Heading>
        <Body>
          Receba notificações quando uma Norma Regulamentadora for atualizada. O escopo do piloto
          é limitado a atualizações de NRs.
        </Body>
      </View>

      <Surface className="mb-4">
        <Caption>Status</Caption>
        <Label className="mt-2">{statusLabel}</Label>
        <Caption className="mt-3">
          No Expo Go o push remoto é limitado. Em um development build você libera a permissão e
          cadastra este aparelho. O envio automático das atualizações de NRs ainda será conectado.
        </Caption>
      </Surface>

      {info ? (
        <Surface tone="accent" className="mb-4">
          <Caption style={{ color: colors.brandDark }}>{info}</Caption>
        </Surface>
      ) : null}
      {error ? (
        <Surface tone="signal" className="mb-4">
          <Caption style={{ color: colors.inkSoft }}>{error}</Caption>
        </Surface>
      ) : null}

      <Button
        label={status === 'granted' ? 'Atualizar cadastro do aparelho' : 'Ativar avisos de NRs'}
        onPress={handleEnable}
        loading={busy}
      />
    </Container>
  );
}
