import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getOrder, OrderResponse, ApiError } from "../../services/api";
import { StatusStepper } from "../../components/StatusStepper";
import { DeliveryMap } from "../../components/DeliveryMap";
import { BRAND, COLORS, RADII, SPACING } from "../../theme/tokens";

// Illustrative marketplace commission (DoorDash/Uber Eats/Grubhub run 15–30%);
// used to show the owner how much of each order stays with the restaurant.
const MARKETPLACE_COMMISSION = 0.3;

const STAGE_MESSAGES: Record<string, string> = {
  placed: "Your order has been sent to the restaurant.",
  preparing: "The kitchen is preparing your order.",
  out_for_delivery: "Your order is on its way!",
  delivered: "Enjoy your meal — thanks for ordering local!",
};

export default function OrderStatusScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = () => {
      getOrder(id)
        .then((o) => {
          setOrder(o);
          if (o.is_delivered && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        })
        .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn't load order status"));
    };

    fetchOrder();
    intervalRef.current = setInterval(fetchOrder, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.restaurantName}>{order.restaurant_name}</Text>
      <Text style={styles.message}>{STAGE_MESSAGES[order.stage]}</Text>

      <View style={styles.savingsCard}>
        <View style={styles.savingsCheck}>
          <Text style={styles.savingsCheckMark}>✓</Text>
        </View>
        <View style={styles.savingsTextWrap}>
          <Text style={styles.savingsTitle}>You ordered direct</Text>
          <Text style={styles.savingsBody}>
            <Text style={styles.savingsAmount}>
              ${(Number(order.subtotal) * MARKETPLACE_COMMISSION).toFixed(2)}
            </Text>{" "}
            of this order stays with {order.restaurant_name} — not a delivery app.
          </Text>
        </View>
      </View>

      <View style={styles.mapCard}>
        <DeliveryMap
          restaurantLat={order.restaurant_latitude}
          restaurantLng={order.restaurant_longitude}
          atRestaurant={order.stage_index < 2}
          progress={order.stage === "out_for_delivery" ? order.progress_in_stage : order.stage_index >= 3 ? 1 : 0}
        />
      </View>

      <View style={styles.stepperCard}>
        <StatusStepper
          stageIndex={order.stage_index}
          progressInStage={order.progress_in_stage}
          stageCount={order.stage_count}
        />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        {order.items.map((item) => (
          <View key={item.id} style={styles.summaryRow}>
            <Text style={styles.summaryItemName}>
              {item.quantity}× {item.name_snapshot}
            </Text>
            <Text style={styles.summaryItemPrice}>${item.line_total}</Text>
          </View>
        ))}
        <View style={[styles.summaryRow, styles.divider]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${order.total}</Text>
        </View>
        {order.delivery_address ? (
          <Text style={styles.address}>Delivering to: {order.delivery_address}</Text>
        ) : null}
      </View>

      {order.is_delivered && (
        <Pressable style={styles.againBtn} onPress={() => router.replace("/")}>
          <Text style={styles.againBtnText}>Order Again</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg, paddingBottom: SPACING.xl, backgroundColor: COLORS.bg, flexGrow: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.bg, padding: SPACING.lg },
  errorText: { color: COLORS.danger, fontWeight: "600" },
  restaurantName: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  message: { fontSize: 14, color: COLORS.textMuted, marginTop: 4, marginBottom: SPACING.md, fontWeight: "600" },
  savingsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: "rgba(15,61,46,0.14)",
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  savingsCheck: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BRAND.deepGreen,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  savingsCheckMark: { color: BRAND.cream, fontSize: 18, fontWeight: "800", lineHeight: 21 },
  savingsTextWrap: { flex: 1 },
  savingsTitle: { fontSize: 14, fontWeight: "800", color: BRAND.deepGreen, marginBottom: 2 },
  savingsBody: { fontSize: 12.5, color: COLORS.textMuted, lineHeight: 17 },
  savingsAmount: { color: BRAND.njRed, fontWeight: "800" },
  mapCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: "center",
  },
  stepperCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  summaryTitle: { fontSize: 15, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.sm },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  summaryItemName: { fontSize: 13, color: COLORS.textMuted, flex: 1 },
  summaryItemPrice: { fontSize: 13, color: COLORS.text, fontWeight: "600" },
  divider: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  totalLabel: { fontSize: 15, fontWeight: "800", color: COLORS.text },
  totalValue: { fontSize: 15, fontWeight: "800", color: COLORS.primary },
  address: { fontSize: 12, color: COLORS.textSoft, marginTop: SPACING.sm },
  againBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.pill,
    paddingVertical: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  againBtnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
});
