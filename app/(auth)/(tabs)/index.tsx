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
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";

import AppBackground from "@/components/ui/AppBackground";
import CategoryIcon from "@/components/ui/CategoryIcon";
import Illustration from "@/components/ui/Illustration";
import Badge from "@/components/ui/Badge";
import { theme } from "@/constants/theme";
import { getSession } from "@/lib/auth";
import {
  calculateMonthlyEquivalent,
  getDaysUntilDue,
  getMetrics,
  getSubscriptions,
  Subscription,
} from "@/lib/subscriptions";

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
  const monthlyCents =
    (metrics.totalMonthly % 1).toFixed(2).split(".")[1] || "00";

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
            {/* TOP BAR */}
            <View style={styles.topBar}>
              <View>
                <Text style={styles.greetingEyebrow}>PORTFOLIO OVERVIEW</Text>
                <Text style={styles.greetingName}>
                  Welcome back, <Text style={styles.greetingHighlight}>{userName}</Text>
                </Text>
              </View>

              <View style={styles.topActions}>
                <Pressable
                  style={styles.profileButton}
                  onPress={() => router.push("/(auth)/(tabs)/profile")}
                  accessibilityLabel="Profile"
                >
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </Pressable>

                <Pressable
                  style={styles.primaryAddButton}
                  onPress={() => router.push("/(auth)/(tabs)/subscription")}
                  accessibilityLabel="Add Subscription"
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryAddButtonText}>Add Plan</Text>
                </Pressable>
              </View>
            </View>

            {/* EXECUTIVE SUMMARY CARD (DARK NAVY ANCHOR) */}
            <View style={styles.heroCard}>
              <View style={styles.heroCardHeader}>
                <View style={styles.heroBadge}>
                  <View style={styles.heroBadgeDot} />
                  <Text style={styles.heroBadgeText}>MONTHLY COMMITTED</Text>
                </View>
                <View style={styles.heroActiveCountBadge}>
                  <Text style={styles.heroActiveCountText}>
                    {metrics.activeCount} Active Plans
                  </Text>
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
                    <Text
                      style={[
                        styles.heroDueValue,
                        metrics.upcomingCount > 0 && styles.heroDueValueWarning,
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
                      <Text style={styles.heroAvgValue}>
                        {formatCurrency(
                          metrics.totalMonthly /
                            Math.max(1, metrics.activeCount)
                        )}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* QUICK SHORTCUTS */}
            <View style={styles.shortcutRow}>
              <Pressable
                style={styles.shortcutCard}
                onPress={() => router.push("/(auth)/(tabs)/subscription")}
              >
                <View style={styles.shortcutIconWrap}>
                  <Ionicons
                    name="layers-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.shortcutTextWrap}>
                  <Text style={styles.shortcutTitle}>Manage Plans</Text>
                  <Text style={styles.shortcutSubtitle}>
                    View & add subscriptions
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.colors.textMuted}
                />
              </Pressable>

              <Pressable
                style={styles.shortcutCard}
                onPress={() => router.push("/(auth)/(tabs)/insight")}
              >
                <View
                  style={[
                    styles.shortcutIconWrap,
                    { backgroundColor: theme.colors.secondaryLight },
                  ]}
                >
                  <Ionicons
                    name="pie-chart-outline"
                    size={20}
                    color={theme.colors.secondary}
                  />
                </View>
                <View style={styles.shortcutTextWrap}>
                  <Text style={styles.shortcutTitle}>Analytics</Text>
                  <Text style={styles.shortcutSubtitle}>
                    Category distribution
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.colors.textMuted}
                />
              </Pressable>
            </View>

            {/* UPCOMING BILLS SECTION */}
            {metrics.upcomingIn7Days.length > 0 && (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>Renewing Soon</Text>
                  </View>
                  <Badge label="Next 7 Days" variant="warning" />
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.upcomingScroll}
                >
                  {metrics.upcomingIn7Days.map((sub) => {
                    const daysLeft = getDaysUntilDue(sub.nextPaymentDate);
                    const isUrgent = daysLeft <= 2;
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
                          <CategoryIcon category={sub.category} size={38} />
                          <Badge
                            label={
                              daysLeft === 0
                                ? "Due Today"
                                : daysLeft === 1
                                ? "Tomorrow"
                                : `In ${daysLeft}d`
                            }
                            variant={isUrgent ? "error" : "warning"}
                          />
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
                  style={styles.viewAllButton}
                >
                  <Text style={styles.viewAllText}>
                    See All ({subscriptions.length})
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={theme.colors.primary}
                  />
                </Pressable>
              </View>

              {subscriptions.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Illustration
                    name="empty-state-no-subscriptions"
                    width={180}
                    height={180}
                  />
                  <Text style={styles.emptyTitle}>No Subscriptions Yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Track your recurring monthly expenses in one clean dashboard.
                  </Text>
                  <Pressable
                    style={styles.emptyButton}
                    onPress={() => router.push("/(auth)/(tabs)/subscription")}
                  >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
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
                          pressed && styles.subCardPressed,
                        ]}
                        onPress={() =>
                          router.push({
                            pathname: "/(auth)/(tabs)/subscription/[id]",
                            params: { id: sub.id },
                          })
                        }
                      >
                        <View style={styles.subIconWrap}>
                          <CategoryIcon category={sub.category} size={40} />
                        </View>

                        <View style={styles.subInfo}>
                          <Text style={styles.subName}>{sub.name}</Text>
                          <View style={styles.subMetaRow}>
                            <Text style={styles.subCycle}>
                              {sub.billingCycle.toUpperCase()}
                            </Text>
                            <Text style={styles.subMetaDot}>•</Text>
                            <Text
                              style={[
                                styles.subDueDate,
                                daysLeft <= 3 && styles.subDueDateUrgent,
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
                          size={18}
                          color={theme.colors.textMuted}
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
    paddingBottom: 60,
  },
  container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  webContainer: {
    maxWidth: 920,
    paddingTop: 32,
    paddingHorizontal: 32,
  },

  // TOP BAR
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greetingEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  greetingName: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -0.4,
  },
  greetingHighlight: {
    color: theme.colors.primary,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profileButton: {
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
  primaryAddButton: {
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
  primaryAddButtonText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },

  // EXECUTIVE HERO CARD (DARK NAVY)
  heroCard: {
    backgroundColor: theme.colors.darkNavy,
    borderRadius: theme.borderRadius.xl,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.darkNavyBorder,
    ...theme.shadows.card,
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
    gap: 6,
  },
  heroBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.colors.secondary,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#94A3B8",
  },
  heroActiveCountBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  heroActiveCountText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#E2E8F0",
  },
  heroAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  heroCurrencySymbol: {
    fontSize: 26,
    fontWeight: "700",
    color: theme.colors.secondaryLight,
    marginRight: 2,
  },
  heroAmountInt: {
    fontSize: 38,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  heroAmountDec: {
    fontSize: 24,
    fontWeight: "800",
    color: "#E2E8F0",
  },
  heroPeriod: {
    fontSize: 15,
    fontWeight: "600",
    color: "#94A3B8",
    marginLeft: 4,
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 14,
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
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    marginBottom: 4,
  },
  heroAnnualValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  heroDueValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#E2E8F0",
    letterSpacing: -0.2,
  },
  heroDueValueWarning: {
    color: "#FBBF24",
  },
  heroAvgValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#93C5FD",
    letterSpacing: -0.2,
  },
  heroVerticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 12,
  },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  // SHORTCUTS
  shortcutRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  shortcutCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  shortcutIconWrap: {
    width: 38,
    height: 38,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  shortcutTextWrap: {
    flex: 1,
  },
  shortcutTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: theme.colors.text,
    letterSpacing: -0.2,
  },
  shortcutSubtitle: {
    fontSize: 11.5,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },

  // SECTION
  sectionWrap: {
    marginBottom: 26,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
  },

  // UPCOMING CARDS
  upcomingScroll: {
    gap: 12,
    paddingRight: 12,
  },
  upcomingCard: {
    width: 170,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.card,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  upcomingCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  upcomingName: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  upcomingPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  upcomingCycle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // SUBSCRIPTION LIST
  subsList: {
    gap: 10,
  },
  subCardPressable: {
    width: "100%",
  },
  subCard: {
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
  subCardPressed: {
    backgroundColor: theme.colors.backgroundAlt,
  },
  subIconWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  subInfo: {
    flex: 1,
  },
  subName: {
    fontSize: 14.5,
    fontWeight: "700",
    color: theme.colors.text,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  subMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  subCycle: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    letterSpacing: 0.4,
  },
  subMetaDot: {
    color: theme.colors.textMuted,
    fontSize: 10,
  },
  subDueDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  subDueDateUrgent: {
    color: theme.colors.warningText,
    fontWeight: "700",
  },
  subPriceWrap: {
    alignItems: "flex-end",
  },
  subPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -0.2,
  },
  subEquivalent: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // EMPTY STATE
  emptyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyButton: {
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
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
});
