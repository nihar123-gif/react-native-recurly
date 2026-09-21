import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { getSession } from "@/lib/auth";

export default function Index() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const session = await getSession();
        if (mounted) {
          if (session?.email) {
            setTarget("/(auth)/(tabs)");
          } else {
            setTarget("/onboarding");
          }
        }
      } catch {
        if (mounted) setTarget("/onboarding");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!target) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F8FAFC",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return <Redirect href={target as any} />;
}
