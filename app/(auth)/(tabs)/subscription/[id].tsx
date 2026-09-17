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
import CategoryIcon from "@/components/ui/CategoryIcon";
import {
  calculateAnnualEquivalent,
  calculateMonthlyEquivalent,
  deleteSubscription,
  getDaysUntilDue,
  getSubscriptionById,
  Subscription,
  updateSubscription,
} from "@/lib/subscriptions";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

export default function SubscriptionDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSub = useCallback(async () => {
    if (!id) return;
    const item = await getSubscriptionById(id);
    setSub(item);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadSub();
    }, [loadSub])
  );

  const handleToggleReminder = async () => {
    if (!sub) return;
    const updated = await updateSubscription(sub.id, {
      remindMe: !sub.remindMe,
    });
    if (updated) setSub(updated);
  };

  const handleToggleStatus = async () => {
    if (!sub) return;
    const updated = await updateSubscription(sub.id, {
      active: !sub.active,
    });
    if (updated) setSub(updated);
  };

  const handleDelete = () => {
    const doDelete = async () => {
      if (!sub) return;
      await deleteSubscription(sub.id);
      router.replace("/(auth)/(tabs)/subscription");
    };

    if (Platform.OS === "web") {
      if (
        window.confirm(
          `Are you sure you want to remove ${sub?.name || "this subscription"}?`
        )
      ) {
        doDelete();
      }
    } else {
      Alert.alert(
        "Delete Subscription",
        `Are you sure you want to remove ${sub?.name || "this subscription"}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: doDelete,
          },
        ]
      );
    }
  };

  if (loading) {
    return (
      <AppBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Loading details...</Text>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  if (!sub) {
    return (
      <AppBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={56} color="#FB7185" />
            <Text style={styles.notFoundTitle}>Subscription Not Found</Text>
            <Text style={styles.notFoundSubtitle}>
              The requested subscription could not be loaded.
            </Text>
            <Pressable
              style={styles.backButtonCenter}
              onPress={() => router.replace("/(auth)/(tabs)/subscription")}
            >
              <Ionicons name="arrow-back" size={18} color="#000000" />
              <Text style={styles.backButtonCenterText}>Back to List</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  const daysLeft = getDaysUntilDue(sub.nextPaymentDate);
  const monthlyEquiv = calculateMonthlyEquivalent(sub);
  const annualEquiv = calculateAnnualEquivalent(sub);

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
            {/* TOP NAV BAR */}
            <View style={styles.topNav}>
              <Pressable
                style={styles.navButton}
                onPress={() => router.back()}
                accessibilityLabel="Back"
              >
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              </Pressable>

              <Text style={styles.navTitle}>Plan Overview</Text>

              <Pressable
                style={[styles.navButton, styles.deleteNavButton]}
                onPress={handleDelete}
                accessibilityLabel="Delete"
              >
                <Ionicons name="trash-outline" size={20} color="#FB7185" />
              </Pressable>
            </View>

            {/* HERO BADGE CARD */}
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <CategoryIcon category={sub.category} size={64} />
                <View
                  style={[
                    styles.statusBadge,
                    sub.active
                      ? styles.statusBadgeActive
                      : styles.statusBadgePaused,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      sub.active
                        ? styles.statusBadgeTextActive
                        : styles.statusBadgeTextPaused,
                    ]}
                  >
                    {sub.active ? "● ACTIVE" : "○ PAUSED"}
                  </Text>
                </View>
              </View>

              <Text style={styles.heroName}>{sub.name}</Text>
              <Text style={styles.heroCategory}>
                {sub.category.toUpperCase()} • {sub.billingCycle.toUpperCase()}
              </Text>

              <View style={styles.priceContainer}>
                <Text style={styles.heroPrice}>
                  ${sub.price.toFixed(2)}
                  <Text style={styles.heroPriceCycle}> /{sub.billingCycle}</Text>
                </Text>
              </View>

              {sub.billingCycle !== "monthly" && (
                <Text style={styles.equivalentNote}>
                  Equivalent to ${monthlyEquiv.toFixed(2)}/mo ($
                  {annualEquiv.toFixed(2)}/year)
                </Text>
              )}
            </View>

            {/* BILLING SCHEDULE & RENEWAL CARD */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Ionicons name="calendar-outline" size={20} color="#10B981" />
                <Text style={styles.infoCardTitle}>Renewal Schedule</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Next Due Date</Text>
                <View style={styles.dueBadgeRow}>
                  <Text style={styles.infoValue}>{sub.nextPaymentDate}</Text>
                  <View
                    style={[
                      styles.daysTag,
                      daysLeft <= 3 ? styles.daysTagUrgent : styles.daysTagNormal,
                    ]}
                  >
                    <Text
                      style={[
                        styles.daysTagText,
                        daysLeft <= 3 && styles.daysTagTextUrgent,
                      ]}
                    >
                      {daysLeft <= 0
                        ? "Due Today"
                        : daysLeft === 1
                        ? "Tomorrow"
                        : `In ${daysLeft} days`}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Billing Frequency</Text>
                <Text style={styles.infoValueCapitalized}>{sub.billingCycle}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment Method</Text>
                <Text style={styles.infoValue}>{sub.paymentMethod}</Text>
              </View>

              {sub.notes ? (
                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.infoLabel}>Notes</Text>
                  <Text style={styles.infoValueNotes}>{sub.notes}</Text>
                </View>
              ) : null}
            </View>

            {/* NOTIFICATION PREFERENCES */}
            <View style={styles.actionCard}>
              <View style={styles.actionRow}>
                <View style={styles.actionCopy}>
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color="#10B981"
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.actionTitle}>Renewal Reminder</Text>
                    <Text style={styles.actionSubtitle}>
                      {sub.remindMe
                        ? "Notifications enabled 48h prior"
                        : "Reminders are turned off"}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={handleToggleReminder}
                  style={[
                    styles.toggleButton,
                    sub.remindMe && styles.toggleButtonActive,
                  ]}
                >
                  <Ionicons
                    name={sub.remindMe ? "checkmark" : "close"}
                    size={16}
                    color={sub.remindMe ? "#000000" : "#64748B"}
                  />
                </Pressable>
              </View>

              <View style={styles.actionDivider} />

              <View style={styles.actionRow}>
                <View style={styles.actionCopy}>
                  <Ionicons
                    name="pause-circle-outline"
                    size={22}
                    color="#FBBF24"
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.actionTitle}>Plan Status</Text>
                    <Text style={styles.actionSubtitle}>
                      {sub.active
                        ? "Tracked actively in monthly budget"
                        : "Excluded from spend calculations"}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={handleToggleStatus}
                  style={[
                    styles.statusButton,
                    sub.active ? styles.pauseBtn : styles.resumeBtn,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBtnText,
                      sub.active ? styles.pauseBtnText : styles.resumeBtnText,
                    ]}
                  >
                    {sub.active ? "Pause" : "Resume"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* SIMULATED BILLING HISTORY */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Ionicons name="receipt-outline" size={20} color="#10B981" />
                <Text style={styles.infoCardTitle}>Recent Invoices</Text>
              </View>

              <View style={styles.invoiceRow}>
                <View>
                  <Text style={styles.invoiceTitle}>Monthly Charge</Text>
                  <Text style={styles.invoiceDate}>Aug 22, 2026 • Auto-debit</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.invoiceAmount}>
                    ${sub.price.toFixed(2)}
                  </Text>
                  <Text style={styles.invoiceStatus}>PAID</Text>
                </View>
              </View>

              <View style={styles.invoiceRow}>
                <View>
                  <Text style={styles.invoiceTitle}>Monthly Charge</Text>
                  <Text style={styles.invoiceDate}>Jul 22, 2026 • Auto-debit</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.invoiceAmount}>
                    ${sub.price.toFixed(2)}
                  </Text>
                  <Text style={styles.invoiceStatus}>PAID</Text>
                </View>
              </View>
            </View>

            {/* DELETE BUTTON */}
            <Pressable style={styles.deleteBottomButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={18} color="#FB7185" />
              <Text style={styles.deleteBottomButtonText}>
                Cancel & Remove Subscription
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "transparent" },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  loadingText: { color: "#94A3B8", fontSize: 16 },
  notFoundTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 16,
    marginBottom: 6,
  },
  notFoundSubtitle: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  backButtonCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#10B981",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  backButtonCenterText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "900",
  },
  scrollContent: { flexGrow: 1, paddingBottom: 50 },
  webScrollContent: { alignItems: "center" },
  container: { width: "100%", paddingHorizontal: 20, paddingTop: 16 },
  webContainer: { maxWidth: 680, paddingTop: 28 },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(13, 17, 23, 0.85)",
    borderWidth: 1,
    borderColor: "#1E2533",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteNavButton: {
    backgroundColor: "rgba(34, 17, 24, 0.85)",
    borderColor: "#4A1828",
  },
  navTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  heroCard: {
    backgroundColor: "rgba(13, 17, 23, 0.85)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1E2533",
    padding: 24,
    alignItems: "center",
    marginBottom: 18,
  },
  heroTopRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeActive: {
    backgroundColor: "#081D14",
    borderWidth: 1,
    borderColor: "#0F462E",
  },
  statusBadgePaused: {
    backgroundColor: "#291B10",
    borderWidth: 1,
    borderColor: "#5F3210",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  statusBadgeTextActive: {
    color: "#10B981",
  },
  statusBadgeTextPaused: {
    color: "#FBBF24",
  },
  heroName: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 4,
  },
  heroCategory: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  heroPrice: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  heroPriceCycle: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "600",
  },
  equivalentNote: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: "rgba(13, 17, 23, 0.85)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E2533",
    padding: 18,
    marginBottom: 18,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  infoCardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2533",
  },
  infoLabel: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
  infoValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  infoValueCapitalized: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  infoValueNotes: {
    color: "#94A3B8",
    fontSize: 13,
    maxWidth: 200,
    textAlign: "right",
  },
  dueBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  daysTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  daysTagNormal: {
    backgroundColor: "#161D2A",
  },
  daysTagUrgent: {
    backgroundColor: "#331E12",
  },
  daysTagText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
  },
  daysTagTextUrgent: {
    color: "#FBBF24",
  },
  actionCard: {
    backgroundColor: "rgba(13, 17, 23, 0.85)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E2533",
    padding: 18,
    marginBottom: 18,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionCopy: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  actionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 2,
  },
  actionSubtitle: {
    color: "#64748B",
    fontSize: 12,
  },
  actionDivider: {
    height: 1,
    backgroundColor: "#1E2533",
    marginVertical: 14,
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#161D2A",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#10B981",
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pauseBtn: {
    backgroundColor: "#291B10",
    borderWidth: 1,
    borderColor: "#5F3210",
  },
  resumeBtn: {
    backgroundColor: "#081D14",
    borderWidth: 1,
    borderColor: "#0F462E",
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: "900",
  },
  pauseBtnText: {
    color: "#FBBF24",
  },
  resumeBtnText: {
    color: "#10B981",
  },
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2533",
  },
  invoiceTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  invoiceDate: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 2,
  },
  invoiceAmount: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  invoiceStatus: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  deleteBottomButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(28, 17, 23, 0.85)",
    borderWidth: 1,
    borderColor: "#3D1A28",
    borderRadius: 16,
    height: 52,
  },
  deleteBottomButtonText: {
    color: "#FB7185",
    fontSize: 14,
    fontWeight: "800",
  },
});