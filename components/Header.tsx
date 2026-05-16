import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  Alert,
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Header({ title }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [user, setUser] = useState(null);

  const router = useRouter();
  const { height } = useWindowDimensions();

  const slideAnim = useRef(new Animated.Value(-500)).current;

  // ================= LOAD USER SESSION =================
  useEffect(() => {
    const loadUser = async () => {
      const session = await AsyncStorage.getItem("user_session");

      if (session) {
        setUser(JSON.parse(session));
      } else {
        setUser(null);
      }
    };

    loadUser();
  }, [menuVisible]);

  // ================= MENU ANIMATION =================
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: menuVisible ? 0 : -500,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [menuVisible]);

  const handleNavigate = (path) => {
    setMenuVisible(false);
    router.push(path);
  };

  // ================= LOGOUT =================
  const handleLogout = async () => {
    setMenuVisible(false);

    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("user_session");
          setUser(null);
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ================= TOP HEADER ================= */}
      <LinearGradient colors={["#1e3a8a", "#3b82f6"]} style={styles.header}>

        {/* MENU ICON */}
        <Pressable
          style={styles.iconBtn}
          onPress={() => setMenuVisible(!menuVisible)}
        >
          <FontAwesome
            name={menuVisible ? "times" : "bars"}
            size={22}
            color="#fff"
          />
        </Pressable>

        {/* TITLE */}
        <Text style={styles.title}>{title}</Text>

        {/* PROFILE ICON */}
        <Pressable
          style={styles.iconBtn}
          onPress={() =>
            handleNavigate(user ? "/profile" : "/login")
          }
        >
          <FontAwesome
            name={user ? "user-circle" : "sign-in"}
            size={22}
            color="#fff"
          />
        </Pressable>

      </LinearGradient>

      {/* ================= DROPDOWN MENU ================= */}
      {menuVisible && (
        <View style={[styles.overlay, { height }]}>

          <TouchableOpacity
            style={styles.backdrop}
            onPress={() => setMenuVisible(false)}
          />

          <Animated.View
            style={[
              styles.menuWrapper,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <BlurView intensity={60} tint="light" style={styles.menu}>

              {/* ================= USER INFO ================= */}
              {user ? (
                <>
                  <TouchableOpacity
                    style={styles.userBox}
                    onPress={() => handleNavigate("/profile")}
                  >
                    <View style={styles.avatar}>
                      <FontAwesome name="user" size={22} color="#1e3a8a" />
                    </View>

                    <View>
                      <Text style={styles.name}>{user.name}</Text>
                      <Text style={styles.email}>{user.email}</Text>
                    </View>

                    <FontAwesome
                      name="chevron-right"
                      size={12}
                      color="#94a3b8"
                      style={{ marginLeft: "auto" }}
                    />
                  </TouchableOpacity>

                  <View style={styles.divider} />
                </>
              ) : (
                <View style={styles.guestBox}>
                  <Text style={styles.guestTitle}>
                    Welcome to ShebaLink
                  </Text>
                  <Text style={styles.guestText}>
                    Login to access all services
                  </Text>
                </View>
              )}

              {/* ================= MENU ITEMS ================= */}
              <MenuItem
                icon="home"
                label="Home"
                color="#4b83f2"
                onPress={() => handleNavigate("/")}
              />

              {user && (
                <MenuItem
                  icon="th-large"
                  label={
                    user?.role === "admin"
                      ? "Admin Dashboard"
                      : user?.role === "provider"
                        ? "Provider Dashboard"
                        : user?.role === "student"
                          ? "Student Dashboard"
                          : "Dashboard"
                  }
                  color="#06b6d4"
                  onPress={() => {
                    if (user?.role === "admin") {
                      handleNavigate("/admin-dashboard");

                    } else if (user?.role === "provider") {
                      handleNavigate("/provider-dashboard");

                    } else if (user?.role === "student") {
                      handleNavigate("/student-dashboard");

                    } else {
                      handleNavigate("/");
                    }
                  }}
                />
              )}

              <MenuItem
                icon="info-circle"
                label="About"
                color="#10b981"
                onPress={() => handleNavigate("/about")}
              />

              {user ? (
                <>
                  <MenuItem
                    icon="cogs"
                    label="Settings"
                    color="#64748b"
                    onPress={() => handleNavigate("/settings")}
                  />

                  <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={handleLogout}
                  >
                    <View style={[styles.iconBox, { backgroundColor: "#fee2e2" }]}>
                      <FontAwesome name="sign-out" size={18} color="#ef4444" />
                    </View>

                    <Text style={styles.logoutText}>Logout</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.divider} />
                  <MenuItem
                    icon="sign-in"
                    label="Login"
                    color="#1e3a8a"
                    onPress={() => handleNavigate("/login")}
                  />
                </>
              )}

            </BlurView>
          </Animated.View>

        </View>
      )}
    </SafeAreaView>
  );
}

// ================= MENU ITEM =================
const MenuItem = ({ icon, label, color, onPress }) => {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: color + "20" }]}>
        <FontAwesome name={icon} size={18} color={color} />
      </View>
      <Text style={styles.itemText}>{label}</Text>
    </TouchableOpacity>
  );
};

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { zIndex: 100 },

  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  iconBtn: {
    width: 40,
    alignItems: "center",
  },

  overlay: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    zIndex: 100,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  menuWrapper: {
    overflow: "hidden",
  },

  menu: {
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  userBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  name: { fontSize: 16, fontWeight: "700" },
  email: { fontSize: 12, color: "#64748b" },

  guestBox: {
    padding: 18,
  },

  guestTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e3a8a",
  },

  guestText: {
    fontSize: 12,
    color: "#64748b",
  },

  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 10,
    marginHorizontal: 15,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  itemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },

  logoutText: {
    color: "#ef4444",
    fontWeight: "700",
    marginLeft: 12,
  },
});