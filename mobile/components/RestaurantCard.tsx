import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND, COLORS, FONTS, RADII, SHADOWS, SPACING } from "../theme/tokens";
import { formatMiles } from "../utils/distance";
import type { RestaurantListItem } from "../services/api";

export function RestaurantCard({
  restaurant,
  onPress,
  distanceMi,
}: {
  restaurant: RestaurantListItem;
  onPress: () => void;
  distanceMi?: number;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.imageWrap}>
        {restaurant.image_url ? (
          <Image source={{ uri: restaurant.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.emoji}>{restaurant.image_emoji ?? "🍽️"}</Text>
        )}
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(255,255,255,0.35)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.6, y: 0.6 }}
          style={styles.imageShine}
        />
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
          <View style={styles.metaChip}>
            <Text style={styles.meta}>⭐ {restaurant.rating}</Text>
          </View>
          {distanceMi != null && isFinite(distanceMi) ? (
            <View style={[styles.metaChip, styles.distanceChip]}>
              <Text style={[styles.meta, styles.distanceText]}>📍 {formatMiles(distanceMi)}</Text>
            </View>
          ) : (
            <View style={styles.metaChip}>
              <Text style={styles.meta}>{restaurant.eta_minutes} min</Text>
            </View>
          )}
          <View style={styles.metaChip}>
            <Text style={styles.meta}>{restaurant.price_range}</Text>
          </View>
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
    alignItems: "center",
    ...SHADOWS.card,
  },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  imageWrap: {
    width: 76,
    height: 76,
    borderRadius: RADII.md,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  imageShine: { ...StyleSheet.absoluteFillObject },
  emoji: { fontSize: 34 },
  emojiBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiBadgeText: { fontSize: 12 },
  info: { flex: 1 },
  name: { fontSize: 17, fontFamily: FONTS.bodyBold, color: COLORS.text },
  cuisine: { fontSize: 13, color: COLORS.textMuted, marginTop: 3, fontFamily: FONTS.body },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6 },
  metaChip: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: RADII.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  meta: { fontSize: 11.5, color: COLORS.ocean, fontFamily: FONTS.bodyBold },
  distanceChip: { backgroundColor: COLORS.primarySoft },
  distanceText: { color: BRAND.deepGreen },
});
