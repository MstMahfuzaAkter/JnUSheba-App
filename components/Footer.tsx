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
      <LinearGradient
        colors={["#111827", "#1f2937"]}
        style={styles.footerContainer}
      >
        {state.routes.map((route: any, index: number) => {
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
              navigation.navigate({ name: route.name, merge: true });
            }
          };

          // Icon mapping
          let iconName = "circle";
          if (route.name === "index") iconName = "home";
          if (route.name === "profile") iconName = "user";
          if (route.name === "services") iconName = "cogs";
          if (route.name === "about") iconName = "info-circle";

          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
            >
              <View
                style={[
                  styles.iconWrapper,
                  isFocused && styles.activeIconWrapper,
                ]}
              >
                <FontAwesome
                  name={iconName as any}
                  size={22}
                  color={isFocused ? "#ffffff" : "#9ca3af"}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? "#ffffff" : "#9ca3af" },
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

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#111827",
  },
  footerContainer: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 75 : 65,
    paddingBottom: Platform.OS === "ios" ? 15 : 10,
    paddingTop: 10,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  activeIconWrapper: {
    backgroundColor: "#2563eb", // Active tab highlight
    shadowColor: "#2563eb",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
