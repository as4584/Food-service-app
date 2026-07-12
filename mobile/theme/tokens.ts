/**
 * NJ Eats brand palette — the source of truth for brand surfaces
 * (splash / loading screen, logo, app icon). Existing COLORS tokens below
 * still drive the rest of the app; these are additive and don't replace them.
 */
export const BRAND = {
  deepGreen: "#0F3D2E",
  njRed: "#D62828",
  cream: "#F7F3EC",
  gold: "#C8A96B",
  nearBlack: "#1A1A1A",
};

// Aligned to the NJ Eats brand (see BRAND above): cream surfaces, deep-green
// structure/text, red for calls to action, gold for premium accents. Token
// names are unchanged so every screen re-skins from this one edit.
export const COLORS = {
  bg: "#F7F3EC", // brand cream
  bgElevated: "#FFFFFF",
  card: "#FFFFFF",
  cardAlt: "#F1EDE1", // soft cream
  border: "#E6DECF",
  text: "#14352A", // deep green-black (headings + body)
  textMuted: "#5E6E64",
  textSoft: "#94A099",
  primary: "#0F3D2E", // deep green — spinners, progress, secondary surfaces
  primaryBright: "#1B5E45",
  primarySoft: "#E4EDE7", // soft green tint (image placeholders)
  ocean: "#0F3D2E", // (kept name) deep green accent for prices/meta
  success: "#2FA86C",
  warning: "#C8A96B", // brand gold
  danger: "#C0392B",
  glimmer: "rgba(255, 255, 255, 0.55)",
};

export const GRADIENTS = {
  sunset: ["#1E6A4E", "#0F3D2E"] as const, // deep-green header
  ocean: ["#D2B679", "#C8A96B"] as const, // gold — the "visit website" banner
  primaryButton: ["#E5433C", "#D62828"] as const, // brand red — CTAs
};

export const FONTS = {
  display: "Fredoka_600SemiBold",
  displayBold: "Fredoka_700Bold",
  displayMedium: "Fredoka_500Medium",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemiBold: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
  bodyExtraBold: "Inter_800ExtraBold",
};

export const SPACING = { xs: 6, sm: 10, md: 16, lg: 20, xl: 28 };
export const RADII = { sm: 12, md: 16, lg: 22, xl: 28, pill: 999 };

export const SHADOWS = {
  card: {
    shadowColor: "#3A2313",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  button: {
    shadowColor: "#D62828",
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  header: {
    shadowColor: "#0F3D2E",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
};
