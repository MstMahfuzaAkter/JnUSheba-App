import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
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
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Loading Bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "My Bookings", 
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: "#ffffff" },
          headerTintColor: "#0f172a",
          headerTitleStyle: { fontWeight: "600", fontSize: 17 },
          headerShadowVisible: false,
        }} 
      />

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0284c7" />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Booking List</Text>
            <Text style={styles.headerSubtitle}>Total: {bookings.length} bookings found</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <FontAwesome name="calendar-o" size={32} color="#0284c7" />
            </View>
            <Text style={styles.emptyTitle}>No Bookings Found</Text>
            <Text style={styles.emptySubtitle}>You don't have any active bookings at the moment.</Text>
          </View>
        }
      />
    </View>
  );
}

const BookingCard = ({ item, userRole, onUpdateStatus }) => {
  const getStatusStyle = (status) => {
    const formatted = (status || "").toLowerCase();
    switch (formatted) {
      case "accepted":
      case "paid":
      case "completed":
      case "valid":
        return { bg: "#dcfce7", color: "#16a34a" };
      case "rejected":
      case "cancelled":
      case "failed":
        return { bg: "#fee2e2", color: "#dc2626" };
      default:
        return { bg: "#fef3c7", color: "#d97706" };
    }
  };

  const badgeStyle = getStatusStyle(item.status || item.paymentStatus);

  // সব সম্ভাব্য ফিল্ড চেক করে সঠিক অ্যামাউন্ট রেন্ডার করার জন্য
  const displayAmount = 
    item.amount || 
    item.total_amount || 
    item.payment?.amount || 
    item.transaction?.amount || 
    item.price || 
    0;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.title} numberOfLines={1}>
          {item.serviceTitle || item.title || "Service Booking"}
        </Text>
        <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
          <Text style={[styles.badgeText, { color: badgeStyle.color }]}>
            {(item.status || item.paymentStatus || "pending").toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.amountText}>৳{displayAmount}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{userRole === "provider" ? "Customer" : "Provider"}</Text>
          <Text style={styles.valueText} numberOfLines={1}>
            {userRole === "provider" ? (item.customerEmail || item.userEmail || item.email) : (item.providerEmail || "N/A")}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.valueText}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            }) : "Recent"}
          </Text>
        </View>
      </View>

      {userRole === "provider" && item.status === "pending" && (
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, styles.acceptBtn]}
            onPress={() => onUpdateStatus(item._id, "accepted")}
            activeOpacity={0.8}
          >
            <FontAwesome name="check" size={13} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.btnText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.rejectBtn]}
            onPress={() => onUpdateStatus(item._id, "rejected")}
            activeOpacity={0.8}
          >
            <FontAwesome name="times" size={13} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: { 
    marginTop: 12, 
    color: "#64748b", 
    fontSize: 14,
    fontWeight: "500" 
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  headerContainer: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    marginBottom: 14,
    borderRadius: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  detailsContainer: {
    gap: 8,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  valueText: {
    fontSize: 13,
    color: "#1e293b",
    fontWeight: "600",
    maxWidth: "65%",
  },
  amountText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
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
    fontWeight: "700",
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#1e293b",
    marginBottom: 6,
  },
  emptySubtitle: { 
    textAlign: "center",
    color: "#64748b", 
    fontSize: 14,
    lineHeight: 20,
  },
});