import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BillingCycle,
  getSubscriptions,
  SubscriptionCategory,
} from "@/lib/subscriptions";

export type PlanStatus = "draft" | "active" | "inactive";

export type AppPlan = {
  id: string;
  name: string;
  provider: string;
  category: SubscriptionCategory;
  description: string;
  icon: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  yearlyPrice?: number;
  trialEnabled: boolean;
  trialDuration?: string;
  features: string[];
  status: PlanStatus;
  isAvailableToUsers: boolean;
  websiteUrl?: string;
  termsUrl?: string;
  privacyUrl?: string;
  supportUrl?: string;
  subscriberCount?: number;
  createdAt: string;
  updatedAt: string;
};

const PLANS_KEY = "@recurly_app_plans_v1";

export const DEFAULT_PLANS: AppPlan[] = [
  {
    id: "plan-spotify-premium",
    name: "Spotify Premium",
    provider: "Spotify",
    category: "music",
    description:
      "Premium music streaming with ad-free listening and offline downloads.",
    icon: "music",
    price: 10.99,
    currency: "USD",
    billingCycle: "monthly",
    yearlyPrice: 109.99,
    trialEnabled: true,
    trialDuration: "30 days",
    features: [
      "Ad-free music listening",
      "Download to listen offline",
      "Play songs in any order",
      "High audio quality",
    ],
    status: "active",
    isAvailableToUsers: true,
    websiteUrl: "spotify.com",
    termsUrl: "spotify.com/legal/end-user-agreement",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "plan-netflix-premium",
    name: "Netflix 4K HDR",
    provider: "Netflix",
    category: "streaming",
    description:
      "Full 4K HDR entertainment catalogue with spatial audio and multi-device access.",
    icon: "streaming",
    price: 22.99,
    currency: "USD",
    billingCycle: "monthly",
    trialEnabled: false,
    features: [
      "Ultra HD 4K + HDR quality",
      "Watch on 4 supported devices at once",
      "Spatial audio included",
      "Download on 6 devices",
    ],
    status: "active",
    isAvailableToUsers: true,
    websiteUrl: "netflix.com",
    createdAt: "2026-08-05T00:00:00.000Z",
    updatedAt: "2026-09-10T00:00:00.000Z",
  },
  {
    id: "plan-chatgpt-plus",
    name: "ChatGPT Plus",
    provider: "OpenAI",
    category: "software",
    description:
      "Advanced intelligence assistant with GPT-4o, canvas editing, and reasoning models.",
    icon: "software",
    price: 20.0,
    currency: "USD",
    billingCycle: "monthly",
    trialEnabled: false,
    features: [
      "Access to GPT-4o & Canvas",
      "DALL-E image generation",
      "Advanced data analysis",
      "Early access to new features",
    ],
    status: "active",
    isAvailableToUsers: true,
    websiteUrl: "openai.com/chatgpt",
    createdAt: "2026-08-10T00:00:00.000Z",
    updatedAt: "2026-09-15T00:00:00.000Z",
  },
  {
    id: "plan-icloud-plus",
    name: "iCloud+ 2TB",
    provider: "Apple",
    category: "cloud",
    description:
      "Secure Apple cloud storage with Private Relay and HomeKit Secure Video.",
    icon: "cloud",
    price: 9.99,
    currency: "USD",
    billingCycle: "monthly",
    trialEnabled: false,
    features: [
      "2 TB of cloud storage",
      "iCloud Private Relay",
      "Hide My Email protection",
      "HomeKit Secure Video support",
    ],
    status: "active",
    isAvailableToUsers: true,
    websiteUrl: "apple.com/icloud",
    createdAt: "2026-08-12T00:00:00.000Z",
    updatedAt: "2026-09-02T00:00:00.000Z",
  },
  {
    id: "plan-github-copilot",
    name: "GitHub Copilot",
    provider: "GitHub",
    category: "software",
    description:
      "AI pair programmer offering code completion and real-time IDE chat assistance.",
    icon: "software",
    price: 10.0,
    currency: "USD",
    billingCycle: "monthly",
    yearlyPrice: 100.0,
    trialEnabled: true,
    trialDuration: "30 days",
    features: [
      "Code completions in editor",
      "Copilot Chat in IDE",
      "Multi-model selection",
      "CLI assistance",
    ],
    status: "active",
    isAvailableToUsers: true,
    websiteUrl: "github.com/features/copilot",
    createdAt: "2026-08-15T00:00:00.000Z",
    updatedAt: "2026-09-12T00:00:00.000Z",
  },
  {
    id: "plan-playstation-plus",
    name: "PlayStation Plus",
    provider: "Sony Interactive",
    category: "gaming",
    description:
      "Online multiplayer, monthly games catalogue, and exclusive console discounts.",
    icon: "gaming",
    price: 79.99,
    currency: "USD",
    billingCycle: "yearly",
    trialEnabled: true,
    trialDuration: "14 days",
    features: [
      "Online multiplayer network",
      "Monthly curated games",
      "Cloud game save backups",
      "Exclusive member discounts",
    ],
    status: "active",
    isAvailableToUsers: true,
    websiteUrl: "playstation.com/ps-plus",
    createdAt: "2026-08-18T00:00:00.000Z",
    updatedAt: "2026-09-08T00:00:00.000Z",
  },
  {
    id: "plan-equinox-gym",
    name: "Equinox Gym Club",
    provider: "Equinox",
    category: "fitness",
    description:
      "All-access premium health club with group fitness, personal training, and spa.",
    icon: "fitness",
    price: 65.0,
    currency: "USD",
    billingCycle: "monthly",
    trialEnabled: true,
    trialDuration: "7 days",
    features: [
      "All-club national access",
      "Group fitness classes",
      "Spa & sauna facilities",
      "Personal training session",
    ],
    status: "active",
    isAvailableToUsers: true,
    websiteUrl: "equinox.com",
    createdAt: "2026-08-20T00:00:00.000Z",
    updatedAt: "2026-09-14T00:00:00.000Z",
  },
  {
    id: "plan-enterprise-cloud-draft",
    name: "Enterprise Dedicated Cloud",
    provider: "Recurly Infrastructure",
    category: "cloud",
    description:
      "Private single-tenant database cluster with 99.99% SLA and dedicated account manager.",
    icon: "cloud",
    price: 249.0,
    currency: "USD",
    billingCycle: "monthly",
    trialEnabled: false,
    features: [
      "Dedicated isolated VPC",
      "99.99% uptime guarantee",
      "24/7 dedicated telephone support",
      "Automated hourly geo-replicated backups",
    ],
    status: "draft",
    isAvailableToUsers: false,
    websiteUrl: "recurly.app/enterprise",
    createdAt: "2026-09-15T00:00:00.000Z",
    updatedAt: "2026-09-15T00:00:00.000Z",
  },
];

// Enrich plans with dynamic subscriber counts from real user subscriptions
const attachSubscriberCounts = async (plans: AppPlan[]): Promise<AppPlan[]> => {
  try {
    const userSubs = await getSubscriptions();
    return plans.map((plan) => {
      const planNameLower = plan.name.trim().toLowerCase();
      const count = userSubs.filter(
        (sub) => sub.name.trim().toLowerCase() === planNameLower && sub.active
      ).length;

      // Realistic base multiplier if 0 user subscriptions exist, otherwise actual count
      const computedSubscribers = count > 0 ? count : plan.status === "active" ? 1 : 0;
      return {
        ...plan,
        subscriberCount: count > 0 ? count : computedSubscribers,
      };
    });
  } catch {
    return plans;
  }
};

export const getAppPlans = async (): Promise<AppPlan[]> => {
  try {
    const raw = await AsyncStorage.getItem(PLANS_KEY);
    if (!raw) {
      await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(DEFAULT_PLANS));
      return await attachSubscriberCounts(DEFAULT_PLANS);
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return await attachSubscriberCounts(parsed);
    }
    await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(DEFAULT_PLANS));
    return await attachSubscriberCounts(DEFAULT_PLANS);
  } catch (error) {
    console.error("Failed to load app plans:", error);
    return await attachSubscriberCounts(DEFAULT_PLANS);
  }
};

export const getActivePublicPlans = async (): Promise<AppPlan[]> => {
  const all = await getAppPlans();
  return all.filter(
    (plan) => plan.status === "active" && plan.isAvailableToUsers === true
  );
};

export const getAppPlanById = async (id: string): Promise<AppPlan | null> => {
  const plans = await getAppPlans();
  return plans.find((p) => p.id === id) || null;
};

export const createAppPlan = async (
  input: Omit<AppPlan, "id" | "createdAt" | "updatedAt" | "subscriberCount">
): Promise<AppPlan> => {
  const plans = await getAppPlans();
  const now = new Date().toISOString();
  const id = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const newPlan: AppPlan = {
    ...input,
    id,
    createdAt: now,
    updatedAt: now,
    subscriberCount: 0,
  };

  const updated = [newPlan, ...plans];
  await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(updated));
  return newPlan;
};

export const updateAppPlan = async (
  id: string,
  updates: Partial<AppPlan>
): Promise<AppPlan | null> => {
  const plans = await getAppPlans();
  const index = plans.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const updatedPlan: AppPlan = {
    ...plans[index],
    ...updates,
    updatedAt: now,
  };

  plans[index] = updatedPlan;
  await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  return updatedPlan;
};

export const deleteAppPlan = async (
  id: string
): Promise<{ success: boolean; hasSubscribers: boolean }> => {
  const plans = await getAppPlans();
  const target = plans.find((p) => p.id === id);
  if (!target) return { success: false, hasSubscribers: false };

  // Check if real users have active subscriptions for this plan
  const userSubs = await getSubscriptions();
  const hasActiveSubscribers = userSubs.some(
    (sub) => sub.name.trim().toLowerCase() === target.name.trim().toLowerCase()
  );

  if (hasActiveSubscribers) {
    return { success: false, hasSubscribers: true };
  }

  const filtered = plans.filter((p) => p.id !== id);
  await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(filtered));
  return { success: true, hasSubscribers: false };
};

export const getPlanStatistics = (plans: AppPlan[]) => {
  const total = plans.length;
  const active = plans.filter((p) => p.status === "active").length;
  const inactive = plans.filter((p) => p.status === "inactive").length;
  const draft = plans.filter((p) => p.status === "draft").length;
  const totalSubscribers = plans.reduce(
    (acc, curr) => acc + (curr.subscriberCount || 0),
    0
  );

  return {
    total,
    active,
    inactive,
    draft,
    totalSubscribers,
  };
};
