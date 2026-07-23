import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Text,
  RefreshControl,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://junsheba.vercel.app";

export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfileData = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");

      if (!session) {
        router.replace("/login");
        return;
      }

      const parsed = JSON.parse(session);
      setUser(parsed);

      if (parsed?.role === "admin") {
        const res = await fetch(`${API}/admin-stats`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.log("Profile Fetch Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [params?.refresh]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfileData();
  }, []);

  // ================= LOGOUT =================
  const performLogout = async () => {
    try {
      await AsyncStorage.removeItem("user_session");
      router.replace("/login");
    } catch (err) {
      console.log("Logout Error:", err);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to logout?");
      if (confirmed) {
        performLogout();
      }
      return;
    }

    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: performLogout },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 10, color: "#64748b", fontWeight: "500" }}>Loading Dashboard...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: "#64748b" }}>No active session found</Text>
      </View>
    );
  }

  const role = user?.role || "user";
  const name = user?.name || "Valued User";
  const email = user?.email || "No email provided";

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
      }
    >
      <Stack.Screen 
        options={{ 
          title: "Dashboard", 
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 5, padding: 8 }}>
              <FontAwesome name="arrow-left" size={18} color="#0f172a" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push("/edit-profile")} style={{ marginRight: 5, padding: 8 }}>
              <FontAwesome name="gear" size={20} color="#0f172a" />
            </TouchableOpacity>
          )
        }} 
      />

      {/* HEADER */}
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#3b82f6"]}
        style={styles.header}
      >
        <Image
          source={{
            uri:
              user?.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`,
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{role.toUpperCase()} ACCOUNT</Text>
        </View>
      </LinearGradient>

      {/* ADMIN ANALYTICS */}
      {role === "admin" && (
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <FontAwesome name="dashboard" size={18} color="#2563eb" />
            <Text style={styles.sectionTitle}>Admin Overview</Text>
          </View>

          <View style={styles.statsGrid}>
            <Stat label="Total Users" value={stats?.totalUsers || 0} icon="users" color="#eff6ff" textColor="#2563eb" />
            <Stat label="Students" value={stats?.totalStudents || 0} icon="graduation-cap" color="#f0fdf4" textColor="#16a34a" />
            <Stat label="Providers" value={stats?.totalProviders || 0} icon="briefcase" color="#fef3c7" textColor="#d97706" />
            <Stat label="Services" value={stats?.totalServices || 0} icon="cogs" color="#f3e8ff" textColor="#9333ea" />
            <Stat label="Bookings" value={stats?.totalBookings || 0} icon="calendar-check-o" color="#fee2e2" textColor="#dc2626" />
          </View>

          {/* Admin Transactions Button */}
          <View style={{ marginTop: 15 }}>
            <Action icon="money" title="All Transactions" onPress={() => router.push("/history")} />
          </View>
        </View>
      )}

      {/* PROVIDER PANEL */}
      {role === "provider" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Provider Management</Text>
          <Action icon="plus-circle" title="Add New Service" onPress={() => router.push("/add-service")} />
          <Action icon="list-ul" title="My Services List" onPress={() => router.push("/my-services")} />
          <Action icon="calendar" title="Manage Bookings" onPress={() => router.push("/my-bookings")} />
          <Action icon="history" title="Transaction History" onPress={() => router.push("/history")} />
        </View>
      )}

      {/* STUDENT / USER PANEL */}
      {role === "student" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Explore & Bookings</Text>
          <Action icon="search" title="Find Services" onPress={() => router.push("/services")} />
          <Action icon="calendar" title="My Bookings" onPress={() => router.push("/my-bookings")} />
          <Action icon="history" title="Transaction History" onPress={() => router.push("/history")} />
        </View>
      )}

      {/* ACCOUNT SETTINGS */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <Action icon="user-o" title="Edit Profile Details" onPress={() => router.push("/edit-profile")} />
        <Action icon="shield" title="Security & Privacy" onPress={() => {}} />
      </View>

      {/* LOGOUT BUTTON */}
      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <FontAwesome name="sign-out" size={16} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const Stat = ({ label, value, icon, color, textColor }) => (
  <View style={[styles.statCard, { backgroundColor: color }]}>
    <View style={styles.statTopRow}>
      <FontAwesome name={icon} size={16} color={textColor} />
      <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
    </View>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Action = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.action} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.actionIconContainer}>
      <FontAwesome name={icon} size={16} color="#2563eb" />
    </View>
    <Text style={styles.actionText}>{title}</Text>
    <FontAwesome name="angle-right" size={16} color="#94a3b8" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 30,
    paddingBottom: 35,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.8)",
    backgroundColor: "#fff",
  },
  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  email: {
    color: "#cbd5e1",
    fontSize: 13,
    marginTop: 2,
  },
  roleBadge: {
    marginTop: 10,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,25,0.2)",
  },
  roleText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  statCard: {
    width: "48%",
    padding: 14,
    borderRadius: 14,
    marginBottom: 4,
  },
  statTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    marginTop: 6,
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  logout: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  logoutText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});