import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  listOrders,
  pickupOrder,
  deliverOrder,
  OrderResponse,
} from "../../services/api";
import { useUserLocation } from "../../context/LocationContext";
import { haversineMiles, formatMiles } from "../../utils/distance";
import { BRAND, COLORS, FONTS, RADII, SHADOWS, SPACING } from "../../theme/tokens";

const POLL_MS = 3000;

/** Driver-side dashboard: claim ready orders, then mark them delivered. */
export default function DriverScreen() {
  const { coords } = useUserLocation();
  const [driverName, setDriverName] = useState("Demo Driver");
  const [available, setAvailable] = useState<OrderResponse[]>([]);
  const [mine, setMine] = useState<OrderResponse[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(() => {
    listOrders({ status: "ready", limit: 50 })
      .then(setAvailable)
      .catch(() => {});
    listOrders({ status: "out_for_delivery", driverName, limit: 50 })
      .then(setMine)
      .catch(() => {});
  }, [driverName]);

  useEffect(() => {
    refresh();
    pollRef.current = setInterval(refresh, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [refresh]);

  const act = async (fn: () => Promise<OrderResponse>, id: string) => {
    setBusyId(id);
    try {
      await fn();
      refresh();
    } catch {
      // next poll reconciles
    } finally {
      setBusyId(null);
    }
  };

  const distanceTo = (o: OrderResponse): number | null =>
    coords && o.restaurant_latitude != null && o.restaurant_longitude != null
      ? haversineMiles(coords.latitude, coords.longitude, o.restaurant_latitude, o.restaurant_longitude)
      : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.nameRow}>
        <Text style={styles.nameLabel}>Driver</Text>
        <TextInput
          value={driverName}
          onChangeText={setDriverName}
          style={styles.nameInput}
          placeholder="Your name"
          placeholderTextColor={COLORS.textSoft}
        />
      </View>

      <Text style={styles.sectionLabel}>Your delivery {mine.length ? `(${mine.length})` : ""}</Text>
      {mine.length === 0 ? (
        <Text style={styles.empty}>You're not carrying an order right now.</Text>
      ) : (
        mine.map((o) => {
          const d = distanceTo(o);
          return (
            <View key={o.id} style={[styles.card, styles.cardActive]}>
              <View style={styles.cardTop}>
                <Text style={styles.restaurant}>{o.restaurant_name}</Text>
                <Text style={styles.payout}>${o.delivery_fee}</Text>
              </View>
              <Text style={styles.drop}>→ {o.delivery_address || "Customer address"}</Text>
              <Text style={styles.meta}>
                {o.customer_name || "Guest"} · ${o.total} order
                {d != null ? ` · ${formatMiles(d)} to pickup` : ""}
              </Text>
              <Pressable
                style={[styles.btn, styles.btnDeliver]}
                disabled={busyId === o.id}
                onPress={() => act(() => deliverOrder(o.id), o.id)}
              >
                <Text style={styles.btnDeliverText}>Mark delivered</Text>
              </Pressable>
            </View>
          );
        })
      )}

      <Text style={[styles.sectionLabel, { marginTop: SPACING.lg }]}>
        Available {available.length ? `(${available.length})` : ""}
      </Text>
      {available.length === 0 ? (
        <Text style={styles.empty}>No orders ready for pickup yet.</Text>
      ) : (
        available.map((o) => {
          const d = distanceTo(o);
          return (
            <View key={o.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.restaurant}>{o.restaurant_name}</Text>
                <Text style={styles.payout}>${o.delivery_fee}</Text>
              </View>
              <Text style={styles.drop}>→ {o.delivery_address || "Customer address"}</Text>
              <Text style={styles.meta}>
                ${o.total} order{d != null ? ` · ${formatMiles(d)} away` : ""}
              </Text>
              <Pressable
                style={[styles.btn, styles.btnPickup]}
                disabled={busyId === o.id || !driverName.trim()}
                onPress={() => act(() => pickupOrder(o.id, driverName.trim()), o.id)}
              >
                <Text style={styles.btnPickupText}>Accept & pick up</Text>
              </Pressable>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg },
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.lg },
  nameLabel: { fontSize: 13, fontFamily: FONTS.bodyExtraBold, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.6, marginRight: SPACING.sm },
  nameInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 9,
    fontSize: 15,
    color: COLORS.text,
    fontFamily: FONTS.bodySemiBold,
  },
  sectionLabel: { fontSize: 13, fontFamily: FONTS.bodyExtraBold, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: SPACING.sm },
  empty: { fontSize: 13, color: COLORS.textSoft, fontFamily: FONTS.body, marginBottom: SPACING.sm },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardActive: { borderColor: BRAND.njRed, borderWidth: 2 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  restaurant: { fontSize: 16, fontFamily: FONTS.displayBold, color: COLORS.text },
  payout: { fontSize: 15, fontFamily: FONTS.bodyExtraBold, color: BRAND.deepGreen },
  drop: { fontSize: 13.5, color: COLORS.text, fontFamily: FONTS.bodyMedium, marginTop: 6 },
  meta: { fontSize: 12, color: COLORS.textMuted, fontFamily: FONTS.body, marginTop: 3 },
  btn: { borderRadius: RADII.pill, paddingVertical: 11, alignItems: "center", marginTop: SPACING.md },
  btnPickup: { backgroundColor: BRAND.deepGreen },
  btnPickupText: { color: "#FFFFFF", fontFamily: FONTS.bodyExtraBold, fontSize: 14 },
  btnDeliver: { backgroundColor: BRAND.njRed },
  btnDeliverText: { color: "#FFFFFF", fontFamily: FONTS.bodyExtraBold, fontSize: 14 },
});
