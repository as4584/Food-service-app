import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useCart } from "../context/CartContext";
import { COLORS, RADII, SPACING } from "../theme/tokens";

const NJ_SALES_TAX = 0.06625;
const DELIVERY_FEE = 3.99;

export default function CartScreen() {
  const router = useRouter();
  const cart = useCart();

  const tax = cart.subtotal * NJ_SALES_TAX;
  const total = cart.subtotal + tax + DELIVERY_FEE;

  if (cart.lines.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty.</Text>
        <Pressable style={styles.emptyBtn} onPress={() => router.push("/")}>
          <Text style={styles.emptyBtnText}>Browse Restaurants</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.restaurantName}>{cart.restaurantName}</Text>
      <FlatList
        data={cart.lines}
        keyExtractor={(l) => l.menuItem.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.itemName}>{item.menuItem.name}</Text>
              <Text style={styles.itemPrice}>
                ${Number(item.menuItem.price).toFixed(2)} each
              </Text>
            </View>
            <View style={styles.stepper}>
              <Pressable
                style={styles.stepBtn}
                onPress={() => cart.setQuantity(item.menuItem.id, item.quantity - 1)}
                hitSlop={8}
              >
                <Text style={styles.stepBtnText}>−</Text>
              </Pressable>
              <Text style={styles.qty}>{item.quantity}</Text>
              <Pressable
                style={styles.stepBtn}
                onPress={() => cart.setQuantity(item.menuItem.id, item.quantity + 1)}
                hitSlop={8}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </Pressable>
            </View>
            <Text style={styles.lineTotal}>
              ${(Number(item.menuItem.price) * item.quantity).toFixed(2)}
            </Text>
          </View>
        )}
      />

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${cart.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>NJ Sales Tax (6.625%)</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>${DELIVERY_FEE.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>

        <Pressable style={styles.checkoutBtn} onPress={() => router.push("/checkout")}>
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg,
    padding: SPACING.lg,
  },
  emptyText: { fontSize: 16, color: COLORS.textMuted, marginBottom: SPACING.lg },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADII.pill,
  },
  emptyBtnText: { color: "#FFFFFF", fontWeight: "700" },
  restaurantName: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    padding: SPACING.lg,
    paddingBottom: 0,
  },
  list: { padding: SPACING.lg },
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
  rowInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  itemPrice: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  stepper: { flexDirection: "row", alignItems: "center", marginHorizontal: SPACING.sm },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: { fontSize: 15, fontWeight: "700", color: COLORS.text, lineHeight: 17 },
  qty: { width: 22, textAlign: "center", fontWeight: "700", color: COLORS.text },
  lineTotal: { fontSize: 14, fontWeight: "800", color: COLORS.text, width: 56, textAlign: "right" },
  summary: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.lg,
    backgroundColor: COLORS.bgElevated,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  summaryLabel: { fontSize: 13, color: COLORS.textMuted },
  summaryValue: { fontSize: 13, color: COLORS.text, fontWeight: "600" },
  totalRow: { marginTop: 4, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  totalLabel: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  totalValue: { fontSize: 16, fontWeight: "800", color: COLORS.primary },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.pill,
    paddingVertical: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  checkoutBtnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
});
