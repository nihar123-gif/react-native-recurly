import { Platform, useWindowDimensions } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isWebDesktop = Platform.OS === "web" && width > 768;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#34D399",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          backgroundColor: isWebDesktop ? "rgba(10, 17, 30, 0.92)" : "#060A13",
          borderTopColor: isWebDesktop ? "rgba(52, 211, 153, 0.3)" : "rgba(255, 255, 255, 0.07)",
          borderWidth: isWebDesktop ? 1 : 0,
          borderTopWidth: 1,
          borderColor: isWebDesktop ? "rgba(52, 211, 153, 0.3)" : "transparent",
          borderRadius: isWebDesktop ? 26 : 0,
          position: isWebDesktop ? "absolute" : undefined,
          bottom: isWebDesktop ? 22 : 0,
          left: isWebDesktop ? "50%" : 0,
          transform: isWebDesktop ? [{ translateX: -270 }] : undefined,
          width: isWebDesktop ? 540 : "100%",
          height: isWebDesktop ? 64 : 68,
          paddingTop: 8,
          paddingBottom: 8,
          elevation: 20,
          shadowColor: isWebDesktop ? "#10B981" : "#000000",
          shadowOffset: { width: 0, height: isWebDesktop ? 8 : -6 },
          shadowOpacity: isWebDesktop ? 0.35 : 0.6,
          shadowRadius: 24,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800",
          marginTop: 3,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="subscription/index"
        options={{
          title: "Plans",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "layers" : "layers-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="insight"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "pie-chart" : "pie-chart-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Dynamic or auxiliary screens hidden from bottom tabs */}
      <Tabs.Screen
        name="subscription/[id]"
        options={{
          href: null,
          title: "Details",
        }}
      />

      <Tabs.Screen
        name="subscription"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="setting"
        options={{
          href: null,
          title: "Settings",
        }}
      />
    </Tabs>
  );
}