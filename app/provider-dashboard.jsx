import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    View as RNView,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
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
  const [providerName, setProviderName] = useState("Partner");
  const [providerEmail, setProviderEmail] = useState(null);
  const [servicesCount, setServicesCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [completedJobsCount, setCompletedJobsCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  // FIX (dynamic): was hardcoded to 4.9 and never touched again after
  // the first render. Now starts as null ("New" until we know better)
  // and gets set from the provider's own services' real rating fields.
  const [providerRating, setProviderRating] = useState(null);
  const [latestBooking, setLatestBooking] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // FIX (dynamic): was hardcoded to true on every load regardless of
  // what the provider actually last set. Initialized from real service
  // data below once it arrives.
  const [isAvailable, setIsAvailable] = useState(true);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [upcomingJobsCount, setUpcomingJobsCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchProviderStats();
    }, [])
  );

  useEffect(() => {
    socket.on("newBooking", () => {
      fetchProviderStats();
    });

    return () => {
      socket.off("newBooking");
    };
  }, []);

  const fetchProviderStats = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      if (!session) {
        setLoading(false);
        return;
      }
      const user = JSON.parse(session);
      const email = user.email;
      if (user?.name) setProviderName(user.name);
      setProviderEmail(email);

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

      // FIX (dynamic): derive the real average rating from this
      // provider's own services instead of showing a fixed 4.9 forever.
      const ratedServices = services.filter((s) => (s.rating || 0) > 0);
      const avgRating = ratedServices.length
        ? ratedServices.reduce((sum, s) => sum + s.rating, 0) / ratedServices.length
        : null;
      setProviderRating(avgRating);

      // FIX (dynamic): reflect the provider's actual saved availability
      // (each service document already carries this field) instead of
      // always defaulting the switch to "Online" on every app open.
      if (services.length > 0) {
        const anyOffline = services.some((s) => s.availability === "offline");
        setIsAvailable(!anyOffline);
      }

      const pendingReqs = bookings.filter((b) => b.status === "pending" || !b.status);
      const upcoming = bookings.filter((b) => b.status === "accepted" || b.status === "confirmed" || b.status === "on_the_way" || b.status === "ongoing");
      const completed = bookings.filter((b) => b.status === "completed");

      setNewRequestsCount(pendingReqs.length);
      setUpcomingJobsCount(upcoming.length);
      setCompletedJobsCount(completed.length);

      // Total Revenue Calculation
      const paidBookings = bookings.filter((b) => b.paymentStatus === "paid" || b.status === "completed");
      const revenue = paidBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
      setTotalRevenue(revenue);

      // FIX (dynamic): the backend saves the customer's name as
      // `customerName`, not `userName` — this always fell back to
      // "Customer" before. Use the field that actually exists.
      const txHistory = paidBookings.slice(0, 5).map((b) => ({
        id: b._id || Math.random().toString(),
        title: b.serviceTitle || "Service Payment",
        client: b.customerName || "Customer",
        amount: Number(b.price) || 0,
        date: b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : "Recent",
        status: "Success",
      }));
      setTransactions(txHistory);

      // FIX (dynamic): "today's profit" used to just be the first two
      // completed bookings regardless of date, with a hardcoded ৳450
      // fallback when there was nothing to show. Now it's the real sum
      // of bookings actually completed today — including honestly ৳0.
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const completedToday = completed.filter((b) => {
        if (!b.updatedAt) return false;
        return new Date(b.updatedAt) >= startOfToday;
      });
      const todayRev = completedToday.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
      setTodayRevenue(todayRev);

    } catch (err) {
      console.log("Error fetching provider stats:", err);
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
        setLatestBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
        fetchProviderStats();
      } else {
        Alert.alert("Error", data.message || "Failed to update status");
      }
    } catch (err) {
      console.log("Status Update Error:", err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  // FIX (dynamic): this only ever flipped local state and popped an
  // alert — nothing was ever saved, so re-opening the app (or a
  // customer browsing services) never reflected the real switch
  // position. The backend already has a dedicated endpoint for this
  // (/provider/availability/:email), just call it.
  const toggleAvailability = async (value) => {
    const previous = isAvailable;
    setIsAvailable(value);

    if (!providerEmail) return;

    try {
      const res = await fetch(`${API}/provider/availability/${providerEmail}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: value ? "available" : "offline" }),
      });

      if (!res.ok) throw new Error("Failed to update availability");

      Alert.alert("Status Updated", value ? "You are now Online & Receiving Requests" : "You are now Offline");
    } catch (err) {
      console.log("Availability update error:", err);
      setIsAvailable(previous); // revert the switch since the save failed
      Alert.alert("Error", "Couldn't update your availability. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* HEADER SECTION */}
        <RNView style={styles.headerContainer}>
          <RNView style={{ flex: 1 }}>
            <RNView style={styles.headerTopRow}>
              <RNView style={styles.partnerBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#2563eb" />
                <Text style={styles.partnerBadgeText}>Verified Partner</Text>
              </RNView>
              <RNView style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#f59e0b" />
                <Text style={styles.ratingText}>
                  {providerRating != null ? providerRating.toFixed(1) : "New"}
                </Text>
              </RNView>
            </RNView>
            <Text style={styles.welcomeText}>Hello, {providerName} 👋</Text>
            <Text style={styles.headerTitle}>Provider Control Panel</Text>
          </RNView>

          {/* AVAILABILITY SWITCH */}
          <RNView style={styles.availabilityCard}>
            <RNView style={[styles.statusDot, { backgroundColor: isAvailable ? "#10b981" : "#94a3b8" }]} />
            <Text style={[styles.availText, { color: isAvailable ? "#10b981" : "#64748b" }]}>
              {isAvailable ? "Online" : "Offline"}
            </Text>
            <Switch
              value={isAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ false: "#cbd5e1", true: "#a7f3d0" }}
              thumbColor={isAvailable ? "#10b981" : "#f1f5f9"}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </RNView>
        </RNView>

        {/* ADVANCED REVENUE BANNER */}
        <RNView style={styles.revenueHeroCard}>
          <RNView style={styles.revenueHeroContent}>
            <Text style={styles.heroRevenueTitle}>Total Earned Balance</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.heroRevenueAmount}>৳ {totalRevenue.toLocaleString("en-BD")}</Text>
            )}
            <RNView style={styles.todayEarnRow}>
              <Ionicons name="trending-up" size={14} color="#a7f3d0" />
              <Text style={styles.todayEarnText}>Today's Profit: ৳ {todayRevenue.toLocaleString("en-BD")}</Text>
            </RNView>
          </RNView>
        </RNView>

        {/* QUICK STATS */}
        <RNView style={styles.statsContainer}>
          <RNView style={styles.statBox}>
            {loading ? <ActivityIndicator size="small" color="#10b981" /> : <Text style={[styles.statNumber, { color: "#10b981" }]}>{completedJobsCount}</Text>}
            <Text style={styles.statLabel}>Completed</Text>
          </RNView>
          <RNView style={[styles.statBox, styles.statDivider]}>
            {loading ? <ActivityIndicator size="small" color="#2563eb" /> : <Text style={[styles.statNumber, { color: "#2563eb" }]}>{bookingsCount}</Text>}
            <Text style={styles.statLabel}>Total Jobs</Text>
          </RNView>
          <RNView style={[styles.statBox, styles.statDivider]}>
            {loading ? <ActivityIndicator size="small" color="#d97706" /> : <Text style={[styles.statNumber, { color: "#d97706" }]}>{servicesCount}</Text>}
            <Text style={styles.statLabel}>Services</Text>
          </RNView>
        </RNView>

        {/* ACTIVE LIVE TRACKING WIDGET */}
        {latestBooking && (
          <RNView style={styles.activeBookingSection}>
            <RNView style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>🔥 Active Task Live Status</Text>
              <TouchableOpacity onPress={() => router.push("/provider-bookings")}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </RNView>
            <RNView style={styles.liveCard}>
              <RNView style={styles.liveCardTop}>
                <Text style={styles.liveServiceTitle}>{latestBooking.serviceTitle}</Text>
                <Text style={styles.clientNameText}>Client: {latestBooking.customerName || "Customer"}</Text>
              </RNView>
              
              <BookingTracker currentStatus={latestBooking.status} />

              <RNView style={styles.actionContainer}>
                {latestBooking.status === "pending" && (
                  <RNView style={styles.btnRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: "#16a34a" }]}
                      onPress={() => updateBookingStatus(latestBooking._id, "accepted")}
                    >
                      <Ionicons name="checkmark-outline" size={16} color="#fff" />
                      <Text style={styles.btnText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: "#dc2626" }]}
                      onPress={() => updateBookingStatus(latestBooking._id, "rejected")}
                    >
                      <Ionicons name="close-outline" size={16} color="#fff" />
                      <Text style={styles.btnText}>Reject</Text>
                    </TouchableOpacity>
                  </RNView>
                )}

                {latestBooking.status === "accepted" && (
                  <TouchableOpacity
                    style={[styles.fullActionBtn, { backgroundColor: "#4f46e5" }]}
                    onPress={() => updateBookingStatus(latestBooking._id, "on_the_way")}
                  >
                    <Text style={styles.btnText}>🚗 On The Way to Location</Text>
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
                  <RNView style={styles.completedBadgeBox}>
                    <Ionicons name="ribbon" size={18} color="#16a34a" />
                    <Text style={styles.completedInfoText}>Job Successfully Completed</Text>
                  </RNView>
                )}
              </RNView>
            </RNView>
          </RNView>
        )}

        {/* TRANSACTION HISTORY SECTION */}
        <RNView style={styles.txSection}>
          <RNView style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>💳 Recent Transactions</Text>
            <Text style={styles.txCountLabel}>{transactions.length} items</Text>
          </RNView>

          {transactions.length === 0 ? (
            <RNView style={styles.emptyTxCard}>
              <Ionicons name="receipt-outline" size={24} color="#94a3b8" />
              <Text style={styles.emptyTxText}>No transactions recorded yet.</Text>
            </RNView>
          ) : (
            <RNView style={styles.txCardList}>
              {transactions.map((item) => (
                <RNView key={item.id} style={styles.txItemCard}>
                  <RNView style={styles.txIconBox}>
                    <Ionicons name="arrow-down-circle" size={20} color="#16a34a" />
                  </RNView>
                  <RNView style={styles.txDetails}>
                    <Text style={styles.txTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.txSubText}>Client: {item.client} • {item.date}</Text>
                  </RNView>
                  <Text style={styles.txAmount}>+ ৳{item.amount}</Text>
                </RNView>
              ))}
            </RNView>
          )}
        </RNView>

        {/* MENU ACTIONS */}
        <RNView style={styles.menuList}>
          <Text style={styles.menuGroupTitle}>Quick Management</Text>
          
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/provider-bookings")}
            style={[styles.menuCard, { borderColor: "#eff6ff" }]}
          >
            <RNView style={[styles.iconWrapper, { backgroundColor: "#eff6ff" }]}>
              <Ionicons name="notifications-outline" size={22} color="#2563eb" />
            </RNView>
            <RNView style={styles.cardContent}>
              <Text style={styles.cardTitle}>New Requests</Text>
              <Text style={styles.cardDesc}>Check incoming client orders</Text>
            </RNView>
            {newRequestsCount > 0 && (
              <RNView style={styles.badge}>
                <Text style={styles.badgeText}>{newRequestsCount}</Text>
              </RNView>
            )}
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/provider-bookings")}
            style={[styles.menuCard, { borderColor: "#ecfdf5" }]}
          >
            <RNView style={[styles.iconWrapper, { backgroundColor: "#ecfdf5" }]}>
              <Ionicons name="briefcase-outline" size={22} color="#10b981" />
            </RNView>
            <RNView style={styles.cardContent}>
              <Text style={styles.cardTitle}>Upcoming Jobs</Text>
              <Text style={styles.cardDesc}>View your scheduled task list</Text>
            </RNView>
            {upcomingJobsCount > 0 && (
              <RNView style={[styles.badge, { backgroundColor: "#10b981" }]}>
                <Text style={styles.badgeText}>{upcomingJobsCount}</Text>
              </RNView>
            )}
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/my-services")}
            style={[styles.menuCard, { borderColor: "#f3e8ff" }]}
          >
            <RNView style={[styles.iconWrapper, { backgroundColor: "#f3e8ff" }]}>
              <Ionicons name="layers-outline" size={22} color="#9333ea" />
            </RNView>
            <RNView style={styles.cardContent}>
              <Text style={styles.cardTitle}>My Service Listings</Text>
              <Text style={styles.cardDesc}>Manage and add your services</Text>
            </RNView>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </RNView>
      </ScrollView>
    </SafeAreaView>
  );
}

const trackerStyles = StyleSheet.create({
  container: {
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
    backgroundColor: "#2563eb",
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    borderWidth: 2,
    borderColor: "#cbd5e1",
  },
  completedCircle: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  currentCircle: {
    backgroundColor: "#ffffff",
    borderColor: "#2563eb",
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
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
    marginTop: 20,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  partnerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#dbeafe",
    gap: 4,
  },
  partnerBadgeText: {
    fontSize: 10,
    color: "#2563eb",
    fontWeight: "700",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  ratingText: {
    fontSize: 10,
    color: "#92400e",
    fontWeight: "800",
  },
  welcomeText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 1,
  },
  availabilityCard: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  availText: {
    fontSize: 11,
    fontWeight: "700",
  },
  revenueHeroCard: {
    backgroundColor: "#5B21B6",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  revenueHeroContent: {
    flex: 1,
  },
  heroRevenueTitle: {
    fontSize: 12,
    color: "#bfdbfe",
    fontWeight: "600",
  },
  heroRevenueAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    marginVertical: 2,
  },
  todayEarnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  todayEarnText: {
    fontSize: 11,
    color: "#a7f3d0",
    fontWeight: "700",
  },
  withdrawBtn: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  withdrawBtnText: {
    color: "#2563eb",
    fontWeight: "800",
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
    borderLeftColor: "#f1f5f9",
  },
  statNumber: {
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 3,
    fontWeight: "600",
  },
  activeBookingSection: {
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563eb",
  },
  liveCard: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  liveCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  liveServiceTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#5B21B6",
    flex: 1,
  },
  clientNameText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
  },
  actionContainer: {
    marginTop: 8,
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
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
  completedBadgeBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  completedInfoText: {
    textAlign: "center",
    color: "#16a34a",
    fontWeight: "700",
    fontSize: 13,
  },
  txSection: {
    marginBottom: 22,
  },
  txCountLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
  },
  emptyTxCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyTxText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 6,
    fontWeight: "600",
  },
  txCardList: {
    gap: 8,
  },
  txItemCard: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  txIconBox: {
    marginRight: 10,
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  txSubText: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "500",
  },
  txAmount: {
    fontSize: 13,
    fontWeight: "800",
    color: "#16a34a",
  },
  menuList: {
    gap: 12,
  },
  menuGroupTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardDesc: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "500",
  },
  badge: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
});