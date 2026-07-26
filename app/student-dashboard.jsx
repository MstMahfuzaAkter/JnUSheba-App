import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { io } from "socket.io-client";

const API = "https://jnushebaserver.onrender.com";
const socket = io(API);

// ================= TRACKING STEPS CONFIG =================
const STEPS = [
  { key: "pending", label: "Requested", icon: "time-outline" },
  { key: "accepted", label: "Accepted", icon: "checkmark-circle-outline" },
  { key: "on_the_way", label: "On The Way", icon: "car-outline" },
  { key: "ongoing", label: "In Progress", icon: "construct-outline" },
  { key: "completed", label: "Completed", icon: "ribbon-outline" },
];

function BookingTracker({ booking, router }) {
  const currentStatus = booking.status;

  const getStepIndex = (status) => {
    switch (status) {
      case "pending": return 0;
      case "accepted": return 1;
      case "on_the_way": return 2;
      case "ongoing": return 3;
      case "completed": return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  const openChat = () => {
    router.push({
      pathname: `/chat/${booking._id}`,
      params: {
        bookingId: booking._id,
        providerEmail: booking.providerEmail,
        serviceTitle: booking.serviceTitle,
      },
    });
  };

  return (
    <View style={trackerStyles.container}>
      <View style={trackerStyles.headerRow}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="pulse" size={14} color="#4f46e5" style={{ marginRight: 6 }} />
          <Text style={trackerStyles.headerTitle}>Live Tracking Status</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={trackerStyles.liveBadge}>
            <View style={trackerStyles.liveDot} />
            <Text style={trackerStyles.liveText}>LIVE</Text>
          </View>

          <TouchableOpacity onPress={openChat} style={trackerStyles.chatBtn} activeOpacity={0.8}>
            <Ionicons name="chatbubbles-outline" size={13} color="#fff" style={{ marginRight: 3 }} />
            <Text style={trackerStyles.chatBtnText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={trackerStyles.trackerContainer}>
        {STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <View key={step.key} style={trackerStyles.stepWrapper}>
              {index < STEPS.length - 1 && (
                <View
                  style={[
                    trackerStyles.line,
                    index < currentIndex && trackerStyles.completedLine,
                  ]}
                />
              )}

              <View
                style={[
                  trackerStyles.circle,
                  isCompleted && trackerStyles.completedCircle,
                  isCurrent && trackerStyles.currentCircle,
                ]}
              >
                <Ionicons
                  name={isCompleted ? "checkmark" : step.icon}
                  size={isCurrent ? 14 : 12}
                  color={isCompleted || isCurrent ? "#fff" : "#94a3b8"}
                />
              </View>

              <Text
                style={[
                  trackerStyles.label,
                  isCompleted && trackerStyles.completedLabel,
                  isCurrent && trackerStyles.currentLabel,
                ]}
                numberOfLines={1}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function StudentDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [rating, setRating] = useState();
  const [comment, setComment] = useState("");

  const loadBookings = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const session = await AsyncStorage.getItem("user_session");
      if (!session) {
        setLoading(false);
        return;
      }
      const user = JSON.parse(session);

      const res = await fetch(`${API}/bookings/user/${user.email}`);
      const data = await res.json();

      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch (err) {
      console.log("Load Bookings Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBookings(true);
  }, []);

  useEffect(() => {
    bookings.forEach((b) => {
      socket.emit("join_room", b._id);
    });

    socket.on("booking_status_updated", (data) => {
      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b._id === data.bookingId ? { ...b, status: data.status } : b
        )
      );
    });

    return () => {
      socket.off("booking_status_updated");
    };
  }, [bookings]);

  const cancelBooking = async (booking) => {
    Alert.alert("Confirm Cancellation", "Are you sure you want to delete this booking?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const session = await AsyncStorage.getItem("user_session");
            const user = JSON.parse(session);

            const res = await fetch(`${API}/bookings/cancel/${booking._id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: user.email }),
            });

            const data = await res.json();

            if (data.success) {
              setBookings((prev) => prev.filter((b) => b._id !== booking._id));
            } else {
              Alert.alert("Notice", data.message || "Cancellation is not allowed.");
            }
          } catch (err) {
            console.log("Cancel Error:", err);
            Alert.alert("Error", "Something went wrong cancelling the booking.");
          }
        }
      }
    ]);
  };

  const payForBooking = async (booking) => {
    router.push({
      pathname: `/payment/${booking._id}`,
      params: {
        bookingId: booking._id,
        amount: booking.amount || booking.price || 500,
        serviceTitle: booking.serviceTitle,
      },
    });
  };

  const submitReview = async (booking) => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      const user = JSON.parse(session);

      await fetch(`${API}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking._id,
          serviceId: booking.serviceId || booking.service?._id,
          providerEmail: booking.providerEmail,
          userEmail: user.email || user.customerEmail,
          rating: Number(rating),
          comment: comment.trim(),
        }),
      });

      Alert.alert("Success", "Review submitted successfully 🎉");
      setReviewingBooking(null);
      setRating(5);
      setComment("");
      loadBookings(true); // রিফ্রেশ করে ইজরিভিউ আপডেট করে নেওয়া
    } catch (err) {
      console.log("Review Error:", err);
      Alert.alert("Error", "Failed to submit review.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 10, color: "#64748b", fontWeight: "500" }}>Loading dashboard...</Text>
      </View>
    );
  }

  const totalBookings = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSubtitle}>Track and manage your service requests</Text>
        </View>
      </View>

      {/* STATS CARDS */}
      <View style={styles.statsBox}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{totalBookings}</Text>
          <Text style={styles.statLabel}>Total Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: "#d97706" }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* MAIN LIST */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />
        }
      >
        {bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={50} color="#cbd5e1" />
            <Text style={styles.noDataTitle}>No Bookings Found</Text>
            <Text style={styles.noDataSubtitle}>You haven't requested any services yet.</Text>
          </View>
        ) : (
          bookings.map((b) => {
            const isPaid = b.paymentStatus === "paid";
            const displayAmount = b.amount || b.price || 0;

            return (
              <View key={b._id} style={styles.card}>
                {/* CARD TOP INFO */}
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.title} numberOfLines={1}>{b.serviceTitle || "Service Booking"}</Text>
                    <Text style={styles.providerText}>Provider: {b.providerEmail || "N/A"}</Text>
                  </View>
                  <View style={styles.amountBadge}>
                    <Text style={styles.amountText}>৳{displayAmount}</Text>
                  </View>
                </View>

                {/* TRACKER WITH CHAT BUTTON */}
                <BookingTracker booking={b} router={router} />

                {/* STATUS & PAYMENT INFO */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Status</Text>
                    <Text style={[styles.metaValue, { textTransform: "capitalize", color: "#0f172a" }]}>
                      {b.status}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Payment</Text>
                    <Text style={[styles.metaValue, { color: isPaid ? "#059669" : "#dc2626", textTransform: "uppercase" }]}>
                      {b.paymentStatus || "Unpaid"}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Date</Text>
                    <Text style={styles.metaValue}>
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent"}
                    </Text>
                  </View>
                </View>

                {b.refundStatus && b.refundStatus !== "none" && (
                  <View style={styles.refundBox}>
                    <Ionicons name="information-circle-outline" size={14} color="#d97706" style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 12, color: "#d97706", fontWeight: "600" }}>
                      Refund Status: <Text style={{ textTransform: "capitalize" }}>{b.refundStatus}</Text>
                    </Text>
                  </View>
                )}

                {/* ACTION BUTTONS */}
                <View style={styles.actionRow}>
                  {!isPaid && b.status !== "cancelled" && (
                    <TouchableOpacity onPress={() => payForBooking(b)} style={styles.payBtn} activeOpacity={0.8}>
                      <Ionicons name="card-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
                      <Text style={styles.btnText}>Pay Now</Text>
                    </TouchableOpacity>
                  )}

                  {b.status === "pending" && (
                    <TouchableOpacity onPress={() => cancelBooking(b)} style={styles.cancelBtn} activeOpacity={0.8}>
                      <Ionicons name="close-circle-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
                      <Text style={styles.btnText}>Cancel</Text>
                    </TouchableOpacity>
                  )}

                  {!b.isReviewed ? (
                    <TouchableOpacity
                      onPress={() => setReviewingBooking(reviewingBooking?._id === b._id ? null : b)}
                      style={styles.reviewBtn}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="star-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
                      <Text style={styles.btnText}>Review</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.alreadyReviewedBtn}>
                      <Ionicons name="checkmark-circle" size={14} color="#059669" style={{ marginRight: 4 }} />
                      <Text style={{ color: "#059669", fontWeight: "700", fontSize: 12 }}>Reviewed</Text>
                    </View>
                  )}
                </View>

                {/* REVIEW INPUT BOX */}
                {reviewingBooking?._id === b._id && (
                  <View style={styles.reviewBox}>
                    <Text style={{ marginBottom: 6, fontWeight: "700", color: "#1e293b", fontSize: 13 }}>Rate Your Experience</Text>
                    <View style={{ flexDirection: "row", marginBottom: 8 }}>
                      {[1, 2, 3, 4, 5].map((r) => (
                        <TouchableOpacity key={r} onPress={() => setRating(r)}>
                          <Text style={{ fontSize: 22, marginRight: 6 }}>{r <= rating ? "⭐" : "☆"}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TextInput
                      placeholder="Write your feedback..."
                      placeholderTextColor="#94a3b8"
                      value={comment}
                      onChangeText={setComment}
                      style={styles.input}
                    />
                    <TouchableOpacity onPress={() => submitReview(b)} style={styles.submitBtn} activeOpacity={0.8}>
                      <Text style={styles.btnText}>Submit Review</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= REDESIGNED TRACKER STYLES =================
const trackerStyles = StyleSheet.create({
  container: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#2563eb",
    marginRight: 4,
  },
  liveText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#2563eb",
  },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4f46e5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  chatBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
  },
  trackerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 4,
    position: "relative",
  },
  stepWrapper: {
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  line: {
    position: "absolute",
    top: 14,
    left: "50%",
    width: "100%",
    height: 3,
    backgroundColor: "#e2e8f0",
    zIndex: 1,
  },
  completedLine: {
    backgroundColor: "#4f46e5",
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
  },
  completedCircle: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  currentCircle: {
    backgroundColor: "#ffffff",
    borderColor: "#4f46e5",
    borderWidth: 2.5,
    transform: [{ scale: 1.1 }],
    elevation: 3,
  },
  label: {
    fontSize: 9,
    color: "#94a3b8",
    marginTop: 6,
    textAlign: "center",
    fontWeight: "500",
  },
  completedLabel: {
    color: "#334155",
    fontWeight: "600",
  },
  currentLabel: {
    color: "#4f46e5",
    fontWeight: "800",
  },
});

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", paddingHorizontal: 16, paddingTop: 10 },
  headerContainer: { marginBottom: 14 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  headerSubtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
  statsBox: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statNum: { fontSize: 20, fontWeight: "800", color: "#4f46e5" },
  statLabel: { fontSize: 12, color: "#64748b", marginTop: 2, fontWeight: "600" },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    marginBottom: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  title: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  providerText: { fontSize: 12, color: "#64748b", marginTop: 2 },
  amountBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  amountText: { fontSize: 14, fontWeight: "800", color: "#0f172a" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  metaItem: { alignItems: "center", flex: 1 },
  metaLabel: { fontSize: 10, color: "#64748b", fontWeight: "600", textTransform: "uppercase" },
  metaValue: { fontSize: 12, fontWeight: "700", color: "#334155", marginTop: 2 },
  refundBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  btnText: { color: "#ffffff", fontWeight: "700", fontSize: 12 },
  payBtn: { flex: 1, flexDirection: "row", backgroundColor: "#7c3aed", paddingVertical: 10, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cancelBtn: { flex: 1, flexDirection: "row", backgroundColor: "#dc2626", paddingVertical: 10, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  reviewBtn: { flex: 1, flexDirection: "row", backgroundColor: "#d97706", paddingVertical: 10, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  reviewBox: { marginTop: 12, backgroundColor: "#f8fafc", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    fontSize: 13,
    color: "#0f172a",
  },
  alreadyReviewedBtn: {
    flex: 1, 
    flexDirection: "row", 
    backgroundColor: "#d1fae5", 
    paddingVertical: 10, 
    borderRadius: 10, 
    alignItems: "center", 
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#a7f3d0"
  },
  submitBtn: { marginTop: 8, backgroundColor: "#059669", paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60, paddingHorizontal: 20 },
  noDataTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b", marginTop: 12 },
  noDataSubtitle: { textAlign: "center", color: "#64748b", fontSize: 13, marginTop: 4 },
});