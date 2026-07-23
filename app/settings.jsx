import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [notification, setNotification] = useState(true);
  const [location, setLocation] = useState(true);

  // ডায়নামিক ইউজারের তথ্য রাখার স্টেট
  const [userData, setUserData] = useState({
    name: "Loading...",
    email: "Loading...",
  });

  // পেজ লোড হওয়ার সময় ইউজারের ডাটা, থিম এবং নোটিফিকেশন প্রিফারেন্স লোড করা
  useEffect(() => {
    fetchUserData();
    loadThemePreference();
    loadNotificationPreference();
  }, []);

  const fetchUserData = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      if (session) {
        const user = JSON.parse(session);
        setUserData({
          name: user.name || user.fullName || "User",
          email: user.email || "No email found",
        });
      } else {
        setUserData({
          name: "Guest User",
          email: "Not logged in",
        });
      }
    } catch (err) {
      console.log("Error loading user data:", err);
      setUserData({
        name: "User",
        email: "Error loading profile",
      });
    }
  };

  // থিম প্রিফারেন্স লোড করা
  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme_mode");
      if (savedTheme === "dark") {
        setDarkMode(true);
      }
    } catch (err) {
      console.log("Error loading theme:", err);
    }
  };

  // নোটিফিকেশন প্রিফারেন্স লোড করা
  const loadNotificationPreference = async () => {
    try {
      const savedStatus = await AsyncStorage.getItem("notification_enabled");
      if (savedStatus !== null) {
        setNotification(JSON.parse(savedStatus));
      }
    } catch (err) {
      console.log("Error loading notification status:", err);
    }
  };

  // ডার্ক মোড টগল করার ফাংশন এবং AsyncStorage-এ সেভ করা
  const toggleDarkMode = async (value) => {
    setDarkMode(value);
    try {
      await AsyncStorage.setItem("theme_mode", value ? "dark" : "light");
    } catch (err) {
      console.log("Error saving theme:", err);
    }
  };

  // নোটিফিকেশন টগল করার ফাংশন
  const toggleNotification = async (value) => {
    setNotification(value);
    try {
      await AsyncStorage.setItem("notification_enabled", JSON.stringify(value));
      if (value) {
        Alert.alert("Notifications", "Push notifications enabled.");
      } else {
        Alert.alert("Notifications", "Push notifications turned off.");
      }
    } catch (err) {
      console.log("Error saving notification preference:", err);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Do you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("user_session");
            router.replace("/login");
          } catch (err) {
            console.log("Logout Error:", err);
          }
        },
      },
    ]);
  };

  // ডার্ক মোড বা লাইট মোডের ওপর ভিত্তি করে ডাইনামিক স্টাইল কনফিগারেশন
  const currentTheme = darkMode ? darkStyles : lightStyles;

  return (
    <ScrollView style={[styles.container, currentTheme.container]} showsVerticalScrollIndicator={false}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, currentTheme.textPrimary]}>Settings</Text>
      </View>

      {/* PROFILE SECTION */}
      <View style={[styles.card, currentTheme.card]}>
        <View style={[styles.avatarContainer, darkMode && { backgroundColor: "#1e1b4b" }]}>
          <Ionicons name="person" size={32} color="#4f46e5" />
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={[styles.name, currentTheme.textPrimary]} numberOfLines={1}>{userData.name}</Text>
          <Text style={[styles.email, currentTheme.textSecondary]} numberOfLines={1}>{userData.email}</Text>
        </View>
      </View>

      {/* SETTINGS OPTIONS */}
      <View style={[styles.cardRow, currentTheme.card]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="moon-outline" size={20} color="#4f46e5" style={{ marginRight: 10 }} />
          <Text style={[styles.label, currentTheme.textPrimary]}>Dark Mode</Text>
        </View>
        <Switch 
          value={darkMode} 
          onValueChange={toggleDarkMode}
          trackColor={{ false: "#cbd5e1", true: "#818cf8" }}
          thumbColor={darkMode ? "#4f46e5" : "#f4f3f4"}
        />
      </View>

      <View style={[styles.cardRow, currentTheme.card]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="notifications-outline" size={20} color="#4f46e5" style={{ marginRight: 10 }} />
          <Text style={[styles.label, currentTheme.textPrimary]}>Notifications</Text>
        </View>
        <Switch 
          value={notification} 
          onValueChange={toggleNotification}
          trackColor={{ false: "#cbd5e1", true: "#818cf8" }}
          thumbColor={notification ? "#4f46e5" : "#f4f3f4"}
        />
      </View>

      <View style={[styles.cardRow, currentTheme.card]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="location-outline" size={20} color="#4f46e5" style={{ marginRight: 10 }} />
          <Text style={[styles.label, currentTheme.textPrimary]}>Location Access</Text>
        </View>
        <Switch 
          value={location} 
          onValueChange={setLocation}
          trackColor={{ false: "#cbd5e1", true: "#818cf8" }}
          thumbColor={location ? "#4f46e5" : "#f4f3f4"}
        />
      </View>

      {/* NAV OPTIONS */}
      <TouchableOpacity style={[styles.menuItem, currentTheme.card]}>
        <Ionicons name="lock-closed-outline" size={22} color="#4f46e5" />
        <Text style={[styles.menuText, currentTheme.textPrimary]}>Privacy Policy</Text>
        <Ionicons name="chevron-forward" size={18} color="#94a3b8" style={{ marginLeft: "auto" }} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, currentTheme.card]}>
        <Ionicons name="help-circle-outline" size={22} color="#4f46e5" />
        <Text style={[styles.menuText, currentTheme.textPrimary]}>Help & Support</Text>
        <Ionicons name="chevron-forward" size={18} color="#94a3b8" style={{ marginLeft: "auto" }} />
      </TouchableOpacity>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// কমন স্টাইলগুলো
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 17,
    fontWeight: "800",
  },
  email: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: "500",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "600",
  },
  logoutBtn: {
    flexDirection: "row",
    backgroundColor: "#dc2626",
    padding: 15,
    borderRadius: 12,
    marginTop: 25,
    marginBottom: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  logoutText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "700",
    fontSize: 15,
  },
});

// লাইট মোড থিম কালার
const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: "#f8fafc",
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  textPrimary: {
    color: "#0f172a",
  },
  textSecondary: {
    color: "#64748b",
  },
});

// ডার্ক মোড থিম কালার
const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: "#0f172a",
  },
  card: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  textPrimary: {
    color: "#f8fafc",
  },
  textSecondary: {
    color: "#94a3b8",
  },
});