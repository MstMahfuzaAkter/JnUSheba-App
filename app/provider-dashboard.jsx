import React from "react";
import { 
  View as RNView, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar 
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ProviderDashboard() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* HEADER SECTION */}
      <RNView style={styles.headerContainer}>
        <Text style={styles.welcomeText}>Welcome Back, Partner 🚀</Text>
        <Text style={styles.headerTitle}>Provider Dashboard</Text>
      </RNView>

      {/* QUICK STATS / OVERVIEW BANNER (Professional Touch) */}
      <RNView style={styles.statsContainer}>
        <RNView style={styles.statBox}>
          <Text style={styles.statNumber}>Grow</Text>
          <Text style={styles.statLabel}>Your Business</Text>
        </RNView>
        <RNView style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: "#e2e8f0" }]}>
          <Text style={styles.statNumber}>Manage</Text>
          <Text style={styles.statLabel}>Campus Orders</Text>
        </RNView>
      </RNView>

      {/* MENU ACTIONS */}
      <RNView style={styles.menuList}>
        
        {/* ADD SERVICE */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/add-service")}
          style={[styles.menuCard, { borderColor: "#eff6ff" }]}
        >
          <RNView style={[styles.iconWrapper, { backgroundColor: "#eff6ff" }]}>
            <Ionicons name="add-circle-outline" size={24} color="#2563eb" />
          </RNView>
          <RNView style={styles.cardContent}>
            <Text style={styles.cardTitle}>Add New Service</Text>
            <Text style={styles.cardDesc}>Launch a new service on the campus</Text>
          </RNView>
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </TouchableOpacity>

        {/* MY SERVICES */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/my-services")}
          style={[styles.menuCard, { borderColor: "#ecfdf5" }]}
        >
          <RNView style={[styles.iconWrapper, { backgroundColor: "#ecfdf5" }]}>
            <Ionicons name="layers-outline" size={24} color="#10b981" />
          </RNView>
          <RNView style={styles.cardContent}>
            <Text style={styles.cardTitle}>My Services</Text>
            <Text style={styles.cardDesc}>Manage and edit your existing listings</Text>
          </RNView>
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </TouchableOpacity>

        {/* BOOKINGS */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/provider-bookings")}
          style={[styles.menuCard, { borderColor: "#fffbeb" }]}
        >
          <RNView style={[styles.iconWrapper, { backgroundColor: "#fffbeb" }]}>
            <Ionicons name="calendar-outline" size={24} color="#d97706" />
          </RNView>
          <RNView style={styles.cardContent}>
            <Text style={styles.cardTitle}>Manage Bookings</Text>
            <Text style={styles.cardDesc}>View orders and student requests</Text>
          </RNView>
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </TouchableOpacity>

      </RNView>
    </SafeAreaView>
  );
}

// ================= PREMIUM STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc", // Modern slate bg
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginTop: 25,
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  welcomeText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "500",
  },
  menuList: {
    gap: 14,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardDesc: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 3,
    fontWeight: "500",
  },
});