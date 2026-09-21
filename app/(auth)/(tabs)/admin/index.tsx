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
import { getSession } from "@/lib/auth";
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

export default function AdminPlanManagement() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  const [isAdmin, setIsAdmin] = useState(true);
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
      const session = await getSession();
      if (session?.role !== "admin") {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
      }
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
        showToast("Plan created successfully.");
      }
      setEditorVisible(false);
      await loadData();
    } catch (e) {
      console.error("Save plan error:", e);
    }
  };

  const handleToggleStatus = async (plan: AppPlan) => {
    const nextStatus: PlanStatus =
      plan.status === "active" ? "inactive" : "active";
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
  };

  const handleDeletePlan = (plan: AppPlan) => {
    const subscriberCount = plan.subscriberCount || 0;

    if (subscriberCount > 0) {
      // Safety warning dialog
      const msg = `This plan currently has ${subscriberCount} active ${
        subscriberCount === 1 ? "subscriber" : "subscribers"
      }. Deactivating it is recommended instead of deleting it.`;

      if (Platform.OS === "web") {
        if (
          window.confirm(
            `Delete Plan?\n\n${msg}\n\nClick OK to Deactivate this plan instead of deleting.`
          )
        ) {
          handleToggleStatus(plan);
        }
      } else {
        Alert.alert("Delete Plan?", msg, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Deactivate",
            style: "default",
            onPress: () => handleToggleStatus(plan),
          },
        ]);
      }
      return;
    }

    // No subscribers -> Allow delete confirmation
    const confirmDelete = async () => {
      await deleteAppPlan(plan.id);
      showToast(`Plan "${plan.name}" deleted.`);
      await loadData();
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Are you sure you want to delete "${plan.name}"?`)) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        "Delete Plan",
        `Are you sure you want to delete "${plan.name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: confirmDelete },
        ]
      );
    }
  };

  // Filter plans
  const filteredPlans = plans.filter((p) => {
    const matchesStatus =
      selectedStatus === "all" || p.status === selectedStatus;
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.provider.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query);
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const stats = getPlanStatistics(plans);

  // Unauthorized view for non-admins
  if (!isAdmin) {
    return (
      <AppBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.unauthCard}>
            <Ionicons
              name="shield-outline"
              size={56}
              color={theme.colors.warning}
            />
            <Text style={styles.unauthTitle}>Admin Access Required</Text>
            <Text style={styles.unauthSubtitle}>
              You must be logged in as an App Owner or Administrator to manage
              catalog subscription plans.
            </Text>
            <Pressable
              style={styles.unauthButton}
              onPress={() => router.replace("/(auth)/(tabs)")}
            >
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
              <Text style={styles.unauthButtonText}>Back to Dashboard</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* TOAST BANNER */}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          <View style={[styles.container, isWeb && styles.webContainer]}>
            {/* HEADER */}
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.eyebrowRow}>
                  <Badge label="APP OWNER AREA" variant="primary" dot />
                </View>
                <Text style={styles.headerTitle}>Plan Management</Text>
                <Text style={styles.headerSubtitle}>
                  Create and manage subscription plans available to users.
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.createPlanBtn,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleOpenCreate}
                accessibilityLabel="Create Plan"
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.createPlanBtnText}>Create Plan</Text>
              </Pressable>
            </View>

            {/* REAL-TIME PLAN STATISTICS */}
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
                <Text style={styles.statLabel}>Active Plans</Text>
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
                    { backgroundColor: theme.colors.secondaryLight },
                  ]}
                >
                  <Ionicons
                    name="people-outline"
                    size={18}
                    color={theme.colors.secondary}
                  />
                </View>
                <Text style={[styles.statNum, { color: theme.colors.primary }]}>
                  {stats.totalSubscribers}
                </Text>
                <Text style={styles.statLabel}>Subscribers</Text>
              </View>
            </View>

            {/* SEARCH AND STATUS FILTER TABS */}
            <View style={styles.filterSection}>
              {/* Search */}
              <View style={styles.searchBar}>
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={theme.colors.textMuted}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by plan name, provider, or category..."
                  placeholderTextColor={theme.colors.inputPlaceholder}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery("")}>
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={theme.colors.textMuted}
                    />
                  </Pressable>
                )}
              </View>

              {/* Status Tabs */}
              <View style={styles.statusTabsRow}>
                {STATUS_FILTERS.map((st) => {
                  const isSelected = selectedStatus === st.id;
                  return (
                    <Pressable
                      key={st.id}
                      style={[
                        styles.statusTabBtn,
                        isSelected && styles.statusTabBtnActive,
                      ]}
                      onPress={() => setSelectedStatus(st.id)}
                    >
                      <Text
                        style={[
                          styles.statusTabText,
                          isSelected && styles.statusTabTextActive,
                        ]}
                      >
                        {st.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Category Pills */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryPillsRow}
              >
                {CATEGORY_FILTERS.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      style={[
                        styles.categoryFilterChip,
                        isSelected && styles.categoryFilterChipActive,
                      ]}
                      onPress={() => setSelectedCategory(cat.id)}
                    >
                      <Text
                        style={[
                          styles.categoryFilterText,
                          isSelected && styles.categoryFilterTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* PLANS LIST */}
            {filteredPlans.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="layers-outline"
                  size={48}
                  color={theme.colors.textMuted}
                />
                <Text style={styles.emptyTitle}>No Plans Matching Filters</Text>
                <Text style={styles.emptyDesc}>
                  Try clearing the search term or switching the status filter tab.
                </Text>
                <Pressable
                  style={styles.emptyResetBtn}
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedStatus("all");
                    setSelectedCategory("all");
                  }}
                >
                  <Text style={styles.emptyResetBtnText}>Reset Filters</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.plansTableWrap}>
                {filteredPlans.map((plan) => {
                  const statusVariant =
                    plan.status === "active"
                      ? "success"
                      : plan.status === "inactive"
                      ? "warning"
                      : "neutral";

                  const subscribers = plan.subscriberCount || 0;

                  return (
                    <View key={plan.id} style={styles.planRowCard}>
                      {/* Top Info Bar */}
                      <View style={styles.planRowHeader}>
                        <View style={styles.planIdentityLeft}>
                          <CategoryIcon category={plan.category} size={44} />
                          <View style={{ flex: 1 }}>
                            <View style={styles.planNameLine}>
                              <Text style={styles.planNameText}>{plan.name}</Text>
                              <Badge
                                label={plan.status.toUpperCase()}
                                variant={statusVariant}
                              />
                            </View>
                            <Text style={styles.planMetaText}>
                              Provider: <Text style={styles.planMetaBold}>{plan.provider}</Text> •{" "}
                              {plan.category.toUpperCase()} • Created{" "}
                              {formatDateDisplay(plan.createdAt)}
                            </Text>
                          </View>
                        </View>

                        {/* Price Display */}
                        <View style={styles.priceColumn}>
                          <Text style={styles.priceText}>
                            ${plan.price.toFixed(2)}
                          </Text>
                          <Text style={styles.cycleText}>
                            /{plan.billingCycle}
                          </Text>
                        </View>
                      </View>

                      {/* Description & Features Preview */}
                      {plan.description ? (
                        <Text style={styles.planDescription} numberOfLines={2}>
                          {plan.description}
                        </Text>
                      ) : null}

                      {/* Feature Chips */}
                      {plan.features && plan.features.length > 0 && (
                        <View style={styles.featuresPreviewWrap}>
                          {plan.features.slice(0, 3).map((feat, idx) => (
                            <View key={idx} style={styles.featurePreviewChip}>
                              <Ionicons
                                name="checkmark"
                                size={12}
                                color={theme.colors.primary}
                              />
                              <Text style={styles.featurePreviewChipText}>
                                {feat}
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

                      {/* Bottom Footer with Subscriber Stats & Action Buttons */}
                      <View style={styles.planFooterRow}>
                        <View style={styles.subscribersWrap}>
                          <Ionicons
                            name="people"
                            size={16}
                            color={theme.colors.primary}
                          />
                          <Text style={styles.subscribersCountText}>
                            <Text style={{ fontWeight: "800", color: theme.colors.text }}>
                              {subscribers}
                            </Text>{" "}
                            {subscribers === 1 ? "subscriber" : "subscribers"}
                          </Text>
                          {plan.trialEnabled && (
                            <Badge
                              label={`${plan.trialDuration || "7d"} Trial`}
                              variant="primary"
                            />
                          )}
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionsBtnRow}>
                          <Pressable
                            style={styles.actionBtnEdit}
                            onPress={() => handleOpenEdit(plan)}
                          >
                            <Ionicons
                              name="create-outline"
                              size={15}
                              color={theme.colors.primary}
                            />
                            <Text style={styles.actionBtnEditText}>Edit</Text>
                          </Pressable>

                          <Pressable
                            style={[
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

                          <Pressable
                            style={styles.actionBtnDelete}
                            onPress={() => handleDeletePlan(plan)}
                            accessibilityLabel="Delete Plan"
                          >
                            <Ionicons
                              name="trash-outline"
                              size={15}
                              color={theme.colors.error}
                            />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* CREATE / EDIT MODAL */}
            <PlanEditorModal
              visible={editorVisible}
              onClose={() => setEditorVisible(false)}
              onSubmit={handleSavePlan}
              initialData={editingPlan}
              mode={editingPlan ? "edit" : "create"}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 60 },
  webScrollContent: { alignItems: "center" },
  container: { width: "100%", paddingHorizontal: 20, paddingTop: 16 },
  webContainer: { maxWidth: 960, paddingTop: 32, paddingHorizontal: 32 },

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
  toastClose: { padding: 4 },

  // HEADER
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 16,
  },
  eyebrowRow: {
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13.5,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  createPlanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.subtle,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  createPlanBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
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
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statNum: {
    fontSize: 22,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // FILTER SECTION
  filterSection: {
    gap: 12,
    marginBottom: 18,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    paddingHorizontal: 12,
    height: 44,
    gap: 10,
    ...theme.shadows.subtle,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    height: "100%",
  },
  statusTabsRow: {
    flexDirection: "row",
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.borderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  statusTabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    borderRadius: theme.borderRadius.sm,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  statusTabBtnActive: {
    backgroundColor: "#FFFFFF",
    ...theme.shadows.subtle,
  },
  statusTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  statusTabTextActive: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
  categoryPillsRow: {
    gap: 8,
    paddingBottom: 4,
  },
  categoryFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  categoryFilterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryFilterText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  categoryFilterTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // PLANS TABLE / LIST
  plansTableWrap: {
    gap: 12,
  },
  planRowCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
  },
  planRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 12,
  },
  planIdentityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  planNameLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  planNameText: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -0.2,
  },
  planMetaText: {
    fontSize: 11.5,
    color: theme.colors.textSecondary,
  },
  planMetaBold: {
    fontWeight: "700",
    color: theme.colors.text,
  },
  priceColumn: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.text,
  },
  cycleText: {
    fontSize: 11.5,
    color: theme.colors.textSecondary,
    textTransform: "capitalize",
    marginTop: 2,
  },
  planDescription: {
    fontSize: 12.5,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  featuresPreviewWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
  },
  featurePreviewChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.backgroundAlt,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
  },
  featurePreviewChipText: {
    fontSize: 11,
    color: theme.colors.text,
    fontWeight: "600",
  },
  moreFeaturesText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    alignSelf: "center",
  },
  planFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: 12,
    flexWrap: "wrap",
    gap: 10,
  },
  subscribersWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  subscribersCountText: {
    fontSize: 12.5,
    color: theme.colors.textSecondary,
  },
  actionsBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtnEdit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primaryBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  actionBtnEditText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  actionBtnToggle: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
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
  actionBtnDelete: {
    padding: 6,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.errorBg,
    borderWidth: 1,
    borderColor: theme.colors.errorBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },

  // EMPTY
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
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: "center",
    maxWidth: 280,
    marginBottom: 16,
  },
  emptyResetBtn: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
  },
  emptyResetBtnText: {
    color: theme.colors.primary,
    fontSize: 12.5,
    fontWeight: "700",
  },

  // UNAUTHORIZED VIEW
  unauthCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  unauthTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  unauthSubtitle: {
    fontSize: 13.5,
    color: theme.colors.textSecondary,
    textAlign: "center",
    maxWidth: 320,
    lineHeight: 20,
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
  },
  unauthButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
