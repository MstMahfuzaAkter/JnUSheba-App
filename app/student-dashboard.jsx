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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://junsheba.vercel.app";

export default function StudentDashboard() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  const [bookedServices, setBookedServices] = useState([]);

  useEffect(() => {
    fetchServices();
    loadBookedServices(); // 🔥 load already booked
  }, []);

  // ================= LOAD SERVICES =================
  const fetchServices = async () => {
    try {
      const res = await fetch(`${API}/services`);
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD BOOKINGS (PERSISTENT) =================
  const loadBookedServices = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      const user = JSON.parse(session);

      const res = await fetch(`${API}/bookings/user/${user.email}`);
      const data = await res.json();

      const bookedIds = data.map((b) => b.serviceId);
      setBookedServices(bookedIds);
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

      if (data.success || data.insertedId) {
        Alert.alert("Success", "Booking Successful 🎉");

        // 🔥 instantly update UI
        setBookedServices((prev) => [...prev, service._id]);
      } else {
        Alert.alert("Failed", data.message || "Booking Failed");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setBookingId(null);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 10 }}>Loading services...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>🎓 Student Dashboard</Text>

      <FlatList
        data={services}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const isBooked = bookedServices.includes(item._id);
          const isLoading = bookingId === item._id;

          return (
            <View style={styles.card}>
              {/* Title */}
              <Text style={styles.title}>{item.title}</Text>

              {/* Category */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.category}</Text>
              </View>

              {/* Description */}
              <Text style={styles.desc} numberOfLines={2}>
                {item.description}
              </Text>

              {/* Price + Location */}
              <View style={styles.row}>
                <Text style={styles.price}>৳ {item.price}</Text>
                <Text style={styles.location}>{item.location}</Text>
              </View>

              {/* BUTTON */}
              <TouchableOpacity
                onPress={() => bookService(item)}
                disabled={isBooked || isLoading}
                style={[
                  styles.button,
                  isBooked && { backgroundColor: "#16a34a" },
                  (isBooked || isLoading) && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.buttonText}>
                  {isLoading
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
    </SafeAreaView>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    paddingHorizontal: 15,
  },

  header: {
    fontSize: 24,
    fontWeight: "800",
    marginVertical: 15,
    color: "#111827",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 6,
  },

  badgeText: {
    fontSize: 12,
    color: "#0284c7",
    fontWeight: "600",
  },

  desc: {
    marginTop: 8,
    color: "#6b7280",
    fontSize: 13,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10b981",
  },

  location: {
    fontSize: 12,
    color: "#6b7280",
  },

  button: {
    marginTop: 12,
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});