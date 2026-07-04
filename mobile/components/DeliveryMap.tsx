import { StyleSheet, Text, View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { COLORS, RADII } from "../theme/tokens";

const WIDTH = 320;
const HEIGHT = 140;

// Cubic bezier control points for the stylized route from restaurant -> home.
const P0 = { x: 34, y: 100 };
const P1 = { x: 110, y: 18 };
const P2 = { x: 210, y: 124 };
const P3 = { x: 288, y: 42 };

const ROUTE_D = `M${P0.x},${P0.y} C${P1.x},${P1.y} ${P2.x},${P2.y} ${P3.x},${P3.y}`;

function cubicBezierPoint(t: number) {
  "worklet";
  const mt = 1 - t;
  const x =
    mt * mt * mt * P0.x + 3 * mt * mt * t * P1.x + 3 * mt * t * t * P2.x + t * t * t * P3.x;
  const y =
    mt * mt * mt * P0.y + 3 * mt * mt * t * P1.y + 3 * mt * t * t * P2.y + t * t * t * P3.y;
  return { x, y };
}

export function DeliveryMap({
  progress,
  atRestaurant,
}: {
  /** 0 (just dispatched) to 1 (arrived) — only meaningful once out for delivery. */
  progress: number;
  /** True while the order hasn't been dispatched yet (placed/preparing). */
  atRestaurant: boolean;
}) {
  const animatedProgress = useSharedValue(0);
  const bob = useSharedValue(0);

  useEffect(() => {
    const target = atRestaurant ? 0 : progress;
    animatedProgress.value = withTiming(target, { duration: 700, easing: Easing.inOut(Easing.cubic) });
  }, [progress, atRestaurant]);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 450, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 450, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const markerStyle = useAnimatedStyle(() => {
    const { x, y } = cubicBezierPoint(animatedProgress.value);
    return {
      transform: [
        { translateX: x - 16 },
        { translateY: y - 16 + bob.value * -3 },
      ],
    };
  });

  return (
    <View style={styles.wrap}>
      <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Path
          d={ROUTE_D}
          stroke={COLORS.border}
          strokeWidth={4}
          strokeDasharray="2 10"
          strokeLinecap="round"
          fill="none"
        />
        <Circle cx={P0.x} cy={P0.y} r={16} fill={COLORS.primarySoft} />
        <Circle cx={P3.x} cy={P3.y} r={16} fill={COLORS.primarySoft} />
      </Svg>

      <View style={[styles.pin, { left: P0.x - 14, top: P0.y - 14 }]}>
        <Text style={styles.pinEmoji}>🏪</Text>
      </View>
      <View style={[styles.pin, { left: P3.x - 14, top: P3.y - 14 }]}>
        <Text style={styles.pinEmoji}>🏠</Text>
      </View>

      <Animated.View style={[styles.marker, markerStyle]}>
        <Text style={styles.markerEmoji}>🛵</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: WIDTH,
    height: HEIGHT,
    alignSelf: "center",
  },
  pin: {
    position: "absolute",
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  pinEmoji: { fontSize: 18 },
  marker: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  markerEmoji: { fontSize: 18 },
});
