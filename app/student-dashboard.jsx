import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://junsheba.vercel.app";

export default function StudentDashboard() {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  const [bookedServices, setBookedServices] = useState([]);
  const [tab, setTab] = useState("services"); // services | bookings

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    await fetchServices();
    await loadBookedServices();
    await loadMyBookings();
    setLoading(false);
  };

  // ================= SERVICES =================
  const fetchServices = async () => {
    try {
      const res = await fetch(`${API}/services`);
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= BOOKINGS =================
  const loadMyBookings = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      const user = JSON.parse(session);

      const res = await fetch(`${API}/bookings/user/${user.email}`);
      const data = await res.json();

      setBookings(data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadBookedServices = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      const user = JSON.parse(session);

      const res = await fetch(`${API}/bookings/user/${user.email}`);
      const data = await res.json();

      const ids = data.map((b) => b.serviceId);
      setBookedServices(ids);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= BOOK SERVICE =================
  const bookService = async (service) => {
    try {
      setBookingId(service._id);

      const session = await AsyncStorage.getItem("user_session");
      const user = JSON.parse(session);

      const res = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service._id,
          serviceTitle: service.title,
          userEmail: user.email,
          providerEmail: service.providerEmail,
        }),
      });

      const data = await res.json();

      if (data.insertedId) {
        Alert.alert("Success", "Booking Successful 🎉");

        setBookedServices((prev) => [...prev, service._id]);
        loadMyBookings();
      }
    } catch (err) {
      console.log(err);
    } finally {
      setBookingId(null);
    }
  };

  // ================= CANCEL BOOKING =================
  const cancelBooking = async (id) => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      const user = JSON.parse(session);

      const res = await fetch(`${API}/bookings/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await res.json();

      if (data.success) {
        Alert.alert("Cancelled", "Booking removed");
        loadMyBookings();
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  // ================= UI =================
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>🎓 Student Dashboard</Text>

      {/* ================= TABS ================= */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "services" && styles.activeTab]}
          onPress={() => setTab("services")}
        >
          <Text style={styles.tabText}>Services</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === "bookings" && styles.activeTab]}
          onPress={() => setTab("bookings")}
        >
          <Text style={styles.tabText}>My Bookings</Text>
        </TouchableOpacity>
      </View>

      {/* ================= SERVICES ================= */}
      {tab === "services" && (
        <FlatList
          data={services}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const isBooked = bookedServices.includes(item._id);
            const loadingBtn = bookingId === item._id;

            return (
              <View style={styles.card}>
                <Text style={styles.title}>{item.title}</Text>

                <Text style={styles.desc}>{item.description}</Text>

                <View style={styles.row}>
                  <Text style={styles.price}>৳ {item.price}</Text>
                  <Text>{item.location}</Text>
                </View>

                <TouchableOpacity
                  disabled={isBooked || loadingBtn}
                  onPress={() => bookService(item)}
                  style={[
                    styles.button,
                    isBooked && { backgroundColor: "#16a34a" },
                  ]}
                >
                  <Text style={styles.btnText}>
                    {loadingBtn
                      ? "Booking..."
                      : isBooked
                      ? "Booked ✔"
                      : "Book Now"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {/* ================= BOOKINGS ================= */}
      {tab === "bookings" && (
        <ScrollView>
          {bookings.map((b) => (
            <View key={b._id} style={styles.card}>
              <Text style={styles.title}>{b.serviceTitle}</Text>

              <Text style={styles.status}>
                Status: {b.status}
              </Text>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => cancelBooking(b._id)}
              >
                <Text style={{ color: "#fff" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", padding: 15 },

  header: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 10,
    color: "#111827",
  },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  tabs: {
    flexDirection: "row",
    marginBottom: 15,
  },

  tab: {
    flex: 1,
    padding: 12,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#4f46e5",
  },

  tabText: { fontWeight: "700", color: "#111" },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
  },

  title: { fontSize: 18, fontWeight: "700" },

  desc: { color: "#6b7280", marginVertical: 5 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  price: { fontWeight: "700", color: "#10b981" },

  button: {
    marginTop: 10,
    backgroundColor: "#4f46e5",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: { color: "#fff", fontWeight: "700" },

  status: {
    marginTop: 5,
    fontWeight: "600",
    color: "#374151",
  },

  cancelBtn: {
    marginTop: 10,
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});