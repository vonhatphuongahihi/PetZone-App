import { PaytoneOne_400Regular, useFonts } from '@expo-google-fonts/paytone-one';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getSocket } from '@/services/socket';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    PaytoneOne_400Regular: PaytoneOne_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();

      // Initialize Socket.IO connection for real-time features
      const initSocket = async () => {
        try {
          // Check if user is logged in before initializing socket
          const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
          const token = await AsyncStorage.getItem('jwt_token');

          if (token) {
            await getSocket();
            console.log('[App] Socket.IO initialized for logged-in user');
          } else {
            console.log('[App] No token found, skipping Socket.IO initialization');
          }
        } catch (error) {
          console.log('[App] Socket.IO initialization failed:', error);
        }
      };

      initSocket();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="splash">
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="otp-verify" options={{ headerShown: false }} />
        <Stack.Screen name="create-store" options={{ headerShown: false }} />
        <Stack.Screen name="seller" options={{ headerShown: false }} />
        <Stack.Screen name="categories" options={{ headerShown: false }} />
        <Stack.Screen name="child-categories" options={{ headerShown: false }} />
        <Stack.Screen name="product-list" options={{ headerShown: false }} />
        <Stack.Screen name="product" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ headerShown: false }} />
        <Stack.Screen name="search-results" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="cart" options={{ headerShown: false }} />
        <Stack.Screen name="payment" options={{ headerShown: false }} />
        <Stack.Screen name="editAddress" options={{ headerShown: false }} />
        <Stack.Screen name="addAddress" options={{ headerShown: false }} />
        <Stack.Screen name="helpCenter" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="order-confirm" options={{ headerShown: false }} />
        <Stack.Screen name="purchase-history" options={{ headerShown: false }} />
        <Stack.Screen name="product-rating" options={{ headerShown: false }} />
        <Stack.Screen name="delivery" options={{ headerShown: false }} />
        <Stack.Screen name="terms-of-use" options={{ headerShown: false }} />
        <Stack.Screen name="privacy-policies" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="seller/shop" options={{ headerShown: false }} />
        <Stack.Screen name="seller/shopCategories" options={{ headerShown: false }} />
        <Stack.Screen name="seller/shopProductList" options={{ headerShown: false }} />
        <Stack.Screen name="seller/shopAddProduct" options={{ headerShown: false }} />
        <Stack.Screen name="seller/shopAddCategories" options={{ headerShown: false }} />

      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}


