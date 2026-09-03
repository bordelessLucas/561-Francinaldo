import { View } from 'react-native';

import { Button } from '@/src/components/Button';
import { Body, Heading } from '@/src/components/Typography';

type ErrorStateProps = {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Estado de erro padronizado para telas mobile. */
export function ErrorState({
  title = 'Algo deu errado',
  message,
  actionLabel = 'Tentar novamente',
  onAction,
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Heading className="text-center text-2xl">{title}</Heading>
      <Body className="mt-3 text-center">{message}</Body>
      {onAction ? (
        <Button label={actionLabel} onPress={onAction} className="mt-6 w-full max-w-sm" />
      ) : null}
    </View>
  );
}
