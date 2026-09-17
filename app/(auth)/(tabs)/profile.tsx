import React, { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import AppBackground from "@/components/ui/AppBackground";
import { getSession, signOut } from "@/lib/auth";
import {
  getMetrics,
  getSubscriptions,
  resetSubscriptionsToDefault,
  Subscription,
} from "@/lib/subscriptions";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  const [session, setSession] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const loadProfile = useCallback(async () => {
    const currentSession = await getSession();
    setSession(currentSession);
    const subs = await getSubscriptions();
    setSubscriptions(subs);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const metrics = getMetrics(subscriptions);

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/sign-in");
  };

  const handleResetData = async () => {
    const doReset = async () => {
      await resetSubscriptionsToDefault();
      const updated = await getSubscriptions();
      setSubscriptions(updated);
      if (Platform.OS === "web") {
        window.alert("Sample subscriptions restored successfully.");
      } else {
        Alert.alert("Success", "Sample subscriptions restored successfully.");
      }
    };

    if (Platform.OS === "web") {
      if (
        window.confirm(
          "Reset all subscriptions back to the realistic default sample pack?"
        )
      ) {
        doReset();
      }
    } else {
      Alert.alert(
        "Reset Subscriptions",
        "Restore all subscriptions back to the default sample pack?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Reset", style: "destructive", onPress: doReset },
        ]
      );
    }
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isWeb && styles.webScrollContent,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.container, isWeb && styles.webContainer]}>
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.headerEyebrow}>ACCOUNT OVERVIEW</Text>
              <Text style={styles.headerTitle}>Profile & System</Text>
            </View>

            {/* USER AVATAR & IDENTITY */}
            <View style={styles.userCard}>
              <View style={styles.avatarRing}>
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarText}>
                    {session?.name ? session.name.charAt(0).toUpperCase() : "U"}
                  </Text>
                </View>
              </View>

              <Text style={styles.userName}>{session?.name || "Subscriber"}</Text>
              <Text style={styles.userEmail}>
                {session?.email || "subscriber@recurly.app"}
              </Text>

              <View style={styles.planTierBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                <Text style={styles.planTierText}>RECURLY BLACK MEMBER</Text>
              </View>
            </View>

            {/* STATS STRIP */}
            <View style={styles.statsStrip}>
              <View style={styles.statCol}>
                <Text style={styles.statNum}>{metrics.activeCount}</Text>
                <Text style={styles.statLabel}>Active Plans</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text style={styles.statNum}>
                  ${metrics.totalMonthly.toFixed(0)}
                </Text>
                <Text style={styles.statLabel}>Monthly Outflow</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text style={styles.statNum}>
                  ${metrics.totalAnnual.toFixed(0)}
                </Text>
                <Text style={styles.statLabel}>Annual Projected</Text>
              </View>
            </View>

            {/* PREFERENCES SECTION */}
            <View style={styles.menuCard}>
              <Text style={styles.menuSectionHeader}>APP PREFERENCES</Text>

              <View style={styles.menuRow}>
                <View style={styles.menuRowLeft}>
                  <View style={styles.menuIcon}>
                    <Ionicons name="cash-outline" size={18} color="#10B981" />
                  </View>
                  <Text style={styles.menuRowText}>Default Currency</Text>
                </View>
                <Text style={styles.menuRowValue}>USD ($)</Text>
              </View>

              <View style={styles.menuRow}>
                <View style={styles.menuRowLeft}>
                  <View style={styles.menuIcon}>
                    <Ionicons
                      name="notifications-outline"
                      size={18}
                      color="#10B981"
                    />
                  </View>
                  <Text style={styles.menuRowText}>Push Notifications</Text>
                </View>
                <Text style={styles.menuRowValue}>Active (48h prior)</Text>
              </View>

              <View style={[styles.menuRow, { borderBottomWidth: 0 }]}>
                <View style={styles.menuRowLeft}>
                  <View style={styles.menuIcon}>
                    <Ionicons name="color-palette-outline" size={18} color="#10B981" />
                  </View>
                  <Text style={styles.menuRowText}>Theme</Text>
                </View>
                <Text style={styles.menuRowValue}>Obsidian Emerald</Text>
              </View>
            </View>

            {/* DATA MANAGEMENT */}
            <View style={styles.menuCard}>
              <Text style={styles.menuSectionHeader}>DATA & BACKUP</Text>

              <Pressable style={styles.menuRow} onPress={handleResetData}>
                <View style={styles.menuRowLeft}>
                  <View
                    style={[
                      styles.menuIcon,
                      { backgroundColor: "#151F30" },
                    ]}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={18}
                      color="#60A5FA"
                    />
                  </View>
                  <Text style={styles.menuRowText}>
                    Restore Sample Subscriptions
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#64748B" />
              </Pressable>

              <View style={[styles.menuRow, { borderBottomWidth: 0 }]}>
                <View style={styles.menuRowLeft}>
                  <View
                    style={[
                      styles.menuIcon,
                      { backgroundColor: "#081D14" },
                    ]}
                  >
                    <Ionicons
                      name="cloud-done-outline"
                      size={18}
                      color="#10B981"
                    />
                  </View>
                  <Text style={styles.menuRowText}>Storage Status</Text>
                </View>
                <Text style={styles.menuRowValue}>Local & Offline</Text>
              </View>
            </View>

            {/* LOGOUT BUTTON */}
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#FB7185" />
              <Text style={styles.logoutButtonText}>Sign Out of Recurly</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "transparent" },
  scrollContent: { flexGrow: 1, paddingBottom: 50 },
  webScrollContent: { alignItems: "center" },
  container: { width: "100%", paddingHorizontal: 20, paddingTop: 16 },
  webContainer: { maxWidth: 680, paddingTop: 28 },
  header: { marginBottom: 20 },
  headerEyebrow: {
    color: "#34D399",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    color: "#F8FAFC",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  userCard: {
    backgroundColor: "rgba(18, 28, 46, 0.7)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  avatarRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#081D14",
    borderWidth: 2,
    borderColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0F3224",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  userName: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
  },
  userEmail: {
    color: "#94A3B8",
    fontSize: 13,
    marginBottom: 14,
  },
  planTierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#081D14",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0F462E",
  },
  planTierText: {
    color: "#34D399",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  statsStrip: {
    flexDirection: "row",
    backgroundColor: "rgba(18, 28, 46, 0.75)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 16,
    marginBottom: 18,
    alignItems: "center",
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statNum: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 2,
  },
  statLabel: {
    color: "#64748B",
    fontSize: 11,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#1E2533",
  },
  menuCard: {
    backgroundColor: "rgba(18, 28, 46, 0.7)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  menuSectionHeader: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 12,
    paddingTop: 4,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#161D2A",
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#081D14",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuRowText: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "700",
  },
  menuRowValue: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(28, 17, 23, 0.85)",
    borderWidth: 1,
    borderColor: "#3D1A28",
    borderRadius: 16,
    height: 54,
    marginTop: 6,
  },
  logoutButtonText: {
    color: "#FB7185",
    fontSize: 15,
    fontWeight: "800",
  },
});
