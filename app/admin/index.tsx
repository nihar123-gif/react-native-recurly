import React, { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";

import AppBackground from "@/components/ui/AppBackground";
import Badge from "@/components/ui/Badge";
import CategoryIcon from "@/components/ui/CategoryIcon";
import PlanEditorModal from "@/components/admin/PlanEditorModal";
import { theme } from "@/constants/theme";
import { adminSignOut, getAdminSession, UserSession } from "@/lib/auth";
import {
  AppPlan,
  createAppPlan,
  deleteAppPlan,
  getAppPlans,
  getPlanStatistics,
  PlanStatus,
  updateAppPlan,
} from "@/lib/plans";
import { formatDateDisplay, SubscriptionCategory } from "@/lib/subscriptions";

const STATUS_FILTERS: { id: "all" | PlanStatus; label: string }[] = [
  { id: "all", label: "All Plans" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "draft", label: "Draft" },
];

const CATEGORY_FILTERS: { id: "all" | SubscriptionCategory; label: string }[] = [
  { id: "all", label: "All Categories" },
  { id: "streaming", label: "Streaming" },
  { id: "music", label: "Music" },
  { id: "software", label: "Software" },
  { id: "cloud", label: "Cloud" },
  { id: "fitness", label: "Fitness" },
  { id: "gaming", label: "Gaming" },
  { id: "reading", label: "Reading" },
  { id: "utilities", label: "Utilities" },
  { id: "other", label: "Other" },
];

export default function AdminConsole() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  const [adminSession, setAdminSession] = useState<UserSession | null>(null);
  const [plans, setPlans] = useState<AppPlan[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | PlanStatus>("all");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | SubscriptionCategory
  >("all");

  // Modal State
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AppPlan | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const session = await getAdminSession();
      if (!session) {
        setAdminSession(null);
        return;
      }
      setAdminSession(session);
      const loadedPlans = await getAppPlans();
      setPlans(loadedPlans);
    } catch (e) {
      console.error("Failed to load admin plans:", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setEditorVisible(true);
  };

  const handleOpenEdit = (plan: AppPlan) => {
    setEditingPlan(plan);
    setEditorVisible(true);
  };

  const handleSavePlan = async (
    formData: Omit<AppPlan, "id" | "createdAt" | "updatedAt" | "subscriberCount">
  ) => {
    try {
      if (editingPlan) {
        await updateAppPlan(editingPlan.id, formData);
        showToast(`Plan "${formData.name}" updated successfully.`);
      } else {
        await createAppPlan(formData);
        showToast(`New plan "${formData.name}" created and published.`);
      }
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save plan.";
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Error", msg);
      }
    }
  };

  const handleToggleStatus = async (plan: AppPlan) => {
    const nextStatus: PlanStatus = plan.status === "active" ? "inactive" : "active";
    try {
      await updateAppPlan(plan.id, {
        status: nextStatus,
        isAvailableToUsers: nextStatus === "active",
      });
      showToast(
        `Plan "${plan.name}" is now ${
          nextStatus === "active" ? "Active" : "Inactive"
        }.`
      );
      await loadData();
    } catch (e) {
      console.error("Failed to toggle plan status:", e);
    }
  };

  const handleDeletePlan = (plan: AppPlan) => {
    const executeDelete = async () => {
      const success = await deleteAppPlan(plan.id);
      if (success) {
        showToast(`Plan "${plan.name}" deleted.`);
        await loadData();
      }
    };

    const subCount = plan.subscriberCount ?? 0;
    if (subCount > 0) {
      const warningText = `"${plan.name}" has ${subCount} active subscriber(s). We recommend deactivating it instead so existing subscribers aren't impacted.`;
      if (Platform.OS === "web") {
        if (
          window.confirm(
            `${warningText}\n\nDeactivate the plan now instead of deleting?`
          )
        ) {
          handleToggleStatus(plan);
        } else if (
          window.confirm(
            `Are you sure you want to FORCE DELETE "${plan.name}"? This cannot be undone.`
          )
        ) {
          executeDelete();
        }
      } else {
        Alert.alert("Active Subscribers Warning", warningText, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Deactivate Instead",
            style: "default",
            onPress: () => handleToggleStatus(plan),
          },
          {
            text: "Delete Anyway",
            style: "destructive",
            onPress: executeDelete,
          },
        ]);
      }
      return;
    }

    if (Platform.OS === "web") {
      if (window.confirm(`Are you sure you want to delete "${plan.name}"?`)) {
        executeDelete();
      }
    } else {
      Alert.alert(
        "Delete Plan",
        `Are you sure you want to delete "${plan.name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: executeDelete },
        ]
      );
    }
  };

  const handleAdminSignOut = async () => {
    await adminSignOut();
    router.replace("/(auth)/sign-in?mode=admin" as any);
  };

  // Filtered plans
  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || plan.status === selectedStatus;

    const matchesCategory =
      selectedCategory === "all" || plan.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = getPlanStatistics(plans);

  // If unauthorized, show security screen
  if (!adminSession) {
    return (
      <AppBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.unauthContainer}>
            <View style={styles.unauthCard}>
              <View style={styles.unauthIconWrap}>
                <Ionicons
                  name="shield-outline"
                  size={42}
                  color={theme.colors.error}
                />
              </View>
              <Text style={styles.unauthTitle}>Admin Console Access Required</Text>
              <Text style={styles.unauthText}>
                You must sign in with verified administrator credentials to access the App Owner Plan Management Console.
              </Text>
              <Pressable
                style={styles.unauthButton}
                onPress={() => router.replace("/(auth)/sign-in?mode=admin" as any)}
              >
                <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                <Text style={styles.unauthButtonText}>Go to Admin Sign In</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isWeb && styles.webScrollContent,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          <View style={[styles.container, isWeb && styles.webContainer]}>
            {/* TOAST NOTIFICATION */}
            {toastMessage && (
              <View style={styles.toastWrap}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={theme.colors.success}
                />
                <Text style={styles.toastText}>{toastMessage}</Text>
              </View>
            )}

            {/* ADMIN CONSOLE HEADER */}
            <View style={styles.adminHeader}>
              <View style={styles.adminHeaderBrand}>
                <View style={styles.adminHeaderIcon}>
                  <Ionicons name="shield-checkmark" size={22} color="#FFFFFF" />
                </View>
                <View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={styles.adminHeaderTitle}>Recurly Admin Console</Text>
                    <Badge label="APP OWNER" variant="primary" />
                  </View>
                  <Text style={styles.adminHeaderSubtitle}>
                    {adminSession.email} • System Control & Catalog Management
                  </Text>
                </View>
              </View>

              <View style={styles.adminHeaderActions}>
                <Pressable
                  style={styles.createBtnHeader}
                  onPress={handleOpenCreate}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                  <Text style={styles.createBtnHeaderText}>Create New Plan</Text>
                </Pressable>

                <Pressable
                  style={styles.signOutBtn}
                  onPress={handleAdminSignOut}
                  accessibilityLabel="Sign out of admin console"
                >
                  <Ionicons name="log-out-outline" size={18} color={theme.colors.error} />
                  <Text style={styles.signOutBtnText}>Sign Out</Text>
                </Pressable>
              </View>
            </View>

            {/* LIVE METRICS STRIP */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIconWrap}>
                  <Ionicons
                    name="layers-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.statNum}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Plans</Text>
              </View>

              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconWrap,
                    { backgroundColor: theme.colors.successBg },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color={theme.colors.success}
                  />
                </View>
                <Text style={[styles.statNum, { color: theme.colors.success }]}>
                  {stats.active}
                </Text>
                <Text style={styles.statLabel}>Active Public</Text>
              </View>

              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconWrap,
                    { backgroundColor: theme.colors.warningBg },
                  ]}
                >
                  <Ionicons
                    name="pause-circle-outline"
                    size={18}
                    color={theme.colors.warning}
                  />
                </View>
                <Text style={[styles.statNum, { color: theme.colors.warning }]}>
                  {stats.inactive + stats.draft}
                </Text>
                <Text style={styles.statLabel}>Inactive / Draft</Text>
              </View>

              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconWrap,
                    { backgroundColor: theme.colors.primaryLight },
                  ]}
                >
                  <Ionicons
                    name="people-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.statNum}>{stats.totalSubscribers}</Text>
                <Text style={styles.statLabel}>Total Subscribers</Text>
              </View>
            </View>

            {/* SEARCH AND FILTERS */}
            <View style={styles.filterCard}>
              <View style={styles.searchRow}>
                <View style={styles.searchBar}>
                  <Ionicons
                    name="search-outline"
                    size={18}
                    color={theme.colors.textMuted}
                  />
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search plans by name, provider, category..."
                    placeholderTextColor={theme.colors.textMuted}
                  />
                  {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery("")}>
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={theme.colors.textMuted}
                      />
                    </Pressable>
                  )}
                </View>
              </View>

              {/* STATUS FILTER PILLS */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterPillsRow}
              >
                {STATUS_FILTERS.map((f) => {
                  const isSelected = selectedStatus === f.id;
                  return (
                    <Pressable
                      key={f.id}
                      style={[
                        styles.filterPill,
                        isSelected && styles.filterPillActive,
                      ]}
                      onPress={() => setSelectedStatus(f.id)}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          isSelected && styles.filterPillTextActive,
                        ]}
                      >
                        {f.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* CATEGORY FILTER PILLS */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.filterPillsRow, { marginTop: 8 }]}
              >
                {CATEGORY_FILTERS.map((c) => {
                  const isSelected = selectedCategory === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      style={[
                        styles.categoryPill,
                        isSelected && styles.categoryPillActive,
                      ]}
                      onPress={() => setSelectedCategory(c.id)}
                    >
                      <Text
                        style={[
                          styles.categoryPillText,
                          isSelected && styles.categoryPillTextActive,
                        ]}
                      >
                        {c.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* SECTION HEADER & COUNT */}
            <View style={styles.catalogHeader}>
              <View>
                <Text style={styles.catalogEyebrow}>CATALOG MANAGEMENT</Text>
                <Text style={styles.catalogTitle}>
                  Available Subscription Plans ({filteredPlans.length})
                </Text>
              </View>

              <Pressable style={styles.quickCreateBtn} onPress={handleOpenCreate}>
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.quickCreateBtnText}>Add Plan</Text>
              </Pressable>
            </View>

            {/* PLANS LIST */}
            {filteredPlans.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="cube-outline"
                  size={48}
                  color={theme.colors.textMuted}
                />
                <Text style={styles.emptyTitle}>No Plans Found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery || selectedStatus !== "all" || selectedCategory !== "all"
                    ? "Try adjusting your search criteria or filters."
                    : "Get started by creating your first subscription plan for users."}
                </Text>
                <Pressable
                  style={styles.emptyButton}
                  onPress={handleOpenCreate}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                  <Text style={styles.emptyButtonText}>Create New Plan</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.plansList}>
                {filteredPlans.map((plan) => (
                  <View key={plan.id} style={styles.planCard}>
                    {/* TOP ROW: ICON, NAME, STATUS */}
                    <View style={styles.planCardHeader}>
                      <View style={styles.planIdentity}>
                        <CategoryIcon
                          category={plan.category}
                          size={40}
                        />
                        <View style={styles.planInfo}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Text style={styles.planName}>{plan.name}</Text>
                            <Badge
                              label={plan.category.toUpperCase()}
                              variant="neutral"
                              style={{ height: 20 }}
                            />
                          </View>
                          <Text style={styles.planProvider}>{plan.provider}</Text>
                        </View>
                      </View>

                      <View style={styles.planBadges}>
                        <Badge
                          label={plan.status.toUpperCase()}
                          variant={
                            plan.status === "active"
                              ? "success"
                              : plan.status === "draft"
                              ? "warning"
                              : "neutral"
                          }
                        />
                      </View>
                    </View>

                    {/* PRICING & TRIAL STRIP */}
                    <View style={styles.planPricingStrip}>
                      <View style={styles.priceCol}>
                        <Text style={styles.priceLabel}>PRICE / CYCLE</Text>
                        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                          <Text style={styles.priceValue}>
                            ${plan.price.toFixed(2)}
                          </Text>
                          <Text style={styles.priceCycle}>/{plan.billingCycle}</Text>
                        </View>
                      </View>

                      {plan.yearlyPrice && (
                        <View style={styles.priceCol}>
                          <Text style={styles.priceLabel}>ANNUAL RATE</Text>
                          <Text style={styles.priceValue}>
                            ${plan.yearlyPrice.toFixed(0)}/yr
                          </Text>
                        </View>
                      )}

                      <View style={styles.priceCol}>
                        <Text style={styles.priceLabel}>TRIAL</Text>
                        <Text style={styles.trialValue}>
                          {plan.trialEnabled ? (plan.trialDuration || "Available") : "None"}
                        </Text>
                      </View>

                      <View style={styles.priceCol}>
                        <Text style={styles.priceLabel}>SUBSCRIBERS</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Ionicons name="people" size={13} color={theme.colors.primary} />
                          <Text style={styles.subscriberValue}>
                            {plan.subscriberCount}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* DESCRIPTION & FEATURES PREVIEW */}
                    {plan.description ? (
                      <Text style={styles.planDesc} numberOfLines={2}>
                        {plan.description}
                      </Text>
                    ) : null}

                    {plan.features && plan.features.length > 0 && (
                      <View style={styles.featuresPreview}>
                        {plan.features.slice(0, 3).map((f, i) => (
                          <View key={i} style={styles.featureTag}>
                            <Ionicons
                              name="checkmark"
                              size={12}
                              color={theme.colors.primary}
                            />
                            <Text style={styles.featureTagText} numberOfLines={1}>
                              {f}
                            </Text>
                          </View>
                        ))}
                        {plan.features.length > 3 && (
                          <Text style={styles.moreFeaturesText}>
                            +{plan.features.length - 3} more
                          </Text>
                        )}
                      </View>
                    )}

                    {/* CARD FOOTER & ACTIONS */}
                    <View style={styles.cardFooter}>
                      <Text style={styles.updatedDate}>
                        Updated {formatDateDisplay(plan.updatedAt || plan.createdAt)}
                      </Text>

                      <View style={styles.actionButtons}>
                        {/* TOGGLE STATUS */}
                        <Pressable
                          style={[
                            styles.actionBtn,
                            styles.actionBtnToggle,
                            plan.status === "active"
                              ? styles.actionBtnDeactivate
                              : styles.actionBtnActivate,
                          ]}
                          onPress={() => handleToggleStatus(plan)}
                        >
                          <Text
                            style={
                              plan.status === "active"
                                ? styles.actionBtnDeactivateText
                                : styles.actionBtnActivateText
                            }
                          >
                            {plan.status === "active" ? "Deactivate" : "Activate"}
                          </Text>
                        </Pressable>

                        {/* EDIT BUTTON */}
                        <Pressable
                          style={[styles.actionBtn, styles.actionBtnEdit]}
                          onPress={() => handleOpenEdit(plan)}
                        >
                          <Ionicons
                            name="create-outline"
                            size={14}
                            color={theme.colors.text}
                          />
                          <Text style={styles.actionBtnEditText}>Edit</Text>
                        </Pressable>

                        {/* DELETE BUTTON */}
                        <Pressable
                          style={[styles.actionBtn, styles.actionBtnDelete]}
                          onPress={() => handleDeletePlan(plan)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={14}
                            color={theme.colors.error}
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* MODAL */}
        <PlanEditorModal
          visible={editorVisible}
          onClose={() => setEditorVisible(false)}
          onSubmit={handleSavePlan}
          initialData={editingPlan}
          mode={editingPlan ? "edit" : "create"}
        />
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 60 },
  webScrollContent: { alignItems: "center" },
  container: { width: "100%", paddingHorizontal: 20, paddingTop: 16 },
  webContainer: { maxWidth: 1040, paddingTop: 28, paddingHorizontal: 32 },

  toastWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.successBorder,
    marginBottom: 16,
    ...theme.shadows.subtle,
  },
  toastText: {
    color: theme.colors.text,
    fontSize: 13.5,
    fontWeight: "600",
  },

  // ADMIN HEADER
  adminHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.darkNavy,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.darkNavyBorder,
    ...theme.shadows.card,
    flexWrap: "wrap",
    gap: 16,
  },
  adminHeaderBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  adminHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  adminHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  adminHeaderSubtitle: {
    color: "#94A3B8",
    fontSize: 12.5,
    marginTop: 2,
  },
  adminHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  createBtnHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  createBtnHeaderText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  signOutBtnText: {
    color: theme.colors.error,
    fontSize: 13,
    fontWeight: "700",
  },

  // STATS GRID
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statNum: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  // FILTER CARD
  filterCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 20,
    ...theme.shadows.subtle,
  },
  searchRow: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    outlineStyle: "none" as any,
  },
  filterPillsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  filterPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterPillText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  filterPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  categoryPillActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primaryBorder,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  categoryPillTextActive: {
    color: theme.colors.primary,
    fontWeight: "700",
  },

  // CATALOG HEADER
  catalogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  catalogEyebrow: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  catalogTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 2,
  },
  quickCreateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.md,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  quickCreateBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
  },

  // PLANS LIST
  plansList: {
    gap: 14,
  },
  planCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
  },
  planCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  planIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  planProvider: {
    color: theme.colors.textSecondary,
    fontSize: 12.5,
    marginTop: 2,
  },
  planBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  // PRICING STRIP
  planPricingStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 10,
  },
  priceCol: {
    minWidth: 80,
  },
  priceLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  priceValue: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 1,
  },
  priceCycle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  trialValue: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 1,
  },
  subscriberValue: {
    color: theme.colors.primary,
    fontSize: 13.5,
    fontWeight: "800",
    marginTop: 1,
  },

  planDesc: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  featuresPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
    marginBottom: 14,
  },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 180,
  },
  featureTagText: {
    color: theme.colors.primary,
    fontSize: 11.5,
    fontWeight: "600",
  },
  moreFeaturesText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },

  // FOOTER ACTIONS
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    flexWrap: "wrap",
    gap: 10,
  },
  updatedDate: {
    color: theme.colors.textMuted,
    fontSize: 11.5,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  actionBtnToggle: {
    minWidth: 84,
    justifyContent: "center",
  },
  actionBtnDeactivate: {
    backgroundColor: theme.colors.warningBg,
    borderColor: "#FDE68A",
  },
  actionBtnDeactivateText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "700",
  },
  actionBtnActivate: {
    backgroundColor: theme.colors.successBg,
    borderColor: "#BBF7D0",
  },
  actionBtnActivateText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "700",
  },
  actionBtnEdit: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.cardBorder,
  },
  actionBtnEditText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  actionBtnDelete: {
    backgroundColor: theme.colors.errorBg,
    borderColor: theme.colors.errorBorder,
    paddingHorizontal: 9,
  },

  // EMPTY STATE
  emptyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: 36,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 14,
  },
  emptySubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
    maxWidth: 320,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },

  // SECURITY CARD
  unauthContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  unauthCard: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.card,
  },
  unauthIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.errorBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  unauthTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  unauthText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
  },
  unauthButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  unauthButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
