import { View, Text } from "react-native";
import React from "react";
import { Link, useLocalSearchParams } from "expo-router";

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold">
        Subscription Details
      </Text>

      <Text className="mt-4">
        Subscription ID: {id}
      </Text>

      <Link href="/(auth)/(tabs)">
        Back
      </Link>
    </View>
  );
};

export default SubscriptionDetails;