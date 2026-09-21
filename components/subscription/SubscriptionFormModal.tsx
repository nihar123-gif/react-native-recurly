import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Badge from "@/components/ui/Badge";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { theme } from "@/constants/theme";
import {
  BillingCycle,
  checkDuplicateName,
  formatDateDisplay,
  Subscription,
  SubscriptionCategory,
  SubscriptionStatus,
} from "@/lib/subscriptions";

export const CATEGORY_OPTIONS: {
  id: SubscriptionCategory;
  label: string;
  icon: string;
  color: string;
}[] = [
  { id: "streaming", label: "Streaming", icon: "tv-outline", color: "#EF4444" },
  { id: "music", label: "Music", icon: "musical-notes-outline", color: "#2563EB" },
  { id: "software", label: "Software", icon: "code-slash-outline", color: "#3B82F6" },
  { id: "cloud", label: "Cloud", icon: "cloud-outline", color: "#0284C7" },
  { id: "fitness", label: "Fitness", icon: "barbell-outline", color: "#0D9488" },
  { id: "gaming", label: "Gaming", icon: "game-controller-outline", color: "#7C3AED" },
  { id: "reading", label: "Reading", icon: "book-outline", color: "#D97706" },
  { id: "utilities", label: "Utilities", icon: "flash-outline", color: "#EC4899" },
  { id: "other", label: "Other", icon: "grid-outline", color: "#64748B" },
];

export const BILLING_CYCLES: { id: BillingCycle; label: string; period: string }[] = [
  { id: "monthly", label: "Monthly", period: "/mo" },
  { id: "yearly", label: "Yearly", period: "/yr" },
  { id: "weekly", label: "Weekly", period: "/wk" },
  { id: "quarterly", label: "Quarterly", period: "/qtr" },
];

export const PAYMENT_METHODS = [
  { id: "Apple Pay", label: "Apple Pay", icon: "logo-apple" },
  { id: "Google Pay", label: "Google Pay", icon: "logo-google" },
  { id: "Visa", label: "Visa", icon: "card-outline" },
  { id: "Mastercard", label: "Mastercard", icon: "card-outline" },
  { id: "PayPal", label: "PayPal", icon: "wallet-outline" },
  { id: "Bank Account", label: "Bank Account", icon: "business-outline" },
  { id: "Cash", label: "Cash", icon: "cash-outline" },
  { id: "Other", label: "Other", icon: "ellipsis-horizontal-outline" },
];

export const STATUS_OPTIONS: { id: SubscriptionStatus; label: string; dotColor: string }[] = [
  { id: "active", label: "Active", dotColor: theme.colors.success },
  { id: "paused", label: "Paused", dotColor: theme.colors.warning },
  { id: "cancelled", label: "Cancelled", dotColor: theme.colors.error },
];

export const REMINDER_OPTIONS = [
  { days: 0, label: "No reminder" },
  { days: 1, label: "1 day before" },
  { days: 3, label: "3 days before" },
  { days: 7, label: "7 days before" },
  { days: 14, label: "14 days before" },
];

interface SubscriptionFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (formData: Omit<Subscription, "id">) => Promise<void>;
  initialData?: Subscription | null;
  mode?: "create" | "edit";
}

export default function SubscriptionFormModal({
  visible,
  onClose,
  onSubmit,
  initialData,
  mode = "create",
}: SubscriptionFormModalProps) {
  const isEdit = mode === "edit" || !!initialData;

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState<SubscriptionCategory>("streaming");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [renewalDate, setRenewalDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Apple Pay");
  const [status, setStatus] = useState<SubscriptionStatus>("active");
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState("");
  const [reminderDays, setReminderDays] = useState(3);

  // Validation & feedback states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePickerDialog, setShowDatePickerDialog] = useState(false);

  // Initialize or reset form on visibility change
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setName(initialData.name || "");
        setCategory(initialData.category || "streaming");
        setPrice(initialData.price !== undefined ? initialData.price.toString() : "");
        setBillingCycle(initialData.billingCycle || "monthly");
        setRenewalDate(
          initialData.nextPaymentDate || getDefaultRenewalDate("monthly")
        );
        setPaymentMethod(initialData.paymentMethod || "Apple Pay");
        setStatus(
          initialData.status || (initialData.active ? "active" : "paused")
        );
        setNotes(initialData.notes || "");
        setWebsite(initialData.website || "");
        setReminderDays(
          initialData.reminderDays !== undefined
            ? initialData.reminderDays
            : initialData.remindMe
            ? 3
            : 0
        );
      } else {
        // Defaults for new subscription
        setName("");
        setCategory("streaming");
        setPrice("");
        setBillingCycle("monthly");
        setRenewalDate(getDefaultRenewalDate("monthly"));
        setPaymentMethod("Apple Pay");
        setStatus("active");
        setNotes("");
        setWebsite("");
        setReminderDays(3);
      }
      setErrors({});
      setIsDuplicate(false);
      setIsSubmitting(false);
    }
  }, [visible, initialData]);

  // Check duplicate name
  useEffect(() => {
    let active = true;
    const checkDup = async () => {
      if (name.trim().length >= 2) {
        const dup = await checkDuplicateName(name, initialData?.id);
        if (active) setIsDuplicate(dup);
      } else {
        if (active) setIsDuplicate(false);
      }
    };
    checkDup();
    return () => {
      active = false;
    };
  }, [name, initialData?.id]);

  function getDefaultRenewalDate(cycle: BillingCycle): string {
    const d = new Date();
    if (cycle === "weekly") d.setDate(d.getDate() + 7);
    else if (cycle === "monthly") d.setMonth(d.getMonth() + 1);
    else if (cycle === "quarterly") d.setMonth(d.getMonth() + 3);
    else if (cycle === "yearly") d.setFullYear(d.getFullYear() + 1);
    else d.setMonth(d.getMonth() + 1);
    return d.toISOString().split("T")[0];
  }

  const setDateByDaysOffset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setRenewalDate(d.toISOString().split("T")[0]);
    if (errors.renewalDate) {
      setErrors((prev) => ({ ...prev, renewalDate: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Service name is required.";
    }

    if (!category) {
      newErrors.category = "Please select a category.";
    }

    const cleanPrice = price.replace("$", "").trim();
    const priceNum = parseFloat(cleanPrice);
    if (!cleanPrice) {
      newErrors.price = "Price is required.";
    } else if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = "Enter a valid positive price.";
    }

    if (!billingCycle) {
      newErrors.billingCycle = "Billing cycle is required.";
    }

    if (!renewalDate || !/^\d{4}-\d{2}-\d{2}$/.test(renewalDate)) {
      newErrors.renewalDate = "Valid renewal date is required (YYYY-MM-DD).";
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = "Payment method is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const cleanPrice = parseFloat(price.replace("$", "").trim());
      const payload: Omit<Subscription, "id"> = {
        name: name.trim(),
        category,
        price: cleanPrice,
        currency: "$",
        billingCycle,
        nextPaymentDate: renewalDate,
        paymentMethod: paymentMethod.trim(),
        active: status === "active",
        status,
        notes: notes.trim() || undefined,
        website: website.trim() || undefined,
        remindMe: reminderDays > 0,
        reminderDays,
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error("Submit subscription error:", err);
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
            {/* MODAL HEADER */}
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIconWrap}>
                  <Ionicons
                    name={isEdit ? "create-outline" : "add-circle-outline"}
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
                <View>
                  <Text style={styles.modalTitle}>
                    {isEdit ? "Edit Subscription" : "Add Subscription"}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {isEdit
                      ? "Update plan terms, schedule, and details."
                      : "Catalog a recurring service to track renewals."}
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

            {/* FORM SCROLL CONTENT */}
            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* 1. SERVICE NAME */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>SERVICE NAME *</Text>
                  {isDuplicate && (
                    <Text style={styles.duplicateWarning}>
                      Already in portfolio
                    </Text>
                  )}
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    errors.name ? styles.inputError : null,
                  ]}
                >
                  <Ionicons
                    name="sparkles-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Spotify Premium, Netflix, ChatGPT"
                    placeholderTextColor={theme.colors.inputPlaceholder}
                    value={name}
                    onChangeText={(val) => {
                      setName(val);
                      if (errors.name) {
                        setErrors((prev) => ({ ...prev, name: "" }));
                      }
                    }}
                    autoCapitalize="words"
                  />
                </View>
                {errors.name ? (
                  <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}
              </View>

              {/* 2. CATEGORY SELECTOR */}
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
                        onPress={() => {
                          setCategory(item.id);
                          if (errors.category) {
                            setErrors((prev) => ({ ...prev, category: "" }));
                          }
                        }}
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
                {errors.category ? (
                  <Text style={styles.errorText}>{errors.category}</Text>
                ) : null}
              </View>

              {/* 3 & 4. PRICE AND BILLING CYCLE */}
              <View style={styles.twoColumnRow}>
                {/* Price */}
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>PRICE *</Text>
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
                        if (errors.price) {
                          setErrors((prev) => ({ ...prev, price: "" }));
                        }
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

              {/* 5. NEXT RENEWAL DATE PICKER */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>NEXT RENEWAL DATE *</Text>
                  <Text style={styles.fieldHint}>
                    Stored: {renewalDate || "None"}
                  </Text>
                </View>

                {/* Date Display Card with Preset Shortcuts */}
                <View style={styles.datePickerCard}>
                  <View style={styles.dateDisplayRow}>
                    <View style={styles.dateInfoLeft}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={theme.colors.primary}
                      />
                      <Text style={styles.dateDisplayText}>
                        {formatDateDisplay(renewalDate) || "Select renewal date"}
                      </Text>
                    </View>

                    {/* On Web: Native Date Input Trigger */}
                    {Platform.OS === "web" ? (
                      <View style={styles.webDatePickerWrap}>
                        <Pressable style={styles.datePickerBtn}>
                          <Ionicons
                            name="pencil-outline"
                            size={14}
                            color={theme.colors.primary}
                          />
                          <Text style={styles.datePickerBtnText}>Pick Date</Text>
                        </Pressable>
                        <input
                          type="date"
                          value={renewalDate}
                          onChange={(e: any) => {
                            if (e.target.value) {
                              setRenewalDate(e.target.value);
                              if (errors.renewalDate) {
                                setErrors((prev) => ({
                                  ...prev,
                                  renewalDate: "",
                                }));
                              }
                            }
                          }}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: 0,
                            cursor: "pointer",
                            width: "100%",
                            height: "100%",
                          }}
                        />
                      </View>
                    ) : (
                      <Pressable
                        style={styles.datePickerBtn}
                        onPress={() => setShowDatePickerDialog(true)}
                      >
                        <Ionicons
                          name="pencil-outline"
                          size={14}
                          color={theme.colors.primary}
                        />
                        <Text style={styles.datePickerBtnText}>Change</Text>
                      </Pressable>
                    )}
                  </View>

                  {/* QUICK PRESETS ROW */}
                  <View style={styles.presetsRow}>
                    <Text style={styles.presetsLabel}>Quick:</Text>
                    <Pressable
                      style={styles.presetChip}
                      onPress={() => setDateByDaysOffset(7)}
                    >
                      <Text style={styles.presetChipText}>+7 Days</Text>
                    </Pressable>
                    <Pressable
                      style={styles.presetChip}
                      onPress={() => setDateByDaysOffset(14)}
                    >
                      <Text style={styles.presetChipText}>+14 Days</Text>
                    </Pressable>
                    <Pressable
                      style={styles.presetChip}
                      onPress={() => setDateByDaysOffset(30)}
                    >
                      <Text style={styles.presetChipText}>+1 Month</Text>
                    </Pressable>
                    <Pressable
                      style={styles.presetChip}
                      onPress={() => setDateByDaysOffset(365)}
                    >
                      <Text style={styles.presetChipText}>+1 Year</Text>
                    </Pressable>
                  </View>
                </View>
                {errors.renewalDate ? (
                  <Text style={styles.errorText}>{errors.renewalDate}</Text>
                ) : null}
              </View>

              {/* 6. PAYMENT METHOD SELECTOR */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PAYMENT METHOD *</Text>
                <View style={styles.paymentMethodsWrap}>
                  {PAYMENT_METHODS.map((pm) => {
                    const isSelected = paymentMethod === pm.id;
                    return (
                      <Pressable
                        key={pm.id}
                        style={[
                          styles.paymentChip,
                          isSelected && styles.paymentChipActive,
                        ]}
                        onPress={() => setPaymentMethod(pm.id)}
                      >
                        <Ionicons
                          name={pm.icon as any}
                          size={15}
                          color={
                            isSelected
                              ? theme.colors.primary
                              : theme.colors.textSecondary
                          }
                        />
                        <Text
                          style={[
                            styles.paymentChipText,
                            isSelected && styles.paymentChipTextActive,
                          ]}
                        >
                          {pm.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* 7. STATUS OPTIONS */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>SUBSCRIPTION STATUS</Text>
                <View style={styles.statusOptionsRow}>
                  {STATUS_OPTIONS.map((st) => {
                    const isSelected = status === st.id;
                    return (
                      <Pressable
                        key={st.id}
                        style={[
                          styles.statusOptionChip,
                          isSelected && styles.statusOptionChipActive,
                        ]}
                        onPress={() => setStatus(st.id)}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: st.dotColor },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusOptionText,
                            isSelected && styles.statusOptionTextActive,
                          ]}
                        >
                          {st.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* 8. REMINDER SELECTOR */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>RENEWAL REMINDER</Text>
                <View style={styles.remindersWrap}>
                  {REMINDER_OPTIONS.map((rem) => {
                    const isSelected = reminderDays === rem.days;
                    return (
                      <Pressable
                        key={rem.days}
                        style={[
                          styles.reminderChip,
                          isSelected && styles.reminderChipActive,
                        ]}
                        onPress={() => setReminderDays(rem.days)}
                      >
                        <Ionicons
                          name={
                            isSelected
                              ? "notifications"
                              : "notifications-outline"
                          }
                          size={14}
                          color={
                            isSelected
                              ? theme.colors.primary
                              : theme.colors.textMuted
                          }
                        />
                        <Text
                          style={[
                            styles.reminderChipText,
                            isSelected && styles.reminderChipTextActive,
                          ]}
                        >
                          {rem.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* 9. OPTIONAL WEBSITE / URL */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>WEBSITE / SERVICE URL (OPTIONAL)</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="globe-outline"
                    size={17}
                    color={theme.colors.textMuted}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. spotify.com or netflix.com"
                    placeholderTextColor={theme.colors.inputPlaceholder}
                    value={website}
                    onChangeText={setWebsite}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                  />
                </View>
              </View>

              {/* 10. OPTIONAL NOTES */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>DESCRIPTION / NOTES (OPTIONAL)</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.textInput, styles.textAreaInput]}
                    placeholder="e.g. Family plan with 5 accounts, charged to corporate card..."
                    placeholderTextColor={theme.colors.inputPlaceholder}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </ScrollView>

            {/* MODAL FOOTER BUTTONS */}
            <View style={styles.footerRow}>
              <Pressable
                style={styles.cancelButton}
                onPress={onClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.submitButton,
                  isSubmitting && styles.submitButtonDisabled,
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
                <Text style={styles.submitButtonText}>
                  {isSubmitting
                    ? isEdit
                      ? "Saving..."
                      : "Adding..."
                    : isEdit
                    ? "Save Changes"
                    : "Add Subscription"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* MOBILE DATE PICKER DIALOG (If triggered on native) */}
        {showDatePickerDialog && (
          <Modal
            transparent
            animationType="fade"
            visible={showDatePickerDialog}
            onRequestClose={() => setShowDatePickerDialog(false)}
          >
            <View style={styles.nestedDialogOverlay}>
              <View style={styles.nestedDialogCard}>
                <Text style={styles.nestedDialogTitle}>Select Renewal Date</Text>
                <Text style={styles.nestedDialogSubtitle}>
                  Choose a preset or enter date (YYYY-MM-DD):
                </Text>

                <View style={styles.nestedInputRow}>
                  <TextInput
                    style={styles.nestedTextInput}
                    placeholder="YYYY-MM-DD"
                    value={renewalDate}
                    onChangeText={setRenewalDate}
                  />
                </View>

                <View style={styles.nestedPresetsWrap}>
                  <Pressable
                    style={styles.presetChip}
                    onPress={() => {
                      setDateByDaysOffset(7);
                      setShowDatePickerDialog(false);
                    }}
                  >
                    <Text style={styles.presetChipText}>+7 Days</Text>
                  </Pressable>
                  <Pressable
                    style={styles.presetChip}
                    onPress={() => {
                      setDateByDaysOffset(30);
                      setShowDatePickerDialog(false);
                    }}
                  >
                    <Text style={styles.presetChipText}>+1 Month</Text>
                  </Pressable>
                  <Pressable
                    style={styles.presetChip}
                    onPress={() => {
                      setDateByDaysOffset(90);
                      setShowDatePickerDialog(false);
                    }}
                  >
                    <Text style={styles.presetChipText}>+3 Months</Text>
                  </Pressable>
                  <Pressable
                    style={styles.presetChip}
                    onPress={() => {
                      setDateByDaysOffset(365);
                      setShowDatePickerDialog(false);
                    }}
                  >
                    <Text style={styles.presetChipText}>+1 Year</Text>
                  </Pressable>
                </View>

                <Pressable
                  style={styles.nestedDoneButton}
                  onPress={() => setShowDatePickerDialog(false)}
                >
                  <Text style={styles.nestedDoneButtonText}>Confirm Date</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
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
    maxWidth: 580,
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
  headerIconWrap: {
    width: 40,
    height: 40,
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

  // FORM SCROLL
  formScroll: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 18,
  },

  // FIELDS
  fieldGroup: {
    gap: 6,
  },
  fieldLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  fieldHint: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  duplicateWarning: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.warning,
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
    fontSize: 14.5,
    color: theme.colors.text,
    outlineWidth: 0,
  } as any,
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
    paddingVertical: 7,
    paddingHorizontal: 11,
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
    fontSize: 12.5,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  categoryPillTextActive: {
    color: theme.colors.primary,
    fontWeight: "700",
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

  // DATE PICKER CARD
  datePickerCard: {
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: 12,
    gap: 10,
  },
  dateDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateDisplayText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },
  webDatePickerWrap: {
    position: "relative",
  },
  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  datePickerBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  presetsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: 8,
  },
  presetsLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    marginRight: 2,
  },
  presetChip: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.text,
  },

  // PAYMENT METHODS
  paymentMethodsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  paymentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  paymentChipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  paymentChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  paymentChipTextActive: {
    color: theme.colors.primary,
    fontWeight: "700",
  },

  // STATUS OPTIONS
  statusOptionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statusOptionChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 38,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  statusOptionChipActive: {
    backgroundColor: "#FFFFFF",
    borderColor: theme.colors.primary,
    ...theme.shadows.subtle,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOptionText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  statusOptionTextActive: {
    color: theme.colors.text,
    fontWeight: "700",
  },

  // REMINDERS
  remindersWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  reminderChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  reminderChipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  reminderChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  reminderChipTextActive: {
    color: theme.colors.primary,
    fontWeight: "700",
  },

  // TEXT AREA
  textAreaContainer: {
    height: 78,
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  textAreaInput: {
    textAlignVertical: "top",
    height: "100%",
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
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  cancelButtonText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  submitButton: {
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
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // NESTED DIALOG (NATIVE DATE)
  nestedDialogOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  nestedDialogCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    gap: 12,
    ...theme.shadows.modal,
  },
  nestedDialogTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
  },
  nestedDialogSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  nestedInputRow: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: "center",
  },
  nestedTextInput: {
    fontSize: 14,
    color: theme.colors.text,
  },
  nestedPresetsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  nestedDoneButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    marginTop: 6,
  },
  nestedDoneButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
