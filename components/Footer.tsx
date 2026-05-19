import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, usePathname } from "expo-router";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: "Home", icon: "home", route: "/" },

    { name: "Services", icon: "th-list", route: "/services" },

    // ❌ "about" নেই, তাই info-circle use করলাম
    { name: "About", icon: "info-circle", route: "/about" },

    // ❌ "setting" নেই, তাই cog use করলাম
    { name: "Settings", icon: "cog", route: "/settings" },

    { name: "Profile", icon: "user", route: "/profile" },
  ];

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safe}>
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
        {tabs.map((tab, index) => {
          const isActive = pathname === tab.route;

          return (
            <Pressable
              key={index}
              style={styles.tab}
              onPress={() => router.push(tab.route)}
            >
              <FontAwesome
                name={tab.icon}
                size={20}
                color={isActive ? "#38bdf8" : "#94a3b8"}
              />

              <Text style={[styles.label, isActive && { color: "#38bdf8" }]}>
                {tab.name}
              </Text>
            </Pressable>
          );
        })}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "transparent",
  },

  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },

  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  label: {
    fontSize: 11,
    marginTop: 3,
    color: "#94a3b8",
  },
});