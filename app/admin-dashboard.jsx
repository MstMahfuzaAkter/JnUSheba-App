import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";

const API = "https://junsheba.vercel.app";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // ================= LOAD =================
  const loadData = async () => {
    try {
      setLoading(true);

      const [sRes, bRes] = await Promise.all([
        fetch(`${API}/admin-stats`),
        fetch(`${API}/admin/bookings`),
      ]);

      const sData = await sRes.json();
      const bData = await bRes.json();

      setStats(sData);
      setBookings(bData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= UPDATE =================
  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API}/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      loadData();
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // ================= STATUS BADGE =================
  const StatusBadge = ({ status }) => {
    let bg = "#f59e0b";

    if (status === "accepted") bg = "#22c55e";
    if (status === "rejected") bg = "#ef4444";

    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={styles.badgeText}>{status.toUpperCase()}</Text>
      </View>
    );
  };

  // ================= STATS CARD =================
  const StatCard = ({ label, value, color }) => (
    <View style={[styles.statCard, { borderColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  // ================= BOOKING ITEM =================
  const renderItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.title}>📦 {item.serviceTitle}</Text>
        <StatusBadge status={item.status} />
      </View>

      <Text style={styles.text}>👤 {item.userEmail}</Text>
      <Text style={styles.text}>🧑‍🔧 {item.providerEmail}</Text>

      {item.status === "pending" && (
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#22c55e" }]}
            onPress={() => updateStatus(item._id, "accepted")}
          >
            <Text style={styles.btnText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#ef4444" }]}
            onPress={() => updateStatus(item._id, "rejected")}
          >
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <Text style={styles.header}>🛡️ Admin Panel</Text>
      <Text style={styles.subHeader}>Dashboard Overview</Text>

      {/* STATS */}
      <View style={styles.statsGrid}>
        <StatCard label="Users" value={stats.totalUsers} color="#6366f1" />
        <StatCard label="Students" value={stats.totalStudents} color="#10b981" />
        <StatCard label="Providers" value={stats.totalProviders} color="#f59e0b" />
        <StatCard label="Services" value={stats.totalServices} color="#3b82f6" />
        <StatCard label="Bookings" value={stats.totalBookings} color="#ef4444" />
      </View>

      {/* BOOKINGS */}
      <Text style={styles.sectionTitle}>Recent Bookings</Text>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
    </View>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
  },

  subHeader: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 15,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
  },

  statValue: {
    fontSize: 22,
    fontWeight: "900",
  },

  statLabel: {
    color: "#64748b",
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 10,
    color: "#0f172a",
  },

  bookingCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  text: {
    color: "#475569",
    marginTop: 3,
  },

  btnRow: {
    flexDirection: "row",
    marginTop: 10,
  },

  btn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});