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

import AppBackground from "@/components/ui/AppBackground";
import CategoryIcon from "@/components/ui/CategoryIcon";
import Illustration from "@/components/ui/Illustration";
import {
  addSubscription,
  BillingCycle,
  calculateMonthlyEquivalent,
  getDaysUntilDue,
  getSubscriptions,
  Subscription,
  SubscriptionCategory,
} from "@/lib/subscriptions";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";

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
              tintColor="#10B981"
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
                <Ionicons name="add" size={20} color="#000000" />
                <Text style={styles.addButtonText}>Add Plan</Text>
              </Pressable>
            </View>

            {/* SEARCH BAR */}
            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={18} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or category..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#64748B" />
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
                <Text style={styles.summaryValueEmerald}>
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
                  width={180}
                  height={180}
                />
                <Text style={styles.emptyStateTitle}>No Matches Found</Text>
                <Text style={styles.emptyStateDesc}>
                  {searchQuery
                    ? `No subscriptions found matching "${searchQuery}".`
                    : "No subscriptions under this category yet."}
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
              <View style={styles.listWrap}>
                {filtered.map((sub) => {
                  const daysLeft = getDaysUntilDue(sub.nextPaymentDate);
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
                      <CategoryIcon category={sub.category} size={48} />

                      <View style={styles.planCardMiddle}>
                        <Text style={styles.planName}>{sub.name}</Text>
                        <View style={styles.planBadgeRow}>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>
                              {sub.category.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.planCycle}>
                            • {sub.billingCycle}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.planRenewal,
                            daysLeft <= 3 && { color: "#FBBF24" },
                          ]}
                        >
                          Renewal:{" "}
                          {daysLeft <= 0 ? "Due today" : `in ${daysLeft} days`}
                        </Text>
                      </View>

                      <View style={styles.planCardRight}>
                        <Text style={styles.planPrice}>
                          {formatCurrency(sub.price)}
                        </Text>
                        {sub.billingCycle !== "monthly" && (
                          <Text style={styles.planSubPrice}>
                            ≈ {formatCurrency(monthly)}/mo
                          </Text>
                        )}
                        <Ionicons
                          name="chevron-forward"
                          size={17}
                          color="#475569"
                          style={{ alignSelf: "flex-end", marginTop: 8 }}
                        />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>

        {/* ADD SUBSCRIPTION MODAL */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <SafeAreaView style={styles.modalSafeArea}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalEyebrow}>NEW SUBSCRIPTION</Text>
                    <Text style={styles.modalTitle}>Add Plan</Text>
                  </View>
                  <Pressable
                    style={styles.modalCloseButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                  </Pressable>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.modalScroll}
                >
                  {/* SERVICE NAME */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>SERVICE / PLAN NAME</Text>
                    <View style={styles.modalInputWrap}>
                      <Ionicons
                        name="cube-outline"
                        size={20}
                        color="#64748B"
                      />
                      <TextInput
                        style={styles.modalInput}
                        placeholder="e.g. Disney+, Figma, Amazon Prime"
                        placeholderTextColor="#64748B"
                        value={newPlanName}
                        onChangeText={setNewPlanName}
                      />
                    </View>
                  </View>

                  {/* CATEGORY PICKER */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>CATEGORY</Text>
                    <View style={styles.categoryPickerWrap}>
                      {(
                        [
                          "streaming",
                          "music",
                          "software",
                          "cloud",
                          "fitness",
                          "gaming",
                          "reading",
                          "utilities",
                        ] as SubscriptionCategory[]
                      ).map((cat) => {
                        const isSel = newPlanCategory === cat;
                        return (
                          <Pressable
                            key={cat}
                            style={[
                              styles.pickerItem,
                              isSel && styles.pickerItemActive,
                            ]}
                            onPress={() => setNewPlanCategory(cat)}
                          >
                            <CategoryIcon category={cat} size={30} />
                            <Text
                              style={[
                                styles.pickerItemText,
                                isSel && styles.pickerItemTextActive,
                              ]}
                            >
                              {cat}
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
                        <Text style={{ color: "#10B981", fontWeight: "800" }}>
                          $
                        </Text>
                        <TextInput
                          style={styles.modalInput}
                          placeholder="14.99"
                          placeholderTextColor="#64748B"
                          value={newPlanPrice}
                          onChangeText={setNewPlanPrice}
                          keyboardType="decimal-pad"
                        />
                      </View>
                    </View>

                    <View style={[styles.fieldGroup, { flex: 1.2 }]}>
                      <Text style={styles.fieldLabel}>CYCLE</Text>
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
                        size={20}
                        color="#64748B"
                      />
                      <TextInput
                        style={styles.modalInput}
                        placeholder="e.g. Apple Pay, Visa •• 4291"
                        placeholderTextColor="#64748B"
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
                      size={26}
                      color={newPlanRemind ? "#10B981" : "#64748B"}
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
                    <Ionicons name="arrow-forward" size={18} color="#000000" />
                  </Pressable>
                </ScrollView>
              </View>
            </SafeAreaView>
          </View>
        </Modal>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  headerEyebrow: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#10B981",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "900",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13, 17, 23, 0.85)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E2533",
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  categoriesRow: {
    gap: 8,
    paddingBottom: 14,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(13, 17, 23, 0.8)",
    borderWidth: 1,
    borderColor: "#1E2533",
  },
  categoryPillActive: {
    backgroundColor: "#0E241B",
    borderColor: "#10B981",
  },
  categoryPillText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
  },
  categoryPillTextActive: {
    color: "#10B981",
    fontWeight: "900",
  },
  summaryStrip: {
    flexDirection: "row",
    backgroundColor: "rgba(13, 17, 23, 0.85)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E2533",
    padding: 14,
    marginBottom: 18,
    alignItems: "center",
  },
  summaryCol: { flex: 1 },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#1E2533",
    marginHorizontal: 12,
  },
  summaryLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 2,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  summaryValueEmerald: {
    color: "#10B981",
    fontSize: 17,
    fontWeight: "900",
  },
  summarySub: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  listWrap: {
    gap: 10,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13, 17, 23, 0.85)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1E2533",
    padding: 14,
  },
  planCardPressed: {
    opacity: 0.8,
    backgroundColor: "#141A24",
  },
  planCardMiddle: {
    flex: 1,
    marginLeft: 14,
  },
  planName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  planBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#081D14",
    borderWidth: 1,
    borderColor: "#0F462E",
  },
  categoryBadgeText: {
    color: "#10B981",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  planCycle: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
  },
  planRenewal: {
    color: "#94A3B8",
    fontSize: 11,
  },
  planCardRight: {
    alignItems: "flex-end",
    marginLeft: 10,
  },
  planPrice: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  planSubPrice: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: "rgba(13, 17, 23, 0.85)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#1E2533",
    padding: 30,
    alignItems: "center",
  },
  emptyStateTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 14,
    marginBottom: 6,
  },
  emptyStateDesc: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 18,
    marginBottom: 18,
  },
  clearFilterButton: {
    backgroundColor: "#161D2A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  clearFilterText: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "800",
  },
  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.88)",
    justifyContent: "flex-end",
  },
  modalSafeArea: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#070A0F",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "#1E2533",
    maxHeight: "90%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2533",
  },
  modalEyebrow: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#161D2A",
    alignItems: "center",
    justifyContent: "center",
  },
  modalScroll: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  modalInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1117",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E2533",
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
  },
  modalInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  categoryPickerWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0D1117",
    borderWidth: 1,
    borderColor: "#1E2533",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  pickerItemActive: {
    backgroundColor: "#0E241B",
    borderColor: "#10B981",
  },
  pickerItemText: {
    color: "#94A3B8",
    fontSize: 12,
    textTransform: "capitalize",
    fontWeight: "700",
  },
  pickerItemTextActive: {
    color: "#10B981",
    fontWeight: "900",
  },
  twoColRow: {
    flexDirection: "row",
    gap: 12,
  },
  cyclePickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  cyclePill: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#0D1117",
    borderWidth: 1,
    borderColor: "#1E2533",
  },
  cyclePillActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  cyclePillText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
  },
  cyclePillTextActive: {
    color: "#000000",
    fontWeight: "900",
  },
  reminderToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0D1117",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E2533",
    padding: 14,
  },
  reminderToggleCopy: {
    gap: 2,
  },
  reminderToggleTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  reminderToggleSubtitle: {
    color: "#64748B",
    fontSize: 12,
  },
  savePlanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10B981",
    height: 54,
    borderRadius: 16,
    marginTop: 6,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  savePlanButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "900",
  },
});
