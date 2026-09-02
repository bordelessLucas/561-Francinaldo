import { Text, View } from 'react-native';

import { getRoleLabel } from '@/lib/access';
import type { UserRole } from '@/lib/types';

type ProfileBadgeProps = {
  role: UserRole | null | undefined;
};

export function ProfileBadge({ role }: ProfileBadgeProps) {
  return (
    <View className="self-start rounded-full bg-brand-mist px-3 py-1.5">
      <Text className="font-sansMedium text-sm text-brand-dark">{getRoleLabel(role)}</Text>
    </View>
  );
}
