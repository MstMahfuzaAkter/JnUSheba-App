import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from "react-native";

const API = "https://junsheba.vercel.app";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  // ================= LOAD ALL =================
  const loadAll = async () => {
    try {
      setLoading(true);

      const [sRes, uRes, pRes, bRes] = await Promise.all([
        fetch(`${API}/admin-stats`),
        fetch(`${API}/users`),
        fetch(`${API}/admin/providers/pending`),
        fetch(`${API}/admin/bookings`),
      ]);

      const sData = await sRes.json();
      const uData = await uRes.json();
      const pData = await pRes.json();
      const bData = await bRes.json();

      setStats(sData);
      setUsers(uData);
      setProviders(pData);
      setBookings(bData);
    } catch (err) {
      console.log("LOAD ERROR:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  // ================= ROLE CHANGE =================
  const changeRole = async (id, role) => {
    try {
      await fetch(`${API}/admin/user-role/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      loadAll();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= PROVIDER ACTION =================
  const handleProviderAction = async (id, action) => {
    try {
      await fetch(`${API}/admin/provider/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      loadAll();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // ================= USER CARD =================
  const renderUser = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>👤 {item.name}</Text>
      <Text style={styles.text}>📧 {item.email}</Text>
      <Text style={styles.status}>Role: {item.role}</Text>

      <View style={styles.btnRow}>
        <TouchableOpacity onPress={() => changeRole(item._id, "student")} style={[styles.btn, { backgroundColor: "#3b82f6" }]}>
          <Text style={styles.btnText}>Student</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => changeRole(item._id, "provider")} style={[styles.btn, { backgroundColor: "#f59e0b" }]}>
          <Text style={styles.btnText}>Provider</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => changeRole(item._id, "admin")} style={[styles.btn, { backgroundColor: "#ef4444" }]}>
          <Text style={styles.btnText}>Admin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ================= PROVIDER CARD =================
  const renderProvider = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>👤 {item.name}</Text>
      <Text style={styles.text}>📧 {item.email}</Text>

      <View style={styles.btnRow}>
        <TouchableOpacity onPress={() => handleProviderAction(item._id, "approve")} style={[styles.btn, { backgroundColor: "#22c55e" }]}>
          <Text style={styles.btnText}>Approve</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleProviderAction(item._id, "reject")} style={[styles.btn, { backgroundColor: "#ef4444" }]}>
          <Text style={styles.btnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ================= BOOKING CARD =================
  const renderBooking = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>📦 {item.serviceTitle}</Text>
      <Text style={styles.text}>👤 {item.userEmail}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[]}
        ListHeaderComponent={
          <View>
            <Text style={styles.header}>🛡️ Admin Dashboard</Text>

            {/* STATS */}
            <View style={styles.statsGrid}>
              <Stat label="Users" value={stats?.totalUsers || 0} color="#6366f1" />
              <Stat label="Students" value={stats?.totalStudents || 0} color="#10b981" />
              <Stat label="Providers" value={stats?.totalProviders || 0} color="#f59e0b" />
              <Stat label="Services" value={stats?.totalServices || 0} color="#3b82f6" />
              <Stat label="Bookings" value={stats?.totalBookings || 0} color="#ef4444" />
            </View>

            {/* USERS */}
            <Text style={styles.sectionTitle}>Users</Text>
            <FlatList data={users} keyExtractor={(i) => i._id} renderItem={renderUser} scrollEnabled={false} />

            {/* PROVIDERS */}
            <Text style={styles.sectionTitle}>Pending Providers</Text>
            <FlatList data={providers} keyExtractor={(i) => i._id} renderItem={renderProvider} scrollEnabled={false} />

            {/* BOOKINGS */}
            <Text style={styles.sectionTitle}>Bookings</Text>
            <FlatList data={bookings} keyExtractor={(i) => i._id} renderItem={renderBooking} scrollEnabled={false} />
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  );
}

// ================= STATS =================
const Stat = ({ label, value, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 15 },
  header: { fontSize: 26, fontWeight: "800", marginBottom: 10 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },

  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 5,
  },

  statValue: { fontSize: 20, fontWeight: "900" },
  statLabel: { color: "#64748b" },

  sectionTitle: { fontSize: 18, fontWeight: "800", marginTop: 15 },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },

  title: { fontWeight: "700", fontSize: 15 },
  text: { color: "#475569" },
  status: { fontWeight: "700", marginTop: 5 },

  btnRow: { flexDirection: "row", marginTop: 10, flexWrap: "wrap" },

  btn: {
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    marginTop: 5,
  },

  btnText: { color: "#fff", fontWeight: "700" },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});