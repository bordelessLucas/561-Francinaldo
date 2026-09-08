import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { doc, setDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';

export type PushRegistrationResult = {
  granted: boolean;
  token?: string;
  message?: string;
};

/** Expo Go (SDK 53+) não inclui push remoto de expo-notifications. */
function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

type NotificationsModule = typeof import('expo-notifications');

function loadNotifications(): NotificationsModule | null {
  if (Platform.OS === 'web' || isExpoGo()) {
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-notifications') as NotificationsModule;
  } catch {
    return null;
  }
}

let handlerReady = false;

function ensureHandler(Notifications: NotificationsModule) {
  if (handlerReady) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  handlerReady = true;
}

/** Solicita permissão e registra o device do usuário (Sprint 9 — só avisos de NRs). */
export async function registerForNrPush(uid: string): Promise<PushRegistrationResult> {
  if (Platform.OS === 'web') {
    return {
      granted: false,
      message: 'Avisos push ficam disponíveis no app instalado (celular).',
    };
  }

  if (isExpoGo()) {
    return {
      granted: false,
      message:
        'Push de NRs no Expo Go não está disponível (SDK 53+). Use um development build para testar avisos reais.',
    };
  }

  const Notifications = loadNotifications();
  if (!Notifications) {
    return {
      granted: false,
      message: 'Módulo de notificações indisponível neste ambiente.',
    };
  }

  ensureHandler(Notifications);

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== 'granted') {
    return {
      granted: false,
      message: 'Permissão de notificação negada. Ative nas configurações do aparelho.',
    };
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    undefined;

  let token: string;
  try {
    const push = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    token = push.data;
  } catch {
    token = `local-${uid}-${Platform.OS}`;
  }

  const now = new Date().toISOString();
  await setDoc(
    doc(db, 'devices', `${uid}_${Platform.OS}`),
    {
      uid,
      platform: Platform.OS,
      token,
      topics: ['nr_updates'],
      enabled: true,
      updatedAt: now,
      createdAt: now,
    },
    { merge: true },
  );

  return {
    granted: true,
    token,
    message:
      'Você receberá avisos quando houver atualização de NRs (quando o envio estiver ativo).',
  };
}

export async function getNrPushPermissionStatus(): Promise<
  'granted' | 'denied' | 'undetermined'
> {
  if (Platform.OS === 'web' || isExpoGo()) return 'undetermined';

  const Notifications = loadNotifications();
  if (!Notifications) return 'undetermined';

  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return 'granted';
  if (current.status === 'denied') return 'denied';
  return 'undetermined';
}
