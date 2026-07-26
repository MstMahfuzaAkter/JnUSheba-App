import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  View as RNView,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { io } from "socket.io-client";

const API = "https://jnushebaserver.onrender.com";
const socket = io(API);

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
    <RNView style={trackerStyles.container}>
      <RNView style={trackerStyles.headerRow}>
        <Text style={trackerStyles.headerTitle}>Live Tracking Status</Text>
        <RNView style={trackerStyles.liveBadge}>
          <RNView style={trackerStyles.liveDot} />
          <Text style={trackerStyles.liveText}>LIVE</Text>
        </RNView>
      </RNView>

      <RNView style={trackerStyles.trackerContainer}>
        {STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <RNView key={step.key} style={trackerStyles.stepWrapper}>
              {index < STEPS.length - 1 && (
                <RNView
                  style={[
                    trackerStyles.line,
                    index < currentIndex && trackerStyles.completedLine,
                  ]}
                />
              )}

              <RNView
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
              </RNView>

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
            </RNView>
          );
        })}
      </RNView>
    </RNView>
  );
}

export default function ManageBookings() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); 

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const session = await AsyncStorage.getItem("user_session");
      if (!session) {
        setLoading(false);
        return;
      }
      const user = JSON.parse(session);
      const email = user.email;

      const res = await fetch(`${API}/provider-bookings/${email}`);
      const data = await res.json();
      const fetchedBookings = Array.isArray(data) ? data : data.bookings || [];
      setBookings(fetchedBookings);
    } catch (err) {
      console.log("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`${API}/bookings/status/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", `Status updated to ${newStatus.replace(/_/g, " ")}`);
        fetchBookings();
      } else {
        Alert.alert("Error", data.message || "Failed to update status");
      }
    } catch (err) {
      console.log("Status Update Error:", err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const status = b.status || "pending";
    if (activeTab === "all") return true;
    if (activeTab === "pending") return status === "pending";
    if (activeTab === "upcoming") return ["accepted", "confirmed", "on_the_way", "ongoing"].includes(status);
    if (activeTab === "completed") return status === "completed";
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      {/* TABS FILTER */}
      <RNView style={styles.tabContainer}>
        {["all","upcoming", "pending", "completed"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </RNView>

      {loading ? (
        <RNView style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </RNView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {filteredBookings.length === 0 ? (
            <RNView style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={40} color="#cbd5e1" />
              <Text style={styles.emptyText}>No bookings found in this category.</Text>
            </RNView>
          ) : (
            filteredBookings.map((item) => (
              <RNView key={item._id} style={styles.bookingCard}>
                <RNView style={styles.cardTopRow}>
                  <Text style={styles.serviceTitle}>{item.serviceTitle}</Text>
                  <Text style={styles.priceText}>৳ {item.price || 0}</Text>
                </RNView>

                <RNView style={styles.clientInfoRow}>
                  <RNView style={styles.clientTag}>
                    <Ionicons name="person" size={11} color="#64748b" />
                    <Text style={styles.clientNameText}>{item.customerName || "Customer"}</Text>
                  </RNView>
                  <Text style={styles.dateText}>
                    {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "Recent"}
                  </Text>
                </RNView>

                {/* CHAT WITH CLIENT BUTTON */}
                <TouchableOpacity
                  style={styles.chatIconButton}
                  onPress={() =>
                    router.push({
                      pathname: `/chat/${item._id}`,
                      params: { receiver: item.customerEmail },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubbles-outline" size={16} color="#4f46e5" />
                  <Text style={styles.chatButtonText}>Chat with Client</Text>
                </TouchableOpacity>

                {/* TRACKER */}
                <BookingTracker currentStatus={item.status} />

                {/* ACTIONS */}
                <RNView style={styles.actionContainer}>
                  {item.status === "pending" && (
                    <RNView style={styles.btnRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: "#16a34a" }]}
                        onPress={() => updateBookingStatus(item._id, "accepted")}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="checkmark-outline" size={16} color="#fff" />
                        <Text style={styles.btnText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: "#ef4444" }]}
                        onPress={() => updateBookingStatus(item._id, "rejected")}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="close-outline" size={16} color="#fff" />
                        <Text style={styles.btnText}>Decline</Text>
                      </TouchableOpacity>
                    </RNView>
                  )}

                  {item.status === "accepted" && (
                    <TouchableOpacity
                      style={[styles.fullActionBtn, { backgroundColor: "#4f46e5" }]}
                      onPress={() => updateBookingStatus(item._id, "on_the_way")}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="car-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.btnText}>On The Way to Location</Text>
                    </TouchableOpacity>
                  )}

                  {item.status === "on_the_way" && (
                    <TouchableOpacity
                      style={[styles.fullActionBtn, { backgroundColor: "#d97706" }]}
                      onPress={() => updateBookingStatus(item._id, "ongoing")}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="construct-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.btnText}>Start Work (In Progress)</Text>
                    </TouchableOpacity>
                  )}

                  {item.status === "ongoing" && (
                    <TouchableOpacity
                      style={[styles.fullActionBtn, { backgroundColor: "#16a34a" }]}
                      onPress={() => updateBookingStatus(item._id, "completed")}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark-done-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.btnText}>Mark as Completed</Text>
                    </TouchableOpacity>
                  )}

                  {item.status === "completed" && (
                    <RNView style={styles.completedBadgeBox}>
                      <Ionicons name="ribbon" size={18} color="#16a34a" />
                      <Text style={styles.completedInfoText}>Job Successfully Completed</Text>
                    </RNView>
                  )}
                </RNView>
              </RNView>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const trackerStyles = StyleSheet.create({
  container: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 14,
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
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4f46e5",
    marginRight: 5,
  },
  liveText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#4f46e5",
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
    top: 11,
    left: "50%",
    width: "100%",
    height: 2,
    backgroundColor: "#cbd5e1",
    zIndex: 1,
  },
  completedLine: {
    backgroundColor: "#4f46e5",
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
  },
  label: {
    fontSize: 9,
    color: "#94a3b8",
    marginTop: 6,
    textAlign: "center",
    fontWeight: "600",
  },
  completedLabel: {
    color: "#334155",
    fontWeight: "700",
  },
  currentLabel: {
    color: "#4f46e5",
    fontWeight: "800",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  tabContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#ffffff",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
  },
  activeTabButton: {
    backgroundColor: "#4f46e5",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  activeTabText: {
    color: "#ffffff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 35,
  },
  emptyCard: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginTop: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  bookingCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#4c1d95",
    flex: 1,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#16a34a",
  },
  clientInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  clientTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  clientNameText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  dateText: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
  },
  chatIconButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
    marginBottom: 10,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  chatButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4f46e5",
  },
  actionContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  fullActionBtn: {
    width: "100%",
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  completedBadgeBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  completedInfoText: {
    textAlign: "center",
    color: "#16a34a",
    fontWeight: "700",
    fontSize: 13,
  },
});