import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import {
  Body,
  Button,
  Caption,
  Container,
  Heading,
  Label,
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
      <Pressable onPress={() => router.back()} className="mb-4 self-start py-1">
        <Caption className="font-sansSemi text-brand-dark">Voltar</Caption>
      </Pressable>

      <View className="mb-6 gap-2">
        <Heading>Avisos de NRs</Heading>
        <Body>
          Receba notificações quando uma Norma Regulamentadora for atualizada. O escopo do piloto
          é limitado a atualizações de NRs.
        </Body>
      </View>

      <View className="mb-4 rounded-3xl border border-line bg-surface px-5 py-5 dark:border-line-dark dark:bg-surface-dark">
        <Caption>Status</Caption>
        <Label className="mt-2">{statusLabel}</Label>
        <Caption className="mt-3">
          No Expo Go o push remoto é limitado. Em um development build você libera a permissão e
          cadastra este aparelho. O envio automático das atualizações de NRs ainda será conectado.
        </Caption>
      </View>

      {info ? (
        <View className="mb-4 rounded-2xl bg-brand-mist px-4 py-3">
          <Caption className="text-brand-dark">{info}</Caption>
        </View>
      ) : null}
      {error ? (
        <View className="mb-4 rounded-2xl bg-signal-soft px-4 py-3">
          <Caption className="text-ink-soft">{error}</Caption>
        </View>
      ) : null}

      <Button
        label={status === 'granted' ? 'Atualizar cadastro do aparelho' : 'Ativar avisos de NRs'}
        onPress={handleEnable}
        loading={busy}
      />
    </Container>
  );
}
