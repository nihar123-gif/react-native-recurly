import React, { useCallback, useState } from "react";
import {
  Alert,
  Linking,
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
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import AppBackground from "@/components/ui/AppBackground";
import CategoryIcon from "@/components/ui/CategoryIcon";
import Badge from "@/components/ui/Badge";
import SubscriptionFormModal from "@/components/subscription/SubscriptionFormModal";
import { theme } from "@/constants/theme";
import {
  calculateAnnualEquivalent,
  calculateMonthlyEquivalent,
  deleteSubscription,
  formatDateDisplay,
  getDaysUntilDue,
  getSubscriptionById,
  Subscription,
  updateSubscription,
} from "@/lib/subscriptions";

export default function SubscriptionDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    const newRemind = !sub.remindMe;
    const updated = await updateSubscription(sub.id, {
      remindMe: newRemind,
      reminderDays: newRemind ? 3 : 0,
    });
    if (updated) setSub(updated);
  };

  const handleToggleStatus = async () => {
    if (!sub) return;
    const newActive = !sub.active;
    const newStatus = newActive ? "active" : "paused";
    const updated = await updateSubscription(sub.id, {
      active: newActive,
      status: newStatus,
    });
    if (updated) setSub(updated);
  };

  const handleUpdate = async (formData: Omit<Subscription, "id">) => {
    if (!sub) return;
    try {
      const updated = await updateSubscription(sub.id, formData);
      if (updated) {
        setSub(updated);
        setEditModalVisible(false);
        setToastMessage("Subscription updated successfully.");
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (e) {
      console.error("Failed to update subscription:", e);
    }
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
          `Delete subscription?\n\nAre you sure you want to remove ${
            sub?.name || "this subscription"
          }?`
        )
      ) {
        doDelete();
      }
    } else {
      Alert.alert(
        "Delete subscription?",
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
            <Ionicons
              name="alert-circle-outline"
              size={56}
              color={theme.colors.error}
            />
            <Text style={styles.notFoundTitle}>Subscription Not Found</Text>
            <Text style={styles.notFoundSubtitle}>
              The requested subscription could not be loaded.
            </Text>
            <Pressable
              style={styles.backButtonCenter}
              onPress={() => router.replace("/(auth)/(tabs)/subscription")}
            >
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
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

  const displayStatus =
    sub.status === "cancelled"
      ? "Cancelled"
      : sub.status === "paused" || !sub.active
      ? "Paused"
      : "Active";

  const badgeVariant =
    displayStatus === "Active"
      ? "success"
      : displayStatus === "Paused"
      ? "warning"
      : "neutral";

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* TOAST FEEDBACK BANNER */}
        {toastMessage && (
          <View style={styles.toastBanner}>
            <View style={styles.toastContent}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={theme.colors.success}
              />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
            <Pressable
              onPress={() => setToastMessage(null)}
              style={styles.toastClose}
            >
              <Ionicons name="close" size={16} color={theme.colors.textMuted} />
            </Pressable>
          </View>
        )}

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
                style={({ pressed }) => [
                  styles.navButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => router.back()}
                accessibilityLabel="Back"
              >
                <Ionicons
                  name="arrow-back"
                  size={18}
                  color={theme.colors.text}
                />
              </Pressable>

              <Text style={styles.navTitle}>Plan Overview</Text>

              {/* ACTION BUTTONS: EDIT & DELETE */}
              <View style={styles.navActionsRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.navButton,
                    styles.editNavButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => setEditModalVisible(true)}
                  accessibilityLabel="Edit Plan"
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.navButton,
                    styles.deleteNavButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleDelete}
                  accessibilityLabel="Delete"
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={theme.colors.error}
                  />
                </Pressable>
              </View>
            </View>

            {/* HERO BADGE CARD */}
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <CategoryIcon category={sub.category} size={56} />
                <Badge label={displayStatus} variant={badgeVariant} />
              </View>

              <Text style={styles.heroName}>{sub.name}</Text>
              <Text style={styles.heroCategory}>
                {sub.category.toUpperCase()} • {sub.billingCycle.toUpperCase()}
              </Text>

              <View style={styles.priceContainer}>
                <Text style={styles.heroPrice}>
                  ${sub.price.toFixed(2)}
                </Text>
                <Text style={styles.heroCycle}>/{sub.billingCycle}</Text>
              </View>

              {sub.billingCycle !== "monthly" && (
                <View style={styles.equivalentRow}>
                  <Text style={styles.equivalentLabel}>
                    Monthly Equivalent:
                  </Text>
                  <Text style={styles.equivalentValue}>
                    ${monthlyEquiv.toFixed(2)}/mo
                  </Text>
                </View>
              )}

              {/* ACTION TOGGLE BUTTON */}
              <Pressable
                style={[
                  styles.statusToggleButton,
                  sub.active
                    ? styles.statusTogglePause
                    : styles.statusToggleResume,
                ]}
                onPress={handleToggleStatus}
              >
                <Ionicons
                  name={sub.active ? "pause-outline" : "play-outline"}
                  size={18}
                  color={sub.active ? theme.colors.textSecondary : "#FFFFFF"}
                />
                <Text
                  style={[
                    styles.statusToggleText,
                    sub.active
                      ? styles.statusToggleTextPause
                      : styles.statusToggleTextResume,
                  ]}
                >
                  {sub.active ? "Pause Subscription" : "Resume Subscription"}
                </Text>
              </Pressable>
            </View>

            {/* BILLING SCHEDULE & RENEWAL CARD */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text style={styles.infoCardTitle}>Renewal Schedule</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Next Due Date</Text>
                <View style={styles.dueBadgeRow}>
                  <Text style={styles.infoValue}>
                    {formatDateDisplay(sub.nextPaymentDate)}
                  </Text>
                  <Badge
                    label={
                      daysLeft <= 0
                        ? "Due Today"
                        : daysLeft === 1
                        ? "Tomorrow"
                        : `In ${daysLeft} days`
                    }
                    variant={daysLeft <= 3 ? "warning" : "neutral"}
                  />
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Billing Frequency</Text>
                <Text style={styles.infoValueCapitalized}>
                  {sub.billingCycle}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment Method</Text>
                <Text style={styles.infoValue}>{sub.paymentMethod}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Plan Status</Text>
                <Text style={styles.infoValue}>{displayStatus}</Text>
              </View>

              {/* WEBSITE IF AVAILABLE */}
              {sub.website ? (
                <Pressable
                  style={styles.infoRow}
                  onPress={() => {
                    const url = sub.website?.startsWith("http")
                      ? sub.website
                      : `https://${sub.website}`;
                    Linking.openURL(url).catch(() => {});
                  }}
                >
                  <Text style={styles.infoLabel}>Official Website</Text>
                  <View style={styles.websiteLinkRow}>
                    <Text style={styles.websiteLinkText}>{sub.website}</Text>
                    <Ionicons
                      name="open-outline"
                      size={14}
                      color={theme.colors.primary}
                    />
                  </View>
                </Pressable>
              ) : null}

              {/* NOTES IF AVAILABLE */}
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
                    size={20}
                    color={theme.colors.primary}
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.actionTitle}>Renewal Reminder</Text>
                    <Text style={styles.actionSubtitle}>
                      {sub.reminderDays && sub.reminderDays > 0
                        ? `Notifications sent ${sub.reminderDays} days before renewal`
                        : sub.remindMe
                        ? "Notifications sent 48 hours prior"
                        : "Reminders are turned off"}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={[
                    styles.toggleSwitch,
                    sub.remindMe
                      ? styles.toggleSwitchActive
                      : styles.toggleSwitchInactive,
                  ]}
                  onPress={handleToggleReminder}
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      sub.remindMe
                        ? styles.toggleKnobActive
                        : styles.toggleKnobInactive,
                    ]}
                  />
                </Pressable>
              </View>
            </View>

            {/* FINANCIAL RUN RATE CARD */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Ionicons
                  name="analytics-outline"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text style={styles.infoCardTitle}>Run-Rate Outflow</Text>
              </View>

              <View style={styles.statsTwoCol}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>MONTHLY OUTFLOW</Text>
                  <Text style={styles.statBoxValue}>
                    ${monthlyEquiv.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.statBoxDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statBoxLabel}>ANNUAL RUN-RATE</Text>
                  <Text style={styles.statBoxValue}>
                    ${annualEquiv.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* SIMULATED INVOICES */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Ionicons
                  name="receipt-outline"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text style={styles.infoCardTitle}>Recent Invoices</Text>
              </View>

              <View style={styles.invoiceRow}>
                <View>
                  <Text style={styles.invoiceTitle}>Monthly Charge</Text>
                  <Text style={styles.invoiceDate}>
                    Auto-debit processed • {sub.paymentMethod}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <Text style={styles.invoiceAmount}>
                    ${sub.price.toFixed(2)}
                  </Text>
                  <Badge label="PAID" variant="success" />
                </View>
              </View>
            </View>

            {/* EDIT & DELETE BUTTONS ROW */}
            <View style={styles.bottomActionsRow}>
              <Pressable
                style={styles.editBottomButton}
                onPress={() => setEditModalVisible(true)}
              >
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text style={styles.editBottomButtonText}>
                  Edit Subscription
                </Text>
              </Pressable>

              <Pressable
                style={styles.deleteBottomButton}
                onPress={handleDelete}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={theme.colors.error}
                />
                <Text style={styles.deleteBottomButtonText}>
                  Delete
                </Text>
              </Pressable>
            </View>

            {/* EDIT MODAL */}
            <SubscriptionFormModal
              visible={editModalVisible}
              onClose={() => setEditModalVisible(false)}
              onSubmit={handleUpdate}
              initialData={sub}
              mode="edit"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  loadingText: { color: theme.colors.textSecondary, fontSize: 15 },
  notFoundTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 6,
  },
  notFoundSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  backButtonCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
  },
  backButtonCenterText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  scrollContent: { flexGrow: 1, paddingBottom: 50 },
  webScrollContent: { alignItems: "center" },
  container: { width: "100%", paddingHorizontal: 20, paddingTop: 16 },
  webContainer: { maxWidth: 720, paddingTop: 32, paddingHorizontal: 32 },

  // TOAST BANNER
  toastBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: theme.borderRadius.md,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: -4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...theme.shadows.subtle,
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  toastText: {
    color: "#166534",
    fontSize: 13.5,
    fontWeight: "700",
  },
  toastClose: {
    padding: 4,
  },

  // TOP NAV
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  navActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.subtle,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  editNavButton: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primaryBorder,
  },
  deleteNavButton: {
    backgroundColor: theme.colors.errorBg,
    borderColor: theme.colors.errorBorder,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  navTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  // HERO CARD
  heroCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 16,
    ...theme.shadows.card,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  heroName: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  heroCategory: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 6,
  },
  heroPrice: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  heroCycle: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 4,
  },
  equivalentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  equivalentLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12.5,
  },
  equivalentValue: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  statusToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: theme.borderRadius.md,
    marginTop: 8,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  statusTogglePause: {
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  statusToggleResume: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.subtle,
  },
  statusToggleText: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  statusToggleTextPause: {
    color: theme.colors.text,
  },
  statusToggleTextResume: {
    color: "#FFFFFF",
  },

  // INFO CARD
  infoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 16,
    ...theme.shadows.subtle,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  infoCardTitle: {
    color: theme.colors.text,
    fontSize: 14.5,
    fontWeight: "800",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  infoLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  infoValue: {
    color: theme.colors.text,
    fontSize: 13.5,
    fontWeight: "700",
  },
  infoValueCapitalized: {
    color: theme.colors.text,
    fontSize: 13.5,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  infoValueNotes: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
  dueBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  websiteLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  websiteLinkText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  // STATS TWO COL
  statsTwoCol: {
    flexDirection: "row",
    alignItems: "center",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statBoxLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  statBoxValue: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.text,
  },
  statBoxDivider: {
    width: 1,
    height: 36,
    backgroundColor: theme.colors.cardBorder,
  },

  // ACTION CARD (NOTIFICATION)
  actionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 16,
    ...theme.shadows.subtle,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionCopy: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  actionTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  actionSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  toggleSwitchActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleSwitchInactive: {
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    ...theme.shadows.subtle,
  },
  toggleKnobActive: {
    alignSelf: "flex-end",
  },
  toggleKnobInactive: {
    alignSelf: "flex-start",
  },

  // INVOICES
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  invoiceTitle: {
    color: theme.colors.text,
    fontSize: 13.5,
    fontWeight: "700",
  },
  invoiceDate: {
    color: theme.colors.textSecondary,
    fontSize: 11.5,
    marginTop: 2,
  },
  invoiceAmount: {
    color: theme.colors.text,
    fontSize: 13.5,
    fontWeight: "800",
  },

  // BOTTOM ACTIONS
  bottomActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  editBottomButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: theme.colors.primaryBorder,
    ...theme.shadows.subtle,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  editBottomButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  deleteBottomButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.errorBg,
    borderWidth: 1,
    borderColor: theme.colors.errorBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  deleteBottomButtonText: {
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: "700",
  },
});