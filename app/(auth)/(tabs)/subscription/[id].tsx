import { Link, useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-3xl font-extrabold text-gray-900 tracking-tight text-center">
        Subscription Details
      </Text>

      <Text className="mt-4">
        Subscription ID: {id}
      </Text>

      <Link href="/(auth)/(tabs)/subscription" className="mt-6 text-blue-500">
        Back
      </Link>
    </View>
  );
};

export default SubscriptionDetails;