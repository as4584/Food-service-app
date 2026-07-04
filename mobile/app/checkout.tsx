import { useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";
import { useCart } from "../context/CartContext";
import { createOrder, ApiError } from "../services/api";
import { COLORS, RADII, SPACING } from "../theme/tokens";

const NJ_SALES_TAX = 0.06625;
const DELIVERY_FEE = 3.99;

export default function CheckoutScreen() {
  const router = useRouter();
  const cart = useCart();
  const [customerName, setCustomerName] = useState("Demo Guest");
  const [address, setAddress] = useState("400 Ocean Ave, Point Pleasant Beach, NJ");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tax = cart.subtotal * NJ_SALES_TAX;
  const total = cart.subtotal + tax + DELIVERY_FEE;

  const handlePlaceOrder = async () => {
    if (!cart.restaurantId || cart.lines.length === 0) return;
    setPlacing(true);
    setError(null);
    try {
      const order = await createOrder({
        restaurant_id: cart.restaurantId,
        customer_name: customerName,
        delivery_address: address,
        items: cart.lines.map((l) => ({ menu_item_id: l.menuItem.id, quantity: l.quantity })),
      });
      cart.clearCart();
      router.replace(`/order/${order.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't place your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={customerName}
        onChangeText={setCustomerName}
        placeholder="Your name"
        placeholderTextColor={COLORS.textSoft}
      />

      <Text style={styles.label}>Delivery Address</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Street, town, NJ"
        placeholderTextColor={COLORS.textSoft}
        multiline
      />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{cart.restaurantName}</Text>
        {cart.lines.map((l) => (
          <View key={l.menuItem.id} style={styles.summaryRow}>
            <Text style={styles.summaryItemName}>
              {l.quantity}× {l.menuItem.name}
            </Text>
            <Text style={styles.summaryItemPrice}>
              ${(Number(l.menuItem.price) * l.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
        <View style={[styles.summaryRow, styles.divider]}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${cart.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>${DELIVERY_FEE.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.placeBtn, placing && styles.placeBtnDisabled]}
        onPress={handlePlaceOrder}
        disabled={placing}
      >
        {placing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.placeBtnText}>Place Order</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  label: { fontSize: 13, fontWeight: "700", color: COLORS.textMuted, marginBottom: 6, marginTop: SPACING.md },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    fontSize: 15,
    color: COLORS.text,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  summaryTitle: { fontSize: 15, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.sm },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  summaryItemName: { fontSize: 13, color: COLORS.textMuted, flex: 1 },
  summaryItemPrice: { fontSize: 13, color: COLORS.text, fontWeight: "600" },
  divider: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  summaryLabel: { fontSize: 13, color: COLORS.textMuted },
  summaryValue: { fontSize: 13, color: COLORS.text, fontWeight: "600" },
  totalLabel: { fontSize: 15, fontWeight: "800", color: COLORS.text, marginTop: 4 },
  totalValue: { fontSize: 15, fontWeight: "800", color: COLORS.primary, marginTop: 4 },
  error: { color: COLORS.danger, marginTop: SPACING.md, fontWeight: "600" },
  placeBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.pill,
    paddingVertical: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  placeBtnDisabled: { opacity: 0.7 },
  placeBtnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
});
