import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          backgroundColor: "#05070B",
          borderTopColor: "#161D2A",
          borderTopWidth: 1,
          height: 68,
          paddingTop: 10,
          paddingBottom: 10,
          elevation: 12,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.5,
          shadowRadius: 14,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800",
          marginTop: 4,
          letterSpacing: 0.2,
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