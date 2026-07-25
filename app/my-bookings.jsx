import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const API = "https://jnushebaserver.onrender.com";

export default function MyBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState("student");

  const loadBookings = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      if (!session) {
        router.replace("/login");
        return;
      }

      const user = JSON.parse(session);
      setUserRole(user.role || "student");

      // রোল অনুযায়ী সঠিক এন্ডপয়েন্টে ফেচ করা হচ্ছে
      // যদি প্রোভাইডার হয় তবে তার সার্ভিস বুকিং, আর স্টুডেন্ট হলে ইউজারের বুকিং ফেচ করবে
      const endpoint =
        user.role === "provider"
          ? `${API}/bookings/provider/${user.email}`
          : `${API}/bookings/user/${user.email}`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (res.ok) {
        setBookings(Array.isArray(data) ? data : []);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.log("Load Bookings Error:", err);
      Alert.alert("Error", "Failed to load bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBookings();
  }, []);

  // ================= UPDATE STATUS =================
  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", `Booking has been ${status}`);
        loadBookings();
      } else {
        Alert.alert("Error", data.message || "Update failed");
      }
    } catch (err) {
      console.log("Update Status Error:", err);
      Alert.alert("Error", "Something went wrong");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10, color: "#64748b" }}>Loading Bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "My Bookings", headerBackTitle: "Back" }} />
      
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>📦 Booking List</Text>
        <Text style={styles.headerSubtitle}>Total: {bookings.length} bookings found</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <BookingCard 
            item={item} 
            userRole={userRole} 
            onUpdateStatus={updateStatus} 
          />
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="calendar-o" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        }
      />
    </View>
  );
}

// আলাদা কম্পোনেন্ট হিসেবে রেন্ডার করা হলো যাতে রি-রেন্ডারিং পারফরমেন্স ভালো থাকে
const BookingCard = ({ item, userRole, onUpdateStatus }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case "accepted":
      case "paid":
        return { bg: "#f0fdf4", color: "#16a34a" };
      case "rejected":
      case "cancelled":
      case "failed":
        return { bg: "#fef2f2", color: "#dc2626" };
      default:
        return { bg: "#fef3c7", color: "#d97706" };
    }
  };

  const badgeStyle = getStatusStyle(item.status || item.paymentStatus);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.title} numberOfLines={1}>📌 {item.serviceTitle || "Service Booking"}</Text>
        <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
          <Text style={[styles.badgeText, { color: badgeStyle.color }]}>
            {(item.status || item.paymentStatus || "pending").toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.text}>
          <Text style={styles.label}>Amount: </Text>৳ {item.amount || 0}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.label}>{userRole === "provider" ? "Customer" : "Provider"}: </Text>
          {userRole === "provider" ? (item.customerEmail || item.userEmail) : (item.providerEmail || "N/A")}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.label}>Date: </Text>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent"}
        </Text>
      </View>

      {/* শুধুমাত্র প্রোভাইডার যদি পেন্ডিং থাকে তবে এক্সেপ্ট/রিজেক্ট বাটন দেখাবে */}
      {userRole === "provider" && item.status === "pending" && (
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, styles.acceptBtn]}
            onPress={() => onUpdateStatus(item._id, "accepted")}
          >
            <FontAwesome name="check" size={14} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.btnText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.rejectBtn]}
            onPress={() => onUpdateStatus(item._id, "rejected")}
          >
            <FontAwesome name="times" size={14} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  headerContainer: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  detailsContainer: {
    gap: 4,
  },
  text: {
    fontSize: 14,
    color: "#475569",
  },
  label: {
    fontWeight: "600",
    color: "#1e293b",
  },
  btnRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  acceptBtn: {
    backgroundColor: "#16a34a",
  },
  rejectBtn: {
    backgroundColor: "#dc2626",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 15,
    color: "#94a3b8",
    fontWeight: "500",
  },
});