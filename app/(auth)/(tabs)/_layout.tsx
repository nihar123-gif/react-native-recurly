import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />

      <Tabs.Screen
        name="insight"
        options={{
          title: "Insight",
        }}
      />

      <Tabs.Screen
        name="setting"
        options={{
          title: "Setting",
        }}
      />

      <Tabs.Screen
        name="subscription"
        options={{
          title: "Subscription",
        }}
      />
    </Tabs>
  );
}