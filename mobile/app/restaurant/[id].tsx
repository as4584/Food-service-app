import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getRestaurant, RestaurantDetail, ApiError } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { MenuItemRow } from "../../components/MenuItemRow";
import { CartBar } from "../../components/CartBar";
import { COLORS, FONTS, GRADIENTS, RADII, SHADOWS, SPACING } from "../../theme/tokens";

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
        {restaurant.image_url ? (
          <Image
            source={{ uri: restaurant.image_url }}
            style={styles.hero}
            resizeMode="cover"
          />
        ) : null}
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.meta}>
          {restaurant.cuisine} · {restaurant.town} · ⭐ {restaurant.rating} ·{" "}
          {restaurant.eta_minutes} min
        </Text>
        {restaurant.description ? (
          <Text style={styles.description}>{restaurant.description}</Text>
        ) : null}

        {restaurant.website_url ? (
          <Pressable
            style={({ pressed }) => [styles.websiteBannerWrap, pressed && styles.pressedShrink]}
            onPress={() => Linking.openURL(restaurant.website_url!)}
          >
            <LinearGradient
              colors={GRADIENTS.ocean}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.websiteBanner}
            >
              <View style={styles.websiteBannerText}>
                <Text style={styles.websiteBannerTitle}>Visit {restaurant.name}'s Website</Text>
                <Text style={styles.websiteBannerSubtitle}>Order directly, view full menu & hours</Text>
              </View>
              <Text style={styles.websiteBannerArrow}>↗</Text>
            </LinearGradient>
          </Pressable>
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
  hero: {
    width: "100%",
    height: 170,
    borderRadius: RADII.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.primarySoft,
    ...SHADOWS.card,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.bg },
  errorText: { color: COLORS.danger, fontFamily: FONTS.bodySemiBold },
  name: { fontSize: 25, fontFamily: FONTS.displayBold, color: COLORS.text },
  meta: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, fontFamily: FONTS.bodySemiBold },
  description: { fontSize: 14, color: COLORS.textMuted, marginTop: SPACING.sm, lineHeight: 20, fontFamily: FONTS.body },
  websiteBannerWrap: { marginTop: SPACING.md, borderRadius: RADII.md, ...SHADOWS.card },
  pressedShrink: { transform: [{ scale: 0.98 }] },
  websiteBanner: {
    borderRadius: RADII.md,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  websiteBannerText: { flex: 1, marginRight: SPACING.sm },
  websiteBannerTitle: { color: "#0F3D2E", fontFamily: FONTS.bodyBold, fontSize: 14 },
  websiteBannerSubtitle: { color: "rgba(15,61,46,0.72)", fontFamily: FONTS.body, fontSize: 12, marginTop: 2 },
  websiteBannerArrow: { color: "#0F3D2E", fontSize: 20, fontFamily: FONTS.bodyBold },
  section: { marginTop: SPACING.lg },
  sectionTitle: {
    fontSize: 17,
    fontFamily: FONTS.display,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
});
