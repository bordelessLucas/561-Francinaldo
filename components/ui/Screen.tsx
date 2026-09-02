import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = ViewProps & {
  scroll?: boolean;
  children: React.ReactNode;
};

export function Screen({ children, scroll = false, className, ...props }: ScreenProps & { className?: string }) {
  const content = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="grow px-6 pb-10 pt-4"
      className="flex-1"
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 px-6 pb-8 pt-4 ${className ?? ''}`} {...props}>
      {children}
    </View>
  );

  return (
    <View className="flex-1 bg-canvas">
      <LinearGradient
        colors={['#D7EDED', '#EEF3F5', '#F7FAFB']}
        locations={[0, 0.35, 1]}
        className="absolute inset-0"
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1">{content}</SafeAreaView>
    </View>
  );
}
