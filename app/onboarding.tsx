import AppBackground from "@/components/ui/AppBackground";
import Illustration from "@/components/ui/Illustration";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const features = [
  {
    icon: "search-outline" as const,
    title: "Portfolio Discovery",
    description: "Connect and catalog all your active subscriptions and bills.",
    color: "#10B981",
  },
  {
    icon: "flash-outline" as const,
    title: "Predictive Run-Rate",
    description: "Accurate monthly outflow tracking and annual spend projections.",
    color: "#FBBF24",
  },
  {
    icon: "notifications-outline" as const,
    title: "Proactive Alerts",
    description: "Smart reminders sent 48 hours before any auto-renewal charges.",
    color: "#60A5FA",
  },
  {
    icon: "trending-down-outline" as const,
    title: "Expense Control",
    description: "Spot unused plans, cancel forgotten trials, and optimize spend.",
    color: "#A78BFA",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const goToAuthChoice = () => router.push("/auth-choice");
  const goToSignIn = () => router.push("/(auth)/sign-in");

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <Pressable style={styles.backButton} onPress={() => setStep(0)}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </Pressable>
          )}

          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Ionicons name="layers" size={20} color="#000000" />
            </View>
            <Text style={styles.brandText}>recurly</Text>
          </View>

          {step === 0 ? (
            <View style={styles.firstStep}>
              <View style={styles.artworkWrap}>
                <Illustration name="onboarding-track" width={280} height={230} />
              </View>

              <View style={styles.copyBlock}>
                <Text style={styles.eyebrow}>SUBSCRIPTION INTELLIGENCE</Text>
                <Text style={styles.heroTitle}>Master Your{`\n`}Subscriptions</Text>
                <Text style={styles.description}>
                  The smart, effortless way to track your recurring bills, forecast renewals, and eliminate wasteful spending.
                </Text>
              </View>

              <PrimaryButton label="Get Started" onPress={() => setStep(1)} />

              <View style={styles.signInRow}>
                <Text style={styles.mutedText}>Already using Recurly?</Text>
                <Pressable onPress={goToSignIn} hitSlop={8}>
                  <Text style={styles.linkText}>Sign In</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.secondStep}>
              <View style={styles.copyBlock}>
                <Text style={styles.eyebrow}>FINANCIAL CLARITY</Text>
                <Text style={styles.pageTitle}>Take Control of{`\n`}Your Outflow</Text>
                <Text style={styles.description}>
                  Everything you need to manage your personal and business subscriptions in one place.
                </Text>
              </View>

              <View style={styles.featureList}>
                {features.map((feature) => (
                  <View key={feature.title} style={styles.featureCard}>
                    <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                      <Ionicons name={feature.icon} size={22} color="#000000" />
                    </View>
                    <View style={styles.featureCopy}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.footer}>
                <View style={styles.progress}>
                  <View style={styles.progressActive} />
                  <View style={styles.progressInactive} />
                </View>
                <PrimaryButton label="Continue" onPress={goToAuthChoice} />
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
      <Ionicons name="arrow-forward" size={20} color="#000000" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#131B2C",
    borderWidth: 1,
    borderColor: "#26354D",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 26 },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  firstStep: { flex: 1, justifyContent: "space-between" },
  secondStep: { flex: 1 },
  artworkWrap: {
    height: 240,
    borderRadius: 24,
    backgroundColor: "#131B2C",
    borderWidth: 1,
    borderColor: "#26354D",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 28,
  },
  copyBlock: { marginBottom: 24 },
  eyebrow: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.6,
    marginBottom: 10,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  pageTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  description: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
  },
  primaryButton: {
    height: 58,
    borderRadius: 16,
    backgroundColor: "#10B981",
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  primaryButtonText: { color: "#000000", fontSize: 16, fontWeight: "800" },
  signInRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  mutedText: { color: "#94A3B8", fontSize: 14, fontWeight: "500" },
  linkText: { color: "#10B981", fontSize: 14, fontWeight: "800" },
  featureList: { gap: 12, marginBottom: 26 },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131B2C",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#26354D",
    padding: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  featureCopy: { flex: 1 },
  featureTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginBottom: 3 },
  featureDescription: { color: "#CBD5E1", fontSize: 13, lineHeight: 18 },
  footer: { marginTop: "auto" },
  progress: {
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginBottom: 20,
  },
  progressActive: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  progressInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#26354D",
  },
});