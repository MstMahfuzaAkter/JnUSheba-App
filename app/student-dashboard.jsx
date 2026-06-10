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
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://junsheba.vercel.app";

export default function StudentDashboard() {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookedServices, setBookedServices] = useState([]);
  const [tab, setTab] = useState("services");

  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    await fetchServices();
    await loadBookings();
    setLoading(false);
  };

  const fetchServices = async () => {
    const res = await fetch(`${API}/services`);
    const data = await res.json();
    setServices(data);
  };

  const loadBookings = async () => {
    const session = await AsyncStorage.getItem("user_session");
    const user = JSON.parse(session);

    const res = await fetch(`${API}/bookings/user/${user.email}`);
    const data = await res.json();

    setBookings(data);
    setBookedServices(data.map((b) => String(b.serviceId)));
  };

  const bookService = async (service) => {
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

      setBookedServices((p) => [...p, String(service._id)]);
      loadBookings();
    }
  };

  const cancelBooking = async (id) => {
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
      loadBookings();
    }
  };

  const submitReview = async (booking) => {
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

    Alert.alert("Thanks!", "Review submitted 🎉");
    setReviewingBooking(null);
    setRating(5);
    setComment("");
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ marginTop: 10 }}>Loading dashboard...</Text>
      </View>
    );
  }

  const totalBookings = bookings.length;
  const pending = bookings.filter((b) => b.status === "pending").length;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>🎓 Student Dashboard</Text>

      {/* STATS */}
      <View style={styles.statsBox}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{services.length}</Text>
          <Text>Services</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNum}>{totalBookings}</Text>
          <Text>Bookings</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNum}>{pending}</Text>
          <Text>Pending</Text>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setTab("services")}
          style={[styles.tab, tab === "services" && styles.activeTab]}
        >
          <Text style={styles.tabText}>Services</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("bookings")}
          style={[styles.tab, tab === "bookings" && styles.activeTab]}
        >
          <Text style={styles.tabText}>Bookings</Text>
        </TouchableOpacity>
      </View>

      {/* SERVICES */}
      {tab === "services" && (
        <FlatList
          data={services}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => {
            const isBooked = bookedServices.includes(String(item._id));

            return (
              <View style={styles.card}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.desc}>{item.description}</Text>

                <View style={styles.row}>
                  <Text style={styles.price}>৳ {item.price}</Text>
                  <Text style={styles.location}>📍 {item.location}</Text>
                </View>

                <TouchableOpacity
                  disabled={isBooked}
                  onPress={() => bookService(item)}
                  style={[
                    styles.button,
                    isBooked && styles.bookedBtn,
                  ]}
                >
                  <Text style={styles.btnText}>
                    {isBooked ? "Booked ✔" : "Book Now"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {/* BOOKINGS */}
      {tab === "bookings" && (
        <ScrollView>
          {bookings.map((b) => (
            <View key={b._id} style={styles.card}>
              <Text style={styles.title}>{b.serviceTitle}</Text>

              <Text style={styles.status}>
                Status: {b.status}
              </Text>

              <TouchableOpacity
                onPress={() => cancelBooking(b._id)}
                style={styles.cancelBtn}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setReviewingBooking(b)}
                style={styles.reviewBtn}
              >
                <Text style={styles.btnText}>⭐ Review</Text>
              </TouchableOpacity>

              {reviewingBooking?._id === b._id && (
                <View style={styles.reviewBox}>
                  <Text style={{ marginBottom: 5 }}>Rating:</Text>

                  <View style={{ flexDirection: "row" }}>
                    {[1,2,3,4,5].map((r) => (
                      <TouchableOpacity key={r} onPress={() => setRating(r)}>
                        <Text style={{ fontSize: 22 }}>
                          {r <= rating ? "⭐" : "☆"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TextInput
                    placeholder="Write comment..."
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
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ================= STYLES (MODERN UI) =================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7ff", padding: 15 },

  header: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 10,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // STATS
  statsBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 5,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  statNum: {
    fontSize: 20,
    fontWeight: "900",
    color: "#4f46e5",
  },

  // TABS
  tabs: {
    flexDirection: "row",
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    padding: 12,
    backgroundColor: "#e5e7eb",
    margin: 5,
    borderRadius: 10,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#4f46e5",
  },
  tabText: {
    color: "#000",
    fontWeight: "700",
  },

  // CARD
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 15,
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: "800" },
  desc: { color: "#6b7280", marginVertical: 5 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  price: { fontWeight: "700", color: "#10b981" },
  location: { color: "#6b7280" },

  button: {
    marginTop: 10,
    backgroundColor: "#4f46e5",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  bookedBtn: {
    backgroundColor: "#16a34a",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
  },

  cancelBtn: {
    marginTop: 10,
    backgroundColor: "#ef4444",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  reviewBtn: {
    marginTop: 8,
    backgroundColor: "#f59e0b",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  reviewBox: {
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },

  submitBtn: {
    marginTop: 10,
    backgroundColor: "green",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
});