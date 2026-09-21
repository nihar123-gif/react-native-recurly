import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Badge from "@/components/ui/Badge";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { theme } from "@/constants/theme";
import {
  CATEGORY_OPTIONS,
  BILLING_CYCLES,
} from "@/components/subscription/SubscriptionFormModal";
import {
  AppPlan,
  PlanStatus,
} from "@/lib/plans";
import { BillingCycle, SubscriptionCategory } from "@/lib/subscriptions";

const TRIAL_DURATIONS = ["3 days", "7 days", "14 days", "30 days", "Custom"];

interface PlanEditorModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    planData: Omit<AppPlan, "id" | "createdAt" | "updatedAt" | "subscriberCount">
  ) => Promise<void>;
  initialData?: AppPlan | null;
  mode?: "create" | "edit";
}

export default function PlanEditorModal({
  visible,
  onClose,
  onSubmit,
  initialData,
  mode = "create",
}: PlanEditorModalProps) {
  const isEdit = mode === "edit" || !!initialData;

  // Form State
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [category, setCategory] = useState<SubscriptionCategory>("software");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [yearlyPrice, setYearlyPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [trialEnabled, setTrialEnabled] = useState(false);
  const [trialDuration, setTrialDuration] = useState("7 days");
  const [customTrial, setCustomTrial] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState("");
  const [status, setStatus] = useState<PlanStatus>("draft");
  const [isAvailableToUsers, setIsAvailableToUsers] = useState(true);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [termsUrl, setTermsUrl] = useState("");
  const [privacyUrl, setPrivacyUrl] = useState("");
  const [supportUrl, setSupportUrl] = useState("");

  // Validation & Loading
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setName(initialData.name || "");
        setProvider(initialData.provider || "");
        setCategory(initialData.category || "software");
        setDescription(initialData.description || "");
        setPrice(initialData.price !== undefined ? initialData.price.toString() : "");
        setYearlyPrice(
          initialData.yearlyPrice !== undefined
            ? initialData.yearlyPrice.toString()
            : ""
        );
        setBillingCycle(initialData.billingCycle || "monthly");
        setTrialEnabled(initialData.trialEnabled || false);
        const duration = initialData.trialDuration || "7 days";
        if (TRIAL_DURATIONS.includes(duration)) {
          setTrialDuration(duration);
          setCustomTrial("");
        } else {
          setTrialDuration("Custom");
          setCustomTrial(duration);
        }
        setFeatures(
          initialData.features && initialData.features.length > 0
            ? [...initialData.features]
            : []
        );
        setStatus(initialData.status || "draft");
        setIsAvailableToUsers(
          initialData.isAvailableToUsers !== undefined
            ? initialData.isAvailableToUsers
            : true
        );
        setWebsiteUrl(initialData.websiteUrl || "");
        setTermsUrl(initialData.termsUrl || "");
        setPrivacyUrl(initialData.privacyUrl || "");
        setSupportUrl(initialData.supportUrl || "");
      } else {
        setName("");
        setProvider("");
        setCategory("software");
        setDescription("");
        setPrice("");
        setYearlyPrice("");
        setBillingCycle("monthly");
        setTrialEnabled(false);
        setTrialDuration("7 days");
        setCustomTrial("");
        setFeatures([
          "Full platform access",
          "Continuous updates & support",
          "Cloud backup integration",
        ]);
        setStatus("draft");
        setIsAvailableToUsers(true);
        setWebsiteUrl("");
        setTermsUrl("");
        setPrivacyUrl("");
        setSupportUrl("");
      }
      setNewFeatureText("");
      setErrors({});
      setIsSubmitting(false);
    }
  }, [visible, initialData]);

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText("");
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = "Plan Name is required.";
    if (!provider.trim()) errs.provider = "Provider / Service name is required.";
    if (!category) errs.category = "Category is required.";

    const p = parseFloat(price.replace("$", "").trim());
    if (!price.trim()) {
      errs.price = "Price is required.";
    } else if (isNaN(p) || p <= 0) {
      errs.price = "Enter a valid positive price.";
    }

    if (!billingCycle) errs.billingCycle = "Billing cycle is required.";
    if (!status) errs.status = "Plan status is required.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const cleanPrice = parseFloat(price.replace("$", "").trim());
      const cleanYearly = yearlyPrice.trim()
        ? parseFloat(yearlyPrice.replace("$", "").trim())
        : undefined;

      const effectiveTrial = trialEnabled
        ? trialDuration === "Custom"
          ? customTrial.trim() || "7 days"
          : trialDuration
        : undefined;

      await onSubmit({
        name: name.trim(),
        provider: provider.trim(),
        category,
        description: description.trim(),
        icon: category,
        price: cleanPrice,
        currency: "USD",
        billingCycle,
        yearlyPrice: cleanYearly,
        trialEnabled,
        trialDuration: effectiveTrial,
        features: features.filter((f) => f.trim().length > 0),
        status,
        isAvailableToUsers,
        websiteUrl: websiteUrl.trim() || undefined,
        termsUrl: termsUrl.trim() || undefined,
        privacyUrl: privacyUrl.trim() || undefined,
        supportUrl: supportUrl.trim() || undefined,
      });

      onClose();
    } catch (e) {
      console.error("Save plan error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* HEADER */}
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <View style={styles.headerBadge}>
                  <Ionicons
                    name={isEdit ? "create-outline" : "cube-outline"}
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
                <View>
                  <Text style={styles.modalTitle}>
                    {isEdit ? "Edit Plan" : "Create New Plan"}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {isEdit
                      ? "Update plan specifications and public availability."
                      : "Add a subscription plan that users can choose from."}
                  </Text>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={onClose}
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={20} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            {/* FORM SCROLL */}
            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* SECTION: PLAN INFORMATION */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionEyebrow}>1. PLAN IDENTIFIERS</Text>
                <Text style={styles.sectionHeading}>Basic Information</Text>
              </View>

              {/* Plan Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PLAN NAME *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.name ? styles.inputError : null,
                  ]}
                >
                  <Ionicons
                    name="pricetag-outline"
                    size={17}
                    color={theme.colors.textMuted}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Spotify Premium, Netflix Ultra 4K"
                    placeholderTextColor={theme.colors.inputPlaceholder}
                    value={name}
                    onChangeText={(val) => {
                      setName(val);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                  />
                </View>
                {errors.name ? (
                  <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}
              </View>

              {/* Provider */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PROVIDER / SERVICE NAME *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.provider ? styles.inputError : null,
                  ]}
                >
                  <Ionicons
                    name="business-outline"
                    size={17}
                    color={theme.colors.textMuted}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Spotify, Netflix, OpenAI, Apple"
                    placeholderTextColor={theme.colors.inputPlaceholder}
                    value={provider}
                    onChangeText={(val) => {
                      setProvider(val);
                      if (errors.provider)
                        setErrors((prev) => ({ ...prev, provider: "" }));
                    }}
                  />
                </View>
                {errors.provider ? (
                  <Text style={styles.errorText}>{errors.provider}</Text>
                ) : null}
              </View>

              {/* Category */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>CATEGORY *</Text>
                <View style={styles.categoryGrid}>
                  {CATEGORY_OPTIONS.map((item) => {
                    const isSelected = category === item.id;
                    return (
                      <Pressable
                        key={item.id}
                        style={[
                          styles.categoryPill,
                          isSelected && styles.categoryPillActive,
                        ]}
                        onPress={() => setCategory(item.id)}
                      >
                        <CategoryIcon category={item.id} size={18} />
                        <Text
                          style={[
                            styles.categoryPillText,
                            isSelected && styles.categoryPillTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Description */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>DESCRIPTION</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.textInput, styles.textAreaInput]}
                    placeholder="Summary of services, value proposition, and user entitlement..."
                    placeholderTextColor={theme.colors.inputPlaceholder}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>

              {/* LOGO / ICON PREVIEW */}
              <View style={styles.iconPreviewCard}>
                <CategoryIcon category={category} size={48} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewTitle}>
                    {name.trim() || "Plan Service Logo"}
                  </Text>
                  <Text style={styles.previewSubtitle}>
                    Category Icon: {category.toUpperCase()} • Live App Icon
                  </Text>
                </View>
                <Badge label="PREVIEW" variant="primary" />
              </View>

              {/* SECTION: PRICING & BILLING */}
              <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                <Text style={styles.sectionEyebrow}>2. COMMERCIAL TERMS</Text>
                <Text style={styles.sectionHeading}>Pricing & Cycle</Text>
              </View>

              <View style={styles.twoColumnRow}>
                {/* Regular Price */}
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>PRICE (USD) *</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      errors.price ? styles.inputError : null,
                    ]}
                  >
                    <Text style={styles.currencyPrefix}>$</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="10.99"
                      placeholderTextColor={theme.colors.inputPlaceholder}
                      value={price}
                      onChangeText={(val) => {
                        setPrice(val);
                        if (errors.price)
                          setErrors((prev) => ({ ...prev, price: "" }));
                      }}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  {errors.price ? (
                    <Text style={styles.errorText}>{errors.price}</Text>
                  ) : null}
                </View>

                {/* Billing Cycle */}
                <View style={[styles.fieldGroup, { flex: 1.25 }]}>
                  <Text style={styles.fieldLabel}>BILLING CYCLE *</Text>
                  <View style={styles.cycleRow}>
                    {BILLING_CYCLES.map((c) => {
                      const isSelected = billingCycle === c.id;
                      return (
                        <Pressable
                          key={c.id}
                          style={[
                            styles.cyclePill,
                            isSelected && styles.cyclePillActive,
                          ]}
                          onPress={() => setBillingCycle(c.id)}
                        >
                          <Text
                            style={[
                              styles.cyclePillText,
                              isSelected && styles.cyclePillTextActive,
                            ]}
                          >
                            {c.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Optional Yearly Discount Price */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  ANNUAL OPTION (USD) (OPTIONAL)
                </Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.currencyPrefix}>$</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 109.99 for yearly subscribers"
                    placeholderTextColor={theme.colors.inputPlaceholder}
                    value={yearlyPrice}
                    onChangeText={setYearlyPrice}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* SECTION: TRIAL CONFIGURATION */}
              <View style={styles.trialCard}>
                <View style={styles.trialToggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.trialTitle}>Free Trial Period</Text>
                    <Text style={styles.trialSubtitle}>
                      Allow new subscribers to trial this plan at zero initial cost
                    </Text>
                  </View>
                  <Switch
                    value={trialEnabled}
                    onValueChange={setTrialEnabled}
                    trackColor={{
                      false: theme.colors.cardBorder,
                      true: theme.colors.primary,
                    }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {trialEnabled && (
                  <View style={styles.trialOptionsWrap}>
                    <Text style={styles.fieldLabel}>TRIAL DURATION</Text>
                    <View style={styles.trialDurationsRow}>
                      {TRIAL_DURATIONS.map((dur) => {
                        const isSelected = trialDuration === dur;
                        return (
                          <Pressable
                            key={dur}
                            style={[
                              styles.trialDurationChip,
                              isSelected && styles.trialDurationChipActive,
                            ]}
                            onPress={() => setTrialDuration(dur)}
                          >
                            <Text
                              style={[
                                styles.trialDurationText,
                                isSelected && styles.trialDurationTextActive,
                              ]}
                            >
                              {dur}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    {trialDuration === "Custom" && (
                      <TextInput
                        style={[styles.inputContainer, styles.textInput, { marginTop: 8 }]}
                        placeholder="e.g. 21 days or 2 months"
                        value={customTrial}
                        onChangeText={setCustomTrial}
                      />
                    )}
                  </View>
                )}
              </View>

              {/* SECTION: PLAN FEATURES */}
              <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                <Text style={styles.sectionEyebrow}>3. VALUE ENTITLEMENT</Text>
                <Text style={styles.sectionHeading}>Plan Features</Text>
              </View>

              <View style={styles.featuresCard}>
                {features.map((feat, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={theme.colors.success}
                    />
                    <Text style={styles.featureText}>{feat}</Text>
                    <Pressable
                      style={styles.featureDeleteBtn}
                      onPress={() => handleRemoveFeature(index)}
                      accessibilityLabel="Remove feature"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={15}
                        color={theme.colors.error}
                      />
                    </Pressable>
                  </View>
                ))}

                {/* Add feature input */}
                <View style={styles.addFeatureRow}>
                  <TextInput
                    style={[styles.inputContainer, styles.textInput, { flex: 1 }]}
                    placeholder="e.g. Unlimited downloads, 4K streaming..."
                    placeholderTextColor={theme.colors.inputPlaceholder}
                    value={newFeatureText}
                    onChangeText={setNewFeatureText}
                    onSubmitEditing={handleAddFeature}
                  />
                  <Pressable
                    style={styles.addFeatureBtn}
                    onPress={handleAddFeature}
                  >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <Text style={styles.addFeatureBtnText}>Add</Text>
                  </Pressable>
                </View>
              </View>

              {/* SECTION: STATUS & AVAILABILITY */}
              <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                <Text style={styles.sectionEyebrow}>4. DEPLOYMENT & VISIBILITY</Text>
                <Text style={styles.sectionHeading}>Status & Access</Text>
              </View>

              {/* Status Chips */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PLAN STATUS *</Text>
                <View style={styles.statusRow}>
                  {(["draft", "active", "inactive"] as PlanStatus[]).map((st) => {
                    const isSelected = status === st;
                    const color =
                      st === "active"
                        ? theme.colors.success
                        : st === "inactive"
                        ? theme.colors.warning
                        : theme.colors.textMuted;
                    return (
                      <Pressable
                        key={st}
                        style={[
                          styles.statusChip,
                          isSelected && styles.statusChipActive,
                        ]}
                        onPress={() => setStatus(st)}
                      >
                        <View
                          style={[styles.statusDot, { backgroundColor: color }]}
                        />
                        <Text
                          style={[
                            styles.statusChipText,
                            isSelected && styles.statusChipTextActive,
                          ]}
                        >
                          {st.charAt(0).toUpperCase() + st.slice(1)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Availability Switch */}
              <View style={styles.availabilityRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.availabilityTitle}>
                    Available to Users
                  </Text>
                  <Text style={styles.availabilitySubtitle}>
                    {isAvailableToUsers
                      ? "Normal users can view and subscribe to this plan."
                      : "Hidden from regular users (admin-only view)."}
                  </Text>
                </View>
                <Switch
                  value={isAvailableToUsers}
                  onValueChange={setIsAvailableToUsers}
                  trackColor={{
                    false: theme.colors.cardBorder,
                    true: theme.colors.primary,
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* SECTION: OPTIONAL URLS */}
              <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                <Text style={styles.sectionEyebrow}>5. EXTERNAL REFERENCES</Text>
                <Text style={styles.sectionHeading}>URLs & Compliance</Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>OFFICIAL WEBSITE URL</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="globe-outline" size={17} color={theme.colors.textMuted} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. spotify.com"
                    value={websiteUrl}
                    onChangeText={setWebsiteUrl}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>TERMS OF SERVICE URL</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="document-text-outline" size={17} color={theme.colors.textMuted} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. spotify.com/legal/terms"
                    value={termsUrl}
                    onChangeText={setTermsUrl}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>SUPPORT URL</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="help-buoy-outline" size={17} color={theme.colors.textMuted} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. support.spotify.com"
                    value={supportUrl}
                    onChangeText={setSupportUrl}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              </View>
            </ScrollView>

            {/* FOOTER ACTIONS */}
            <View style={styles.footerRow}>
              <Pressable
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.saveBtn,
                  isSubmitting && styles.saveBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name={isEdit ? "checkmark-circle" : "add"}
                    size={18}
                    color="#FFFFFF"
                  />
                )}
                <Text style={styles.saveBtnText}>
                  {isSubmitting
                    ? isEdit
                      ? "Saving Plan..."
                      : "Creating Plan..."
                    : isEdit
                    ? "Save Changes"
                    : "Save Plan"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 620,
    maxHeight: "92%",
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.modal,
    overflow: "hidden",
  },

  // HEADER
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
    backgroundColor: "#FFFFFF",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerBadge: {
    width: 42,
    height: 42,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  buttonPressed: {
    opacity: 0.8,
  },

  // SCROLL CONTENT
  formScroll: { flex: 1 },
  formContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },

  // SECTION HEADERS
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    paddingBottom: 6,
    marginBottom: 4,
  },
  sectionEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.primary,
    letterSpacing: 0.8,
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: "800",
    color: theme.colors.text,
    marginTop: 2,
  },

  // FIELDS
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    letterSpacing: 0.6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    paddingHorizontal: 12,
    gap: 10,
    ...theme.shadows.subtle,
  },
  inputError: {
    borderColor: theme.colors.error,
    backgroundColor: "#FEF2F2",
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    outlineWidth: 0,
  } as any,
  textAreaContainer: {
    height: 80,
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  textAreaInput: {
    textAlignVertical: "top",
    height: "100%",
  },
  errorText: {
    fontSize: 11.5,
    color: theme.colors.error,
    fontWeight: "600",
    marginTop: 2,
  },

  // CATEGORY GRID
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  categoryPillActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  categoryPillTextActive: {
    color: theme.colors.primary,
    fontWeight: "700",
  },

  // ICON PREVIEW
  iconPreviewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.text,
  },
  previewSubtitle: {
    fontSize: 11.5,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // TWO COLUMN
  twoColumnRow: {
    flexDirection: "row",
    gap: 12,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  cycleRow: {
    flexDirection: "row",
    gap: 4,
    height: 46,
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.borderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  cyclePill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.sm,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  cyclePillActive: {
    backgroundColor: "#FFFFFF",
    ...theme.shadows.subtle,
  },
  cyclePillText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  cyclePillTextActive: {
    color: theme.colors.primary,
    fontWeight: "800",
  },

  // TRIAL CARD
  trialCard: {
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: 12,
  },
  trialToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trialTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },
  trialSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  trialOptionsWrap: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: 10,
    gap: 8,
  },
  trialDurationsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  trialDurationChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  trialDurationChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  trialDurationText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  trialDurationTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // FEATURES
  featuresCard: {
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: 10,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: "600",
  },
  featureDeleteBtn: {
    padding: 4,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  addFeatureRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  addFeatureBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  addFeatureBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  // STATUS ROW
  statusRow: {
    flexDirection: "row",
    gap: 8,
  },
  statusChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  statusChipActive: {
    backgroundColor: "#FFFFFF",
    borderColor: theme.colors.primary,
    ...theme.shadows.subtle,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusChipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  statusChipTextActive: {
    color: theme.colors.text,
    fontWeight: "800",
  },

  // AVAILABILITY
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  availabilityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },
  availabilitySubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
    maxWidth: "85%",
  },

  // FOOTER
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.backgroundAlt,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.subtle,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
