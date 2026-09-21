import { Platform } from "react-native";

export const theme = {
  colors: {
    // Primary Action Palette
    primary: "#2563EB",
    primaryHover: "#1D4ED8",
    primaryLight: "#EFF6FF",
    primaryBorder: "#BFDBFE",

    // Secondary Accents
    secondary: "#3B82F6",
    secondaryLight: "#DBEAFE",

    // Dark Navy (Headers, Navigation, Executive Summary Card)
    darkNavy: "#0F172A",
    darkNavyCard: "#1E293B",
    darkNavyBorder: "#334155",

    // Light Canvas & Cards
    background: "#F8FAFC",
    backgroundAlt: "#F1F5F9",
    card: "#FFFFFF",
    cardHover: "#F8FAFC",
    cardBorder: "#E2E8F0",
    divider: "#F1F5F9",

    // Typography
    text: "#0F172A",
    textSecondary: "#64748B",
    textMuted: "#94A3B8",
    textInverse: "#FFFFFF",

    // Form Inputs
    inputBg: "#FFFFFF",
    inputBorder: "#CBD5E1",
    inputBorderFocused: "#2563EB",
    inputPlaceholder: "#94A3B8",

    // Semantic Status Indicators
    success: "#10B981",
    successBg: "#ECFDF5",
    successBorder: "#A7F3D0",
    successText: "#065F46",

    warning: "#F59E0B",
    warningBg: "#FEF3C7",
    warningBorder: "#FDE68A",
    warningText: "#92400E",

    error: "#EF4444",
    errorBg: "#FEE2E2",
    errorBorder: "#FECACA",
    errorText: "#991B1B",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
  },

  borderRadius: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 14,
    xl: 16,
    xxl: 20,
    full: 9999,
  },

  shadows: {
    none: {
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    subtle: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
      ...(Platform.OS === "web"
        ? ({ boxShadow: "0 1px 3px 0 rgba(15, 23, 42, 0.05)" } as any)
        : {}),
    },
    card: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
      ...(Platform.OS === "web"
        ? ({
            boxShadow:
              "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.06)",
          } as any)
        : {}),
    },
    hover: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      ...(Platform.OS === "web"
        ? ({
            boxShadow:
              "0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.08)",
          } as any)
        : {}),
    },
    modal: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 28,
      elevation: 10,
      ...(Platform.OS === "web"
        ? ({
            boxShadow:
              "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)",
          } as any)
        : {}),
    },
  },

  typography: {
    display: {
      fontSize: 32,
      fontWeight: "900" as const,
      lineHeight: 38,
      letterSpacing: -0.6,
      color: "#0F172A",
    },
    h1: {
      fontSize: 24,
      fontWeight: "800" as const,
      lineHeight: 30,
      letterSpacing: -0.4,
      color: "#0F172A",
    },
    h2: {
      fontSize: 20,
      fontWeight: "700" as const,
      lineHeight: 26,
      letterSpacing: -0.3,
      color: "#0F172A",
    },
    h3: {
      fontSize: 16,
      fontWeight: "700" as const,
      lineHeight: 22,
      letterSpacing: -0.2,
      color: "#0F172A",
    },
    body: {
      fontSize: 14,
      fontWeight: "400" as const,
      lineHeight: 20,
      color: "#0F172A",
    },
    bodyMedium: {
      fontSize: 14,
      fontWeight: "500" as const,
      lineHeight: 20,
      color: "#0F172A",
    },
    bodySemibold: {
      fontSize: 14,
      fontWeight: "600" as const,
      lineHeight: 20,
      color: "#0F172A",
    },
    small: {
      fontSize: 12,
      fontWeight: "500" as const,
      lineHeight: 16,
      color: "#64748B",
    },
    caption: {
      fontSize: 11,
      fontWeight: "700" as const,
      lineHeight: 14,
      letterSpacing: 0.6,
      textTransform: "uppercase" as const,
      color: "#64748B",
    },
    button: {
      fontSize: 14,
      fontWeight: "700" as const,
      lineHeight: 18,
      letterSpacing: -0.1,
    },
  },
};

export default theme;
