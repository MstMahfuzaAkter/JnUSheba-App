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
  Platform,
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

  const slideAnim = useRef(new Animated.Value(-600)).current;

  // ================= LOAD USER =================
  useEffect(() => {
    const loadUser = async () => {
      const session = await AsyncStorage.getItem("user_session");
      setUser(session ? JSON.parse(session) : null);
    };

    loadUser();
  }, [menuVisible]);

  // ================= ANIMATION =================
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: menuVisible ? 0 : -600,
      useNativeDriver: true,
      friction: 9,
      tension: 45,
    }).start();
  }, [menuVisible]);

  const handleNavigate = (path) => {
    setMenuVisible(false);
    router.push(path);
  };

  // ================= LOGOUT (web + native safe) =================
  const performLogout = async () => {
    try {
      await AsyncStorage.removeItem("user_session");
      setUser(null);
      router.replace("/login");
    } catch (err) {
      console.log("Logout Error:", err);
    }
  };

  const handleLogout = () => {
    setMenuVisible(false);

    if (Platform.OS === "web") {
      // Alert.alert buttons are unreliable on react-native-web,
      // so use the browser's native confirm dialog instead.
      const confirmed = window.confirm("Do you want to logout?");
      if (confirmed) {
        performLogout();
      }
      return;
    }

    Alert.alert("Logout", "Do you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: performLogout,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ================= HEADER ================= */}
      <LinearGradient colors={["#1e3a8a", "#2563eb"]} style={styles.header}>

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

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

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

      {/* ================= MENU ================= */}
      {menuVisible && (
        <View style={[styles.overlay, { height }]}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />

          <Animated.View
            style={[
              styles.menuWrapper,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <BlurView intensity={70} tint="light" style={styles.menu}>

              {/* ================= USER ================= */}
              {user ? (
                <>
                  <TouchableOpacity
                    style={styles.userBox}
                    onPress={() => handleNavigate("/profile")}
                    activeOpacity={0.8}
                  >
                    <View style={styles.avatar}>
                      <FontAwesome name="user" size={20} color="#1e3a8a" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.name} numberOfLines={1}>
                        {user.name}
                      </Text>
                      <Text style={styles.email} numberOfLines={1}>
                        {user.email}
                      </Text>
                    </View>

                    <FontAwesome
                      name="chevron-right"
                      size={12}
                      color="#94a3b8"
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
                    Login to access full features
                  </Text>
                </View>
              )}

              {/* ================= MENU ITEMS ================= */}
              <MenuItem
                icon="home"
                label="Home"
                color="#3b82f6"
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
                      : "Student Dashboard"
                  }
                  color="#06b6d4"
                  onPress={() => {
                    if (user?.role === "admin")
                      handleNavigate("/admin-dashboard");
                    else if (user?.role === "provider")
                      handleNavigate("/provider-dashboard");
                    else handleNavigate("/student-dashboard");
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
                    activeOpacity={0.8}
                  >
                    <View style={styles.logoutIcon}>
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
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconBox, { backgroundColor: color + "15" }]}>
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
    elevation: 6,
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    maxWidth: "70%",
  },

  iconBtn: {
    width: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  overlay: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    zIndex: 999,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  menuWrapper: {
    overflow: "hidden",
  },

  menu: {
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingVertical: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  userBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  name: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  email: { fontSize: 12, color: "#64748b" },

  guestBox: {
    padding: 16,
  },

  guestTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e3a8a",
  },

  guestText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
    marginHorizontal: 14,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 18,
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  itemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  logoutIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  logoutText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 14,
  },
});