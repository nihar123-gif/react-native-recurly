import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { StatusBar } from "expo-status-bar";
import { theme } from "@/constants/theme";

interface AppBackgroundProps extends ViewProps {
  children?: React.ReactNode;
}

export default function AppBackground({
  children,
  style,
  ...props
}: AppBackgroundProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      <StatusBar style="dark" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
