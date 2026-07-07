import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  listRestaurants,
  listOrders,
  acceptOrder,
  rejectOrder,
  markOrderReady,
  RestaurantListItem,
  OrderResponse,
} from "../../services/api";
import { BRAND, COLORS, FONTS, RADII, SHADOWS, SPACING } from "../../theme/tokens";

const POLL_MS = 3000;

function minutesAgo(seconds: number): string {
  if (seconds < 60) return "just now";
  const m = Math.floor(seconds / 60);
  return `${m} min ago`;
}

/** The restaurant-side order queue: accept / decline / mark ready. */
export default function MerchantScreen() {
  const [restaurants, setRestaurants] = useState<RestaurantListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load the restaurant roster once; default to the featured restaurant.
  useEffect(() => {
    listRestaurants()
      .then((rs) => {
        setRestaurants(rs);
        const featured = rs.find((r) => r.is_featured) ?? rs[0];
        setSelectedId((prev) => prev ?? featured?.id ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const refresh = useCallback(() => {
    if (!selectedId) return;
    listOrders({ restaurantId: selectedId, limit: 50 })
      .then(setOrders)
      .catch(() => {});
  }, [selectedId]);

  // Poll the selected restaurant's orders.
  useEffect(() => {
    if (!selectedId) return;
    refresh();
    pollRef.current = setInterval(refresh, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedId, refresh]);

  const act = async (fn: () => Promise<OrderResponse>, id: string) => {
    setBusyId(id);
    try {
      await fn();
      refresh();
    } catch {
      // leave the ticket in place; next poll reconciles
    } finally {
      setBusyId(null);
    }
  };

  const { incoming, others } = useMemo(() => {
    const active = orders.filter((o) => !o.is_delivered && !o.rejected);
    return {
      incoming: active.filter((o) => o.status === "pending"),
      others: active.filter((o) => o.status !== "pending"),
    };
  }, [orders]);

  const selected = restaurants.find((r) => r.id === selectedId);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{selected?.name ?? "Restaurant"}</Text>
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live order feed</Text>
        </View>
      </View>

      {restaurants.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsRow}
          contentContainerStyle={styles.chipsContent}
        >
          {restaurants.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => setSelectedId(r.id)}
              style={[styles.chip, r.id === selectedId && styles.chipActive]}
            >
              <Text style={[styles.chipText, r.id === selectedId && styles.chipTextActive]}>
                {r.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.sectionLabel}>
              New orders {incoming.length ? `(${incoming.length})` : ""}
            </Text>
            {incoming.length === 0 ? (
              <Text style={styles.empty}>No new orders right now.</Text>
            ) : (
              incoming.map((o) => (
                <View key={o.id} style={[styles.ticket, styles.ticketNew]}>
                  <TicketBody order={o} />
                  <View style={styles.actionRow}>
                    <Pressable
                      style={[styles.btn, styles.btnDecline]}
                      disabled={busyId === o.id}
                      onPress={() => act(() => rejectOrder(o.id), o.id)}
                    >
                      <Text style={styles.btnDeclineText}>Decline</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.btn, styles.btnAccept]}
                      disabled={busyId === o.id}
                      onPress={() => act(() => acceptOrder(o.id), o.id)}
                    >
                      <Text style={styles.btnAcceptText}>Accept</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}

            <Text style={[styles.sectionLabel, { marginTop: SPACING.lg }]}>In progress</Text>
            {others.length === 0 ? (
              <Text style={styles.empty}>Nothing in the kitchen.</Text>
            ) : (
              others.map((o) => (
                <View key={o.id} style={styles.ticket}>
                  <TicketBody order={o} />
                  <View style={styles.statusPillRow}>
                    <Text style={styles.statusPill}>{o.status_label}</Text>
                    {o.status === "accepted" || o.status === "preparing" ? (
                      <Pressable
                        style={[styles.btn, styles.btnReady]}
                        disabled={busyId === o.id}
                        onPress={() => act(() => markOrderReady(o.id), o.id)}
                      >
                        <Text style={styles.btnReadyText}>Mark ready</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ))
            )}
      </ScrollView>
    </View>
  );
}

function TicketBody({ order }: { order: OrderResponse }) {
  return (
    <>
      <View style={styles.ticketTop}>
        <Text style={styles.ticketName}>{order.customer_name || "Guest"}</Text>
        <Text style={styles.ticketTotal}>${order.total}</Text>
      </View>
      <Text style={styles.ticketMeta}>
        #{order.id.slice(0, 6)} · {minutesAgo(order.seconds_elapsed)}
      </Text>
      {order.items.map((it) => (
        <Text key={it.id} style={styles.ticketItem}>
          {it.quantity}× {it.name_snapshot}
        </Text>
      ))}
      {order.delivery_address ? (
        <Text style={styles.ticketAddress}>{order.delivery_address}</Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.xs },
  headerTitle: { fontSize: 22, fontFamily: FONTS.displayBold, color: COLORS.text },
  liveRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success, marginRight: 6 },
  liveText: { fontSize: 12, color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold },
  chipsRow: { flexGrow: 0, marginTop: SPACING.xs },
  chipsContent: { paddingHorizontal: SPACING.lg, gap: SPACING.xs },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.cardAlt,
    marginRight: SPACING.xs,
  },
  chipActive: { backgroundColor: BRAND.deepGreen },
  chipText: { fontSize: 12.5, color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold },
  chipTextActive: { color: "#FFFFFF" },
  body: { padding: SPACING.lg },
  sectionLabel: { fontSize: 13, fontFamily: FONTS.bodyExtraBold, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: SPACING.sm },
  empty: { fontSize: 13, color: COLORS.textSoft, fontFamily: FONTS.body, marginBottom: SPACING.sm },
  ticket: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  ticketNew: { borderColor: "rgba(15,61,46,0.35)", borderWidth: 2 },
  ticketTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  ticketName: { fontSize: 16, fontFamily: FONTS.displayBold, color: COLORS.text },
  ticketTotal: { fontSize: 16, fontFamily: FONTS.bodyExtraBold, color: BRAND.deepGreen },
  ticketMeta: { fontSize: 11.5, color: COLORS.textSoft, fontFamily: FONTS.body, marginTop: 1, marginBottom: SPACING.xs },
  ticketItem: { fontSize: 13.5, color: COLORS.text, fontFamily: FONTS.bodyMedium, marginTop: 1 },
  ticketAddress: { fontSize: 12, color: COLORS.textMuted, fontFamily: FONTS.body, marginTop: 6 },
  actionRow: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.md },
  btn: { flex: 1, borderRadius: RADII.pill, paddingVertical: 11, alignItems: "center" },
  btnAccept: { backgroundColor: BRAND.deepGreen },
  btnAcceptText: { color: "#FFFFFF", fontFamily: FONTS.bodyExtraBold, fontSize: 14 },
  btnDecline: { backgroundColor: COLORS.cardAlt },
  btnDeclineText: { color: COLORS.danger, fontFamily: FONTS.bodyBold, fontSize: 14 },
  statusPillRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: SPACING.sm },
  statusPill: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: FONTS.bodySemiBold,
    backgroundColor: COLORS.cardAlt,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.pill,
    overflow: "hidden",
  },
  btnReady: { flex: 0, paddingHorizontal: 18, backgroundColor: BRAND.gold },
  btnReadyText: { color: BRAND.nearBlack, fontFamily: FONTS.bodyExtraBold, fontSize: 13 },
});
