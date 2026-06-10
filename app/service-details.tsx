import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  StatusBar,
  Image,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://junsheba.vercel.app";

export default function ServiceDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [isBooked, setIsBooked] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchService();
    checkBookedStatus();
  }, [id]);

  useEffect(() => {
    if (service?.providerEmail) {
      loadReviews(service.providerEmail);
    }
  }, [service]);

  // ================= FETCH SERVICE =================
  const fetchService = async () => {
    try {
      const res = await fetch(`${API}/services/${id}`);
      const data = await res.json();
      setService(data);
    } catch (err) {
      Alert.alert("Error", "Failed to load service");
    } finally {
      setLoading(false);
    }
  };

  // ================= REVIEWS =================
  const loadReviews = async (providerEmail) => {
    try {
      setLoadingReviews(true);

      const res = await fetch(`${API}/reviews/${providerEmail}`);
      const data = await res.json();

      setReviews(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // ================= BOOKED CHECK =================
  const checkBookedStatus = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      if (!session) return;

      const user = JSON.parse(session);

      const res = await fetch(`${API}/bookings/user/${user.email}`);
      const data = await res.json();

      const found = data.find((b) => b.serviceId === id);

      if (found) setIsBooked(true);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= BOOK SERVICE =================
  const handleDirectBook = async () => {
    try {
      setBookingLoading(true);

      const session = await AsyncStorage.getItem("user_session");
      if (!session) {
        Alert.alert("Error", "Please login first");
        return;
      }

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

      if (data.insertedId || data.success) {
        Alert.alert("Success 🎉", "Booking Successful!");
        setIsBooked(true);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setBookingLoading(false);
    }
  };

  // ================= CALL =================
  const handleCall = async () => {
    if (!service?.phone) return Alert.alert("No phone number");

    const url = `tel:${service.phone}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) Linking.openURL(url);
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.center}>
        <Text>Service not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HERO */}
      <View style={styles.hero}>
        {service.image ? (
          <Image source={{ uri: service.image }} style={styles.image} />
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="image-outline" size={50} color="#94a3b8" />
          </View>
        )}

        <View style={styles.overlay} />
        <View style={styles.heroText}>
          <Text style={styles.category}>{service.category}</Text>
          <Text style={styles.title}>{service.title}</Text>
        </View>
      </View>

      {/* INFO */}
      <View style={styles.card}>
        <Text style={styles.price}>৳ {service.price}</Text>
        <Text>{service.location}</Text>
        <Text>{service.providerEmail}</Text>
      </View>

      {/* DESCRIPTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text>{service.description}</Text>
      </View>

      {/* BOOK */}
      <View style={styles.card}>
        <TouchableOpacity
          onPress={handleDirectBook}
          disabled={isBooked || bookingLoading}
          style={[
            styles.bookBtn,
            isBooked && { backgroundColor: "#10b981" },
          ]}
        >
          {bookingLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {isBooked ? "Booked ✔" : "Book Now"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ACTIONS */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
          <Text style={{ color: "#fff" }}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() => router.push(`/chat/${id}`)}
        >
          <Text style={{ color: "#fff" }}>Chat</Text>
        </TouchableOpacity>
      </View>

      {/* ================= REVIEWS ================= */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>⭐ Reviews</Text>

        {loadingReviews ? (
          <ActivityIndicator size="small" color="#3b82f6" />
        ) : reviews.length === 0 ? (
          <Text style={{ color: "#64748b" }}>No reviews yet</Text>
        ) : (
          reviews.map((r) => (
            <View key={r._id} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.rating}>⭐ {r.rating}/5</Text>
                <Text style={styles.email}>{r.userEmail}</Text>
              </View>

              <Text style={styles.comment}>{r.comment}</Text>

              <Text style={styles.date}>
                {new Date(r.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  hero: { height: 250, position: "relative" },

  image: { width: "100%", height: "100%" },

  noImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  heroText: {
    position: "absolute",
    bottom: 20,
    left: 15,
  },

  category: { color: "#93c5fd", fontWeight: "700" },

  title: { color: "#fff", fontSize: 22, fontWeight: "800" },

  card: {
    backgroundColor: "#fff",
    margin: 12,
    padding: 15,
    borderRadius: 12,
  },

  price: { fontSize: 22, fontWeight: "800", color: "#2563eb" },

  sectionTitle: { fontWeight: "800", marginBottom: 10 },

  bookBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    gap: 10,
    margin: 12,
  },

  callBtn: {
    flex: 1,
    backgroundColor: "#475569",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  chatBtn: {
    flex: 1,
    backgroundColor: "#0284c7",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  reviewCard: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  reviewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  rating: { color: "#f59e0b", fontWeight: "800" },

  email: { fontSize: 12, color: "#64748b" },

  comment: { marginTop: 5, fontWeight: "500" },

  date: { marginTop: 5, fontSize: 11, color: "#94a3b8" },
});