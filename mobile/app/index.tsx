import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { listRestaurants, RestaurantListItem, ApiError } from "../services/api";
import { RestaurantCard } from "../components/RestaurantCard";
import { Glimmer } from "../components/Glimmer";
import { useUserLocation } from "../context/LocationContext";
import { haversineMiles } from "../utils/distance";
import { COLORS, FONTS, GRADIENTS, RADII, SHADOWS, SPACING } from "../theme/tokens";

type WithDistance = RestaurantListItem & { distanceMi?: number };

export default function RestaurantListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { coords } = useUserLocation();
  const [restaurants, setRestaurants] = useState<RestaurantListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // When we have the user's location, show distances and sort nearest-first —
  // but keep the featured restaurant (Master Pizza) pinned to the top.
  const ordered = useMemo<WithDistance[]>(() => {
    if (!coords) return restaurants;
    const withDistance: WithDistance[] = restaurants.map((r) => ({
      ...r,
      distanceMi:
        r.latitude != null && r.longitude != null
          ? haversineMiles(coords.latitude, coords.longitude, r.latitude, r.longitude)
          : undefined,
    }));
    return withDistance.sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return (a.distanceMi ?? Infinity) - (b.distanceMi ?? Infinity);
    });
  }, [restaurants, coords]);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listRestaurants()
      .then(setRestaurants)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn't load restaurants"))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.sunset}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + SPACING.lg }]}
      >
        <View pointerEvents="none" style={styles.glowBlobLarge} />
        <View pointerEvents="none" style={styles.glowBlobSmall} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>North Jersey Eats</Text>
          <Text style={styles.subtitle}>The best local restaurants in one place.</Text>
        </View>
        <Glimmer />
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={ordered}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Pressable
              style={({ pressed }) => [styles.spinCta, pressed && styles.spinCtaPressed]}
              onPress={() => router.push("/spin")}
            >
              <LinearGradient
                colors={GRADIENTS.sunset}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.spinBadge}
              >
                <Text style={styles.spinBadgeEmoji}>🎡</Text>
              </LinearGradient>
              <View style={styles.spinCtaText}>
                <Text style={styles.spinCtaTitle}>Feeling lucky?</Text>
                <Text style={styles.spinCtaSub}>Spin the wheel to find your next meal</Text>
              </View>
              <View style={styles.spinPill}>
                <Text style={styles.spinPillText}>Spin</Text>
              </View>
            </Pressable>
          }
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              distanceMi={item.distanceMi}
              onPress={() => router.push(`/restaurant/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingBottom: SPACING.xl + SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADII.xl,
    borderBottomRightRadius: RADII.xl,
    overflow: "hidden",
    ...SHADOWS.header,
  },
  glowBlobLarge: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.14)",
    top: -110,
    right: -60,
  },
  glowBlobSmall: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.10)",
    bottom: -50,
    left: -30,
  },
  headerContent: { position: "relative" },
  title: { fontSize: 34, fontFamily: FONTS.displayBold, color: "#FFFFFF", letterSpacing: 0.2 },
  subtitle: {
    fontSize: 14,
    color: "#FFF3EC",
    marginTop: 4,
    fontFamily: FONTS.bodySemiBold,
  },
  list: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.lg },
  errorText: { color: COLORS.danger, textAlign: "center", fontFamily: FONTS.bodySemiBold },
  spinCta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    padding: SPACING.sm + 2,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  spinCtaPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  spinBadge: {
    width: 52,
    height: 52,
    borderRadius: RADII.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  spinBadgeEmoji: { fontSize: 28 },
  spinCtaText: { flex: 1 },
  spinCtaTitle: { fontSize: 16, fontFamily: FONTS.displayBold, color: COLORS.text },
  spinCtaSub: { fontSize: 12.5, color: COLORS.textMuted, fontFamily: FONTS.body, marginTop: 1 },
  spinPill: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: SPACING.sm,
  },
  spinPillText: { color: "#FFFFFF", fontFamily: FONTS.bodyExtraBold, fontSize: 13 },
});
