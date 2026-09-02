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

import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import { createUser } from "@/lib/auth";

// Cross-platform alert: Alert.alert() does not show a dialog on React Native Web,
// so on web we fall back to window.alert() and manually run the onPress callback.
const showAlert = (
  title: string,
  message: string,
  buttons?: { text?: string; onPress?: () => void }[],
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
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    if (isSubmitting) {
      return;
    }

    if (!name.trim()) {
      showAlert("Required", "Please enter your name.");
      return;
    }

    if (!email.trim()) {
      showAlert("Required", "Please enter your email.");
      return;
    }

    if (!email.includes("@")) {
      showAlert(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    if (!password.trim()) {
      showAlert(
        "Required",
        "Please enter your password."
      );
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
      showAlert(
        "Password Mismatch",
        "Passwords do not match."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await createUser({ name, email, password });

      showAlert(
        "Success",
        "Your account has been created.",
        [
          {
            text: "Continue",
            onPress: () =>
              router.replace("/(auth)/sign-in"),
          },
        ]
      );
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>

            {/* Back Button */}
            <Pressable
              style={styles.backButton}
              onPress={() =>
                router.back()
              }
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color="#0F172A"
              />

              <Text style={styles.backText}>
                Back
              </Text>
            </Pressable>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoCircle}>
                <Ionicons
                  name="card-outline"
                  size={40}
                  color="#14B8A6"
                />
              </View>

              <Text style={styles.title}>
                Create Account
              </Text>

              <Text style={styles.subtitle}>
                Create your Recurly account
              </Text>
            </View>

            {/* Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Full Name
              </Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={21}
                  color="#64748B"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Email
              </Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={21}
                  color="#64748B"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
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
              <Text style={styles.label}>
                Password
              </Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={21}
                  color="#64748B"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />

                <Pressable
                  onPress={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-outline"
                        : "eye-off-outline"
                    }
                    size={21}
                    color="#64748B"
                  />
                </Pressable>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Confirm Password
              </Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={21}
                  color="#64748B"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#94A3B8"
                  value={confirmPassword}
                  onChangeText={
                    setConfirmPassword
                  }
                  secureTextEntry={
                    !showConfirmPassword
                  }
                />

                <Pressable
                  onPress={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  <Ionicons
                    name={
                      showConfirmPassword
                        ? "eye-outline"
                        : "eye-off-outline"
                    }
                    size={21}
                    color="#64748B"
                  />
                </Pressable>
              </View>
            </View>

            {/* Create Account */}
            <Pressable
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#FFFFFF"
              />
            </Pressable>

            {/* Sign In */}
            <View style={styles.signinContainer}>
              <Text style={styles.accountText}>
                Already have an account?
              </Text>

              <Pressable
                onPress={() => {
                  router.dismissAll();
                  router.replace("/(auth)/sign-in");
                }}
              >
                <Text style={styles.signinText}>
                  Sign In
                </Text>
              </Pressable>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
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
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  backText: {
    marginLeft: 7,
    fontSize: 15,
    color: "#334155",
    fontWeight: "600",
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  logoCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#CCFBF1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 7,
  },

  subtitle: {
    fontSize: 15,
    color: "#64748B",
  },

  inputContainer: {
    marginBottom: 17,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },

  inputWrapper: {
    height: 54,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    marginLeft: 10,
  },

  button: {
    height: 55,
    backgroundColor: "#14B8A6",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
  },

  accountText: {
    color: "#64748B",
    fontSize: 14,
  },

  signinText: {
    color: "#0F766E",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 5,
  },
});