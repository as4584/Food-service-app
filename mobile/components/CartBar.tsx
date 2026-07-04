import { Pressable, StyleSheet, Text } from "react-native";
import { COLORS, RADII, SPACING } from "../theme/tokens";

export function CartBar({
  itemCount,
  subtotal,
  onPress,
}: {
  itemCount: number;
  subtotal: number;
  onPress: () => void;
}) {
  if (itemCount === 0) return null;

  return (
    <Pressable style={styles.bar} onPress={onPress}>
      <Text style={styles.text}>
        View Cart · {itemCount} item{itemCount === 1 ? "" : "s"}
      </Text>
      <Text style={styles.total}>${subtotal.toFixed(2)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: SPACING.md,
    right: SPACING.md,
    bottom: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADII.pill,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  text: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  total: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
});
