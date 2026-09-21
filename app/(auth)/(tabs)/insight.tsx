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
import { theme } from "@/constants/theme";
import {
  calculateMonthlyEquivalent,
  getMetrics,
  getSubscriptions,
  Subscription,
  SubscriptionCategory,
} from "@/lib/subscriptions";

const CATEGORY_COLORS: Record<SubscriptionCategory, string> = {
  streaming: "#EF4444", // Red
  music: "#2563EB", // Royal Blue
  software: "#3B82F6", // Blue
  cloud: "#0284C7", // Sky
  fitness: "#0D9488", // Teal
  gaming: "#7C3AED", // Violet
  reading: "#D97706", // Amber
  utilities: "#EC4899", // Pink
  other: "#64748B", // Slate
};

export default function InsightsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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

  const metrics = getMetrics(subscriptions);
  const activeSubs = subscriptions.filter((s) => s.active);
  const avgCost =
    activeSubs.length > 0 ? metrics.totalMonthly / activeSubs.length : 0;

  const sortedByCost = [...activeSubs].sort(
    (a, b) => calculateMonthlyEquivalent(b) - calculateMonthlyEquivalent(a)
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
            <View style={styles.header}>
              <Text style={styles.headerEyebrow}>FINANCIAL INTELLIGENCE</Text>
              <Text style={styles.headerTitle}>Spending Analytics</Text>
              <Text style={styles.headerSubtitle}>
                Analyze your recurring portfolio and identify optimization
                opportunities
              </Text>
            </View>

            {/* METRICS ROW */}
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <View style={styles.metricIconWrap}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.metricLabel}>MONTHLY RUN-RATE</Text>
                <Text style={styles.metricValue}>
                  {formatCurrency(metrics.totalMonthly)}
                </Text>
                <Text style={styles.metricSub}>
                  Across {metrics.activeCount} active plans
                </Text>
              </View>

              <View style={styles.metricCard}>
                <View
                  style={[
                    styles.metricIconWrap,
                    { backgroundColor: theme.colors.secondaryLight },
                  ]}
                >
                  <Ionicons
                    name="globe-outline"
                    size={18}
                    color={theme.colors.secondary}
                  />
                </View>
                <Text style={styles.metricLabel}>PROJECTED ANNUAL</Text>
                <Text style={styles.metricValue}>
                  {formatCurrency(metrics.totalAnnual)}
                </Text>
                <Text style={styles.metricSub}>
                  Avg {formatCurrency(avgCost)}/sub
                </Text>
              </View>
            </View>

            {/* CATEGORY BREAKDOWN */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons
                    name="pie-chart-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Category Distribution</Text>
                </View>
                <Text style={styles.sectionSub}>% of monthly total</Text>
              </View>

              {/* STACKED MULTI-SEGMENT PROGRESS BAR */}
              <View style={styles.stackedBar}>
                {metrics.categoryBreakdown.map((item) => (
                  <View
                    key={item.category}
                    style={[
                      styles.stackedBarSegment,
                      {
                        flex: Math.max(item.percentage, 1),
                        backgroundColor:
                          CATEGORY_COLORS[item.category] ||
                          theme.colors.textSecondary,
                      },
                    ]}
                  />
                ))}
              </View>

              {/* CATEGORY LIST ROWS */}
              <View style={styles.categoryList}>
                {metrics.categoryBreakdown.map((item, idx) => {
                  const color =
                    CATEGORY_COLORS[item.category] || theme.colors.textSecondary;
                  const isLast = idx === metrics.categoryBreakdown.length - 1;
                  return (
                    <View
                      key={item.category}
                      style={[
                        styles.categoryRow,
                        isLast && { borderBottomWidth: 0 },
                      ]}
                    >
                      <View style={styles.categoryLeft}>
                        <CategoryIcon category={item.category} size={36} />
                        <View style={{ marginLeft: 12 }}>
                          <Text style={styles.categoryName}>
                            {item.category.charAt(0).toUpperCase() +
                              item.category.slice(1)}
                          </Text>
                          <Text style={styles.categoryPct}>
                            {item.percentage.toFixed(1)}% of budget
                          </Text>
                        </View>
                      </View>

                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.categoryAmount}>
                          {formatCurrency(item.amount)}
                          <Text style={{ fontSize: 11, color: theme.colors.textSecondary }}>
                            /mo
                          </Text>
                        </Text>
                        <View style={styles.colorIndicatorRow}>
                          <View
                            style={[
                              styles.colorDot,
                              { backgroundColor: color },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* OPTIMIZATION & SAVINGS OPPORTUNITIES */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons
                    name="bulb-outline"
                    size={18}
                    color={theme.colors.warning}
                  />
                  <Text style={styles.sectionTitle}>
                    Optimization & Insights
                  </Text>
                </View>
              </View>

              <View style={styles.tipCard}>
                <View style={styles.tipIconWrap}>
                  <Ionicons
                    name="sparkles"
                    size={18}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Annual Billing Arbitrage</Text>
                  <Text style={styles.tipDesc}>
                    You have several entertainment subscriptions billed
                    monthly. Switching to annual cycles on streaming and cloud
                    storage typically saves up to 15% ($42/yr).
                  </Text>
                </View>
              </View>

              <View style={[styles.tipCard, { marginTop: 10 }]}>
                <View
                  style={[
                    styles.tipIconWrap,
                    { backgroundColor: theme.colors.warningBg },
                  ]}
                >
                  <Ionicons
                    name="flash-outline"
                    size={18}
                    color={theme.colors.warning}
                  />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Upcoming Renewal Volume</Text>
                  <Text style={styles.tipDesc}>
                    {metrics.upcomingCount > 0
                      ? `${metrics.upcomingCount} subscriptions will renew in the next 7 days. Verify your primary payment method.`
                      : "No heavy payment clusters in the immediate 7-day period."}
                  </Text>
                </View>
              </View>
            </View>

            {/* TOP 3 LARGEST EXPENSES */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons
                    name="trending-up-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Top Commitments</Text>
                </View>
              </View>

              <View style={styles.topExpensesList}>
                {sortedByCost.slice(0, 3).map((sub, idx) => {
                  const monthly = calculateMonthlyEquivalent(sub);
                  const isLast = idx === sortedByCost.slice(0, 3).length - 1;
                  return (
                    <Pressable
                      key={sub.id}
                      style={[
                        styles.topExpenseRow,
                        isLast && { borderBottomWidth: 0 },
                      ]}
                      onPress={() =>
                        router.push({
                          pathname: "/(auth)/(tabs)/subscription/[id]",
                          params: { id: sub.id },
                        })
                      }
                    >
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankText}>#{idx + 1}</Text>
                      </View>

                      <CategoryIcon category={sub.category} size={38} />

                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.topExpenseName}>{sub.name}</Text>
                        <Text style={styles.topExpenseSub}>
                          {sub.billingCycle.toUpperCase()} • via{" "}
                          {sub.paymentMethod.split(" ")[0]}
                        </Text>
                      </View>

                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.topExpensePrice}>
                          {formatCurrency(sub.price)}
                        </Text>
                        {sub.billingCycle !== "monthly" && (
                          <Text style={styles.topExpenseMonthly}>
                            ≈ {formatCurrency(monthly)}/mo
                          </Text>
                        )}
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={theme.colors.textMuted}
                        style={{ marginLeft: 8 }}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
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
  header: { marginBottom: 20 },
  headerEyebrow: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
    maxWidth: 600,
  },

  // METRICS
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.subtle,
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  metricLabel: {
    color: theme.colors.textSecondary,
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  metricSub: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },

  // SECTION CARD
  sectionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 16,
    ...theme.shadows.subtle,
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
    gap: 6,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 15.5,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  sectionSub: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },

  // STACKED BAR
  stackedBar: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: theme.colors.backgroundAlt,
    gap: 2,
  },
  stackedBarSegment: {
    height: "100%",
    borderRadius: 2,
  },

  // CATEGORY LIST
  categoryList: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: 4,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  categoryPct: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  categoryAmount: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  colorIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // TIPS
  tipCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    color: theme.colors.text,
    fontSize: 13.5,
    fontWeight: "700",
    marginBottom: 3,
  },
  tipDesc: {
    color: theme.colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
  },

  // TOP EXPENSES
  topExpensesList: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: 4,
  },
  topExpenseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rankText: {
    color: theme.colors.textSecondary,
    fontSize: 11.5,
    fontWeight: "700",
  },
  topExpenseName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  topExpenseSub: {
    color: theme.colors.textSecondary,
    fontSize: 11.5,
    marginTop: 2,
  },
  topExpensePrice: {
    color: theme.colors.text,
    fontSize: 14.5,
    fontWeight: "800",
  },
  topExpenseMonthly: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
});