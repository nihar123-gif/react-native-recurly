import React, { useState } from "react";
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
import Illustration from "@/components/ui/Illustration";
import { theme } from "@/constants/theme";

const features = [
  {
    icon: "search-outline" as const,
    title: "Portfolio Discovery",
    description:
      "Connect and catalog all your active subscriptions and recurring bills.",
    color: theme.colors.primary,
    bgColor: theme.colors.primaryLight,
  },
  {
    icon: "flash-outline" as const,
    title: "Predictive Run-Rate",
    description:
      "Accurate monthly outflow tracking and annual spend projections.",
    color: theme.colors.warning,
    bgColor: theme.colors.warningBg,
  },
  {
    icon: "notifications-outline" as const,
    title: "Proactive Alerts",
    description:
      "Smart reminders sent 48 hours before any auto-renewal charges.",
    color: theme.colors.secondary,
    bgColor: theme.colors.secondaryLight,
  },
  {
    icon: "trending-down-outline" as const,
    title: "Expense Control",
    description:
      "Spot unused plans, cancel forgotten trials, and optimize spend.",
    color: theme.colors.success,
    bgColor: theme.colors.successBg,
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const goToAuthChoice = () => {
    router.push("/auth-choice");
  };

  const goToSignIn = () => {
    router.push("/(auth)/sign-in");
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            {/* Back Button */}
            {step === 1 && (
              <Pressable
                style={styles.backButton}
                onPress={() => setStep(0)}
                accessibilityLabel="Back"
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color={theme.colors.text}
                />
              </Pressable>
            )}

            {/* Brand Header */}
            <View style={styles.brand}>
              <View style={styles.brandMark}>
                <Ionicons name="layers" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.brandText}>recurly</Text>
            </View>

            {/* STEP 0 */}
            {step === 0 ? (
              <View style={styles.stepContainer}>
                {/* Illustration */}
                <View style={styles.artworkWrap}>
                  <Illustration
                    name="onboarding-track"
                    width={260}
                    height={210}
                  />
                </View>

                {/* Copy Block */}
                <View style={styles.copyBlock}>
                  <Text style={styles.eyebrow}>
                    SUBSCRIPTION INTELLIGENCE
                  </Text>
                  <Text style={styles.heroTitle}>
                    Master Your{"\n"}Subscriptions
                  </Text>
                  <Text style={styles.description}>
                    The smart, effortless way to track recurring bills, forecast
                    renewals, and eliminate wasteful spend.
                  </Text>
                </View>

                {/* Primary CTA */}
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => setStep(1)}
                >
                  <Text style={styles.primaryButtonText}>Get Started</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </Pressable>

                {/* Sign In Link */}
                <View style={styles.signInRow}>
                  <Text style={styles.mutedText}>Already using Recurly?</Text>
                  <Pressable onPress={goToSignIn} hitSlop={8}>
                    <Text style={styles.linkText}>Sign In</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              /* STEP 1 */
              <View style={styles.stepContainer}>
                {/* Copy Block */}
                <View style={styles.copyBlock}>
                  <Text style={styles.eyebrow}>FINANCIAL CLARITY</Text>
                  <Text style={styles.pageTitle}>
                    Take Control of{"\n"}Your Outflow
                  </Text>
                  <Text style={styles.description}>
                    Everything you need to manage your personal and business
                    subscriptions in one place.
                  </Text>
                </View>

                {/* Features List */}
                <View style={styles.featureList}>
                  {features.map((feature) => (
                    <View key={feature.title} style={styles.featureCard}>
                      <View
                        style={[
                          styles.featureIcon,
                          { backgroundColor: feature.bgColor },
                        ]}
                      >
                        <Ionicons
                          name={feature.icon}
                          size={20}
                          color={feature.color}
                        />
                      </View>
                      <View style={styles.featureText}>
                        <Text style={styles.featureTitle}>
                          {feature.title}
                        </Text>
                        <Text style={styles.featureDescription}>
                          {feature.description}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Footer Controls */}
                <View style={styles.footerWrap}>
                  {/* Step Progress Indicators */}
                  <View style={styles.progressRow}>
                    <View style={styles.progressActive} />
                    <View style={styles.progressInactive} />
                  </View>

                  <Pressable
                    style={styles.primaryButton}
                    onPress={goToAuthChoice}
                  >
                    <Text style={styles.primaryButtonText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            )}
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: Platform.OS === "web" ? "center" : undefined,
  },
  contentContainer: {
    width: "100%",
    maxWidth: 480,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    alignSelf: "flex-start",
    ...theme.shadows.subtle,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 20,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: -0.4,
  },

  stepContainer: {
    width: "100%",
  },

  artworkWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },

  copyBlock: {
    marginBottom: 24,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: theme.colors.primary,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
    letterSpacing: -0.6,
    color: theme.colors.text,
    marginBottom: 10,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 32,
    letterSpacing: -0.5,
    color: theme.colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14.5,
    lineHeight: 21,
    color: theme.colors.textSecondary,
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

  signInRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 18,
  },
  mutedText: {
    fontSize: 13.5,
    color: theme.colors.textSecondary,
  },
  linkText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: theme.colors.primary,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },

  // FEATURES
  featureList: {
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12.5,
    color: theme.colors.textSecondary,
    lineHeight: 17,
  },

  footerWrap: {
    gap: 16,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  progressActive: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  progressInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.inputBorder,
  },
});