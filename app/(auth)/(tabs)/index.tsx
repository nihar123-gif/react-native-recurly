import "@/global.css";

import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";

import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function App() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isWeb = width > 600;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isWeb && styles.webScrollContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.container,
            isWeb && styles.webContainer,
          ]}
        >
          {/* =====================================
              LOGO
          ====================================== */}
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Ionicons
                name="card-outline"
                size={48}
                color="#14B8A6"
              />
            </View>
          </View>

          {/* =====================================
              TITLE
          ====================================== */}
          <Text style={styles.title}>
            Welcome to Recurly
          </Text>

          <Text style={styles.subtitle}>
            Manage all your subscriptions in one place
          </Text>

          {/* =====================================
              AUTH BUTTONS
          ====================================== */}

          <View style={styles.buttonGroup}>

            {/* Onboarding */}
            <Pressable
              onPress={() => router.push("/onboarding")}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressedButton,
              ]}
            >
              <View style={styles.buttonIconPrimary}>
                <Ionicons
                  name="rocket-outline"
                  size={22}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.buttonTextContainer}>
                <Text style={styles.primaryButtonTitle}>
                  Get Started
                </Text>

                <Text style={styles.primaryButtonSubtitle}>
                  Start managing subscriptions
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={22}
                color="#FFFFFF"
              />
            </Pressable>

            {/* Sign In */}
            <Pressable
              onPress={() => router.push("/(auth)/sign-in")}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressedButton,
              ]}
            >
              <View style={styles.buttonIcon}>
                <Ionicons
                  name="log-in-outline"
                  size={23}
                  color="#14B8A6"
                />
              </View>

              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>
                  Sign In
                </Text>

                <Text style={styles.buttonSubtitle}>
                  Login to your account
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={22}
                color="#64748B"
              />
            </Pressable>

            {/* Sign Up */}
            <Pressable
              onPress={() => router.push("/(auth)/sign-up")}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressedButton,
              ]}
            >
              <View style={styles.buttonIcon}>
                <Ionicons
                  name="person-add-outline"
                  size={23}
                  color="#14B8A6"
                />
              </View>

              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>
                  Create Account
                </Text>

                <Text style={styles.buttonSubtitle}>
                  Create your new account
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={22}
                color="#64748B"
              />
            </Pressable>

          </View>

          {/* =====================================
              SUBSCRIPTIONS HEADER
          ====================================== */}

          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons
                name="repeat-outline"
                size={18}
                color="#14B8A6"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Subscriptions
              </Text>

              <Text style={styles.sectionSubtitle}>
                Explore your subscription services
              </Text>
            </View>
          </View>

          {/* =====================================
              SPOTIFY
          ====================================== */}

          <Pressable
            onPress={() =>
              router.push("/subscription/spotify")
            }
            style={({ pressed }) => [
              styles.subscriptionCard,
              pressed && styles.pressedButton,
            ]}
          >
            <View style={styles.subscriptionIcon}>
              <Ionicons
                name="musical-notes-outline"
                size={28}
                color="#14B8A6"
              />
            </View>

            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionTitle}>
                Spotify
              </Text>

              <Text style={styles.subscriptionDescription}>
                Music & podcasts
              </Text>
            </View>

            <View style={styles.arrowContainer}>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#64748B"
              />
            </View>
          </Pressable>

          {/* =====================================
              NETFLIX
          ====================================== */}

          <Pressable
            onPress={() =>
              router.push("/subscription/netflix")
            }
            style={({ pressed }) => [
              styles.subscriptionCard,
              pressed && styles.pressedButton,
            ]}
          >
            <View style={styles.subscriptionIcon}>
              <Ionicons
                name="tv-outline"
                size={28}
                color="#14B8A6"
              />
            </View>

            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionTitle}>
                Netflix
              </Text>

              <Text style={styles.subscriptionDescription}>
                Movies & TV shows
              </Text>
            </View>

            <View style={styles.arrowContainer}>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#64748B"
              />
            </View>
          </Pressable>

          {/* =====================================
              DYNAMIC SUBSCRIPTION
          ====================================== */}

          <Pressable
            onPress={() =>
              router.push({
                pathname: "/subscription/[id]",
                params: {
                  id: "1",
                },
              })
            }
            style={({ pressed }) => [
              styles.subscriptionCard,
              pressed && styles.pressedButton,
            ]}
          >
            <View style={styles.subscriptionIcon}>
              <Ionicons
                name="card-outline"
                size={28}
                color="#14B8A6"
              />
            </View>

            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionTitle}>
                Subscription Details
              </Text>

              <Text style={styles.subscriptionDescription}>
                View your subscription
              </Text>
            </View>

            <View style={styles.arrowContainer}>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#64748B"
              />
            </View>
          </Pressable>

          {/* =====================================
              FOOTER
          ====================================== */}

          <View style={styles.footer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color="#64748B"
            />

            <Text style={styles.footerText}>
              Secure subscription management
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  /* =====================================
     SCREEN
  ====================================== */

  safeArea: {
    flex: 1,
    backgroundColor: "#0B1220",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 110,
  },

  webScrollContent: {
    alignItems: "center",
  },

  container: {
    width: "100%",
    maxWidth: 520,
    paddingHorizontal: 22,
    paddingTop: 35,
    paddingBottom: 40,
  },

  webContainer: {
    paddingTop: 45,
  },

  /* =====================================
     LOGO
  ====================================== */

  logoOuter: {
    alignSelf: "center",

    width: 92,
    height: 92,

    borderRadius: 28,

    backgroundColor: "#102A2B",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 22,

    borderWidth: 1,
    borderColor: "#164E4A",
  },

  logoInner: {
    width: 68,
    height: 68,

    borderRadius: 21,

    backgroundColor: "#123C3A",

    alignItems: "center",
    justifyContent: "center",
  },

  /* =====================================
     TITLE
  ====================================== */

  title: {
    fontSize: 30,
    fontWeight: "800",

    color: "#FFFFFF",

    textAlign: "center",

    letterSpacing: -0.5,

    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,

    color: "#94A3B8",

    textAlign: "center",

    lineHeight: 22,

    marginBottom: 30,

    paddingHorizontal: 20,
  },

  /* =====================================
     BUTTON GROUP
  ====================================== */

  buttonGroup: {
    width: "100%",
  },

  /* =====================================
     PRIMARY BUTTON
  ====================================== */

  primaryButton: {
    width: "100%",
    minHeight: 68,

    backgroundColor: "#14B8A6",

    borderRadius: 18,

    paddingHorizontal: 16,

    flexDirection: "row",
    alignItems: "center",

    marginBottom: 12,

    shadowColor: "#14B8A6",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,

    elevation: 5,
  },

  buttonIconPrimary: {
    width: 44,
    height: 44,

    borderRadius: 14,

    backgroundColor: "rgba(255,255,255,0.16)",

    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonTitle: {
    fontSize: 16,
    fontWeight: "700",

    color: "#FFFFFF",

    marginBottom: 3,
  },

  primaryButtonSubtitle: {
    fontSize: 12,

    color: "#D9FFFA",
  },

  /* =====================================
     SECONDARY BUTTON
  ====================================== */

  secondaryButton: {
    width: "100%",
    minHeight: 68,

    backgroundColor: "#111C2E",

    borderRadius: 18,

    borderWidth: 1,
    borderColor: "#263449",

    paddingHorizontal: 16,

    flexDirection: "row",
    alignItems: "center",

    marginBottom: 12,
  },

  buttonIcon: {
    width: 44,
    height: 44,

    borderRadius: 14,

    backgroundColor: "#102A2B",

    alignItems: "center",
    justifyContent: "center",
  },

  buttonTextContainer: {
    flex: 1,

    marginLeft: 13,
  },

  buttonTitle: {
    fontSize: 15,

    fontWeight: "700",

    color: "#F8FAFC",

    marginBottom: 3,
  },

  buttonSubtitle: {
    fontSize: 12,

    color: "#64748B",
  },

  /* =====================================
     SECTION
  ====================================== */

  sectionHeader: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    marginTop: 18,
    marginBottom: 12,
  },

  sectionIcon: {
    width: 40,
    height: 40,

    borderRadius: 13,

    backgroundColor: "#102A2B",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 11,
  },

  sectionTitle: {
    fontSize: 17,

    fontWeight: "700",

    color: "#F8FAFC",
  },

  sectionSubtitle: {
    fontSize: 12,

    color: "#64748B",

    marginTop: 2,
  },

  /* =====================================
     SUBSCRIPTION CARD
  ====================================== */

  subscriptionCard: {
    width: "100%",

    minHeight: 82,

    backgroundColor: "#111C2E",

    borderRadius: 20,

    borderWidth: 1,
    borderColor: "#263449",

    paddingHorizontal: 14,

    flexDirection: "row",
    alignItems: "center",

    marginBottom: 12,
  },

  subscriptionIcon: {
    width: 52,
    height: 52,

    borderRadius: 16,

    backgroundColor: "#102A2B",

    borderWidth: 1,
    borderColor: "#164E4A",

    alignItems: "center",
    justifyContent: "center",
  },

  subscriptionInfo: {
    flex: 1,

    marginLeft: 14,
  },

  subscriptionTitle: {
    fontSize: 16,

    fontWeight: "700",

    color: "#F8FAFC",

    marginBottom: 4,
  },

  subscriptionDescription: {
    fontSize: 12,

    color: "#64748B",
  },

  arrowContainer: {
    width: 34,
    height: 34,

    borderRadius: 11,

    backgroundColor: "#172235",

    alignItems: "center",
    justifyContent: "center",
  },

  /* =====================================
     PRESS EFFECT
  ====================================== */

  pressedButton: {
    opacity: 0.72,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  /* =====================================
     FOOTER
  ====================================== */

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginTop: 18,

    gap: 7,
  },

  footerText: {
    fontSize: 12,

    color: "#64748B",
  },
});