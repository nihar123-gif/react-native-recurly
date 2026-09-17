import React, { useCallback, useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import AppBackground from "@/components/ui/AppBackground";
import CategoryIcon from "@/components/ui/CategoryIcon";
import Illustration from "@/components/ui/Illustration";
import { getSession } from "@/lib/auth";
import {
  calculateMonthlyEquivalent,
  getDaysUntilDue,
  getMetrics,
  getSubscriptions,
  Subscription,
} from "@/lib/subscriptions";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  const [userName, setUserName] = useState<string>("Member");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const session = await getSession();
      if (session?.name) {
        setUserName(session.name.split(" ")[0]);
      }
      const subs = await getSubscriptions();
      setSubscriptions(subs);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
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

  const metrics = getMetrics(subscriptions);
  const activeSubscriptions = subscriptions.filter((s) => s.active);

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#10B981"
            />
          }
        >
          <View style={[styles.container, isWeb && styles.webContainer]}>
            {/* TOP BAR */}
            <View style={styles.topBar}>
              <View>
                <Text style={styles.greetingEyebrow}>PORTFOLIO OVERVIEW</Text>
                <Text style={styles.greetingName}>Welcome back, {userName}</Text>
              </View>

              <View style={styles.topActions}>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => router.push("/(auth)/(tabs)/profile")}
                  accessibilityLabel="Profile"
                >
                  <Ionicons name="person-outline" size={19} color="#FFFFFF" />
                </Pressable>

                <Pressable
                  style={[styles.iconButton, styles.primaryAddButton]}
                  onPress={() => router.push("/(auth)/(tabs)/subscription")}
                  accessibilityLabel="Add Subscription"
                >
                  <Ionicons name="add" size={22} color="#000000" />
                </Pressable>
              </View>
            </View>

            {/* TOTAL SPEND HERO CARD */}
            <View style={styles.heroCard}>
              <View style={styles.heroCardHeader}>
                <View style={styles.heroBadge}>
                  <View style={styles.emeraldGlowDot} />
                  <Text style={styles.heroBadgeText}>MONTHLY COMMITTED</Text>
                </View>
                <Text style={styles.heroActiveCount}>
                  {metrics.activeCount} Active Plans
                </Text>
              </View>

              <Text style={styles.heroAmount}>
                {formatCurrency(metrics.totalMonthly)}
                <Text style={styles.heroPeriod}> /mo</Text>
              </Text>

              <View style={styles.heroDivider} />

              <View style={styles.heroFooter}>
                <View style={styles.heroFooterCol}>
                  <Text style={styles.heroFooterLabel}>Annual Run-Rate</Text>
                  <Text style={styles.heroFooterValue}>
                    {formatCurrency(metrics.totalAnnual)}
                  </Text>
                </View>

                <View style={styles.heroVerticalDivider} />

                <View style={styles.heroFooterCol}>
                  <Text style={styles.heroFooterLabel}>Due This Week</Text>
                  <Text
                    style={[
                      styles.heroFooterValue,
                      {
                        color:
                          metrics.upcomingCount > 0 ? "#FBBF24" : "#CBD5E1",
                      },
                    ]}
                  >
                    {metrics.upcomingCount}{" "}
                    {metrics.upcomingCount === 1 ? "renewal" : "renewals"}
                  </Text>
                </View>
              </View>
            </View>

            {/* QUICK SHORTCUTS */}
            <View style={styles.shortcutRow}>
              <Pressable
                style={styles.shortcutCard}
                onPress={() => router.push("/(auth)/(tabs)/subscription")}
              >
                <View
                  style={[
                    styles.shortcutIconWrap,
                    { backgroundColor: "#0E241B" },
                  ]}
                >
                  <Ionicons name="layers-outline" size={20} color="#10B981" />
                </View>
                <View style={styles.shortcutTextWrap}>
                  <Text style={styles.shortcutTitle}>Manage Plans</Text>
                  <Text style={styles.shortcutSubtitle}>
                    View & add subscriptions
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color="#94A3B8" />
              </Pressable>

              <Pressable
                style={styles.shortcutCard}
                onPress={() => router.push("/(auth)/(tabs)/insight")}
              >
                <View
                  style={[
                    styles.shortcutIconWrap,
                    { backgroundColor: "#1A1B2E" },
                  ]}
                >
                  <Ionicons name="pie-chart-outline" size={20} color="#818CF8" />
                </View>
                <View style={styles.shortcutTextWrap}>
                  <Text style={styles.shortcutTitle}>Analytics</Text>
                  <Text style={styles.shortcutSubtitle}>
                    Category distribution
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color="#94A3B8" />
              </Pressable>
            </View>

            {/* UPCOMING BILLS SECTION */}
            {metrics.upcomingIn7Days.length > 0 && (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.pulsingDot} />
                    <Text style={styles.sectionTitle}>Renewing Soon</Text>
                  </View>
                  <Text style={styles.sectionActionText}>Next 7 Days</Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.upcomingScroll}
                >
                  {metrics.upcomingIn7Days.map((sub) => {
                    const daysLeft = getDaysUntilDue(sub.nextPaymentDate);
                    return (
                      <Pressable
                        key={sub.id}
                        style={styles.upcomingCard}
                        onPress={() =>
                          router.push({
                            pathname: "/(auth)/(tabs)/subscription/[id]",
                            params: { id: sub.id },
                          })
                        }
                      >
                        <View style={styles.upcomingCardTop}>
                          <CategoryIcon category={sub.category} size={36} />
                          <View
                            style={[
                              styles.dueBadge,
                              daysLeft <= 2
                                ? styles.dueBadgeUrgent
                                : styles.dueBadgeNormal,
                            ]}
                          >
                            <Text
                              style={[
                                styles.dueBadgeText,
                                daysLeft <= 2 && styles.dueBadgeTextUrgent,
                              ]}
                            >
                              {daysLeft === 0
                                ? "Today"
                                : daysLeft === 1
                                ? "Tomorrow"
                                : `In ${daysLeft}d`}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.upcomingName} numberOfLines={1}>
                          {sub.name}
                        </Text>
                        <Text style={styles.upcomingPrice}>
                          {formatCurrency(sub.price)}
                        </Text>
                        <Text style={styles.upcomingCycle}>
                          via {sub.paymentMethod.split(" ")[0]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* ALL SUBSCRIPTIONS LIST */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tracked Subscriptions</Text>
                <Pressable
                  onPress={() => router.push("/(auth)/(tabs)/subscription")}
                >
                  <Text style={styles.viewAllText}>
                    See All ({subscriptions.length})
                  </Text>
                </Pressable>
              </View>

              {subscriptions.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Illustration
                    name="empty-state-no-subscriptions"
                    width={190}
                    height={190}
                  />
                  <Text style={styles.emptyTitle}>No Subscriptions Yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Track your monthly recurring expenses in one clean dashboard.
                  </Text>
                  <Pressable
                    style={styles.emptyButton}
                    onPress={() => router.push("/(auth)/(tabs)/subscription")}
                  >
                    <Ionicons name="add" size={20} color="#000000" />
                    <Text style={styles.emptyButtonText}>Add First Plan</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.subsList}>
                  {subscriptions.slice(0, 5).map((sub) => {
                    const monthly = calculateMonthlyEquivalent(sub);
                    const daysLeft = getDaysUntilDue(sub.nextPaymentDate);

                    return (
                      <Pressable
                        key={sub.id}
                        style={({ pressed }) => [
                          styles.subCard,
                          pressed && styles.pressedCard,
                        ]}
                        onPress={() =>
                          router.push({
                            pathname: "/(auth)/(tabs)/subscription/[id]",
                            params: { id: sub.id },
                          })
                        }
                      >
                        <CategoryIcon category={sub.category} size={46} />

                        <View style={styles.subInfo}>
                          <Text style={styles.subName}>{sub.name}</Text>
                          <View style={styles.subMetaRow}>
                            <Text style={styles.subCycle}>
                              {sub.billingCycle.toUpperCase()}
                            </Text>
                            <Text style={styles.subDot}>•</Text>
                            <Text
                              style={[
                                styles.subDueDate,
                                daysLeft <= 5 && { color: "#FBBF24" },
                              ]}
                            >
                              {daysLeft <= 0
                                ? "Due today"
                                : `Due in ${daysLeft}d`}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.subPriceWrap}>
                          <Text style={styles.subPrice}>
                            {formatCurrency(sub.price)}
                          </Text>
                          {sub.billingCycle !== "monthly" && (
                            <Text style={styles.subEquivalent}>
                              ≈ {formatCurrency(monthly)}/mo
                            </Text>
                          )}
                        </View>

                        <Ionicons
                          name="chevron-forward"
                          size={17}
                          color="#94A3B8"
                          style={{ marginLeft: 6 }}
                        />
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  webScrollContent: {
    alignItems: "center",
  },
  container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  webContainer: {
    maxWidth: 680,
    paddingTop: 28,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greetingEyebrow: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  greetingName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#131B2C",
    borderWidth: 1,
    borderColor: "#26354D",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryAddButton: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  heroCard: {
    backgroundColor: "#131B2C",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#26354D",
    padding: 22,
    marginBottom: 20,
  },
  heroCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#081D14",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0F462E",
  },
  emeraldGlowDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#10B981",
  },
  heroBadgeText: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  heroActiveCount: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "700",
  },
  heroAmount: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1,
  },
  heroPeriod: {
    color: "#94A3B8",
    fontSize: 18,
    fontWeight: "600",
  },
  heroDivider: {
    height: 1,
    backgroundColor: "#26354D",
    marginVertical: 18,
  },
  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroFooterCol: {
    flex: 1,
  },
  heroFooterLabel: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 3,
    fontWeight: "600",
  },
  heroFooterValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  heroVerticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#26354D",
    marginHorizontal: 16,
  },
  shortcutRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: "#131B2C",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#26354D",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  shortcutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  shortcutTextWrap: {
    flex: 1,
  },
  shortcutTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  shortcutSubtitle: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 2,
  },
  sectionWrap: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FBBF24",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  sectionActionText: {
    color: "#FBBF24",
    fontSize: 12,
    fontWeight: "800",
  },
  viewAllText: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "800",
  },
  upcomingScroll: {
    gap: 12,
    paddingRight: 20,
  },
  upcomingCard: {
    width: 155,
    backgroundColor: "#131B2C",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#26354D",
    padding: 14,
  },
  upcomingCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  dueBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dueBadgeUrgent: {
    backgroundColor: "#331E12",
    borderWidth: 1,
    borderColor: "#6C3411",
  },
  dueBadgeNormal: {
    backgroundColor: "#1B253B",
  },
  dueBadgeText: {
    color: "#CBD5E1",
    fontSize: 10,
    fontWeight: "800",
  },
  dueBadgeTextUrgent: {
    color: "#FBBF24",
  },
  upcomingName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },
  upcomingPrice: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  upcomingCycle: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 2,
  },
  subsList: {
    gap: 10,
  },
  subCard: {
    backgroundColor: "#131B2C",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#26354D",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  pressedCard: {
    opacity: 0.82,
    backgroundColor: "#1A243A",
  },
  subInfo: {
    flex: 1,
    marginLeft: 14,
  },
  subName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  subMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  subCycle: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  subDot: {
    color: "#64748B",
    fontSize: 12,
  },
  subDueDate: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "600",
  },
  subPriceWrap: {
    alignItems: "flex-end",
  },
  subPrice: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  subEquivalent: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 2,
  },
  emptyWrap: {
    backgroundColor: "#131B2C",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#26354D",
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    color: "#CBD5E1",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: 18,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#10B981",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "900",
  },
});