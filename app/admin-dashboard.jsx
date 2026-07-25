import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const API = "https://jnushebaserver.onrender.com";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadAll();
  }, []);

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
      setUsers(Array.isArray(uData) ? uData : uData.users || []);
      setProviders(Array.isArray(pData) ? pData : pData.providers || []);
      setBookings(Array.isArray(bData) ? bData : bData.bookings || []);
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

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#5B21B6" />
        <Text style={styles.loaderText}>Loading Magic Dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* COLORFUL GRADIENT-LIKE APP BAR */}
      <View style={styles.appBar}>
        <View style={styles.appBarContent}>
          <View>
            <Text style={styles.appBarSubtitle}>✨ MANAGEMENT SUITE</Text>
            <Text style={styles.appBarTitle}>Admin Dashboard 🚀</Text>
          </View>
          <TouchableOpacity style={styles.refreshIconBtn} onPress={loadAll}>
            <Ionicons name="sparkles" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* VIBRANT TABS */}
      <View style={styles.tabContainer}>
        {[
          { key: "overview", label: "📊 Overview", color: "#6366f1" },
          { key: "users", label: `👥 Users (${users.length})`, color: "#3b82f6" },
          { key: "providers", label: `🛡️ Pending (${providers.length})`, color: "#f59e0b" },
          { key: "bookings", label: `📦 Bookings`, color: "#ec4899" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && { backgroundColor: tab.color, shadowColor: tab.color },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ec4899" />}
      >
        {/* OVERVIEW TAB */}
        {(activeTab === "overview" || activeTab === "all") && (
          <View>
            <Text style={styles.sectionHeader}>🌈 Platform Statistics</Text>
            <View style={styles.statsGrid}>
              <StatCard title="Total Users" value={stats?.totalUsers || 0} icon="people" color="#6366f1" bg="#e0e7ff" />
              <StatCard title="Students" value={stats?.totalStudents || 0} icon="school" color="#10b981" bg="#d1fae5" />
              <StatCard title="Providers" value={stats?.totalProviders || 0} icon="briefcase" color="#f59e0b" bg="#fef3c7" />
              <StatCard title="Pending App." value={providers.length} icon="time" color="#f43f5e" bg="#ffe4e6" />
              <StatCard title="Services" value={stats?.totalServices || 0} icon="layers" color="#0ea5e9" bg="#e0f2fe" />
              <StatCard title="Bookings" value={stats?.totalBookings || 0} icon="receipt" color="#a855f7" bg="#f3e8ff" />
            </View>

            {providers.length > 0 && (
              <View style={styles.bannerAlert}>
                <View style={styles.bannerIconBox}>
                  <Ionicons name="notifications" size={20} color="#f59e0b" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.bannerTitle}>Provider Approvals Waiting!</Text>
                  <Text style={styles.bannerText}>You have {providers.length} new providers wanting access.</Text>
                </View>
                <TouchableOpacity onPress={() => setActiveTab("providers")} style={styles.bannerBtn}>
                  <Text style={styles.bannerBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* USERS TAB */}
        {(activeTab === "users" || activeTab === "all") && (
          <View style={{ marginTop: activeTab === "all" ? 20 : 0 }}>
            <Text style={styles.sectionHeader}>👥 User Directory & Roles</Text>
            {users.map((item) => (
              <View key={item._id} style={[styles.card, { borderLeftColor: getRoleColor(item.role) }]}>
                <View style={styles.cardTopRow}>
                  <View style={[styles.avatarBox, { backgroundColor: getRoleBg(item.role) }]}>
                    <Text style={[styles.avatarLetter, { color: getRoleColor(item.role) }]}>
                      {item.name ? item.name.charAt(0).toUpperCase() : "U"}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.cardTitle}>{item.name || "Unnamed User"}</Text>
                    <Text style={styles.cardSubtitle}>{item.email}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: getRoleBg(item.role) }]}>
                    <Text style={[styles.badgeText, { color: getRoleColor(item.role) }]}>{item.role || "user"}</Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <Text style={styles.actionLabel}>Switch Role:</Text>
                  <View style={styles.pillGroup}>
                    {[
                      { r: "student", label: "Student", color: "#3b82f6" },
                      { r: "provider", label: "Provider", color: "#f59e0b" },
                      { r: "admin", label: "Admin", color: "#ef4444" },
                    ].map((roleObj) => (
                      <TouchableOpacity
                        key={roleObj.r}
                        onPress={() => changeRole(item._id, roleObj.r)}
                        style={[
                          styles.roleBtn,
                          item.role === roleObj.r && { backgroundColor: roleObj.color },
                        ]}
                      >
                        <Text style={[styles.roleBtnText, item.role === roleObj.r && { color: "#ffffff" }]}>
                          {roleObj.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* PROVIDERS TAB */}
        {(activeTab === "providers" || activeTab === "all") && (
          <View style={{ marginTop: activeTab === "all" ? 20 : 0 }}>
            <Text style={styles.sectionHeader}>🛡️ Pending Provider Requests</Text>
            {providers.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="checkmark-circle" size={40} color="#10b981" />
                <Text style={styles.emptyText}>Amazing! No pending requests right now.</Text>
              </View>
            ) : (
              providers.map((item) => (
                <View key={item._id} style={[styles.card, { borderLeftColor: "#f59e0b" }]}>
                  <View style={styles.cardTopRow}>
                    <View style={[styles.avatarBox, { backgroundColor: "#fef3c7" }]}>
                      <Ionicons name="shield-checkmark" size={18} color="#d97706" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <Text style={styles.cardSubtitle}>{item.email}</Text>
                    </View>
                  </View>

                  <View style={styles.dualBtnRow}>
                    <TouchableOpacity
                      onPress={() => handleProviderAction(item._id, "approve")}
                      style={[styles.actionBtn, { backgroundColor: "#10b981" }]}
                    >
                      <Ionicons name="checkmark-circle" size={15} color="#fff" />
                      <Text style={styles.actionBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleProviderAction(item._id, "reject")}
                      style={[styles.actionBtn, { backgroundColor: "#ef4444" }]}
                    >
                      <Ionicons name="close-circle" size={15} color="#fff" />
                      <Text style={styles.actionBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* BOOKINGS TAB */}
        {(activeTab === "bookings" || activeTab === "all") && (
          <View style={{ marginTop: activeTab === "all" ? 20 : 0 }}>
            <Text style={styles.sectionHeader}>📦 Bookings & Payments</Text>
            {bookings.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="receipt-outline" size={40} color="#a855f7" />
                <Text style={styles.emptyText}>No bookings found in the system.</Text>
              </View>
            ) : (
              bookings.map((item) => (
                <View key={item._id} style={[styles.card, { borderLeftColor: "#ec4899" }]}>
                  <View style={styles.cardTopRow}>
                    <View style={[styles.avatarBox, { backgroundColor: "#fce7f3" }]}>
                      <Ionicons name="cube" size={18} color="#db2777" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.cardTitle}>{item.serviceTitle || "Service Booking"}</Text>
                      <Text style={styles.cardSubtitle}>Client: {item.userEmail || "N/A"}</Text>
                    </View>
                  </View>

                  <View style={styles.statusRow}>
                    <View style={styles.statusBox}>
                      <Text style={styles.statusKey}>Status:</Text>
                      <Text style={styles.statusVal}>{item.status || "pending"}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBox,
                        { backgroundColor: item.paymentStatus === "paid" ? "#d1fae5" : "#ffe4e6" },
                      ]}
                    >
                      <Text style={styles.statusKey}>Payment:</Text>
                      <Text
                        style={[
                          styles.statusVal,
                          { color: item.paymentStatus === "paid" ? "#047857" : "#be123c" },
                        ]}
                      >
                        {item.paymentStatus || "unpaid"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable Stat Card
const StatCard = ({ title, value, icon, color, bg }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statTop}>
      <Text style={styles.statLabel}>{title}</Text>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={15} color={color} />
      </View>
    </View>
    <Text style={[styles.statValNum, { color }]}>{value}</Text>
  </View>
);

// Color Helpers
const getRoleColor = (role) => {
  if (role === "admin") return "#ef4444";
  if (role === "provider") return "#f59e0b";
  return "#3b82f6";
};

const getRoleBg = (role) => {
  if (role === "admin") return "#fee2e2";
  if (role === "provider") return "#fef3c7";
  return "#dbeafe";
};

// Colorful & Modern Styles with Times New Roman
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdf2f8",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fdf2f8",
    gap: 12,
  },
  loaderText: {
    color: "#5B21B6",
    fontWeight: "800",
    fontSize: 14,
    fontFamily: "Times New Roman",
  },
  appBar: {
    backgroundColor: "#5B21B6",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  appBarContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appBarSubtitle: {
    color: "#fce7f3",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    fontFamily: "Times New Roman",
  },
  appBarTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2,
    fontFamily: "Times New Roman",
  },
  refreshIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 6,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tabText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    fontFamily: "Times New Roman",
  },
  activeTabText: {
    color: "#ffffff",
    fontWeight: "900",
    fontFamily: "Times New Roman",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "900",
    color: "#831843",
    marginBottom: 12,
    marginTop: 6,
    fontFamily: "Times New Roman",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  statTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    fontFamily: "Times New Roman",
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  statValNum: {
    fontSize: 22,
    fontWeight: "900",
    fontFamily: "Times New Roman",
  },
  bannerAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderRadius: 18,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  bannerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#b45309",
    fontFamily: "Times New Roman",
  },
  bannerText: {
    fontSize: 11,
    color: "#d97706",
    fontWeight: "600",
    marginTop: 1,
    fontFamily: "Times New Roman",
  },
  bannerBtn: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  bannerBtnText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 11,
    fontFamily: "Times New Roman",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    fontWeight: "900",
    fontSize: 16,
    fontFamily: "Times New Roman",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1e293b",
    fontFamily: "Times New Roman",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    marginTop: 1,
    fontFamily: "Times New Roman",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    fontFamily: "Times New Roman",
  },
  actionRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    fontFamily: "Times New Roman",
  },
  pillGroup: {
    flexDirection: "row",
    gap: 6,
  },
  roleBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  roleBtnText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    fontFamily: "Times New Roman",
  },
  dualBtnRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  actionBtnText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 12,
    fontFamily: "Times New Roman",
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  statusBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusKey: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    fontFamily: "Times New Roman",
  },
  statusVal: {
    fontSize: 11,
    fontWeight: "900",
    color: "#1e293b",
    textTransform: "capitalize",
    fontFamily: "Times New Roman",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  emptyText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 8,
    fontFamily: "Times New Roman",
  },
});