import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Footer({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      
      {/* ================= FOOTER BACKGROUND ================= */}
      <LinearGradient
        colors={["#0f172a", "#1e293b"]}
        style={styles.container}
      >

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // ================= ICON MAPPING =================
          let iconName = "circle";

          if (route.name === "index") iconName = "home";
          if (route.name === "services") iconName = "cogs";
          if (route.name === "bookings") iconName = "calendar";
          if (route.name === "dashboard") iconName = "th-large";
          if (route.name === "profile") iconName = "user";
          if (route.name === "about") iconName = "info-circle";

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
            >

              {/* ================= ICON ================= */}
              <View
                style={[
                  styles.iconBox,
                  isFocused && styles.activeIconBox,
                ]}
              >
                <FontAwesome
                  name={iconName}
                  size={20}
                  color={isFocused ? "#ffffff" : "#94a3b8"}
                />
              </View>

              {/* ================= LABEL ================= */}
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? "#ffffff" : "#94a3b8" },
                ]}
              >
                {label}
              </Text>

            </Pressable>
          );
        })}

      </LinearGradient>
    </SafeAreaView>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#0f172a",
  },

  container: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 78 : 65,
    paddingBottom: Platform.OS === "ios" ? 15 : 8,
    paddingTop: 10,
    borderTopWidth: 0,
    elevation: 10,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  activeIconBox: {
    backgroundColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },

  label: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: "600",
  },
});