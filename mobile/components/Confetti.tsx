import { useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const COLORS = ["#D62828", "#0F3D2E", "#C8A96B", "#1C7C9C", "#E58A2B", "#2FA86C", "#C86FA0"];
const PIECES = 46;

type Piece = {
  x0: number;
  angle: number;
  dist: number;
  fall: number;
  rot: number;
  color: string;
  size: number;
  round: boolean;
};

/**
 * A one-shot confetti burst built entirely on Reanimated (no extra deps).
 * Re-fires whenever `fireKey` changes to a new truthy value.
 */
export function Confetti({ fireKey }: { fireKey: number }) {
  const { width, height } = useWindowDimensions();
  const progress = useSharedValue(0);

  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: PIECES }).map(() => ({
        x0: (Math.random() - 0.5) * width * 0.5,
        angle: -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1,
        dist: 120 + Math.random() * (width * 0.55),
        fall: height * (0.5 + Math.random() * 0.5),
        rot: (Math.random() - 0.5) * 900,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 7 + Math.random() * 7,
        round: Math.random() > 0.5,
      })),
    [width, height]
  );

  useEffect(() => {
    if (!fireKey) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 1700, easing: Easing.out(Easing.quad) });
  }, [fireKey, progress]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <ConfettiPiece key={i} piece={p} progress={progress} originX={width / 2} originY={height * 0.32} />
      ))}
    </View>
  );
}

function ConfettiPiece({
  piece,
  progress,
  originX,
  originY,
}: {
  piece: Piece;
  progress: SharedValue<number>;
  originX: number;
  originY: number;
}) {
  const style = useAnimatedStyle(() => {
    const t = progress.value;
    const x = piece.x0 + Math.cos(piece.angle) * piece.dist * t;
    // upward launch that arcs back down under "gravity"
    const y = Math.sin(piece.angle) * piece.dist * t + piece.fall * t * t;
    const opacity = t === 0 ? 0 : t < 0.75 ? 1 : 1 - (t - 0.75) / 0.25;
    return {
      opacity,
      transform: [
        { translateX: originX + x },
        { translateY: originY + y },
        { rotate: `${piece.rot * t}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: -piece.size / 2,
          top: -piece.size / 2,
          width: piece.size,
          height: piece.size * (piece.round ? 1 : 1.6),
          backgroundColor: piece.color,
          borderRadius: piece.round ? piece.size : 2,
        },
        style,
      ]}
    />
  );
}
