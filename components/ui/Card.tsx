import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { theme } from "@/constants/theme";

interface CardProps extends ViewProps {
  children?: React.ReactNode;
  variant?: "default" | "muted" | "dark";
}

export default function Card({
  children,
  style,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <View style={[styles.base, styles[variant], style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  default: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.card,
  },
  muted: {
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  dark: {
    backgroundColor: theme.colors.darkNavy,
    borderWidth: 1,
    borderColor: theme.colors.darkNavyBorder,
    ...theme.shadows.card,
  },
});
