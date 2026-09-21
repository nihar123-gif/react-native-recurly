import React from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import AppBackground from "@/components/ui/AppBackground";
import Badge from "@/components/ui/Badge";
import { theme } from "@/constants/theme";

export default function AuthChoice() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/onboarding");
    }
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* TOP NAVIGATION BAR AT TOP-LEFT */}
        <View style={styles.topNavRow}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleBack}
            accessibilityLabel="Go back to onboarding"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={theme.colors.text}
            />
          </Pressable>

          <Badge label="256-Bit SSL" variant="primary" dot />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.centerContainer}>
            {/* CENTERED SAAS CARD */}
            <View style={styles.card}>
              {/* BRAND HEADER */}
              <View style={styles.header}>
                <View style={styles.logoBadge}>
                  <Ionicons name="layers" size={28} color="#FFFFFF" />
                </View>

                <Badge label="RECURLY OS" variant="primary" />

                <Text style={styles.title}>Subscription Intelligence</Text>
                <Text style={styles.subtitle}>
                  Track, optimize, and organize all your recurring bills in one
                  secure production dashboard.
                </Text>
              </View>

              {/* ACTION BUTTONS */}
              <View style={styles.actions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => router.push("/(auth)/sign-in")}
                >
                  <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.secondaryButtonPressed,
                  ]}
                  onPress={() => router.push("/(auth)/sign-up")}
                >
                  <View style={styles.secondaryIconBadge}>
                    <Ionicons
                      name="person-add-outline"
                      size={18}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={styles.secondaryButtonText}>Create Account</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={theme.colors.textMuted}
                  />
                </Pressable>
              </View>

              {/* STATS HIGHLIGHT ROW */}
              <View style={styles.statsRow}>
                <View style={styles.statPill}>
                  <Text style={styles.statLabel}>AVG SAVINGS</Text>
                  <Text style={styles.statValue}>$340/yr</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statPill}>
                  <Text style={styles.statLabel}>ALERTS</Text>
                  <Text style={styles.statHighlight}>48h Prior</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statPill}>
                  <Text style={styles.statLabel}>PRIVACY</Text>
                  <Text style={styles.statValue}>Zero-Sale</Text>
                </View>
              </View>

              {/* SECURITY FOOTNOTE */}
              <View style={styles.footerNote}>
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color={theme.colors.primary}
                />
                <Text style={styles.footerNoteText}>
                  Bank-grade 256-bit encryption • Local storage privacy
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    width: "100%",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.subtle,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  centerContainer: {
    width: "100%",
    maxWidth: 440,
  },

  // CARD
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    paddingHorizontal: 28,
    paddingVertical: 32,
    ...theme.shadows.modal,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    ...theme.shadows.subtle,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13.5,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 320,
  },

  // ACTIONS
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.subtle,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    height: 50,
    ...theme.shadows.subtle,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  secondaryButtonPressed: {
    backgroundColor: theme.colors.backgroundAlt,
  },
  secondaryIconBadge: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  secondaryButtonText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14.5,
    fontWeight: "700",
  },

  // STATS ROW
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  statPill: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.text,
  },
  statHighlight: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: theme.colors.cardBorder,
  },

  // FOOTER NOTE
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    marginTop: 20,
    paddingTop: 16,
  },
  footerNoteText: {
    fontSize: 11.5,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
});