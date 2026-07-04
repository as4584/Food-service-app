import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { COLORS, RADII } from "../theme/tokens";

const STAGE_LABELS = ["Order Placed", "Preparing", "Out for Delivery", "Delivered"];

function StepNode({
  label,
  isDone,
  isActive,
}: {
  label: string;
  isDone: boolean;
  isActive: boolean;
}) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.35, { duration: 500, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [isActive]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={styles.nodeCol}>
      <Animated.View
        style={[styles.node, (isDone || isActive) && styles.nodeFilled, pulseStyle]}
      />
      <Text style={[styles.label, (isDone || isActive) && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function StatusStepper({
  stageIndex,
  progressInStage,
  stageCount,
}: {
  stageIndex: number;
  progressInStage: number;
  stageCount: number;
}) {
  const fraction = useSharedValue(0);

  useEffect(() => {
    const target = stageCount > 1 ? (stageIndex + progressInStage) / (stageCount - 1) : 1;
    fraction.value = withTiming(Math.min(1, target), { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [stageIndex, progressInStage, stageCount]);

  const trackFillStyle = useAnimatedStyle(() => ({
    width: `${fraction.value * 100}%`,
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <Animated.View style={[styles.trackFill, trackFillStyle]} />
      </View>
      <View style={styles.nodesRow}>
        {STAGE_LABELS.map((label, i) => {
          const isDone = i < stageIndex || (i === stageIndex && progressInStage >= 1);
          const isActive = i === stageIndex && progressInStage < 1;
          return <StepNode key={label} label={label} isDone={isDone} isActive={isActive} />;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 8 },
  track: {
    height: 6,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 14,
  },
  trackFill: {
    height: "100%",
    borderRadius: RADII.pill,
    backgroundColor: COLORS.primary,
  },
  nodesRow: { flexDirection: "row", justifyContent: "space-between" },
  nodeCol: { alignItems: "center", flex: 1 },
  node: {
    width: 14,
    height: 14,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.border,
    marginBottom: 6,
  },
  nodeFilled: { backgroundColor: COLORS.primary },
  label: { fontSize: 10, color: COLORS.textSoft, textAlign: "center", fontWeight: "600" },
  labelActive: { color: COLORS.text },
});
