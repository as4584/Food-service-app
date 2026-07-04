import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, RADII, SPACING } from "../theme/tokens";
import type { RestaurantListItem } from "../services/api";

export function RestaurantCard({
  restaurant,
  onPress,
}: {
  restaurant: RestaurantListItem;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        {restaurant.image_url ? (
          <Image source={{ uri: restaurant.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.emoji}>{restaurant.image_emoji ?? "🍽️"}</Text>
        )}
        {restaurant.image_url && restaurant.image_emoji ? (
          <View style={styles.emojiBadge}>
            <Text style={styles.emojiBadgeText}>{restaurant.image_emoji}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Text style={styles.cuisine} numberOfLines={1}>
          {restaurant.cuisine} · {restaurant.town}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>⭐ {restaurant.rating}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.meta}>{restaurant.eta_minutes} min</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.meta}>{restaurant.price_range}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  imageWrap: {
    width: 64,
    height: 64,
    borderRadius: RADII.md,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  emoji: { fontSize: 32 },
  emojiBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiBadgeText: { fontSize: 12 },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: "700", color: COLORS.text },
  cuisine: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  meta: { fontSize: 12, color: COLORS.textSoft, fontWeight: "600" },
  metaDot: { fontSize: 12, color: COLORS.textSoft, marginHorizontal: 6 },
});
