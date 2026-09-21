import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { theme } from "@/constants/theme";

export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "neutral"
  | "primary";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  dot?: boolean;
}

export default function Badge({
  label,
  variant = "neutral",
  style,
  dot = false,
}: BadgeProps) {
  const variantStyles = styles[variant];

  return (
    <View style={[styles.badge, variantStyles.container, style]}>
      {dot && <View style={[styles.dot, variantStyles.dot]} />}
      <Text style={[styles.text, variantStyles.text]}>{label}</Text>
    </View>
  );
}

const styles = {
  badge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.2,
  },
  success: StyleSheet.create({
    container: {
      backgroundColor: theme.colors.successBg,
      borderWidth: 1,
      borderColor: theme.colors.successBorder,
    },
    dot: {
      backgroundColor: theme.colors.success,
    },
    text: {
      color: theme.colors.successText,
    },
  }),
  warning: StyleSheet.create({
    container: {
      backgroundColor: theme.colors.warningBg,
      borderWidth: 1,
      borderColor: theme.colors.warningBorder,
    },
    dot: {
      backgroundColor: theme.colors.warning,
    },
    text: {
      color: theme.colors.warningText,
    },
  }),
  error: StyleSheet.create({
    container: {
      backgroundColor: theme.colors.errorBg,
      borderWidth: 1,
      borderColor: theme.colors.errorBorder,
    },
    dot: {
      backgroundColor: theme.colors.error,
    },
    text: {
      color: theme.colors.errorText,
    },
  }),
  neutral: StyleSheet.create({
    container: {
      backgroundColor: theme.colors.backgroundAlt,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
    dot: {
      backgroundColor: theme.colors.textMuted,
    },
    text: {
      color: theme.colors.textSecondary,
    },
  }),
  primary: StyleSheet.create({
    container: {
      backgroundColor: theme.colors.primaryLight,
      borderWidth: 1,
      borderColor: theme.colors.primaryBorder,
    },
    dot: {
      backgroundColor: theme.colors.primary,
    },
    text: {
      color: theme.colors.primary,
    },
  }),
};
