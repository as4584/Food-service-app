import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Line, Polygon, Rect } from "react-native-svg";
import { NJEatsLogo } from "./NJEatsLogo";
import { BRAND, FONTS } from "../theme/tokens";

/**
 * NJ Eats branded loading screen (cream variant from the brand reference).
 * Shown over the app while it warms up, then dismissed by the caller.
 */
export function BrandLoadingScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [progress]);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["8%", "100%"],
  });

  return (
    <View style={styles.container}>
      {/* Subtle NJ skyline silhouette across the lower background */}
      <View style={[styles.skyline, { bottom: insets.bottom + 96 }]} pointerEvents="none">
        <Skyline width={width} />
      </View>

      <View style={[styles.center, { paddingTop: insets.top }]}>
        <NJEatsLogo size={128} />
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 28 }]}>
        <Text style={styles.taglineTop}>FROM JERSEY KITCHENS</Text>
        <Text style={styles.taglineBottom}>TO YOUR DOOR.</Text>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: fillWidth }]}>
            <View style={[styles.progressSeg, { backgroundColor: BRAND.deepGreen }]} />
            <View style={[styles.progressSeg, { backgroundColor: BRAND.cream }]} />
            <View style={[styles.progressSeg, { backgroundColor: BRAND.njRed }]} />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const BASE = 160; // baseline (waterline) y in the 400x160 viewBox

// Contiguous downtown silhouette (widths, heights), left → right. The taller
// entries get antenna spires; the last is the tapered Freedom-Tower spire.
const BUILDINGS: [number, number][] = [
  [22, 40], [14, 64], [10, 52], [18, 82], [8, 58], [16, 98], [10, 70],
  [20, 54], [12, 112], [16, 66], [10, 48], [22, 86], [14, 58], [10, 104],
  [18, 62], [12, 76], [16, 50], [20, 90], [14, 60], [8, 120],
  // waterfront under the bridge (right side)
  [20, 26], [18, 34], [16, 22], [22, 30], [16, 28], [18, 24],
];

function buildingsPath(): { d: string; spires: { x: number; top: number }[]; towerX: number; towerTop: number } {
  let x = 0;
  let d = `M0 ${BASE}`;
  const spires: { x: number; top: number }[] = [];
  let towerX = 0;
  let towerTop = 0;
  BUILDINGS.forEach(([w, h], i) => {
    const top = BASE - h;
    d += ` L${x} ${top} L${x + w} ${top}`;
    if (h >= 100 && i < 19) spires.push({ x: x + w / 2, top }); // antennas on tall towers
    if (i === 19) {
      towerX = x + w / 2; // the Freedom-Tower spire
      towerTop = top;
    }
    x += w;
  });
  d += ` L${x} ${BASE} Z`;
  return { d, spires, towerX, towerTop };
}

function Skyline({ width }: { width: number }) {
  const h = 160;
  const { d, spires, towerX, towerTop } = buildingsPath();

  // Suspension bridge over the waterfront (viewBox x ≈ 296–400)
  const deckY = 128;
  const t1 = 320; // tower 1 x
  const t2 = 372; // tower 2 x
  const towerTopY = 82;
  const suspenders = [304, 312, t1, 330, 340, 350, 360, t2, 384, 392];

  return (
    <Svg width={width} height={(width * h) / 400} viewBox="0 0 400 160" preserveAspectRatio="xMidYMax meet">
      {/* Building silhouette */}
      <Path d={d} fill={BRAND.gold} opacity={0.2} />

      {/* Antenna spires on the tallest towers */}
      {spires.map((s, i) => (
        <Line key={i} x1={s.x} y1={s.top} x2={s.x} y2={s.top - 16} stroke={BRAND.gold} strokeWidth={2} opacity={0.2} />
      ))}

      {/* Freedom-Tower tapered spire */}
      <Polygon
        points={`${towerX - 5},${towerTop} ${towerX + 5},${towerTop} ${towerX + 2},${towerTop - 26} ${towerX - 2},${towerTop - 26}`}
        fill={BRAND.gold}
        opacity={0.2}
      />
      <Line x1={towerX} y1={towerTop - 26} x2={towerX} y2={towerTop - 40} stroke={BRAND.gold} strokeWidth={1.5} opacity={0.2} />

      {/* Suspension bridge */}
      {/* main cables: anchor → tower1 top → sag between towers → tower2 top → anchor */}
      <Path
        d={`M296 ${deckY} L${t1} ${towerTopY} Q${(t1 + t2) / 2} ${towerTopY + 26} ${t2} ${towerTopY} L400 ${deckY}`}
        fill="none"
        stroke={BRAND.gold}
        strokeWidth={2}
        opacity={0.28}
      />
      {/* towers */}
      <Rect x={t1 - 2} y={towerTopY} width={4} height={deckY - towerTopY} fill={BRAND.gold} opacity={0.28} />
      <Rect x={t2 - 2} y={towerTopY} width={4} height={deckY - towerTopY} fill={BRAND.gold} opacity={0.28} />
      {/* deck */}
      <Line x1={296} y1={deckY} x2={400} y2={deckY} stroke={BRAND.gold} strokeWidth={2.5} opacity={0.28} />
      {/* vertical suspenders */}
      {suspenders.map((sx, i) => {
        // approximate cable height above the deck across the span
        const mid = (t1 + t2) / 2;
        const frac = Math.min(1, Math.abs(sx - mid) / (mid - t1 + 1));
        const cableY = towerTopY + 26 - frac * frac * 26;
        return (
          <Line key={`s${i}`} x1={sx} y1={cableY} x2={sx} y2={deckY} stroke={BRAND.gold} strokeWidth={1} opacity={0.24} />
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BRAND.cream,
    zIndex: 100,
  },
  skyline: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  footer: { alignItems: "center", paddingHorizontal: 32 },
  taglineTop: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    letterSpacing: 2.5,
    color: BRAND.deepGreen,
  },
  taglineBottom: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    letterSpacing: 2.5,
    color: BRAND.njRed,
    marginTop: 3,
  },
  progressTrack: {
    marginTop: 22,
    width: 132,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(15,61,46,0.12)",
    overflow: "hidden",
  },
  progressFill: {
    flexDirection: "row",
    height: "100%",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressSeg: { flex: 1, height: "100%" },
});
