import { useCallback, useEffect, useState } from "react";
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
import { BrandLoadingScreen } from "../components/BrandLoadingScreen";
import { COLORS, FONTS } from "../theme/tokens";

SplashScreen.preventAutoHideAsync().catch(() => {});

// Minimum time the branded loading screen stays up once fonts are ready, so it
// reads as an intentional brand moment rather than a flash on fast devices.
const MIN_BRAND_MS = 1900;

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

  const [brandDone, setBrandDone] = useState(false);

  useEffect(() => {
    if (!fontsLoaded) return;
    // Fonts are ready — hand off from the native splash to the in-app branded
    // loading screen, then reveal the app after a short beat.
    SplashScreen.hideAsync().catch(() => {});
    const timer = setTimeout(() => setBrandDone(true), MIN_BRAND_MS);
    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  const onLayout = useCallback(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  // Keep the native splash (cream) up until custom fonts are ready so the
  // branded loading screen renders with the correct typography.
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
            headerBackTitle: "Back",
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
        {!brandDone && <BrandLoadingScreen />}
      </CartProvider>
    </SafeAreaProvider>
  );
}
