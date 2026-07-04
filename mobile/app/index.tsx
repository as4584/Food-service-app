import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { listRestaurants, RestaurantListItem, ApiError } from "../services/api";
import { RestaurantCard } from "../components/RestaurantCard";
import { COLORS, GRADIENTS, SPACING } from "../theme/tokens";

export default function RestaurantListScreen() {
  const router = useRouter();
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
      <LinearGradient colors={GRADIENTS.sunset} style={styles.header}>
        <Text style={styles.title}>Shore Eats</Text>
        <Text style={styles.subtitle}>Jersey Shore eats, delivered 🌊</Text>
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
    paddingTop: 64,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  title: { fontSize: 32, fontWeight: "800", color: "#FFFFFF" },
  subtitle: { fontSize: 14, color: "#FFF3EC", marginTop: 4, fontWeight: "600" },
  list: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.lg },
  errorText: { color: COLORS.danger, textAlign: "center", fontWeight: "600" },
});
