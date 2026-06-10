import React, { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TabLayout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await AsyncStorage.getItem("user_session");

        if (!session) {
          return;
        }

        const user = JSON.parse(session);

        // যদি role না থাকে → force logout
        if (!user?.role) {
          await AsyncStorage.removeItem("user_session");
        }

      } catch (err) {
        console.log("Auth check error:", err);
        await AsyncStorage.removeItem("user_session");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ================= LOADING UI =================
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // ================= TABS =================
  return (
    <Tabs
      tabBar={(props) => <Footer {...props} />}
      screenOptions={{
        header: () => <Header title="JnU_ShebaLink" />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />

      <Tabs.Screen
        name="services"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}