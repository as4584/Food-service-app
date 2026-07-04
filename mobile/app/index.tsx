import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { listRestaurants, RestaurantListItem, ApiError } from "../services/api";
import { RestaurantCard } from "../components/RestaurantCard";
import { Glimmer } from "../components/Glimmer";
import { COLORS, FONTS, GRADIENTS, RADII, SHADOWS, SPACING } from "../theme/tokens";

export default function RestaurantListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [restaurants, setRestaurants] = useState<RestaurantListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <Text style={styles.title}>Shore Eats</Text>
          <Text style={styles.subtitle}>Jersey Shore eats, delivered 🌊</Text>
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
          data={restaurants}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
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
});
