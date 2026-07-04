import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, RADII, SPACING } from "../theme/tokens";
import type { MenuItem } from "../services/api";

export function MenuItemRow({
  item,
  quantity,
  onAdd,
  onRemove,
}: {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.emojiWrap}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.emoji}>{item.image_emoji ?? "🍴"}</Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
      </View>
      <View style={styles.stepper}>
        {quantity > 0 && (
          <Pressable style={styles.stepBtn} onPress={onRemove} hitSlop={8}>
            <Text style={styles.stepBtnText}>−</Text>
          </Pressable>
        )}
        {quantity > 0 && <Text style={styles.qty}>{quantity}</Text>}
        <Pressable style={[styles.stepBtn, styles.addBtn]} onPress={onAdd} hitSlop={8}>
          <Text style={[styles.stepBtnText, styles.addBtnText]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  emoji: { fontSize: 24 },
  info: { flex: 1, marginRight: SPACING.sm },
  name: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  description: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  price: { fontSize: 13, color: COLORS.ocean, fontWeight: "700", marginTop: 4 },
  stepper: { flexDirection: "row", alignItems: "center" },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepBtnText: { fontSize: 16, fontWeight: "700", color: COLORS.text, lineHeight: 18 },
  addBtnText: { color: "#FFFFFF" },
  qty: { width: 24, textAlign: "center", fontWeight: "700", color: COLORS.text },
});
