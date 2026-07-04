import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getRestaurant, RestaurantDetail, ApiError } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { MenuItemRow } from "../../components/MenuItemRow";
import { CartBar } from "../../components/CartBar";
import { COLORS, SPACING } from "../../theme/tokens";

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const cart = useCart();
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRestaurant(id)
      .then(setRestaurant)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn't load menu"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = (item: RestaurantDetail["menu_items"][number]) => {
    if (!restaurant) return;
    const switchingRestaurants =
      cart.restaurantId && cart.restaurantId !== restaurant.id && cart.lines.length > 0;

    if (switchingRestaurants) {
      Alert.alert(
        "Start a new order?",
        `Your cart has items from ${cart.restaurantName}. Adding from ${restaurant.name} will clear it.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Start New Order",
            style: "destructive",
            onPress: () => cart.addItem(restaurant.id, restaurant.name, item),
          },
        ]
      );
      return;
    }
    cart.addItem(restaurant.id, restaurant.name, item);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? "Restaurant not found"}</Text>
      </View>
    );
  }

  const grouped = restaurant.menu_items.reduce<Record<string, typeof restaurant.menu_items>>(
    (acc, item) => {
      (acc[item.category] ??= []).push(item);
      return acc;
    },
    {}
  );

  const quantityFor = (menuItemId: string) =>
    cart.lines.find((l) => l.menuItem.id === menuItemId)?.quantity ?? 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.meta}>
          {restaurant.cuisine} · {restaurant.town} · ⭐ {restaurant.rating} ·{" "}
          {restaurant.eta_minutes} min
        </Text>
        {restaurant.description ? (
          <Text style={styles.description}>{restaurant.description}</Text>
        ) : null}

        {Object.entries(grouped).map(([category, items]) => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{category}</Text>
            {items.map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                quantity={quantityFor(item.id)}
                onAdd={() => handleAdd(item)}
                onRemove={() => cart.setQuantity(item.id, quantityFor(item.id) - 1)}
              />
            ))}
          </View>
        ))}
      </ScrollView>
      <CartBar
        itemCount={cart.itemCount}
        subtotal={cart.subtotal}
        onPress={() => router.push("/cart")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, paddingBottom: 100 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.bg },
  errorText: { color: COLORS.danger, fontWeight: "600" },
  name: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  meta: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, fontWeight: "600" },
  description: { fontSize: 14, color: COLORS.textMuted, marginTop: SPACING.sm, lineHeight: 20 },
  section: { marginTop: SPACING.lg },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
});
