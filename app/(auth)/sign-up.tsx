import "@/global.css";

import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AppBackground from "@/components/ui/AppBackground";
import { createUser } from "@/lib/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

const showAlert = (
  title: string,
  message: string,
  buttons?: { text?: string; onPress?: () => void }[]
) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    if (buttons && buttons[0] && buttons[0].onPress) {
      buttons[0].onPress();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

export default function SignUp() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    if (isSubmitting) return;

    if (!name.trim()) {
      showAlert("Required", "Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      showAlert("Required", "Please enter your email.");
      return;
    }

    if (!email.includes("@")) {
      showAlert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!password.trim()) {
      showAlert("Required", "Please enter your password.");
      return;
    }

    if (password.length < 6) {
      showAlert(
        "Weak Password",
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Password Mismatch", "Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createUser({ name, email, password });
      router.replace("/(auth)/(tabs)");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create your account right now.";

      showAlert("Account Creation Failed", message);
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
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
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

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.logoCircle}>
                  <Ionicons name="layers" size={34} color="#000000" />
                </View>

                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>
                  Join Recurly to take control of your subscriptions
                </Text>
              </View>

              {/* Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>FULL NAME</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#94A3B8" />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Alex Rivera"
                    placeholderTextColor="#94A3B8"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>EMAIL ADDRESS</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#94A3B8" />
                  <TextInput
                    style={styles.input}
                    placeholder="alex@example.com"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
                  <TextInput
                    style={styles.input}
                    placeholder="Min. 6 characters"
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

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>CONFIRM PASSWORD</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color="#94A3B8"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Repeat your password"
                    placeholderTextColor="#94A3B8"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <Pressable
                    onPress={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-outline" : "eye-off-outline"
                      }
                      size={20}
                      color="#94A3B8"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Create Account Button */}
              <Pressable
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#000000" />
              </Pressable>

              {/* Sign In Link */}
              <View style={styles.signinContainer}>
                <Text style={styles.accountText}>Already have an account?</Text>
                <Pressable onPress={() => router.push("/(auth)/sign-in")}>
                  <Text style={styles.signinText}>Sign In</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 6,
    padding: 6,
    marginLeft: -6,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
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
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "900",
    color: "#CBD5E1",
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrapper: {
    height: 52,
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
  button: {
    height: 56,
    backgroundColor: "#10B981",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "800",
  },
  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 20,
    gap: 6,
  },
  accountText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  signinText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "800",
  },
});