import "@/global.css";

import React, { useState } from "react";
import {
  ActivityIndicator,
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

import AppBackground from "@/components/ui/AppBackground";
import Badge from "@/components/ui/Badge";
import { theme } from "@/constants/theme";
import { signInUser } from "@/lib/auth";

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
  const [focusedInput, setFocusedInput] = useState<
    "email" | "password" | null
  >(null);

  const handleSignIn = async () => {
    if (isSubmitting) return;

    if (!email.trim()) {
      showAlert("Required", "Please enter your email address.");
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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.centerContainer}>
              {/* TOP NAVIGATION ROW */}
              <View style={styles.topNavRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.backButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => {
                    if (router.canGoBack()) {
                      router.back();
                    } else {
                      router.replace("/auth-choice");
                    }
                  }}
                  accessibilityLabel="Go back"
                >
                  <Ionicons
                    name="arrow-back"
                    size={18}
                    color={theme.colors.text}
                  />
                  <Text style={styles.backText}>Back</Text>
                </Pressable>

                <Badge label="256-Bit SSL" variant="primary" dot />
              </View>

              {/* CENTERED SAAS CARD */}
              <View style={styles.card}>
                {/* BRAND HEADER */}
                <View style={styles.header}>
                  <View style={styles.logoBadge}>
                    <Ionicons name="layers" size={26} color="#FFFFFF" />
                  </View>

                  <Badge label="RECURLY ACCESS" variant="primary" />

                  <Text style={styles.title}>Welcome Back</Text>
                  <Text style={styles.subtitle}>
                    Sign in to manage your subscription portfolio
                  </Text>
                </View>

                {/* EMAIL INPUT */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === "email" && styles.inputWrapperFocused,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={
                        focusedInput === "email"
                          ? theme.colors.primary
                          : theme.colors.textMuted
                      }
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="alex@example.com"
                      placeholderTextColor={theme.colors.inputPlaceholder}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => setFocusedInput("email")}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>

                {/* PASSWORD INPUT */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>PASSWORD</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === "password" &&
                        styles.inputWrapperFocused,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={
                        focusedInput === "password"
                          ? theme.colors.primary
                          : theme.colors.textMuted
                      }
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor={theme.colors.inputPlaceholder}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => setFocusedInput(null)}
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                    >
                      <Ionicons
                        name={
                          showPassword
                            ? "eye-outline"
                            : "eye-off-outline"
                        }
                        size={18}
                        color={theme.colors.textMuted}
                      />
                    </Pressable>
                  </View>
                </View>

                {/* PRIMARY SIGN IN BUTTON */}
                <Pressable
                  style={({ pressed }) => [
                    styles.submitButton,
                    isSubmitting && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleSignIn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Sign In</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color="#FFFFFF"
                      />
                    </>
                  )}
                </Pressable>

                {/* SIGN UP SWITCH ROW */}
                <View style={styles.signupContainer}>
                  <Text style={styles.accountText}>
                    Don't have an account?
                  </Text>
                  <Pressable onPress={() => router.push("/(auth)/sign-up")}>
                    <Text style={styles.signupText}>Create Account</Text>
                  </Pressable>
                </View>

                {/* FOOTNOTE */}
                <View style={styles.footerNote}>
                  <Ionicons
                    name="lock-closed"
                    size={12}
                    color={theme.colors.textMuted}
                  />
                  <Text style={styles.footerNoteText}>
                    Bank-grade 256-bit encryption • Offline-first storage
                  </Text>
                </View>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  centerContainer: {
    width: "100%",
    maxWidth: 440,
  },
  topNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  backText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
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
    marginBottom: 24,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    ...theme.shadows.subtle,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: theme.colors.text,
    marginTop: 10,
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13.5,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 290,
  },

  // INPUTS
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.text,
    letterSpacing: 0.4,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  inputWrapper: {
    height: 48,
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.borderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
    ...(Platform.OS === "web"
      ? ({ transition: "border-color 0.15s ease, box-shadow 0.15s ease" } as any)
      : {}),
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primary,
    ...(Platform.OS === "web"
      ? ({
          boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.12)",
        } as any)
      : {}),
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    height: "100%",
  },
  eyeBtn: {
    padding: 6,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },

  // SUBMIT
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    marginTop: 8,
    ...theme.shadows.subtle,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
  },

  // SWITCH
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 6,
  },
  accountText: {
    color: theme.colors.textSecondary,
    fontSize: 13.5,
  },
  signupText: {
    color: theme.colors.primary,
    fontSize: 13.5,
    fontWeight: "700",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },

  // FOOTER
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
    color: theme.colors.textMuted,
    fontWeight: "500",
  },
});
