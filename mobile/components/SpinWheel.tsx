import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useAudioPlayer } from "expo-audio";
import { WHEEL_CATEGORIES, WheelCategory } from "../theme/categories";
import { BRAND, FONTS } from "../theme/tokens";

const N = WHEEL_CATEGORIES.length;
const SEG = 360 / N;
const TURNS = 5; // full rotations before landing
const DURATION = 4200;

export interface SpinWheelHandle {
  spin: () => void;
}

const pt = (cx: number, cy: number, r: number, angleDeg: number) => {
  // angle measured from the top (pointer), clockwise
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) };
};

export const SpinWheel = forwardRef<
  SpinWheelHandle,
  { size?: number; onSpinStart?: () => void; onResult: (c: WheelCategory) => void }
>(function SpinWheel({ size = 300, onSpinStart, onResult }, ref) {
  const rotation = useSharedValue(0);
  const spinning = useRef(false);
  const pendingIndex = useRef(0);

  const tickPlayer = useAudioPlayer(require("../assets/sounds/tick.wav"));
  const winPlayer = useAudioPlayer(require("../assets/sounds/win.wav"));

  const playTick = useCallback(() => {
    try {
      tickPlayer.seekTo(0);
      tickPlayer.play();
    } catch {}
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [tickPlayer]);

  const finish = useCallback(() => {
    spinning.current = false;
    try {
      winPlayer.seekTo(0);
      winPlayer.play();
    } catch {}
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onResult(WHEEL_CATEGORIES[pendingIndex.current]);
  }, [winPlayer, onResult]);

  // tick each time a wedge boundary passes the pointer
  useAnimatedReaction(
    () => Math.floor(rotation.value / SEG),
    (idx, prev) => {
      if (prev !== null && idx !== prev) runOnJS(playTick)();
    }
  );

  const spin = useCallback(() => {
    if (spinning.current) return;
    spinning.current = true;
    onSpinStart?.();
    const ti = Math.floor(Math.random() * N);
    pendingIndex.current = ti;
    // land wedge ti centered under the pointer (top)
    const targetMod = (360 - (ti + 0.5) * SEG + 360) % 360;
    const currentMod = ((rotation.value % 360) + 360) % 360;
    const delta = TURNS * 360 + ((targetMod - currentMod + 360) % 360);
    rotation.value = withTiming(
      rotation.value + delta,
      { duration: DURATION, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(finish)();
      }
    );
  }, [rotation, onSpinStart, finish]);

  useImperativeHandle(ref, () => ({ spin }), [spin]);

  const wheelStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;
  const labelR = r * 0.64;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={[{ width: size, height: size }, wheelStyle]}>
        <Svg width={size} height={size}>
          <G>
            {WHEEL_CATEGORIES.map((c, i) => {
              const p0 = pt(cx, cy, r, i * SEG);
              const p1 = pt(cx, cy, r, (i + 1) * SEG);
              const d = `M${cx} ${cy} L${p0.x} ${p0.y} A${r} ${r} 0 0 1 ${p1.x} ${p1.y} Z`;
              return <Path key={c.key} d={d} fill={c.color} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />;
            })}
            <Circle cx={cx} cy={cy} r={r - 1} fill="none" stroke={BRAND.cream} strokeWidth={4} />
            <Circle cx={cx} cy={cy} r={26} fill={BRAND.cream} stroke={BRAND.deepGreen} strokeWidth={4} />
          </G>
        </Svg>

        {/* labels (rotate with the wheel) */}
        {WHEEL_CATEGORIES.map((c, i) => {
          const am = (i + 0.5) * SEG;
          const lp = pt(cx, cy, labelR, am);
          return (
            <View
              key={c.key}
              style={[
                styles.label,
                { left: lp.x - 40, top: lp.y - 26, transform: [{ rotate: `${am}deg` }] },
              ]}
            >
              <Text style={styles.labelEmoji}>{c.emoji}</Text>
              <Text style={styles.labelText}>{c.label}</Text>
            </View>
          );
        })}
      </Animated.View>

      {/* fixed pointer at the top */}
      <View style={styles.pointerWrap} pointerEvents="none">
        <View style={styles.pointer} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  label: { position: "absolute", width: 80, alignItems: "center", justifyContent: "center" },
  labelEmoji: { fontSize: 26 },
  labelText: { color: "#FFFFFF", fontFamily: FONTS.bodyExtraBold, fontSize: 13, marginTop: 1 },
  pointerWrap: { position: "absolute", top: -6, alignItems: "center", width: "100%" },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 26,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: BRAND.deepGreen,
  },
});
