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
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";

import AppBackground from "@/components/ui/AppBackground";
import Badge from "@/components/ui/Badge";
import { theme } from "@/constants/theme";
import { getSession, setCurrentUserRole, signOut, UserSession } from "@/lib/auth";
import {
  getMetrics,
  getSubscriptions,
  resetSubscriptionsToDefault,
  Subscription,
} from "@/lib/subscriptions";

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  const [session, setSession] = useState<UserSession | null>(null);
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

  const handleToggleRole = async () => {
    const nextRole = session?.role === "admin" ? "user" : "admin";
    await setCurrentUserRole(nextRole);
    await loadProfile();
    if (Platform.OS === "web") {
      window.alert(
        `Role switched to: ${
          nextRole === "admin" ? "App Owner / Admin" : "Regular User"
        }`
      );
    } else {
      Alert.alert(
        "Role Switched",
        `You are now viewing as: ${
          nextRole === "admin" ? "App Owner / Admin" : "Regular User"
        }`
      );
    }
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

  const isAdmin = session?.role === "admin";

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
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarText}>
                  {session?.name ? session.name.charAt(0).toUpperCase() : "U"}
                </Text>
              </View>

              <Text style={styles.userName}>
                {session?.name || "Subscriber Member"}
              </Text>
              <Text style={styles.userEmail}>
                {session?.email || "subscriber@recurly.app"}
              </Text>

              <View style={{ flexDirection: "row", gap: 8, marginTop: 10, alignItems: "center" }}>
                <Badge
                  label={isAdmin ? "APP OWNER / ADMIN" : "SUBSCRIBER"}
                  variant={isAdmin ? "primary" : "neutral"}
                />
                <Badge
                  label="PRO TIER"
                  variant="success"
                />
              </View>
            </View>

            {/* APP OWNER / ADMIN PORTAL CARD */}
            <View style={[styles.adminCard, !isAdmin && styles.adminCardInactive]}>
              <View style={styles.adminCardHeader}>
                <View style={styles.adminBadgeRow}>
                  <View
                    style={[
                      styles.adminBadgeIcon,
                      { backgroundColor: isAdmin ? theme.colors.primary : theme.colors.cardBorder },
                    ]}
                  >
                    <Ionicons
                      name="shield-checkmark"
                      size={16}
                      color={isAdmin ? "#FFFFFF" : theme.colors.textSecondary}
                    />
                  </View>
                  <View>
                    <Text style={styles.adminBadgeEyebrow}>APP OWNER PORTAL</Text>
                    <Text style={styles.adminBadgeTitle}>Plan Catalog Management</Text>
                  </View>
                </View>
                <Badge
                  label={isAdmin ? "ADMIN ACCESS" : "USER VIEW"}
                  variant={isAdmin ? "primary" : "neutral"}
                />
              </View>

              <Text style={styles.adminCardDesc}>
                Create, edit, activate/deactivate, and publish subscription plans to the public catalog for all users.
              </Text>

              <View style={styles.adminActionsRow}>
                {isAdmin && (
                  <Pressable
                    style={styles.adminOpenBtn}
                    onPress={() => router.push("/(auth)/(tabs)/admin" as any)}
                  >
                    <Ionicons name="settings" size={16} color="#FFFFFF" />
                    <Text style={styles.adminOpenBtnText}>Open Plan Management</Text>
                  </Pressable>
                )}

                <Pressable
                  style={[styles.adminToggleRoleBtn, !isAdmin && { flex: 1 }]}
                  onPress={handleToggleRole}
                >
                  <Ionicons
                    name={isAdmin ? "swap-horizontal" : "key-outline"}
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.adminToggleRoleText}>
                    {isAdmin ? "Switch to Regular User Mode" : "Switch to App Owner Mode"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* STATS STRIP */}
            <View style={styles.statsStrip}>
              <View style={styles.statCol}>
                <Text style={styles.statNum}>{metrics.activeCount}</Text>
                <Text style={styles.statLabel}>My Subscriptions</Text>
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
                    <Ionicons
                      name="cash-outline"
                      size={18}
                      color={theme.colors.primary}
                    />
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
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={styles.menuRowText}>Push Notifications</Text>
                </View>
                <Text style={styles.menuRowValue}>Active (48h prior)</Text>
              </View>

              <View style={[styles.menuRow, { borderBottomWidth: 0 }]}>
                <View style={styles.menuRowLeft}>
                  <View style={styles.menuIcon}>
                    <Ionicons
                      name="color-palette-outline"
                      size={18}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={styles.menuRowText}>Theme</Text>
                </View>
                <Text style={styles.menuRowValue}>SaaS Royal Blue</Text>
              </View>
            </View>

            {/* DATA MANAGEMENT */}
            <View style={styles.menuCard}>
              <Text style={styles.menuSectionHeader}>DATA & BACKUP</Text>

              <Pressable
                style={styles.menuRow}
                onPress={handleResetData}
              >
                <View style={styles.menuRowLeft}>
                  <View style={styles.menuIcon}>
                    <Ionicons
                      name="refresh-outline"
                      size={18}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={styles.menuRowText}>
                    Restore Sample Subscriptions
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.textMuted}
                />
              </Pressable>

              <View style={[styles.menuRow, { borderBottomWidth: 0 }]}>
                <View style={styles.menuRowLeft}>
                  <View style={styles.menuIcon}>
                    <Ionicons
                      name="cloud-done-outline"
                      size={18}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={styles.menuRowText}>Storage Status</Text>
                </View>
                <Text style={styles.menuRowValue}>Local & Offline</Text>
              </View>
            </View>

            {/* LOGOUT BUTTON */}
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons
                name="log-out-outline"
                size={18}
                color={theme.colors.error}
              />
              <Text style={styles.logoutButtonText}>Sign Out of Recurly</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 50 },
  webScrollContent: { alignItems: "center" },
  container: { width: "100%", paddingHorizontal: 20, paddingTop: 16 },
  webContainer: { maxWidth: 720, paddingTop: 32, paddingHorizontal: 32 },

  header: { marginBottom: 20 },
  headerEyebrow: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.4,
  },

  // USER CARD
  userCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 16,
    ...theme.shadows.subtle,
  },
  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    ...theme.shadows.subtle,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },
  userName: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  userEmail: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },

  // ADMIN PORTAL CARD
  adminCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.primaryBorder,
    marginBottom: 16,
    ...theme.shadows.subtle,
  },
  adminCardInactive: {
    borderColor: theme.colors.cardBorder,
  },
  adminCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  adminBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  adminBadgeIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  adminBadgeEyebrow: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  adminBadgeTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  adminCardDesc: {
    color: theme.colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 14,
  },
  adminActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },
  adminOpenBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: theme.borderRadius.md,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  adminOpenBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  adminToggleRoleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primaryBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  adminToggleRoleText: {
    color: theme.colors.primary,
    fontSize: 12.5,
    fontWeight: "600",
  },

  // STATS STRIP
  statsStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 16,
    ...theme.shadows.subtle,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statNum: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: theme.colors.cardBorder,
  },

  // MENU CARD
  menuCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 6,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 16,
    ...theme.shadows.subtle,
  },
  menuSectionHeader: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuRowText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  menuRowValue: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },

  // LOGOUT
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.colors.errorBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.errorBorder,
    height: 48,
    marginTop: 4,
    marginBottom: 24,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  logoutButtonText: {
    color: theme.colors.errorText,
    fontSize: 13.5,
    fontWeight: "700",
  },
});
