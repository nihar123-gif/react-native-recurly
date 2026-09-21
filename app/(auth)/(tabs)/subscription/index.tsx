import React, { useCallback, useState } from "react";
import {
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
import CategoryIcon from "@/components/ui/CategoryIcon";
import Illustration from "@/components/ui/Illustration";
import Badge from "@/components/ui/Badge";
import SubscriptionFormModal from "@/components/subscription/SubscriptionFormModal";
import { theme } from "@/constants/theme";
import {
  addSubscription,
  calculateMonthlyEquivalent,
  formatDateDisplay,
  getSubscriptions,
  Subscription,
  SubscriptionCategory,
} from "@/lib/subscriptions";

const CATEGORIES: { id: "all" | SubscriptionCategory; label: string }[] = [
  { id: "all", label: "All Plans" },
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

export default function SubscriptionsCatalog() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | SubscriptionCategory
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const data = await getSubscriptions();
    setSubscriptions(data);
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

  const handleCreateSubscription = async (
    formData: Omit<Subscription, "id">
  ) => {
    try {
      const created = await addSubscription(formData);
      setModalVisible(false);
      await loadData();
      setToastMessage(`${created.name} added successfully.`);
      setTimeout(() => {
        setToastMessage(null);
      }, 3500);
    } catch (e) {
      console.error("Failed to add subscription:", e);
    }
  };

  const filtered = subscriptions.filter((sub) => {
    const matchesCategory =
      selectedCategory === "all" || sub.category === selectedCategory;
    const matchesSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.notes && sub.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sub.paymentMethod &&
        sub.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalMonthlySpend = filtered.reduce(
    (acc, sub) => acc + calculateMonthlyEquivalent(sub),
    0
  );

  const formatCurrency = (amt: number) => `$${amt.toFixed(2)}`;

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* SUCCESS TOAST NOTIFICATION BANNER */}
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
              <View>
                <Text style={styles.headerEyebrow}>PORTFOLIO DIRECTORY</Text>
                <Text style={styles.headerTitle}>All Subscriptions</Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => setModalVisible(true)}
                accessibilityLabel="Add New Plan"
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Plan</Text>
              </Pressable>
            </View>

            {/* SEARCH BAR */}
            <View style={styles.searchWrap}>
              <Ionicons
                name="search-outline"
                size={18}
                color={theme.colors.textMuted}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search subscriptions, category, notes..."
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

            {/* CATEGORY FILTER PILLS */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesRow}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryPill,
                      isSelected && styles.categoryPillActive,
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        isSelected && styles.categoryPillTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* SUMMARY STRIP */}
            <View style={styles.summaryStrip}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>SHOWING</Text>
                <Text style={styles.summaryValue}>
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "subscription" : "subscriptions"}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>FILTER TOTAL</Text>
                <Text style={styles.summaryValueBlue}>
                  {formatCurrency(totalMonthlySpend)}
                  <Text style={styles.summarySub}>/mo</Text>
                </Text>
              </View>
            </View>

            {/* LIST OR EMPTY STATES */}
            {subscriptions.length === 0 ? (
              // Empty Portfolio State
              <View style={styles.emptyState}>
                <Illustration
                  name="empty-state-no-subscriptions"
                  width={180}
                  height={180}
                />
                <Text style={styles.emptyStateTitle}>No subscriptions yet</Text>
                <Text style={styles.emptyStateDesc}>
                  Add your first subscription to start tracking your recurring
                  expenses and renewal alerts.
                </Text>
                <Pressable
                  style={styles.emptyAddButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                  <Text style={styles.emptyAddButtonText}>
                    Add Subscription
                  </Text>
                </Pressable>
              </View>
            ) : filtered.length === 0 ? (
              // Empty Filter/Search Results State
              <View style={styles.emptyState}>
                <Illustration
                  name="empty-state-no-subscriptions"
                  width={170}
                  height={170}
                />
                <Text style={styles.emptyStateTitle}>No Results Found</Text>
                <Text style={styles.emptyStateDesc}>
                  Try clearing your search query or selecting a different
                  category filter.
                </Text>
                <Pressable
                  style={styles.clearFilterButton}
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  <Text style={styles.clearFilterText}>Reset Filters</Text>
                </Pressable>
              </View>
            ) : (
              // Active Subscriptions List
              <View style={styles.plansList}>
                {filtered.map((sub) => {
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
                    <Pressable
                      key={sub.id}
                      style={({ pressed }) => [
                        styles.planCard,
                        pressed && styles.planCardPressed,
                      ]}
                      onPress={() =>
                        router.push({
                          pathname: "/(auth)/(tabs)/subscription/[id]",
                          params: { id: sub.id },
                        })
                      }
                    >
                      <View style={styles.planIconWrap}>
                        <CategoryIcon category={sub.category} size={42} />
                      </View>

                      <View style={styles.planInfo}>
                        <View style={styles.planNameRow}>
                          <Text style={styles.planName}>{sub.name}</Text>
                          <Badge
                            label={displayStatus}
                            variant={badgeVariant}
                          />
                        </View>
                        <Text style={styles.planSubmeta}>
                          Renews {formatDateDisplay(sub.nextPaymentDate)} •{" "}
                          {sub.paymentMethod}
                        </Text>
                      </View>

                      <View style={styles.planPriceCol}>
                        <Text style={styles.planPrice}>
                          {formatCurrency(sub.price)}
                        </Text>
                        <Text style={styles.planSubPrice}>
                          {sub.billingCycle}
                        </Text>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={theme.colors.textMuted}
                        style={{ marginLeft: 8 }}
                      />
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* PRODUCTION REUSABLE ADD SUBSCRIPTION MODAL */}
            <SubscriptionFormModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onSubmit={handleCreateSubscription}
              mode="create"
            />
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
  webContainer: { maxWidth: 920, paddingTop: 32, paddingHorizontal: 32 },

  // TOAST BANNER
  toastBanner: {
    position: "relative",
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

  // HEADER
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -0.4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.subtle,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },

  // SEARCH
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    paddingHorizontal: 12,
    height: 44,
    gap: 10,
    marginBottom: 14,
    ...theme.shadows.subtle,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    height: "100%",
  },

  // CATEGORIES
  categoriesRow: {
    gap: 8,
    paddingBottom: 14,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  categoryPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  categoryPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // SUMMARY STRIP
  summaryStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 16,
    ...theme.shadows.subtle,
  },
  summaryCol: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },
  summaryValueBlue: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  summarySub: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.cardBorder,
    marginHorizontal: 12,
  },

  // LIST
  plansList: {
    gap: 10,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
    ...(Platform.OS === "web"
      ? ({ cursor: "pointer", transition: "background-color 0.15s ease" } as any)
      : {}),
  },
  planCardPressed: {
    backgroundColor: theme.colors.backgroundAlt,
  },
  planIconWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  planName: {
    fontSize: 14.5,
    fontWeight: "700",
    color: theme.colors.text,
    letterSpacing: -0.2,
  },
  planSubmeta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  planPriceCol: {
    alignItems: "flex-end",
  },
  planPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -0.2,
  },
  planSubPrice: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textTransform: "capitalize",
    marginTop: 2,
  },

  // EMPTY
  emptyState: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: 32,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: "center",
    ...theme.shadows.subtle,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyStateDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyAddButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.subtle,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  emptyAddButtonText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
  clearFilterButton: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primaryBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  clearFilterText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
});
