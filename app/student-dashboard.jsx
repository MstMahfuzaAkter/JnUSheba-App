import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { io } from "socket.io-client";

const API = "https://junsheba.vercel.app";
const socket = io(API);

// ================= TRACKING STEPS CONFIG =================
const STEPS = [
  { key: "pending", label: "Requested", icon: "time-outline" },
  { key: "accepted", label: "Accepted", icon: "checkmark-circle-outline" },
  { key: "on_the_way", label: "On The Way", icon: "car-outline" },
  { key: "ongoing", label: "In Progress", icon: "construct-outline" },
  { key: "completed", label: "Completed", icon: "ribbon-outline" },
];

function BookingTracker({ currentStatus }) {
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

  return (
    <View style={trackerStyles.container}>
      <View style={trackerStyles.headerRow}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="pulse" size={16} color="#4f46e5" style={{ marginRight: 6 }} />
          <Text style={trackerStyles.headerTitle}>Live Tracking Status</Text>
        </View>
        <View style={trackerStyles.liveBadge}>
          <View style={trackerStyles.liveDot} />
          <Text style={trackerStyles.liveText}>LIVE</Text>
        </View>
      </View>
      
      <View style={trackerStyles.trackerContainer}>
        {STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <View key={step.key} style={trackerStyles.stepWrapper}>
              {/* Connecting Line */}
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
                  size={isCurrent ? 15 : 13}
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

  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [])
  );

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

  const loadBookings = async () => {
    try {
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
    }
  };

  const cancelBooking = async (booking) => {
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
        Alert.alert("Deleted", "Booking has been deleted successfully.");
        setBookings((prev) => prev.filter((b) => b._id !== booking._id));
      } else {
        Alert.alert("Cannot Cancel", data.message || "Cancellation is not allowed.");
      }
    } catch (err) {
      console.log("Cancel Error:", err);
      Alert.alert("Error", "Something went wrong cancelling the booking.");
    }
  };

  const payForBooking = async (booking) => {
    router.push({
      pathname: `/payment/${booking._id}`,
      params: {
        bookingId: booking._id,
        amount: booking.price || 500,
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
          providerEmail: booking.providerEmail,
          userEmail: user.email,
          rating,
          comment,
        }),
      });

      Alert.alert("Thanks!", "Review submitted successfully 🎉");
      setReviewingBooking(null);
      setRating(5);
      setComment("");
    } catch (err) {
      console.log("Review Error:", err);
      Alert.alert("Error", "Failed to submit review.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 10, color: "#64748b" }}>Loading dashboard...</Text>
      </View>
    );
  }

  const totalBookings = bookings.length;
  const pending = bookings.filter((b) => b.status === "pending").length;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>🎓 My Bookings & Payments</Text>

      {/* STATS */}
      <View style={styles.statsBox}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{totalBookings}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNum}>{pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* BOOKINGS & PAYMENTS LIST */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {bookings.length === 0 ? (
          <Text style={styles.noData}>No bookings found!</Text>
        ) : (
          bookings.map((b) => (
            <View key={b._id} style={styles.card}>
              <Text style={styles.title}>{b.serviceTitle}</Text>

              {/* Redesigned Premium Live Tracking Bar */}
              <BookingTracker currentStatus={b.status} />

              <View style={styles.metaRow}>
                <Text style={styles.status}>
                  Status: <Text style={{ textTransform: "capitalize", color: "#1e293b", fontWeight: "700" }}>{b.status}</Text>
                </Text>

                <Text style={[styles.status, { color: b.paymentStatus === "paid" ? "#16a34a" : "#dc2626" }]}>
                  Payment: <Text style={{ textTransform: "capitalize", fontWeight: "700" }}>{b.paymentStatus || "unpaid"}</Text>
                </Text>
              </View>

              {b.refundStatus && b.refundStatus !== "none" && (
                <Text style={[styles.status, { color: "#d97706", marginTop: 4 }]}>
                  Refund: <Text style={{ textTransform: "capitalize" }}>{b.refundStatus}</Text>
                </Text>
              )}

              <View style={styles.actionRow}>
                {b.paymentStatus !== "paid" && b.status !== "cancelled" && (
                  <TouchableOpacity
                    onPress={() => payForBooking(b)}
                    style={styles.payBtn}
                  >
                    <Ionicons name="card-outline" size={16} color="#fff" style={{ marginRight: 5 }} />
                    <Text style={styles.btnText}>Pay Now</Text>
                  </TouchableOpacity>
                )}

                {b.status === "pending" && (
                  <TouchableOpacity
                    onPress={() => cancelBooking(b)}
                    style={styles.cancelBtn}
                  >
                    <Ionicons name="close-circle-outline" size={16} color="#fff" style={{ marginRight: 5 }} />
                    <Text style={styles.btnText}>Cancel</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => setReviewingBooking(reviewingBooking?._id === b._id ? null : b)}
                  style={styles.reviewBtn}
                >
                  <Ionicons name="star-outline" size={16} color="#fff" style={{ marginRight: 5 }} />
                  <Text style={styles.btnText}>Review</Text>
                </TouchableOpacity>
              </View>

              {reviewingBooking?._id === b._id && (
                <View style={styles.reviewBox}>
                  <Text style={{ marginBottom: 5, fontWeight: "600", color: "#1e293b" }}>Rate Service:</Text>

                  <View style={{ flexDirection: "row", marginBottom: 5 }}>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <TouchableOpacity key={r} onPress={() => setRating(r)}>
                        <Text style={{ fontSize: 24, marginRight: 5 }}>
                          {r <= rating ? "⭐" : "☆"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TextInput
                    placeholder="Write your comment here..."
                    placeholderTextColor="#94a3b8"
                    value={comment}
                    onChangeText={setComment}
                    style={styles.input}
                  />

                  <TouchableOpacity
                    onPress={() => submitReview(b)}
                    style={styles.submitBtn}
                  >
                    <Text style={styles.btnText}>Submit Review</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= REDESIGNED TRACKER STYLES =================
const trackerStyles = StyleSheet.create({
  container: {
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#93c5fd",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563eb",
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2563eb",
    letterSpacing: 0.5,
  },
  trackerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 5,
    position: "relative",
  },
  stepWrapper: {
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  line: {
    position: "absolute",
    top: 16,
    left: "50%",
    width: "100%",
    height: 4,
    backgroundColor: "#cbd5e1",
    zIndex: 1,
    borderRadius: 2,
  },
  completedLine: {
    backgroundColor: "#4f46e5",
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    borderWidth: 2,
    borderColor: "#cbd5e1",
  },
  completedCircle: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  currentCircle: {
    backgroundColor: "#ffffff",
    borderColor: "#4f46e5",
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  label: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600",
  },
  completedLabel: {
    color: "#334155",
    fontWeight: "700",
  },
  currentLabel: {
    color: "#4f46e5",
    fontWeight: "900",
  },
});

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9", padding: 15 },
  header: { fontSize: 24, fontWeight: "900", marginBottom: 12, color: "#0f172a" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
  statsBox: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    marginHorizontal: 4,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNum: { fontSize: 20, fontWeight: "900", color: "#4f46e5" },
  statLabel: { fontSize: 12, color: "#64748b", marginTop: 2, fontWeight: "600" },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  title: { fontSize: 17, fontWeight: "800", color: "#0f172a" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  status: { fontWeight: "600", fontSize: 13, color: "#475569" },
  actionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  btnText: { color: "#ffffff", fontWeight: "700", fontSize: 13 },
  payBtn: { flex: 1, flexDirection: "row", backgroundColor: "#7c3aed", padding: 10, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 4 },
  cancelBtn: { flex: 1, flexDirection: "row", backgroundColor: "#dc2626", padding: 10, borderRadius: 10, alignItems: "center", justifyContent: "center", marginHorizontal: 4 },
  reviewBtn: { flex: 1, flexDirection: "row", backgroundColor: "#d97706", padding: 10, borderRadius: 10, alignItems: "center", justifyContent: "center", marginLeft: 4 },
  reviewBox: { marginTop: 12, backgroundColor: "#f8fafc", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 6,
    backgroundColor: "#ffffff",
    fontSize: 13,
    color: "#0f172a",
  },
  submitBtn: { marginTop: 10, backgroundColor: "#059669", padding: 10, borderRadius: 8, alignItems: "center" },
  noData: { textAlign: "center", color: "#94a3b8", marginTop: 40, fontSize: 15, fontWeight: "600" },
});