import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import AppBackground from "@/components/ui/AppBackground";
import { theme } from "@/constants/theme";
import { getSession, signOut } from "@/lib/auth";

export default function Setting() {
  const router = useRouter();
  const [session, setSession] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const currentSession = await getSession();
      setSession(currentSession);
    };

    loadSession();
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.dismissAll();
    router.replace("/(auth)/sign-in");
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={18}
                color={theme.colors.text}
              />
            </Pressable>
            <Text style={styles.headerTitle}>System Settings</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>AUTHENTICATED MEMBER</Text>
            <Text style={styles.name}>{session?.name ?? "User Member"}</Text>
            <Text style={styles.email}>
              {session?.email ?? "subscriber@recurly.app"}
            </Text>
          </View>

          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={18}
              color={theme.colors.error}
            />
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 20,
    ...theme.shadows.subtle,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: 2,
  },
  email: {
    fontSize: 13.5,
    color: theme.colors.textSecondary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.colors.errorBg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.errorBorder,
    height: 48,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  logoutButtonText: {
    color: theme.colors.errorText,
    fontSize: 13.5,
    fontWeight: "700",
  },
});