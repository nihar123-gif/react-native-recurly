import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
      {/* SOLID EXECUTIVE DARK CANVAS WITH SUBTLE DEPTH GRADIENT */}
      <LinearGradient
        colors={["#0B111E", "#070B14", "#04070D"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080C16",
  },
});
