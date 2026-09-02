import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = ViewProps & {
  scroll?: boolean;
  children: React.ReactNode;
};

export function Screen({
  children,
  scroll = false,
  className,
  ...props
}: ScreenProps & { className?: string }) {
  const content = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 }}
      style={{ flex: 1 }}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      className={`flex-1 ${className ?? ''}`}
      style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 }}
      {...props}
    >
      {children}
    </View>
  );

  return (
    <View className="flex-1 bg-canvas" style={{ flex: 1, backgroundColor: '#EEF3F5' }}>
      <LinearGradient
        colors={['#D7EDED', '#EEF3F5', '#F7FAFB']}
        locations={[0, 0.35, 1]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        {content}
      </SafeAreaView>
    </View>
  );
}
