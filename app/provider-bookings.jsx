import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    View as RNView,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";

const API = "https://jnushebaserver.onrender.com";

export default function ProviderBookings() {
  // 💥 <Booking[]> এবং টাইপস্ক্রিপ্টের সিনট্যাক্স বাদ দেওয়া হয়েছে
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null); 

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      if (!session) return;
      const user = JSON.parse(session);

      const res = await fetch(`${API}/provider-bookings/${user.email}`);
      const data = await res.json();
      
      const verifiedBookings = Array.isArray(data) ? data : data.data || [];
      setBookings(verifiedBookings);
    } catch (err) {
      console.log("Load Bookings Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setActionLoadingId(id);
      const res = await fetch(`${API}/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      
      if (data.success || res.ok) {
        Alert.alert("Updated", `Booking has been ${status}!`);
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status } : b))
        );
      } else {
        Alert.alert("Error", "Failed to update status");
      }
    } catch (err) {
      console.log("Update Status Error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusStyle = (status = "pending") => {
    switch (status.toLowerCase()) {
      case "accepted":
        return { bg: "#ecfdf5", text: "#10b981" };
      case "rejected":
        return { bg: "#fef2f2", text: "#ef4444" };
      default:
        return { bg: "#fffbeb", text: "#d97706" };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <RNView style={styles.headerContainer}>
        <Text style={styles.welcomeText}>Incoming Requests 📩</Text>
        <Text style={styles.headerTitle}>Manage Bookings</Text>
      </RNView>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={
          <RNView style={styles.center}>
            <Ionicons name="calendar-clear-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>No bookings requested yet.</Text>
          </RNView>
        }
        renderItem={({ item }) => {
          const currentStatus = item.status || "pending";
          const statusStyle = getStatusStyle(currentStatus);
          const isActionLoading = actionLoadingId === item._id;

          return (
            <RNView style={styles.card}>
              <RNView style={styles.cardHeader}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.serviceTitle || "Requested Service"}
                </Text>
                <RNView style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                    {currentStatus}
                  </Text>
                </RNView>
              </RNView>

              <RNView style={styles.infoBox}>
                <Ionicons name="person-outline" size={14} color="#64748b" />
                <Text style={styles.infoText}>Student: {item.userEmail}</Text>
              </RNView>

              {currentStatus === "pending" && (
                <RNView style={styles.actionRow}>
                  {isActionLoading ? (
                    <ActivityIndicator size="small" color="#2563eb" style={{ flex: 1, paddingVertical: 10 }} />
                  ) : (
                    <>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => updateStatus(item._id, "accepted")}
                        style={[styles.actionBtn, styles.acceptBtn]}
                      >
                        <Ionicons name="checkmark-sharp" size={16} color="#fff" />
                        <Text style={styles.btnText}>Accept</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => updateStatus(item._id, "rejected")}
                        style={[styles.actionBtn, styles.rejectBtn]}
                      >
                        <Ionicons name="close-sharp" size={16} color="#fff" />
                        <Text style={styles.btnText}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </RNView>
              )}
            </RNView>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "500",
    marginTop: 10,
  },
  headerContainer: {
    marginVertical: 20,
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
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
    marginRight: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  infoText: {
    marginLeft: 6,
    color: "#475569",
    fontSize: 13,
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    backgroundColor: "transparent",
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  acceptBtn: {
    backgroundColor: "#10b981",
  },
  rejectBtn: {
    backgroundColor: "#ef4444",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});