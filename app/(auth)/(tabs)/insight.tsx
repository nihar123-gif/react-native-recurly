import React, { useCallback, useState } from "react";
import {
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
import {
  calculateMonthlyEquivalent,
  getMetrics,
  getSubscriptions,
  Subscription,
  SubscriptionCategory,
} from "@/lib/subscriptions";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";

const CATEGORY_COLORS: Record<SubscriptionCategory, string> = {
  streaming: "#FB7185", // Rose
  music: "#10B981", // Emerald
  software: "#60A5FA", // Blue
  cloud: "#38BDF8", // Sky
  fitness: "#34D399", // Mint
  gaming: "#A78BFA", // Violet
  reading: "#FBBF24", // Amber
  utilities: "#F472B6", // Pink
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
              tintColor="#10B981"
            />
          }
        >
          <View style={[styles.container, isWeb && styles.webContainer]}>
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.headerEyebrow}>FINANCIAL INTELLIGENCE</Text>
              <Text style={styles.headerTitle}>Spending Analytics</Text>
              <Text style={styles.headerSubtitle}>
                Analyze your recurring portfolio and identify optimization opportunities
              </Text>
            </View>

            {/* METRICS ROW */}
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <View style={styles.metricIconWrap}>
                  <Ionicons name="calendar-outline" size={18} color="#10B981" />
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
                    { backgroundColor: "#1C172E" },
                  ]}
                >
                  <Ionicons name="globe-outline" size={18} color="#A78BFA" />
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
                  <Ionicons name="pie-chart-outline" size={18} color="#10B981" />
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
                          CATEGORY_COLORS[item.category] || "#64748B",
                      },
                    ]}
                  />
                ))}
              </View>

              {/* CATEGORY LIST ROWS */}
              <View style={styles.categoryList}>
                {metrics.categoryBreakdown.map((item) => {
                  const color = CATEGORY_COLORS[item.category] || "#64748B";
                  return (
                    <View key={item.category} style={styles.categoryRow}>
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
                          <Text style={{ fontSize: 11, color: "#64748B" }}>
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
                  <Ionicons name="bulb-outline" size={18} color="#FBBF24" />
                  <Text style={styles.sectionTitle}>
                    Optimization & Insights
                  </Text>
                </View>
              </View>

              <View style={styles.tipCard}>
                <View style={styles.tipIconWrap}>
                  <Ionicons name="sparkles" size={18} color="#10B981" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Annual Billing Arbitrage</Text>
                  <Text style={styles.tipDesc}>
                    You have several entertainment subscriptions billed monthly.
                    Switching to annual cycles on streaming and cloud storage typically saves up to 15% ($42/yr).
                  </Text>
                </View>
              </View>

              <View style={styles.tipCard}>
                <View
                  style={[styles.tipIconWrap, { backgroundColor: "#331E12" }]}
                >
                  <Ionicons name="flash-outline" size={18} color="#FBBF24" />
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
                  <Ionicons name="trending-up-outline" size={18} color="#FB7185" />
                  <Text style={styles.sectionTitle}>Top Commitments</Text>
                </View>
              </View>

              <View style={styles.topExpensesList}>
                {sortedByCost.slice(0, 3).map((sub, idx) => {
                  const monthly = calculateMonthlyEquivalent(sub);
                  return (
                    <Pressable
                      key={sub.id}
                      style={styles.topExpenseRow}
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

                      <CategoryIcon category={sub.category} size={40} />

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
                          <Text style={styles.topExpenseEquiv}>
                            ≈ {formatCurrency(monthly)}/mo
                          </Text>
                        )}
                      </View>
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
  safeArea: { flex: 1, backgroundColor: "transparent" },
  scrollContent: { flexGrow: 1, paddingBottom: 50 },
  webScrollContent: { alignItems: "center" },
  container: { width: "100%", paddingHorizontal: 20, paddingTop: 16 },
  webContainer: { maxWidth: 680, paddingTop: 28 },
  header: { marginBottom: 20 },
  headerEyebrow: {
    color: "#34D399",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    color: "#F8FAFC",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#64748B",
    fontSize: 13,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "rgba(18, 28, 46, 0.7)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 16,
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#081D14",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  metricLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metricValue: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 2,
  },
  metricSub: {
    color: "#94A3B8",
    fontSize: 11,
  },
  sectionCard: {
    backgroundColor: "rgba(18, 28, 46, 0.7)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 18,
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "900",
  },
  sectionSub: {
    color: "#64748B",
    fontSize: 12,
  },
  stackedBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#161D2A",
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 18,
  },
  stackedBarSegment: {
    height: "100%",
  },
  categoryList: {
    gap: 12,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#161D2A",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryName: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 2,
  },
  categoryPct: {
    color: "#64748B",
    fontSize: 11,
  },
  categoryAmount: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "800",
  },
  colorIndicatorRow: {
    marginTop: 4,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "rgba(18, 28, 46, 0.6)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#161D2A",
    padding: 14,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  tipIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#081D14",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 3,
  },
  tipDesc: {
    color: "#8290A4",
    fontSize: 12,
    lineHeight: 17,
  },
  topExpensesList: {
    gap: 10,
  },
  topExpenseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#161D2A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rankText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
  },
  topExpenseName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 2,
  },
  topExpenseSub: {
    color: "#64748B",
    fontSize: 11,
  },
  topExpensePrice: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  topExpenseEquiv: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 2,
  },
});