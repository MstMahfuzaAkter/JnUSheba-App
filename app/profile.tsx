import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Alert,
  Text,
} from "react-native";

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

  useEffect(() => {
    const init = async () => {
      try {
        const session = await AsyncStorage.getItem("user_session");

        if (!session) {
          router.replace("/login");
          return;
        }

        const parsed = JSON.parse(session);

        console.log("USER SESSION:", parsed);

        setUser(parsed);

        if (parsed?.role === "admin") {
          const res = await fetch(`${API}/admin-stats`);
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.log("Profile Error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel",
      },
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

  if (!user) {
    return (
      <View style={styles.loading}>
        <Text>No user found</Text>
      </View>
    );
  }

  const role = user?.role || "user";
  const name = user?.name || "Unknown User";

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: "Dashboard" }} />

      {/* HEADER */}
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#3b82f6"]}
        style={styles.header}
      >
        <Image
          source={{
            uri:
              user?.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>{name}</Text>

        <Text style={styles.role}>
          {role.toUpperCase()} DASHBOARD
        </Text>
      </LinearGradient>

      {/* ADMIN */}
      {role === "admin" && stats && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Admin Analytics</Text>

          <Stat label="Users" value={stats?.totalUsers || 0} />
          <Stat label="Students" value={stats?.totalStudents || 0} />
          <Stat label="Providers" value={stats?.totalProviders || 0} />
          <Stat label="Services" value={stats?.totalServices || 0} />
          <Stat label="Bookings" value={stats?.totalBookings || 0} />
        </View>
      )}

      {/* PROVIDER */}
      {role === "provider" && (
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

      {/* STUDENT */}
      {role === "student" && (
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

      {/* SETTINGS */}
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

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

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
    paddingTop: 55,
    paddingBottom: 35,
    alignItems: "center",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,

    elevation: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#fff",
  },

  name: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
  },

  role: {
    color: "#dbeafe",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
    letterSpacing: 1,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 22,

    elevation: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 15,
  },

  stat: {
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },

  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
  },

  statLabel: {
    marginTop: 4,
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },

  action: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  actionText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },

  logout: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 35,
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",

    elevation: 5,
    shadowColor: "#ef4444",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});