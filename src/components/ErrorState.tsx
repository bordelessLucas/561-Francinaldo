import { View } from 'react-native';
import { router, type Href } from 'expo-router';

import { Button } from '@/src/components/Button';
import { Container } from '@/src/components/Container';
import { Body, Heading } from '@/src/components/Typography';

type ErrorStateProps = {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Segunda ação quando o usuário pode ficar preso (ex.: Ir para início). */
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  /** Fallback se onAction for "voltar" e não houver histórico. */
  fallbackHref?: Href;
  /** Envolve em Container (fundo + tab bar visível). */
  withContainer?: boolean;
};

function safeBack(fallbackHref: Href) {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallbackHref);
}

/** Estado de erro padronizado para telas mobile. */
export function ErrorState({
  title = 'Algo deu errado',
  message,
  actionLabel = 'Tentar novamente',
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  fallbackHref = '/(app)/' as Href,
  withContainer = false,
}: ErrorStateProps) {
  const body = (
    <View className="flex-1 items-center justify-center px-6">
      <Heading className="text-center text-2xl">{title}</Heading>
      <Body className="mt-3 text-center">{message}</Body>
      {onAction ? (
        <Button label={actionLabel} onPress={onAction} className="mt-6 w-full max-w-sm" />
      ) : null}
      {secondaryActionLabel && onSecondaryAction ? (
        <Button
          label={secondaryActionLabel}
          variant="outline"
          onPress={onSecondaryAction}
          className="mt-3 w-full max-w-sm"
        />
      ) : null}
    </View>
  );

  if (withContainer) {
    return <Container>{body}</Container>;
  }

  return body;
}

export { safeBack };
