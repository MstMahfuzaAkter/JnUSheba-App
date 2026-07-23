import React, { useEffect, useState, useCallback } from "react";
import {
  View as RNView,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

const API = "https://junsheba.vercel.app";
const socket = io(API);

export default function StudentBookings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [userEmail, setUserEmail] = useState("");

  useFocusEffect(
    useCallback(() => {
      fetchStudentBookings();
    }, [])
  );

  const fetchStudentBookings = async () => {
    try {
      setLoading(true);
      const session = await AsyncStorage.getItem("user_session");
      if (!session) {
        setLoading(false);
        return;
      }
      const user = JSON.parse(session);
      const email = user.email;
      setUserEmail(email);

      const res = await fetch(`${API}/bookings/user/${email}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setBookings(list);

      // Socket.io রুম জয়েন করা এবং লাইভ স্ট্যাটাস আপডেট শোনা
      list.forEach((b) => {
        socket.emit("join_room", b._id);
      });
    } catch (err) {
      console.log("Error fetching student bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Socket.io লাইভ লিসেনার সেটআপ
  useEffect(() => {
    socket.on("booking_status_updated", (data) => {
      setBookings((prev) =>
        prev.map((b) =>
          b._id === data.bookingId ? { ...b, status: data.status } : b
        )
      );
    });

    return () => {
      socket.off("booking_status_updated");
    };
  }, []);

  // বুকিং ক্যানসেল করার ফাংশন
  const cancelBooking = async (bookingId) => {
    try {
      const res = await fetch(`${API}/bookings/cancel/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", "Booking cancelled successfully");
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      } else {
        Alert.alert("Error", data.message || "Failed to cancel booking");
      }
    } catch (err) {
      console.log("Cancel Error:", err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* HEADER */}
      <RNView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <RNView style={{ width: 38 }} />
      </RNView>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {loading ? (
          <RNView style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading Your Bookings...</Text>
          </RNView>
        ) : bookings.length === 0 ? (
          <RNView style={styles.centerContainer}>
            <Ionicons name="receipt-outline" size={50} color="#cbd5e1" />
            <Text style={styles.noDataText}>You have no bookings yet.</Text>
          </RNView>
        ) : (
          bookings.map((item) => (
            <RNView key={item._id} style={styles.card}>
              {/* Top Row: Service Title & Status Badge */}
              <RNView style={styles.cardHeader}>
                <Text style={styles.serviceTitle}>{item.serviceTitle || "Service"}</Text>
                <RNView
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === "completed"
                          ? "#dcfce7"
                          : item.status === "ongoing"
                          ? "#fef3c7"
                          : item.status === "on_the_way"
                          ? "#e0e7ff"
                          : item.status === "accepted"
                          ? "#d1fae5"
                          : item.status === "rejected"
                          ? "#fee2e2"
                          : "#f1f5f9",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          item.status === "completed"
                            ? "#16a34a"
                            : item.status === "ongoing"
                            ? "#d97706"
                            : item.status === "on_the_way"
                            ? "#4f46e5"
                            : item.status === "accepted"
                            ? "#059669"
                            : item.status === "rejected"
                            ? "#dc2626"
                            : "#64748b",
                      },
                    ]}
                  >
                    {item.status ? item.status.toUpperCase().replace(/_/g, " ") : "PENDING"}
                  </Text>
                </RNView>
              </RNView>

              {/* Provider Info */}
              <RNView style={styles.infoRow}>
                <Ionicons name="person-outline" size={15} color="#64748b" />
                <Text style={styles.infoText}>Provider: {item.providerName || "N/A"}</Text>
              </RNView>
              <RNView style={styles.infoRow}>
                <Ionicons name="call-outline" size={15} color="#64748b" />
                <Text style={styles.infoText}>Phone: {item.providerPhone || "N/A"}</Text>
              </RNView>
              <RNView style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={15} color="#64748b" />
                <Text style={styles.infoText}>Date: {item.bookingDate || "N/A"} ({item.bookingTime || ""})</Text>
              </RNView>
              <RNView style={styles.infoRow}>
                <Ionicons name="cash-outline" size={15} color="#64748b" />
                <Text style={styles.infoText}>Price: ৳ {item.price || 0}</Text>
              </RNView>

              {/* Cancel Button (Only if pending) */}
              {item.status === "pending" && (
                <RNView style={styles.actionContainer}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => cancelBooking(item._id)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                  </TouchableOpacity>
                </RNView>
              )}
            </RNView>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  loadingText: {
    marginTop: 10,
    color: "#64748b",
    fontSize: 14,
  },
  noDataText: {
    marginTop: 10,
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  actionContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
  },
  cancelBtn: {
    backgroundColor: "#fee2e2",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#dc2626",
    fontWeight: "700",
    fontSize: 13,
  },
});