import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function ProviderDashboard() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: 20, gap: 15 }}>

      <Text style={{ fontSize: 22, fontWeight: "800" }}>
        🧑‍💼 Provider Dashboard
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/add-service")}
        style={{ padding: 15, backgroundColor: "#3b82f6", borderRadius: 10 }}
      >
        <Text style={{ color: "#fff" }}>➕ Add Service</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/my-services")}
        style={{ padding: 15, backgroundColor: "#10b981", borderRadius: 10 }}
      >
        <Text style={{ color: "#fff" }}>📦 My Services</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/provider-bookings")}
        style={{ padding: 15, backgroundColor: "#f59e0b", borderRadius: 10 }}
      >
        <Text style={{ color: "#fff" }}>📅 Bookings</Text>
      </TouchableOpacity>

    </View>
  );
}