export const COLORS = {
  bg: "#FDF6E9",
  bgElevated: "#FFFFFF",
  card: "#FFFFFF",
  cardAlt: "#FFF9EF",
  border: "#F0E4CC",
  text: "#1B3A4B",
  textMuted: "#5D7A8C",
  textSoft: "#8FA6B3",
  primary: "#FF6F3C",
  primaryBright: "#FF8A5C",
  primarySoft: "#FFE3D6",
  ocean: "#1C7C9C",
  success: "#2FA86C",
  warning: "#F5B942",
  danger: "#E0563E",
  glimmer: "rgba(255, 255, 255, 0.55)",
};

export const GRADIENTS = {
  sunset: ["#FFB25C", "#FF8A5C", "#FF6636"] as const,
  ocean: ["#3FB6D3", "#1C7C9C"] as const,
  primaryButton: ["#FF8A5C", "#FF6636"] as const,
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
    shadowColor: "#FF6636",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  header: {
    shadowColor: "#FF6636",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
};
