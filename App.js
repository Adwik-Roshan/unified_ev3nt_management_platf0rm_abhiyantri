import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppNavigator from './src/navigation/AppNavigator';

// Suppress known non-fatal React Native Web compatibility warnings from third-party libraries
LogBox.ignoreLogs([
  'props.pointerEvents is deprecated',
  '"shadow*" style props are deprecated',
  'Animated: `useNativeDriver` is not supported',
]);

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac6',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider 
        theme={theme}
        settings={{
          icon: props => <MaterialCommunityIcons {...props} />,
        }}
      >
        <AppNavigator />
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
