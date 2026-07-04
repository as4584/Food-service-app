import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Line, Ellipse, Rect } from "react-native-svg";
import { BRAND, FONTS } from "../theme/tokens";

/**
 * NJ Eats brand logo — a scalable vector composition (no raster assets).
 *
 * Built to visually match the brand reference: green "N" / red "J" mark with
 * a food cloche above the J and delivery motion lines to the left, over the
 * "NJ EATS" wordmark and a green·gold·red divider. Letters use the bundled
 * Fredoka display font so the mark stays crisp at any size.
 */
export function NJEatsLogo({
  size = 132,
  showWordmark = true,
}: {
  size?: number;
  showWordmark?: boolean;
}) {
  const letterSize = size * 0.82;
  const clocheW = size * 0.34;
  const clocheH = size * 0.2;

  return (
    <View style={styles.wrap}>
      <View style={[styles.markRow, { height: size }]}>
        {/* Delivery motion lines */}
        <Svg width={size * 0.42} height={size} viewBox="0 0 42 100" style={styles.motion}>
          <Line x1="0" y1="42" x2="30" y2="42" stroke={BRAND.deepGreen} strokeWidth="6" strokeLinecap="round" />
          <Line x1="6" y1="56" x2="34" y2="56" stroke={BRAND.deepGreen} strokeWidth="6" strokeLinecap="round" />
          <Line x1="14" y1="70" x2="38" y2="70" stroke={BRAND.deepGreen} strokeWidth="6" strokeLinecap="round" />
        </Svg>

        <View style={styles.letters}>
          {/* Food cloche / dome sitting above the J */}
          <View style={[styles.cloche, { width: clocheW, height: clocheH + size * 0.12, right: -size * 0.02 }]}>
            <Svg width={clocheW} height={clocheH + size * 0.12} viewBox="0 0 100 90">
              {/* knob */}
              <Ellipse cx="50" cy="10" rx="8" ry="8" fill={BRAND.deepGreen} />
              <Rect x="47" y="14" width="6" height="8" fill={BRAND.deepGreen} />
              {/* dome */}
              <Path d="M12 62 A38 40 0 0 1 88 62 Z" fill={BRAND.deepGreen} />
              {/* base tray */}
              <Rect x="6" y="62" width="88" height="12" rx="6" fill={BRAND.deepGreen} />
            </Svg>
          </View>

          <Text
            allowFontScaling={false}
            style={[styles.letter, { fontSize: letterSize, color: BRAND.deepGreen }]}
          >
            N
          </Text>
          <Text
            allowFontScaling={false}
            style={[styles.letter, { fontSize: letterSize, color: BRAND.njRed, marginLeft: -size * 0.04 }]}
          >
            J
          </Text>
        </View>
      </View>

      {showWordmark && (
        <>
          <View style={styles.wordmarkRow}>
            <Text allowFontScaling={false} style={[styles.wordmark, { color: BRAND.deepGreen }]}>
              NJ{" "}
            </Text>
            <Text allowFontScaling={false} style={[styles.wordmark, { color: BRAND.njRed }]}>
              EATS
            </Text>
          </View>

          {/* green · gold dot · red divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: BRAND.deepGreen }]} />
            <View style={styles.dividerDot} />
            <View style={[styles.dividerLine, { backgroundColor: BRAND.njRed }]} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  markRow: { flexDirection: "row", alignItems: "center" },
  motion: { marginRight: 2 },
  letters: { flexDirection: "row", alignItems: "flex-end", position: "relative" },
  cloche: { position: "absolute", top: 0, zIndex: 2 },
  letter: {
    fontFamily: FONTS.displayBold,
    includeFontPadding: false,
    lineHeight: undefined,
  },
  wordmarkRow: { flexDirection: "row", marginTop: 6 },
  wordmark: {
    fontFamily: FONTS.displayBold,
    fontSize: 30,
    letterSpacing: 4,
  },
  divider: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  dividerLine: { width: 34, height: 3, borderRadius: 2 },
  dividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BRAND.gold,
    marginHorizontal: 8,
  },
});
