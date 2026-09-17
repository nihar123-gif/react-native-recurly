import React, { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import AppBackground from "@/components/ui/AppBackground";
import { getSession, signOut } from "@/lib/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

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
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.headerTitle}>System Settings</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>AUTHENTICATED MEMBER</Text>
            <Text style={styles.name}>{session?.name ?? "User Member"}</Text>
            <Text style={styles.email}>
              {session?.email ?? "subscriber@recurly.app"}
            </Text>
          </View>

          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#FB7185" />
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
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    padding: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(13, 17, 23, 0.85)",
    borderWidth: 1,
    borderColor: "#1E2533",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: "rgba(13, 17, 23, 0.85)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E2533",
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#94A3B8",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(28, 17, 23, 0.85)",
    borderWidth: 1,
    borderColor: "#3D1A28",
    borderRadius: 16,
    height: 52,
  },
  logoutButtonText: {
    color: "#FB7185",
    fontSize: 15,
    fontWeight: "800",
  },
});