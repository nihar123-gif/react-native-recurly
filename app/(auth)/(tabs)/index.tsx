import { Link } from "expo-router";
import "@/global.css";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Title */}
        <Text style={styles.title}>Welcome to My App</Text>

        <Text style={styles.subtitle}>
          Sign in to continue or create an account
        </Text>

        {/* Onboarding Button */}
        <Link href="/onboarding" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>
              Go to Onboarding
            </Text>
          </Pressable>
        </Link>

        {/* Sign In Button */}
        <Link href="/(auth)/sign-in" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>
              Sign In
            </Text>
          </Pressable>
        </Link>

        {/* Sign Up Button */}
        <Link href="/(auth)/sign-up" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>
              Sign Up
            </Text>
          </Pressable>
        </Link>

        {/* Spotify Subscription */}
        <Link href="/subscription/spotify" asChild>
          <Pressable style={styles.subscriptionButton}>
            <Text style={styles.subscriptionButtonText}>
              Spotify Subscription
            </Text>
          </Pressable>
        </Link>

        {/* Dynamic Subscription */}
        <Link
          href={{
            pathname: "/subscription/[id]",
            params: { id: "123" },
          }}
          asChild
        >
          <Pressable style={styles.subscriptionButton}>
            <Text style={styles.subscriptionButtonText}>
              Subscription 123
            </Text>
          </Pressable>
        </Link>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    marginBottom: 40,
    textAlign: "center",
  },

  /* Main Button */
  primaryButton: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#14b8a6",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  /* Sign In / Sign Up */
  secondaryButton: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 16,
    borderRadius: 999,
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  /* Subscription Buttons */
  subscriptionButton: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 14,
    borderRadius: 999,
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  subscriptionButtonText: {
    color: "#cbd5e1",
    fontSize: 15,
    fontWeight: "500",
  },
});