import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API = "https://jnushebaserver.onrender.com";

const FONTS = {
  regular: "Times New Roman",
  medium: "Times New Roman",
  semibold: "Times New Roman",
  bold: "Times New Roman",
  extrabold: "Times New Roman",
};
const COLORS = {
  header: "#5B21B6",
  headerMid: "#7C3AED",
  headerDark: "#3B0764",
  background: "#F6F6FB",
  cards: "#FFFFFF",
  button: "#FF6B35",
  success: "#16A34A",
  successBg: "#DCFCE7",
  danger: "#EF4444",
  warning: "#D97706",
  warningBg: "#FEF3C7",
  purpleBg: "#F3E8F6",
  blueBg: "#EFF6FF",
  text: "#181524",
  subtitle: "#6B7280",
  subtitleLight: "#9CA3AF",
  border: "#EFEFF6",
  chipBg: "#F1EEFB",
};

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
      // ইমেইল দিয়ে ব্যাকএন্ডে রিকোয়েস্ট পাঠানো নিরাপদ ও নিখুঁত
      const identifier = parsed?.email || parsed?._id || parsed?.id;

      if (identifier) {
        try {
          const res = await fetch(`${API}/users/${identifier}`);
          const latestData = await res.json();
          if (latestData && (latestData._id || latestData.email)) {
            setUser(latestData);
            await AsyncStorage.setItem("user_session", JSON.stringify(latestData));
          } else {
            setUser(parsed);
          }
        } catch (e) {
          console.log("Server sync error:", e);
          setUser(parsed);
        }
      } else {
        setUser(parsed);
      }

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
        <ActivityIndicator size="large" color={COLORS.headerMid} />
        <Text style={{ marginTop: 10, color: COLORS.subtitle, fontFamily: FONTS.medium }}>Loading Dashboard...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: COLORS.subtitle, fontFamily: FONTS.medium }}>No active session found</Text>
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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.headerMid} />
      }
    >
      <Stack.Screen 
        options={{ 
          title: "Profile", 
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 5, padding: 8 }}>
              <FontAwesome name="arrow-left" size={18} color={COLORS.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push("/edit-profile")} style={{ marginRight: 5, padding: 8 }}>
              <FontAwesome name="gear" size={20} color={COLORS.text} />
            </TouchableOpacity>
          )
        }} 
      />

      {/* HEADER */}
      <LinearGradient
        colors={[COLORS.headerDark, COLORS.header, COLORS.headerMid]}
        style={styles.header}
      >
        <Image
          source={{
            uri:
              user?.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=5B21B6&color=fff`,
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
            <FontAwesome name="dashboard" size={18} color={COLORS.headerMid} />
            <Text style={styles.sectionTitle}>Admin Overview</Text>
          </View>

          <View style={styles.statsGrid}>
            <Stat label="Total Users" value={stats?.totalUsers || 0} icon="users" color={COLORS.blueBg} textColor={COLORS.headerMid} />
            <Stat label="Students" value={stats?.totalStudents || 0} icon="graduation-cap" color={COLORS.successBg} textColor={COLORS.success} />
            <Stat label="Providers" value={stats?.totalProviders || 0} icon="briefcase" color={COLORS.warningBg} textColor={COLORS.warning} />
            <Stat label="Services" value={stats?.totalServices || 0} icon="cogs" color={COLORS.purpleBg} textColor="#9333EA" />
            <Stat label="Bookings" value={stats?.totalBookings || 0} icon="calendar-check-o" color="#FEE2E2" textColor={COLORS.danger} />
          </View>

          <View style={{ marginTop: 15 }}>
            <Action icon="money" title="All Transactions" onPress={() => router.push("/history")} />
          </View>
        </View>
      )}

      {/* PROVIDER PANEL */}
      {role === "provider" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Provider Management</Text>
          
          {user?.isApproved ? (
            <>
              <Action icon="plus-circle" title="Add New Service" onPress={() => router.push("/add-service")} />
              <Action icon="list-ul" title="My Services List" onPress={() => router.push("/my-services")} />
            </>
          ) : (
            <View style={styles.pendingBox}>
              <FontAwesome name="clock-o" size={18} color={COLORS.warning} />
              <Text style={styles.pendingText}>
                Your account is pending admin approval. You cannot add services yet.
              </Text>
            </View>
          )}

          <Action icon="calendar" title="Manage Bookings" onPress={() => router.push("/manage-booking")} />
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

const Stat = ({ label, value, icon, color, textColor }: any) => (
  <View style={[styles.statCard, { backgroundColor: color }]}>
    <View style={styles.statTopRow}>
      <FontAwesome name={icon} size={16} color={textColor} />
      <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
    </View>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Action = ({ icon, title, onPress }: any) => (
  <TouchableOpacity style={styles.action} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.actionIconContainer}>
      <FontAwesome name={icon} size={16} color={COLORS.headerMid} />
    </View>
    <Text style={styles.actionText}>{title}</Text>
    <FontAwesome name="angle-right" size={16} color={COLORS.subtitleLight} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
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
  name: { color: "#fff", fontSize: 22, fontFamily: FONTS.extrabold, marginTop: 10 },
  email: { color: "#E9D5FF", fontSize: 13, marginTop: 2, fontFamily: FONTS.medium },
  roleBadge: {
    marginTop: 10,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  roleText: { color: "#fff", fontSize: 11, fontFamily: FONTS.extrabold, letterSpacing: 1 },
  card: {
    backgroundColor: COLORS.cards,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontFamily: FONTS.extrabold, color: COLORS.text, marginBottom: 12, marginLeft: 6 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 },
  statCard: { width: "48%", padding: 14, borderRadius: 14, marginBottom: 4 },
  statTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statValue: { fontSize: 20, fontFamily: FONTS.extrabold },
  statLabel: { marginTop: 6, fontSize: 12, color: COLORS.subtitle, fontFamily: FONTS.semibold },
  action: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.chipBg,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: { flex: 1, marginLeft: 12, fontSize: 14, fontFamily: FONTS.semibold, color: COLORS.text },
  pendingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.warningBg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  pendingText: { flex: 1, marginLeft: 10, fontSize: 12, color: COLORS.warning, fontWeight: "600" },
  logout: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 25,
    marginBottom: 40,
    backgroundColor: COLORS.danger,
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  logoutText: { color: "#fff", fontSize: 15, fontFamily: FONTS.bold },
});