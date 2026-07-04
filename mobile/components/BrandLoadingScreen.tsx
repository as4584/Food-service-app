import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Line } from "react-native-svg";
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

function Skyline({ width }: { width: number }) {
  const h = 120;
  return (
    <Svg width={width} height={h} viewBox="0 0 400 120" preserveAspectRatio="xMidYMax meet" opacity={0.16}>
      {/* Building block skyline */}
      <Path
        fill={BRAND.gold}
        d="M0 120 V78 H18 V64 H34 V78 H50 V52 H62 V78 H78 V40 H86 V32 H92 V40 H100 V70 H116 V58 H130 V70 H146 V44 H158 V70 H176 V84 H196 V60 H206 V48 H212 V60 H224 V80 H244 V66 H258 V80 H276 V54 H288 V80 H306 V72 H322 V58 H332 V44 H338 V58 H348 V72 H366 V64 H382 V78 H400 V120 Z"
      />
      {/* Suspension-bridge hint on the right */}
      <Path
        fill="none"
        stroke={BRAND.gold}
        strokeWidth="2"
        d="M300 96 Q340 66 380 96"
      />
      <Line x1="316" y1="86" x2="316" y2="104" stroke={BRAND.gold} strokeWidth="1.5" />
      <Line x1="340" y1="80" x2="340" y2="104" stroke={BRAND.gold} strokeWidth="1.5" />
      <Line x1="364" y1="86" x2="364" y2="104" stroke={BRAND.gold} strokeWidth="1.5" />
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
