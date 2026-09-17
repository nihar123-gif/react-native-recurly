import AppBackground from "@/components/ui/AppBackground";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function AuthChoice() {
  const router = useRouter();

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>

          <View style={styles.content}>
            <View style={styles.logoMark}>
              <Ionicons name="layers" size={34} color="#000000" />
            </View>
            <Text style={styles.brandBadge}>RECURLY OS</Text>
            <Text style={styles.title}>Subscription{`\n`}Management</Text>
            <Text style={styles.subtitle}>
              Track, optimize, and organize all your recurring bills in one place.
            </Text>

            <View style={styles.actions}>
              <ChoiceButton
                label="Sign In"
                icon="log-in-outline"
                onPress={() => router.push("/(auth)/sign-in")}
                primary
              />
              <ChoiceButton
                label="Create Account"
                icon="person-add-outline"
                onPress={() => router.push("/(auth)/sign-up")}
              />
            </View>
          </View>

          <View style={styles.footerRow}>
            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
            <Text style={styles.footerText}>
              Bank-grade security • Local storage privacy
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}

function ChoiceButton({
  label,
  icon,
  onPress,
  primary = false,
}: {
  label: string;
  icon: "log-in-outline" | "person-add-outline";
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceButton,
        primary ? styles.primaryButton : styles.secondaryButton,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={22}
        color={primary ? "#000000" : "#10B981"}
      />
      <Text style={[styles.buttonText, primary && styles.primaryButtonText]}>
        {label}
      </Text>
      <Ionicons
        name="arrow-forward"
        size={20}
        color={primary ? "#000000" : "#94A3B8"}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
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
  },
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
  logoMark: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  brandBadge: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.6,
  },
  subtitle: {
    color: "#CBD5E1",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 12,
    maxWidth: 320,
  },
  actions: { width: "100%", gap: 14, marginTop: 40 },
  choiceButton: {
    height: 58,
    borderRadius: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  primaryButton: {
    backgroundColor: "#10B981",
  },
  secondaryButton: {
    backgroundColor: "#131B2C",
    borderWidth: 1,
    borderColor: "#26354D",
  },
  buttonText: { flex: 1, color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  primaryButtonText: { color: "#000000" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  footerText: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
});