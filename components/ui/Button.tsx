import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import { theme } from "@/constants/theme";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const isInteractive = !disabled && !loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={!isInteractive}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        pressed && isInteractive && styles[`${variant}Pressed`],
        !isInteractive && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "primary" ? "#FFFFFF" : theme.colors.textSecondary
          }
        />
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          <Text
            style={[
              styles.textBase,
              styles[`${variant}Text`],
              styles[`${size}Text`],
              textStyle,
            ]}
          >
            {label}
          </Text>
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.md,
    gap: 8,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
    ...(Platform.OS === "web" ? ({ cursor: "not-allowed" } as any) : {}),
  },

  // VARIANTS
  primary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.subtle,
  },
  primaryPressed: {
    backgroundColor: theme.colors.primaryHover,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  secondary: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
  },
  secondaryPressed: {
    backgroundColor: theme.colors.backgroundAlt,
    borderColor: theme.colors.inputBorder,
  },
  secondaryText: {
    color: theme.colors.text,
    fontWeight: "700",
  },

  danger: {
    backgroundColor: theme.colors.errorBg,
    borderWidth: 1,
    borderColor: theme.colors.errorBorder,
  },
  dangerPressed: {
    backgroundColor: "#FCA5A5",
  },
  dangerText: {
    color: theme.colors.errorText,
    fontWeight: "700",
  },

  ghost: {
    backgroundColor: "transparent",
  },
  ghostPressed: {
    backgroundColor: theme.colors.backgroundAlt,
  },
  ghostText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },

  // SIZES
  sm: {
    height: 36,
    paddingHorizontal: 12,
  },
  smText: {
    fontSize: 13,
  },
  md: {
    height: 44,
    paddingHorizontal: 16,
  },
  mdText: {
    fontSize: 14,
  },
  lg: {
    height: 50,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.lg,
  },
  lgText: {
    fontSize: 15,
  },

  textBase: {
    letterSpacing: -0.1,
  },
});
