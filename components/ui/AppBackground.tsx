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
      {/* SOLID EXECUTIVE DARK CANVAS WITH RICH DEPTH GRADIENT */}
      <LinearGradient
        colors={["#080E1A", "#060A12", "#030509"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* SUBTLE EMERALD AMBIENT AURA - TOP RIGHT */}
      <View style={styles.topEmeraldAura} pointerEvents="none" />

      {/* SUBTLE INDIGO/SAPPHIRE AMBIENT AURA - BOTTOM LEFT */}
      <View style={styles.bottomSapphireAura} pointerEvents="none" />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050811",
  },
  topEmeraldAura: {
    position: "absolute",
    top: -160,
    right: -100,
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: "#10B981",
    opacity: 0.08,
  },
  bottomSapphireAura: {
    position: "absolute",
    bottom: -160,
    left: -120,
    width: 650,
    height: 650,
    borderRadius: 325,
    backgroundColor: "#3B82F6",
    opacity: 0.06,
  },
});
