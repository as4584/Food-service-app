import { useEffect } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

/**
 * A diagonal light sweep that loops across its parent.
 * Parent must have `overflow: "hidden"` and `position: "relative"`.
 */
export function Glimmer({
  size = 140,
  delayMs = 2600,
  durationMs = 1400,
}: {
  size?: number;
  delayMs?: number;
  durationMs?: number;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const travel = screenWidth + size * 2;
  const x = useSharedValue(-size);

  useEffect(() => {
    x.value = withRepeat(
      withSequence(
        withTiming(-size, { duration: 0 }),
        withDelay(delayMs, withTiming(travel, { duration: durationMs, easing: Easing.out(Easing.quad) }))
      ),
      -1
    );
  }, [delayMs, durationMs, size, travel, x]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { rotate: "20deg" }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.sweep, { width: size }, style]}>
      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.55)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sweep: {
    position: "absolute",
    top: -60,
    bottom: -60,
  },
});
