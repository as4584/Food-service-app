import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FONTS, GRADIENTS, RADII, SHADOWS, SPACING } from "../theme/tokens";
import { Glimmer } from "./Glimmer";

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
    <Pressable
      style={({ pressed }) => [styles.wrap, pressed && styles.wrapPressed]}
      onPress={onPress}
    >
      <LinearGradient
        colors={GRADIENTS.primaryButton}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bar}
      >
        <View style={styles.overflowClip}>
          <Glimmer size={90} delayMs={3400} durationMs={1100} />
        </View>
        <Text style={styles.text}>
          View Cart · {itemCount} item{itemCount === 1 ? "" : "s"}
        </Text>
        <Text style={styles.total}>${subtotal.toFixed(2)}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: SPACING.md,
    right: SPACING.md,
    bottom: SPACING.md,
    borderRadius: RADII.pill,
    ...SHADOWS.button,
  },
  wrapPressed: { transform: [{ scale: 0.98 }] },
  bar: {
    borderRadius: RADII.pill,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  overflowClip: { ...StyleSheet.absoluteFillObject, borderRadius: RADII.pill, overflow: "hidden" },
  text: { color: "#FFFFFF", fontFamily: FONTS.bodyBold, fontSize: 15 },
  total: { color: "#FFFFFF", fontFamily: FONTS.bodyExtraBold, fontSize: 15 },
});
