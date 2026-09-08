import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/contexts/ThemeContext';

type ContainerProps = ViewProps & {
  children: React.ReactNode;
  /** Scroll + teclado para formulários. */
  scroll?: boolean;
  /** Evita teclado cobrir inputs. */
  keyboard?: boolean;
  className?: string;
};

/** Layout base mobile: safe area, fundo e margens. */
export function Container({
  children,
  scroll = false,
  keyboard = false,
  className,
  ...props
}: ContainerProps) {
  const { colors, isDark } = useAppTheme();

  const padded = (
    <View className={`flex-1 px-6 pb-8 pt-4 ${className ?? ''}`} style={{ flex: 1 }} {...props}>
      {children}
    </View>
  );

  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 }}
      style={{ flex: 1 }}
    >
      {children}
    </ScrollView>
  ) : (
    padded
  );

  const withKeyboard = keyboard ? (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <View className="flex-1 bg-canvas dark:bg-canvas-dark" style={{ flex: 1, backgroundColor: colors.canvas }}>
      <LinearGradient
        colors={[colors.brandMist, colors.canvas, colors.canvasElev]}
        locations={[0, 0.35, 1]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        {withKeyboard}
      </SafeAreaView>
    </View>
  );
}
