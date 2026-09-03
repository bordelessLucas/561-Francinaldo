import { Image, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { brand, colors } from '@/constants/theme';
import { Caption, Label } from '@/src/components/Typography';

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  onPressMenu?: () => void;
  onPressProfile?: () => void;
};

/** Header/Navbar de apresentação — sem regra de negócio. */
export function AppHeader({
  title = brand.name,
  subtitle,
  showLogo = true,
  onPressMenu = () => {},
  onPressProfile = () => {},
}: AppHeaderProps) {
  return (
    <View className="mb-6 flex-row items-center justify-between">
      <View className="flex-1 flex-row items-center gap-3 pr-3">
        {showLogo ? (
          <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-brand-black">
            <Image
              source={brand.logo}
              style={{ width: 44, height: 44 }}
              resizeMode="contain"
              accessibilityLabel="Logo Alpha SST"
            />
          </View>
        ) : null}
        <View className="flex-1">
          <Label className="text-xl text-brand-dark">{title}</Label>
          {subtitle ? <Caption className="mt-1">{subtitle}</Caption> : null}
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Menu"
          onPress={onPressMenu}
          className="h-11 w-11 items-center justify-center rounded-2xl border border-line bg-white"
        >
          <Ionicons name="menu-outline" size={22} color={colors.ink} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Perfil"
          onPress={onPressProfile}
          className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-mist"
        >
          <Ionicons name="person-outline" size={20} color={colors.brandDark} />
        </Pressable>
      </View>
    </View>
  );
}
