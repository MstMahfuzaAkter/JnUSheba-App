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
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
                  size={isCurrent ? 14 : 12}
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

export default function ProviderDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [servicesCount, setServicesCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [latestBooking, setLatestBooking] = useState(null);

  const [isAvailable, setIsAvailable] = useState(true);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [upcomingJobsCount, setUpcomingJobsCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchProviderStats();
    }, [])
  );

  const fetchProviderStats = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      if (!session) {
        setLoading(false);
        return;
      }
      const user = JSON.parse(session);
      const email = user.email;

      const [servicesRes, bookingsRes] = await Promise.all([
        fetch(`${API}/services/provider/${email}`),
        fetch(`${API}/provider-bookings/${email}`),
      ]);

      const servicesData = await servicesRes.json();
      const bookingsData = await bookingsRes.json();

      const services = Array.isArray(servicesData) ? servicesData : servicesData.services || [];
      const bookings = Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || [];

      setServicesCount(services.length);
      setBookingsCount(bookings.length);

      if (bookings.length > 0) {
        setLatestBooking(bookings[0]);
      }

      const pendingReqs = bookings.filter((b) => b.status === "pending" || !b.status);
      const upcoming = bookings.filter((b) => b.status === "accepted" || b.status === "confirmed" || b.status === "on_the_way" || b.status === "ongoing");

      setNewRequestsCount(pendingReqs.length);
      setUpcomingJobsCount(upcoming.length);

      const revenue = bookings
        .filter((b) => b.paymentStatus === "paid")
        .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

      setTotalRevenue(revenue);
    } catch (err) {
      console.log("Error fetching provider stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // স্ট্যাটাস আপডেট হ্যান্ডলার (ড্যাশবোর্ডের সর্বশেষ বুকিংয়ের জন্য)
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
        setLatestBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
      } else {
        Alert.alert("Error", data.message || "Failed to update status");
      }
    } catch (err) {
      console.log("Status Update Error:", err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const toggleAvailability = (value) => {
    setIsAvailable(value);
    Alert.alert("Status Updated", value ? "You are now Online / Available" : "You are now Offline");
  };

  const formattedRevenue = totalRevenue.toLocaleString("en-BD");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* HEADER SECTION */}
        <RNView style={styles.headerContainer}>
          <RNView>
            <Text style={styles.welcomeText}>Welcome Back, Partner 🚀</Text>
            <Text style={styles.headerTitle}>Provider Dashboard</Text>
          </RNView>

          {/* AVAILABILITY SWITCH */}
          <RNView style={styles.availabilityCard}>
            <Text style={[styles.availText, { color: isAvailable ? "#10b981" : "#64748b" }]}>
              {isAvailable ? "Available" : "Offline"}
            </Text>
            <Switch
              value={isAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ false: "#cbd5e1", true: "#a7f3d0" }}
              thumbColor={isAvailable ? "#10b981" : "#f1f5f9"}
            />
          </RNView>
        </RNView>

        {/* QUICK STATS / OVERVIEW BANNER */}
        <RNView style={styles.statsContainer}>
          <RNView style={styles.statBox}>
            {loading ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <Text style={styles.statNumber} numberOfLines={1} adjustsFontSizeToFit>
                ৳ {formattedRevenue}
              </Text>
            )}
            <Text style={styles.statLabel}>Total Revenue</Text>
          </RNView>

          <RNView style={[styles.statBox, styles.statDivider]}>
            {loading ? (
              <ActivityIndicator size="small" color="#10b981" />
            ) : (
              <Text style={[styles.statNumber, { color: "#10b981" }]}>{bookingsCount}</Text>
            )}
            <Text style={styles.statLabel}>Bookings</Text>
          </RNView>

          <RNView style={[styles.statBox, styles.statDivider]}>
            {loading ? (
              <ActivityIndicator size="small" color="#d97706" />
            ) : (
              <Text style={[styles.statNumber, { color: "#d97706" }]}>{servicesCount}</Text>
            )}
            <Text style={styles.statLabel}>Services</Text>
          </RNView>
        </RNView>

        {/* ACTIVE LIVE TRACKING WIDGET */}
        {latestBooking && (
          <RNView style={styles.activeBookingSection}>
            <Text style={styles.sectionHeading}>🔥 Active Task Live Status</Text>
            <RNView style={styles.liveCard}>
              <Text style={styles.liveServiceTitle}>{latestBooking.serviceTitle}</Text>
              <BookingTracker currentStatus={latestBooking.status} />

              {/* ACTION BUTTONS FOR LATEST BOOKING */}
              <RNView style={styles.actionContainer}>
                {latestBooking.status === "pending" && (
                  <RNView style={styles.btnRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: "#16a34a" }]}
                      onPress={() => updateBookingStatus(latestBooking._id, "accepted")}
                    >
                      <Text style={styles.btnText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: "#dc2626" }]}
                      onPress={() => updateBookingStatus(latestBooking._id, "rejected")}
                    >
                      <Text style={styles.btnText}>Reject</Text>
                    </TouchableOpacity>
                  </RNView>
                )}

                {latestBooking.status === "accepted" && (
                  <TouchableOpacity
                    style={[styles.fullActionBtn, { backgroundColor: "#4f46e5" }]}
                    onPress={() => updateBookingStatus(latestBooking._id, "on_the_way")}
                  >
                    <Text style={styles.btnText}>🚗 On The Way</Text>
                  </TouchableOpacity>
                )}

                {latestBooking.status === "on_the_way" && (
                  <TouchableOpacity
                    style={[styles.fullActionBtn, { backgroundColor: "#d97706" }]}
                    onPress={() => updateBookingStatus(latestBooking._id, "ongoing")}
                  >
                    <Text style={styles.btnText}>⚙️ Start Work (In Progress)</Text>
                  </TouchableOpacity>
                )}

                {latestBooking.status === "ongoing" && (
                  <TouchableOpacity
                    style={[styles.fullActionBtn, { backgroundColor: "#16a34a" }]}
                    onPress={() => updateBookingStatus(latestBooking._id, "completed")}
                  >
                    <Text style={styles.btnText}>✅ Mark as Completed</Text>
                  </TouchableOpacity>
                )}

                {latestBooking.status === "completed" && (
                  <Text style={styles.completedInfoText}>🎉 Job Successfully Completed</Text>
                )}
              </RNView>

              <TouchableOpacity
                onPress={() => router.push("/provider-bookings")}
                style={styles.manageJobBtn}
              >
                <Text style={styles.manageJobBtnText}>Manage All Bookings</Text>
              </TouchableOpacity>
            </RNView>
          </RNView>
        )}

        {/* MENU ACTIONS */}
        <RNView style={styles.menuList}>
          {/* NEW REQUESTS */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/provider-bookings")}
            style={[styles.menuCard, { borderColor: "#eff6ff" }]}
          >
            <RNView style={[styles.iconWrapper, { backgroundColor: "#eff6ff" }]}>
              <Ionicons name="notifications-outline" size={24} color="#2563eb" />
            </RNView>
            <RNView style={styles.cardContent}>
              <Text style={styles.cardTitle}>New Requests</Text>
              <Text style={styles.cardDesc}>Check incoming client requests</Text>
            </RNView>
            {newRequestsCount > 0 && (
              <RNView style={styles.badge}>
                <Text style={styles.badgeText}>{newRequestsCount}</Text>
              </RNView>
            )}
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          {/* UPCOMING JOBS */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/provider-bookings")}
            style={[styles.menuCard, { borderColor: "#ecfdf5" }]}
          >
            <RNView style={[styles.iconWrapper, { backgroundColor: "#ecfdf5" }]}>
              <Ionicons name="briefcase-outline" size={24} color="#10b981" />
            </RNView>
            <RNView style={styles.cardContent}>
              <Text style={styles.cardTitle}>Upcoming Jobs</Text>
              <Text style={styles.cardDesc}>View your scheduled tasks</Text>
            </RNView>
            {upcomingJobsCount > 0 && (
              <RNView style={[styles.badge, { backgroundColor: "#10b981" }]}>
                <Text style={styles.badgeText}>{upcomingJobsCount}</Text>
              </RNView>
            )}
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          {/* EARNINGS */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/provider-bookings")}
            style={[styles.menuCard, { borderColor: "#fffbeb" }]}
          >
            <RNView style={[styles.iconWrapper, { backgroundColor: "#fffbeb" }]}>
              <Ionicons name="wallet-outline" size={24} color="#d97706" />
            </RNView>
            <RNView style={styles.cardContent}>
              <Text style={styles.cardTitle}>Earnings & Payments</Text>
              <Text style={styles.cardDesc}>Track revenue and paid histories</Text>
            </RNView>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          {/* MY SERVICES */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/my-services")}
            style={[styles.menuCard, { borderColor: "#f3e8ff" }]}
          >
            <RNView style={[styles.iconWrapper, { backgroundColor: "#f3e8ff" }]}>
              <Ionicons name="layers-outline" size={24} color="#9333ea" />
            </RNView>
            <RNView style={styles.cardContent}>
              <Text style={styles.cardTitle}>My Services</Text>
              <Text style={styles.cardDesc}>Manage and add your service listings</Text>
            </RNView>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </RNView>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= TRACKER STYLES =================
const trackerStyles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
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
    color: "#334155",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#2563eb",
    marginRight: 4,
  },
  liveText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#2563eb",
    letterSpacing: 0.5,
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
    top: 12,
    left: "50%",
    width: "100%",
    height: 2,
    backgroundColor: "#e2e8f0",
    zIndex: 1,
  },
  completedLine: {
    backgroundColor: "#2563eb",
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  completedCircle: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  currentCircle: {
    backgroundColor: "#ffffff",
    borderColor: "#2563eb",
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  label: {
    fontSize: 9,
    color: "#94a3b8",
    marginTop: 5,
    textAlign: "center",
    fontWeight: "600",
  },
  completedLabel: {
    color: "#334155",
    fontWeight: "600",
  },
  currentLabel: {
    color: "#2563eb",
    fontWeight: "800",
  },
});

// ================= MAIN STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerContainer: {
    marginTop: 25,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 2,
  },
  availabilityCard: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  availText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: "#e2e8f0",
  },
  statNumber: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2563eb",
    textAlign: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 3,
    fontWeight: "600",
  },
  activeBookingSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  liveCard: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  liveServiceTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 6,
  },
  actionContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  fullActionBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  completedInfoText: {
    textAlign: "center",
    color: "#16a34a",
    fontWeight: "700",
    fontSize: 13,
    paddingVertical: 5,
  },
  manageJobBtn: {
    marginTop: 12,
    backgroundColor: "#f1f5f9",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  manageJobBtnText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 13,
  },
  menuList: {
    gap: 14,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardDesc: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 3,
    fontWeight: "500",
  },
  badge: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
});