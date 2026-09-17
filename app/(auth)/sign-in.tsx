import "@/global.css";

import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AppBackground from "@/components/ui/AppBackground";
import { signInUser } from "@/lib/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function SignIn() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (isSubmitting) return;

    if (!email.trim()) {
      showAlert("Required", "Please enter your email.");
      return;
    }

    if (!password.trim()) {
      showAlert("Required", "Please enter your password.");
      return;
    }

    if (!email.includes("@")) {
      showAlert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signInUser({ email, password });
      router.replace("/(auth)/(tabs)");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to sign in right now. Please try again.";

      showAlert("Sign In Failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.container}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              <Text style={styles.backText}>Back</Text>
            </Pressable>

            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="layers" size={36} color="#000000" />
              </View>

              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to manage your subscription portfolio
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#94A3B8" />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#94A3B8"
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={styles.forgotButton}
              onPress={() =>
                showAlert(
                  "Password Recovery",
                  "Password reset link has been simulated for your account."
                )
              }
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            <Pressable
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#000000" />
            </Pressable>

            <View style={styles.signupContainer}>
              <Text style={styles.accountText}>Don't have an account?</Text>
              <Pressable onPress={() => router.push("/(auth)/sign-up")}>
                <Text style={styles.signupText}>Create One</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 6,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#CBD5E1",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: "900",
    color: "#CBD5E1",
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrapper: {
    height: 54,
    backgroundColor: "#131B2C",
    borderWidth: 1,
    borderColor: "#26354D",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotText: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "700",
  },
  button: {
    height: 56,
    backgroundColor: "#10B981",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "800",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 6,
  },
  accountText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  signupText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "800",
  },
});
