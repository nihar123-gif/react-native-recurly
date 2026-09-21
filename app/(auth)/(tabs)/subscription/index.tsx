import React, { useCallback, useState } from "react";
import {
  Alert,
  Modal,
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
import { theme } from "@/constants/theme";
import {
  addSubscription,
  BillingCycle,
  calculateMonthlyEquivalent,
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
];

const BILLING_CYCLES: { id: BillingCycle; label: string }[] = [
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
  { id: "weekly", label: "Weekly" },
  { id: "quarterly", label: "Quarterly" },
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

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanCategory, setNewPlanCategory] =
    useState<SubscriptionCategory>("streaming");
  const [newPlanPrice, setNewPlanPrice] = useState("");
  const [newPlanCycle, setNewPlanCycle] = useState<BillingCycle>("monthly");
  const [newPlanPaymentMethod, setNewPlanPaymentMethod] = useState("Apple Pay");
  const [newPlanRemind, setNewPlanRemind] = useState(true);

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

  const handleCreateSubscription = async () => {
    if (!newPlanName.trim()) {
      if (Platform.OS === "web") window.alert("Please enter a service name");
      else Alert.alert("Missing Name", "Please enter a service name.");
      return;
    }

    const priceNumber = parseFloat(newPlanPrice.replace("$", "").trim());
    if (isNaN(priceNumber) || priceNumber <= 0) {
      if (Platform.OS === "web") window.alert("Please enter a valid price");
      else Alert.alert("Invalid Price", "Please enter a valid price amount.");
      return;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);
    const dateStr = nextDate.toISOString().split("T")[0];

    try {
      await addSubscription({
        name: newPlanName.trim(),
        category: newPlanCategory,
        price: priceNumber,
        currency: "$",
        billingCycle: newPlanCycle,
        nextPaymentDate: dateStr,
        paymentMethod: newPlanPaymentMethod.trim() || "Apple Pay",
        active: true,
        remindMe: newPlanRemind,
      });

      setModalVisible(false);
      setNewPlanName("");
      setNewPlanPrice("");
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = subscriptions.filter((sub) => {
    const matchesCategory =
      selectedCategory === "all" || sub.category === selectedCategory;
    const matchesSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.category.toLowerCase().includes(searchQuery.toLowerCase());
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
                style={styles.addButton}
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
                placeholder="Search subscriptions or category..."
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

            {/* CATEGORY PILLS */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesRow}
            >
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryPill,
                      active && styles.categoryPillActive,
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        active && styles.categoryPillTextActive,
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

            {/* LIST */}
            {filtered.length === 0 ? (
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
              <View style={styles.plansList}>
                {filtered.map((sub) => {
                  const monthly = calculateMonthlyEquivalent(sub);
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
                            label={sub.active ? "Active" : "Paused"}
                            variant={sub.active ? "success" : "neutral"}
                          />
                        </View>
                        <Text style={styles.planSubmeta}>
                          Renews {sub.nextPaymentDate} • {sub.paymentMethod}
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

            {/* ADD SUBSCRIPTION MODAL */}
            <Modal
              visible={modalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  {/* MODAL HEADER */}
                  <View style={styles.modalHeader}>
                    <View>
                      <Text style={styles.modalEyebrow}>NEW RECORD</Text>
                      <Text style={styles.modalTitle}>Add Subscription</Text>
                    </View>
                    <Pressable
                      style={styles.modalCloseButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Ionicons
                        name="close"
                        size={20}
                        color={theme.colors.textSecondary}
                      />
                    </Pressable>
                  </View>

                  <ScrollView
                    contentContainerStyle={styles.modalScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {/* NAME */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>SERVICE NAME</Text>
                      <View style={styles.modalInputWrap}>
                        <Ionicons
                          name="business-outline"
                          size={18}
                          color={theme.colors.textMuted}
                        />
                        <TextInput
                          style={styles.modalInput}
                          placeholder="e.g. Netflix, Spotify, Figma"
                          placeholderTextColor={theme.colors.inputPlaceholder}
                          value={newPlanName}
                          onChangeText={setNewPlanName}
                        />
                      </View>
                    </View>

                    {/* CATEGORY PICKER */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>CATEGORY</Text>
                      <View style={styles.categoryPickerWrap}>
                        {(CATEGORIES.filter((c) => c.id !== "all") as {
                          id: SubscriptionCategory;
                          label: string;
                        }[]).map((cat) => {
                          const isSelected = newPlanCategory === cat.id;
                          return (
                            <Pressable
                              key={cat.id}
                              style={[
                                styles.pickerItem,
                                isSelected && styles.pickerItemActive,
                              ]}
                              onPress={() => setNewPlanCategory(cat.id)}
                            >
                              <CategoryIcon category={cat.id} size={20} />
                              <Text
                                style={[
                                  styles.pickerItemText,
                                  isSelected && styles.pickerItemTextActive,
                                ]}
                              >
                                {cat.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    {/* PRICE & CYCLE */}
                    <View style={styles.twoColRow}>
                      <View style={[styles.fieldGroup, { flex: 1 }]}>
                        <Text style={styles.fieldLabel}>PRICE ($)</Text>
                        <View style={styles.modalInputWrap}>
                          <Text
                            style={{
                              color: theme.colors.primary,
                              fontWeight: "800",
                              fontSize: 16,
                            }}
                          >
                            $
                          </Text>
                          <TextInput
                            style={styles.modalInput}
                            placeholder="14.99"
                            placeholderTextColor={theme.colors.inputPlaceholder}
                            value={newPlanPrice}
                            onChangeText={setNewPlanPrice}
                            keyboardType="decimal-pad"
                          />
                        </View>
                      </View>

                      <View style={[styles.fieldGroup, { flex: 1.2 }]}>
                        <Text style={styles.fieldLabel}>BILLING CYCLE</Text>
                        <View style={styles.cyclePickerRow}>
                          {BILLING_CYCLES.map((c) => (
                            <Pressable
                              key={c.id}
                              style={[
                                styles.cyclePill,
                                newPlanCycle === c.id && styles.cyclePillActive,
                              ]}
                              onPress={() => setNewPlanCycle(c.id)}
                            >
                              <Text
                                style={[
                                  styles.cyclePillText,
                                  newPlanCycle === c.id &&
                                    styles.cyclePillTextActive,
                                ]}
                              >
                                {c.label}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    </View>

                    {/* PAYMENT METHOD */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>PAYMENT METHOD</Text>
                      <View style={styles.modalInputWrap}>
                        <Ionicons
                          name="card-outline"
                          size={18}
                          color={theme.colors.textMuted}
                        />
                        <TextInput
                          style={styles.modalInput}
                          placeholder="e.g. Apple Pay, Visa •• 4291"
                          placeholderTextColor={theme.colors.inputPlaceholder}
                          value={newPlanPaymentMethod}
                          onChangeText={setNewPlanPaymentMethod}
                        />
                      </View>
                    </View>

                    {/* REMINDER TOGGLE */}
                    <Pressable
                      style={styles.reminderToggleRow}
                      onPress={() => setNewPlanRemind(!newPlanRemind)}
                    >
                      <View style={styles.reminderToggleCopy}>
                        <Text style={styles.reminderToggleTitle}>
                          Renewal Reminder
                        </Text>
                        <Text style={styles.reminderToggleSubtitle}>
                          Notify me 48 hours prior
                        </Text>
                      </View>
                      <Ionicons
                        name={
                          newPlanRemind
                            ? "checkmark-circle"
                            : "ellipse-outline"
                        }
                        size={24}
                        color={
                          newPlanRemind
                            ? theme.colors.primary
                            : theme.colors.textMuted
                        }
                      />
                    </Pressable>

                    {/* SUBMIT BUTTON */}
                    <Pressable
                      style={styles.savePlanButton}
                      onPress={handleCreateSubscription}
                    >
                      <Text style={styles.savePlanButtonText}>
                        Save Subscription
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color="#FFFFFF"
                      />
                    </Pressable>
                  </ScrollView>
                </View>
              </View>
            </Modal>
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
    maxWidth: 280,
    lineHeight: 18,
    marginBottom: 18,
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

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: Platform.OS === "web" ? "center" : "flex-end",
    alignItems: Platform.OS === "web" ? "center" : undefined,
    padding: Platform.OS === "web" ? 20 : 0,
  },
  modalContainer: {
    backgroundColor: theme.colors.card,
    width: "100%",
    maxWidth: 520,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: Platform.OS === "web" ? 24 : 0,
    borderBottomRightRadius: Platform.OS === "web" ? 24 : 0,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    maxHeight: Platform.OS === "web" ? ("85vh" as any) : "90%",
    paddingBottom: 24,
    ...theme.shadows.modal,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  modalEyebrow: {
    fontSize: 10.5,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text,
    marginTop: 2,
    letterSpacing: -0.3,
  },
  modalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  modalScroll: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: theme.colors.text,
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  modalInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.inputBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  modalInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    height: "100%",
  },
  categoryPickerWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.sm,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  pickerItemActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  pickerItemText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textTransform: "capitalize",
    fontWeight: "600",
  },
  pickerItemTextActive: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
  twoColRow: {
    flexDirection: "row",
    gap: 12,
  },
  cyclePickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  cyclePill: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  cyclePillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  cyclePillText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  cyclePillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  reminderToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: 12,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  reminderToggleCopy: {
    gap: 2,
  },
  reminderToggleTitle: {
    color: theme.colors.text,
    fontSize: 13.5,
    fontWeight: "700",
  },
  reminderToggleSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 11.5,
  },
  savePlanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: theme.borderRadius.md,
    marginTop: 6,
    ...theme.shadows.subtle,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  savePlanButtonText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
  },
});
