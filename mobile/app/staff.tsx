import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BRAND, COLORS, FONTS, RADII, SHADOWS, SPACING } from "../theme/tokens";

/**
 * Staff hub — the entry point for the two operator surfaces (restaurant and
 * driver). In production these become separate installable apps behind auth
 * (see PRODUCTION_CHECKLIST.md §2/§3); bundling them here lets the whole
 * customer → restaurant → driver loop be demoed on one device.
 */
export default function StaffHubScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Operations</Text>
      <Text style={styles.sub}>
        Pick a view to run the other side of an order. Place an order as a
        customer, then accept it here as the restaurant and deliver it as a driver.
      </Text>

      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={() => router.push("/merchant")}
      >
        <View style={[styles.badge, { backgroundColor: BRAND.deepGreen }]}>
          <Text style={styles.badgeText}>R</Text>
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Restaurant</Text>
          <Text style={styles.cardSub}>See incoming orders, accept or decline, mark ready</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={() => router.push("/driver")}
      >
        <View style={[styles.badge, { backgroundColor: BRAND.njRed }]}>
          <Text style={styles.badgeText}>D</Text>
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Driver</Text>
          <Text style={styles.cardSub}>Grab available deliveries, pick up and drop off</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </Pressable>

      <Text style={styles.note}>
        No login yet — this is the pilot build. Accounts and role permissions are
        on the production checklist.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.lg },
  heading: { fontSize: 26, fontFamily: FONTS.displayBold, color: COLORS.text },
  sub: { fontSize: 13.5, color: COLORS.textMuted, marginTop: 6, marginBottom: SPACING.lg, lineHeight: 19, fontFamily: FONTS.body },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  badge: {
    width: 48,
    height: 48,
    borderRadius: RADII.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  badgeText: { color: "#FFFFFF", fontFamily: FONTS.displayBold, fontSize: 22 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontFamily: FONTS.displayBold, color: COLORS.text },
  cardSub: { fontSize: 12.5, color: COLORS.textMuted, marginTop: 2, fontFamily: FONTS.body },
  arrow: { fontSize: 26, color: COLORS.textSoft, marginLeft: SPACING.sm },
  note: { fontSize: 12, color: COLORS.textSoft, marginTop: SPACING.md, lineHeight: 17, fontFamily: FONTS.body },
});
