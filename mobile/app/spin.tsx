import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { setAudioModeAsync } from "expo-audio";
import { listRestaurants, RestaurantListItem, ApiError } from "../services/api";
import { SpinWheel, SpinWheelHandle } from "../components/SpinWheel";
import { Confetti } from "../components/Confetti";
import { RestaurantCard } from "../components/RestaurantCard";
import { useUserLocation } from "../context/LocationContext";
import { haversineMiles } from "../utils/distance";
import { WheelCategory } from "../theme/categories";
import { BRAND, COLORS, FONTS, GRADIENTS, RADII, SHADOWS, SPACING } from "../theme/tokens";

export default function SpinScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { coords } = useUserLocation();
  const wheelRef = useRef<SpinWheelHandle>(null);

  const [restaurants, setRestaurants] = useState<RestaurantListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState<WheelCategory | null>(null);
  const [fireKey, setFireKey] = useState(0);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      listRestaurants()
        .then(setRestaurants)
        .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn't load restaurants"));
    }, [])
  );

  const onSpinStart = useCallback(() => {
    setSpinning(true);
    setLanded(null);
  }, []);

  const onResult = useCallback((c: WheelCategory) => {
    setSpinning(false);
    setLanded(c);
    setFireKey((k) => k + 1);
  }, []);

  const matches = (landed ? restaurants.filter((r) => r.category === landed.key) : [])
    .map((r) => ({
      ...r,
      distanceMi:
        coords && r.latitude != null && r.longitude != null
          ? haversineMiles(coords.latitude, coords.longitude, r.latitude, r.longitude)
          : undefined,
    }))
    .sort((a, b) => (a.distanceMi ?? Infinity) - (b.distanceMi ?? Infinity));
  const wheelSize = Math.min(340, width - SPACING.lg * 2);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Feeling Lucky?</Text>
        <Text style={styles.subtitle}>Can't decide? Let the wheel pick your next meal.</Text>

        <View style={styles.wheelWrap}>
          <SpinWheel ref={wheelRef} size={wheelSize} onSpinStart={onSpinStart} onResult={onResult} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.spinBtnWrap, pressed && styles.pressed, spinning && styles.disabled]}
          onPress={() => wheelRef.current?.spin()}
          disabled={spinning}
        >
          <LinearGradient
            colors={GRADIENTS.primaryButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.spinBtn}
          >
            <Text style={styles.spinBtnText}>{spinning ? "Spinning…" : landed ? "Spin Again" : "Spin the Wheel"}</Text>
          </LinearGradient>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {landed ? (
          <View style={styles.result}>
            <Text style={styles.resultHeader}>
              {landed.emoji} {landed.label}
            </Text>
            <Text style={styles.resultSub}>
              {matches.length} spot{matches.length === 1 ? "" : "s"} near you
            </Text>
            {matches.map((item) => (
              <RestaurantCard
                key={item.id}
                restaurant={item}
                distanceMi={item.distanceMi}
                onPress={() => router.push(`/restaurant/${item.id}`)}
              />
            ))}
            {matches.length === 0 ? (
              <Text style={styles.empty}>More {landed.label.toLowerCase()} spots joining soon.</Text>
            ) : null}
          </View>
        ) : (
          !spinning && <Text style={styles.hint}>Tap spin and see where you land 🎯</Text>
        )}
      </ScrollView>

      <Confetti fireKey={fireKey} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xl, alignItems: "center" },
  title: { fontSize: 28, fontFamily: FONTS.displayBold, color: COLORS.text, marginTop: SPACING.sm },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    textAlign: "center",
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  wheelWrap: { marginVertical: SPACING.md, ...SHADOWS.card },
  spinBtnWrap: { borderRadius: RADII.pill, marginTop: SPACING.md, alignSelf: "stretch", ...SHADOWS.button },
  pressed: { transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.75 },
  spinBtn: { borderRadius: RADII.pill, paddingVertical: SPACING.md, alignItems: "center" },
  spinBtnText: { color: "#FFFFFF", fontFamily: FONTS.bodyExtraBold, fontSize: 17, letterSpacing: 0.5 },
  error: { color: COLORS.danger, marginTop: SPACING.md, fontFamily: FONTS.bodySemiBold },
  hint: { color: COLORS.textSoft, fontFamily: FONTS.body, marginTop: SPACING.lg },
  result: { alignSelf: "stretch", marginTop: SPACING.xl },
  resultHeader: { fontSize: 24, fontFamily: FONTS.displayBold, color: BRAND.deepGreen, textAlign: "center" },
  resultSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontFamily: FONTS.bodySemiBold,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  empty: { color: COLORS.textSoft, fontFamily: FONTS.body, textAlign: "center", marginTop: SPACING.sm },
});
