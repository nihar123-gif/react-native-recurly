import AsyncStorage from "@react-native-async-storage/async-storage";

export type SubscriptionCategory =
  | "streaming"
  | "music"
  | "cloud"
  | "gaming"
  | "fitness"
  | "reading"
  | "software"
  | "utilities";

export type BillingCycle = "monthly" | "yearly" | "weekly" | "quarterly";

export type Subscription = {
  id: string;
  name: string;
  category: SubscriptionCategory;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  firstBillDate?: string;
  nextPaymentDate: string; // ISO date string YYYY-MM-DD
  paymentMethod: string;
  notes?: string;
  active: boolean;
  remindMe: boolean;
  color?: string;
};

const SUBSCRIPTIONS_KEY = "@recurly_subscriptions_v1";

export const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub-1",
    name: "Spotify Premium",
    category: "music",
    price: 10.99,
    currency: "$",
    billingCycle: "monthly",
    nextPaymentDate: "2026-09-22",
    paymentMethod: "Apple Pay (•• 4291)",
    notes: "Individual Premium plan",
    active: true,
    remindMe: true,
  },
  {
    id: "sub-2",
    name: "Netflix 4K HDR",
    category: "streaming",
    price: 22.99,
    currency: "$",
    billingCycle: "monthly",
    nextPaymentDate: "2026-09-25",
    paymentMethod: "Mastercard (•• 8812)",
    notes: "Standard with 4 screens",
    active: true,
    remindMe: true,
  },
  {
    id: "sub-3",
    name: "ChatGPT Plus",
    category: "software",
    price: 20.0,
    currency: "$",
    billingCycle: "monthly",
    nextPaymentDate: "2026-10-02",
    paymentMethod: "Visa (•• 3014)",
    notes: "GPT-4o & Canvas access",
    active: true,
    remindMe: true,
  },
  {
    id: "sub-4",
    name: "iCloud+ 2TB",
    category: "cloud",
    price: 9.99,
    currency: "$",
    billingCycle: "monthly",
    nextPaymentDate: "2026-10-05",
    paymentMethod: "Apple Pay (•• 4291)",
    notes: "Family sharing enabled",
    active: true,
    remindMe: false,
  },
  {
    id: "sub-5",
    name: "Equinox Gym Club",
    category: "fitness",
    price: 65.0,
    currency: "$",
    billingCycle: "monthly",
    nextPaymentDate: "2026-10-08",
    paymentMethod: "Checking Account (•• 7109)",
    notes: "All-access monthly pass",
    active: true,
    remindMe: true,
  },
  {
    id: "sub-6",
    name: "GitHub Copilot",
    category: "software",
    price: 100.0,
    currency: "$",
    billingCycle: "yearly",
    nextPaymentDate: "2026-12-15",
    paymentMethod: "Visa (•• 3014)",
    notes: "Annual developer license",
    active: true,
    remindMe: true,
  },
  {
    id: "sub-7",
    name: "PlayStation Plus",
    category: "gaming",
    price: 79.99,
    currency: "$",
    billingCycle: "yearly",
    nextPaymentDate: "2026-11-19",
    paymentMethod: "PayPal",
    notes: "Extra tier games catalogue",
    active: true,
    remindMe: false,
  },
];

export const getSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const raw = await AsyncStorage.getItem(SUBSCRIPTIONS_KEY);
    if (!raw) {
      await saveSubscriptions(DEFAULT_SUBSCRIPTIONS);
      return DEFAULT_SUBSCRIPTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_SUBSCRIPTIONS;
  } catch (error) {
    console.error("Failed to load subscriptions:", error);
    return DEFAULT_SUBSCRIPTIONS;
  }
};

export const saveSubscriptions = async (subs: Subscription[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subs));
  } catch (error) {
    console.error("Failed to save subscriptions:", error);
  }
};

export const getSubscriptionById = async (id: string): Promise<Subscription | null> => {
  const subs = await getSubscriptions();
  return subs.find((s) => s.id === id) || null;
};

export const addSubscription = async (
  sub: Omit<Subscription, "id">
): Promise<Subscription> => {
  const subs = await getSubscriptions();
  const newSub: Subscription = {
    ...sub,
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  };
  const updated = [newSub, ...subs];
  await saveSubscriptions(updated);
  return newSub;
};

export const updateSubscription = async (
  id: string,
  updates: Partial<Subscription>
): Promise<Subscription | null> => {
  const subs = await getSubscriptions();
  const index = subs.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const updatedItem = { ...subs[index], ...updates };
  subs[index] = updatedItem;
  await saveSubscriptions(subs);
  return updatedItem;
};

export const deleteSubscription = async (id: string): Promise<boolean> => {
  const subs = await getSubscriptions();
  const filtered = subs.filter((s) => s.id !== id);
  await saveSubscriptions(filtered);
  return true;
};

export const resetSubscriptionsToDefault = async (): Promise<Subscription[]> => {
  await saveSubscriptions(DEFAULT_SUBSCRIPTIONS);
  return DEFAULT_SUBSCRIPTIONS;
};

export const calculateMonthlyEquivalent = (sub: Subscription): number => {
  if (!sub.active) return 0;
  switch (sub.billingCycle) {
    case "weekly":
      return sub.price * 4.33;
    case "monthly":
      return sub.price;
    case "quarterly":
      return sub.price / 3;
    case "yearly":
      return sub.price / 12;
    default:
      return sub.price;
  }
};

export const calculateAnnualEquivalent = (sub: Subscription): number => {
  return calculateMonthlyEquivalent(sub) * 12;
};

export const getDaysUntilDue = (dateStr: string): number => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

export const getMetrics = (subs: Subscription[]) => {
  const activeSubs = subs.filter((s) => s.active);
  const totalMonthly = activeSubs.reduce(
    (acc, curr) => acc + calculateMonthlyEquivalent(curr),
    0
  );
  const totalAnnual = totalMonthly * 12;

  // Upcoming in 7 days
  const upcomingIn7Days = activeSubs.filter((s) => {
    const days = getDaysUntilDue(s.nextPaymentDate);
    return days >= 0 && days <= 7;
  });

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  activeSubs.forEach((s) => {
    const monthlyCost = calculateMonthlyEquivalent(s);
    categoryMap[s.category] = (categoryMap[s.category] || 0) + monthlyCost;
  });

  const categoryBreakdown = Object.entries(categoryMap).map(
    ([category, amount]) => ({
      category: category as SubscriptionCategory,
      amount,
      percentage: totalMonthly > 0 ? (amount / totalMonthly) * 100 : 0,
    })
  );

  categoryBreakdown.sort((a, b) => b.amount - a.amount);

  return {
    totalMonthly,
    totalAnnual,
    activeCount: activeSubs.length,
    upcomingCount: upcomingIn7Days.length,
    upcomingIn7Days,
    categoryBreakdown,
  };
};
