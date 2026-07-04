import { useCallback } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from "@expo-google-fonts/fredoka";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import { CartProvider } from "../context/CartContext";
import { COLORS, FONTS } from "../theme/tokens";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const onLayout = useCallback(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider onLayout={onLayout}>
      <CartProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.bg },
            headerTintColor: COLORS.text,
            headerTitleStyle: { fontFamily: FONTS.display, fontSize: 18 },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: COLORS.bg },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="restaurant/[id]" options={{ title: "" }} />
          <Stack.Screen name="cart" options={{ title: "Your Cart" }} />
          <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
          <Stack.Screen
            name="order/[id]"
            options={{ title: "Order Status", headerBackVisible: false }}
          />
        </Stack>
      </CartProvider>
    </SafeAreaProvider>
  );
}
