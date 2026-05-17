import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";

import { Text } from "react-native";
import { Stack, useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://junsheba.vercel.app";

export default function ProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= LOAD USER =================
  useEffect(() => {
    const init = async () => {
      try {
        const session = await AsyncStorage.getItem("user_session");

        if (!session) {
          router.replace("/login");
          return;
        }

        const parsed = JSON.parse(session);
        setUser(parsed);

        // ADMIN STATS ONLY FOR ADMIN
        if (parsed.role === "admin") {
          const res = await fetch(`${API}/admin-stats`);
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("user_session");
          router.replace("/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!user) return null;

  return (
    <ScrollView style={styles.container}>

      <Stack.Screen options={{ title: "Dashboard" }} />

      {/* ================= HEADER ================= */}
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#3b82f6"]}
        style={styles.header}
      >
        <Image
          source={{
            uri: user.profileImage
              ? user.profileImage
              : `https://ui-avatars.com/api/?name=${user.name}`,
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>{user.name}</Text>

        <Text style={styles.role}>
          {user.role.toUpperCase()} DASHBOARD
        </Text>
      </LinearGradient>

      {/* ================= ADMIN PANEL ================= */}
      {user.role === "admin" && stats && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Admin Analytics</Text>

          <Stat label="Users" value={stats.totalUsers} />
          <Stat label="Students" value={stats.totalStudents} />
          <Stat label="Providers" value={stats.totalProviders} />
          <Stat label="Services" value={stats.totalServices} />
          <Stat label="Bookings" value={stats.totalBookings} />
        </View>
      )}

      {/* ================= PROVIDER ================= */}
      {user.role === "provider" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Provider Panel</Text>

          <Action
            icon="plus"
            title="Add Service"
            onPress={() => router.push("/add-service")}
          />

          <Action
            icon="list"
            title="My Services"
            onPress={() => router.push("/my-services")}
          />

          <Action
            icon="calendar"
            title="Bookings"
            onPress={() => router.push("/provider-bookings")}
          />
        </View>
      )}

      {/* ================= STUDENT ================= */}
      {user.role === "student" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Student Panel</Text>

          <Action
            icon="search"
            title="Find Services"
            onPress={() => router.push("/services")}
          />

          <Action
            icon="calendar"
            title="My Bookings"
            onPress={() => router.push("/my-bookings")}
          />

          <Action
            icon="history"
            title="History"
            onPress={() => router.push("/history")}
          />
        </View>
      )}

      {/* ================= SETTINGS ================= */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <Action
          icon="user"
          title="Edit Profile"
          onPress={() => router.push("/edit-profile")}
        />

        <Action
          icon="lock"
          title="Security"
          onPress={() => {}}
        />
      </View>

      {/* ================= LOGOUT ================= */}
      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={{ color: "red", fontWeight: "800" }}>
          Logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */

const Stat = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Action = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.action} onPress={onPress}>
    <FontAwesome name={icon} size={18} color="#3b82f6" />
    <Text style={styles.actionText}>{title}</Text>
  </TouchableOpacity>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    padding: 30,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#fff",
  },

  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 10,
  },

  role: {
    color: "#cbd5e1",
    fontSize: 12,
  },

  card: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 15,
    borderRadius: 15,
  },

  sectionTitle: {
    fontWeight: "800",
    marginBottom: 10,
  },

  stat: {
    paddingVertical: 6,
  },

  statValue: {
    fontSize: 18,
    fontWeight: "900",
  },

  statLabel: {
    fontSize: 12,
    color: "#64748b",
  },

  action: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 12,
    alignItems: "center",
  },

  actionText: {
    fontWeight: "600",
  },

  logout: {
    margin: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
  },
});