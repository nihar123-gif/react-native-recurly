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
import { LinearGradient } from "expo-linear-gradient";
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

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const monthlyInt = Math.floor(metrics.totalMonthly).toLocaleString("en-US");
  const monthlyCents = (metrics.totalMonthly % 1).toFixed(2).split(".")[1] || "00";

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
                <View style={styles.eyebrowRow}>
                  <View style={styles.eyebrowDot} />
                  <Text style={styles.greetingEyebrow}>PORTFOLIO OVERVIEW</Text>
                </View>
                <Text style={styles.greetingName}>
                  <Text style={styles.greetingPrefix}>Welcome back, </Text>
                  <Text style={styles.greetingHighlight}>{userName}</Text>
                </Text>
              </View>

              <View style={styles.topActions}>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => router.push("/(auth)/(tabs)/profile")}
                  accessibilityLabel="Profile"
                >
                  <Ionicons name="person-outline" size={19} color="#34D399" />
                </Pressable>

                <Pressable
                  style={styles.primaryAddButton}
                  onPress={() => router.push("/(auth)/(tabs)/subscription")}
                  accessibilityLabel="Add Subscription"
                >
                  <LinearGradient
                    colors={["#34D399", "#10B981", "#059669"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.primaryAddGradient}
                  >
                    <Ionicons name="add" size={22} color="#04180F" />
                  </LinearGradient>
                </Pressable>
              </View>
            </View>

            {/* TOTAL SPEND HERO CARD */}
            <LinearGradient
              colors={["#122338", "#0C1929", "#08101E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroCardHeader}>
                <View style={styles.heroBadge}>
                  <View style={styles.emeraldGlowDot} />
                  <Text style={styles.heroBadgeText}>MONTHLY COMMITTED</Text>
                </View>
                <View style={styles.heroActiveCountBadge}>
                  <Text style={styles.heroActiveCountNum}>
                    {metrics.activeCount}
                  </Text>
                  <Text style={styles.heroActiveCountLabel}> Active Plans</Text>
                </View>
              </View>

              <View style={styles.heroAmountRow}>
                <Text style={styles.heroCurrencySymbol}>$</Text>
                <Text style={styles.heroAmountInt}>{monthlyInt}</Text>
                <Text style={styles.heroAmountDec}>.{monthlyCents}</Text>
                <Text style={styles.heroPeriod}> /mo</Text>
              </View>

              <View style={styles.heroDivider} />

              <View style={styles.heroFooter}>
                <View style={styles.heroFooterCol}>
                  <Text style={styles.heroFooterLabel}>Annual Run-Rate</Text>
                  <Text style={styles.heroAnnualValue}>
                    {formatCurrency(metrics.totalAnnual)}
                  </Text>
                </View>

                <View style={styles.heroVerticalDivider} />

                <View style={styles.heroFooterCol}>
                  <Text style={styles.heroFooterLabel}>Due This Week</Text>
                  <View style={styles.dueRow}>
                    {metrics.upcomingCount > 0 && <View style={styles.dueDot} />}
                    <Text
                      style={[
                        styles.heroDueValue,
                        {
                          color:
                            metrics.upcomingCount > 0 ? "#FBBF24" : "#94A3B8",
                        },
                      ]}
                    >
                      {metrics.upcomingCount}{" "}
                      {metrics.upcomingCount === 1 ? "renewal" : "renewals"}
                    </Text>
                  </View>
                </View>

                {isWeb && (
                  <>
                    <View style={styles.heroVerticalDivider} />
                    <View style={styles.heroFooterCol}>
                      <Text style={styles.heroFooterLabel}>Avg / Active Plan</Text>
                      <Text style={[styles.heroAnnualValue, { color: "#34D399" }]}>
                        {formatCurrency(metrics.totalMonthly / Math.max(1, metrics.activeCount))}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </LinearGradient>

            {/* QUICK SHORTCUTS */}
            <View style={styles.shortcutRow}>
              <Pressable
                style={styles.shortcutPressable}
                onPress={() => router.push("/(auth)/(tabs)/subscription")}
              >
                <LinearGradient
                  colors={["#121D30", "#0C1423"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shortcutCard}
                >
                  <View
                    style={[
                      styles.shortcutIconWrap,
                      { backgroundColor: "rgba(16, 185, 129, 0.14)", borderColor: "rgba(16, 185, 129, 0.3)" },
                    ]}
                  >
                    <Ionicons name="layers-outline" size={20} color="#34D399" />
                  </View>
                  <View style={styles.shortcutTextWrap}>
                    <Text style={styles.shortcutTitlePlans}>Manage Plans</Text>
                    <Text style={styles.shortcutSubtitle}>
                      View & add subscriptions
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#34D399" />
                </LinearGradient>
              </Pressable>

              <Pressable
                style={styles.shortcutPressable}
                onPress={() => router.push("/(auth)/(tabs)/insight")}
              >
                <LinearGradient
                  colors={["#121D30", "#0C1423"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shortcutCard}
                >
                  <View
                    style={[
                      styles.shortcutIconWrap,
                      { backgroundColor: "rgba(129, 140, 248, 0.14)", borderColor: "rgba(129, 140, 248, 0.3)" },
                    ]}
                  >
                    <Ionicons name="pie-chart-outline" size={20} color="#A5B4FC" />
                  </View>
                  <View style={styles.shortcutTextWrap}>
                    <Text style={styles.shortcutTitleAnalytics}>Analytics</Text>
                    <Text style={styles.shortcutSubtitle}>
                      Category distribution
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#A5B4FC" />
                </LinearGradient>
              </Pressable>
            </View>

            {/* UPCOMING BILLS SECTION */}
            {metrics.upcomingIn7Days.length > 0 && (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.pulsingDot} />
                    <Text style={styles.sectionTitleRenew}>Renewing Soon</Text>
                  </View>
                  <View style={styles.sectionBadgeWrap}>
                    <Text style={styles.sectionActionText}>Next 7 Days</Text>
                  </View>
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
                        style={styles.upcomingPressable}
                        onPress={() =>
                          router.push({
                            pathname: "/(auth)/(tabs)/subscription/[id]",
                            params: { id: sub.id },
                          })
                        }
                      >
                        <LinearGradient
                          colors={["#132238", "#0D1729"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.upcomingCard}
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
                        </LinearGradient>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* ALL SUBSCRIPTIONS LIST */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitleTracked}>
                  Tracked Subscriptions
                </Text>
                <Pressable
                  onPress={() => router.push("/(auth)/(tabs)/subscription")}
                  style={styles.viewAllButton}
                >
                  <Text style={styles.viewAllText}>
                    See All ({subscriptions.length})
                  </Text>
                  <Ionicons name="arrow-forward" size={13} color="#34D399" />
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
                    <Ionicons name="add" size={20} color="#04180F" />
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
                          styles.subCardPressable,
                          pressed && styles.pressedCard,
                        ]}
                        onPress={() =>
                          router.push({
                            pathname: "/(auth)/(tabs)/subscription/[id]",
                            params: { id: sub.id },
                          })
                        }
                      >
                        <LinearGradient
                          colors={["#121D32", "#0C1525"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.subCard}
                        >
                          <CategoryIcon category={sub.category} size={44} />

                          <View style={styles.subInfo}>
                            <Text style={styles.subName}>{sub.name}</Text>
                            <View style={styles.subMetaRow}>
                              <View style={styles.subCycleBadge}>
                                <Text style={styles.subCycle}>
                                  {sub.billingCycle.toUpperCase()}
                                </Text>
                              </View>
                              <Text style={styles.subDot}>•</Text>
                              <Text
                                style={[
                                  styles.subDueDate,
                                  daysLeft <= 5 && styles.subDueDateUrgent,
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
                            size={16}
                            color="#34D399"
                            style={{ marginLeft: 8 }}
                          />
                        </LinearGradient>
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
    paddingBottom: 120,
  },
  container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  webContainer: {
    maxWidth: 880,
    paddingTop: 36,
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34D399",
  },
  greetingEyebrow: {
    color: "#34D399",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.8,
  },
  greetingName: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  greetingPrefix: {
    color: "#94A3B8",
  },
  greetingHighlight: {
    color: "#34D399",
    textShadowColor: "rgba(52, 211, 153, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    cursor: "pointer" as any,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(18, 28, 46, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryAddButton: {
    cursor: "pointer" as any,
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryAddGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(52, 211, 153, 0.35)",
    padding: 22,
    marginBottom: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  heroCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(16, 185, 129, 0.16)",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.4)",
  },
  emeraldGlowDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#34D399",
    shadowColor: "#34D399",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  heroBadgeText: {
    color: "#34D399",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  heroActiveCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52, 211, 153, 0.1)",
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.25)",
  },
  heroActiveCountNum: {
    color: "#34D399",
    fontSize: 12,
    fontWeight: "900",
  },
  heroActiveCountLabel: {
    color: "#A7F3D0",
    fontSize: 12,
    fontWeight: "700",
  },
  heroAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginVertical: 4,
  },
  heroCurrencySymbol: {
    color: "#34D399",
    fontSize: 32,
    fontWeight: "900",
    marginRight: 3,
    textShadowColor: "rgba(52, 211, 153, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroAmountInt: {
    color: "#34D399",
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: -1.2,
    textShadowColor: "rgba(52, 211, 153, 0.45)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  heroAmountDec: {
    color: "#6EE7B7",
    fontSize: 24,
    fontWeight: "800",
  },
  heroPeriod: {
    color: "#A7F3D0",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 4,
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(52, 211, 153, 0.15)",
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
    marginBottom: 4,
    fontWeight: "600",
  },
  heroAnnualValue: {
    color: "#38BDF8",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FBBF24",
  },
  heroDueValue: {
    fontSize: 15,
    fontWeight: "900",
  },
  heroVerticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginHorizontal: 16,
  },
  shortcutRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  shortcutPressable: {
    cursor: "pointer" as any,
    flex: 1,
  },
  shortcutCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  shortcutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  shortcutTextWrap: {
    flex: 1,
  },
  shortcutTitlePlans: {
    color: "#34D399",
    fontSize: 13,
    fontWeight: "900",
  },
  shortcutTitleAnalytics: {
    color: "#A5B4FC",
    fontSize: 13,
    fontWeight: "900",
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
    shadowColor: "#FBBF24",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  sectionTitleRenew: {
    color: "#FBBF24",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  sectionTitleTracked: {
    color: "#38BDF8",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  sectionBadgeWrap: {
    backgroundColor: "rgba(251, 191, 36, 0.12)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  sectionActionText: {
    color: "#FBBF24",
    fontSize: 11,
    fontWeight: "800",
  },
  viewAllButton: {
    cursor: "pointer" as any,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    color: "#34D399",
    fontSize: 13,
    fontWeight: "800",
  },
  upcomingScroll: {
    gap: 12,
    paddingRight: 20,
  },
  upcomingPressable: {
    cursor: "pointer" as any,
    width: 155,
  },
  upcomingCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
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
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.4)",
  },
  dueBadgeNormal: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
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
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },
  upcomingPrice: {
    color: "#34D399",
    fontSize: 17,
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
  subCardPressable: {
    cursor: "pointer" as any,
    borderRadius: 18,
  },
  subCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  pressedCard: {
    opacity: 0.85,
    transform: [{ scale: 0.995 }],
  },
  subInfo: {
    flex: 1,
    marginLeft: 14,
  },
  subName: {
    color: "#E2E8F0",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  subMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  subCycleBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.28)",
  },
  subCycle: {
    color: "#34D399",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  subDot: {
    color: "#475569",
    fontSize: 12,
  },
  subDueDate: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
  subDueDateUrgent: {
    color: "#FBBF24",
    fontWeight: "700",
  },
  subPriceWrap: {
    alignItems: "flex-end",
  },
  subPrice: {
    color: "#34D399",
    fontSize: 17,
    fontWeight: "900",
  },
  subEquivalent: {
    color: "#6EE7B7",
    fontSize: 11,
    marginTop: 2,
  },
  emptyWrap: {
    backgroundColor: "rgba(18, 29, 48, 0.8)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: "#38BDF8",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    color: "#94A3B8",
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
    color: "#04180F",
    fontSize: 14,
    fontWeight: "900",
  },
});
