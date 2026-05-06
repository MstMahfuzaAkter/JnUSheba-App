import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const content = (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );

  if (Platform.OS === 'web') {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={styles.webBody}>
          <View style={styles.mobileContainer}>
            {content}
          </View>
        </View>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {content}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  webBody: {
    flex: 1,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  mobileContainer: {
    width: '100%',
    maxWidth: 414, // iPhone Max width roughly
    height: '100%',
    maxHeight: 896, // iPhone Max height roughly
    backgroundColor: '#fff', 
    borderRadius: 30, // mobile bezel roundness
    overflow: 'hidden',
    borderWidth: 8,
    borderColor: '#1f2937', // bezel color
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20, // for android web/hybrid
    position: 'relative',
    transform: [{ scale: 1 }],
    zIndex: 1, // Creates a new stacking context for mobile view container
  }
});

