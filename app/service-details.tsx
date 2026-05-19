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

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchService();
    checkBookedStatus();
  }, [id]);

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

  // ================= CHECK BOOKED STATUS =================
  const checkBookedStatus = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      if (!session) return;
      const user = JSON.parse(session);

      const res = await fetch(`${API}/bookings/user/${user.email}`);
      const data = await res.json();

      const found = data.find((b: any) => b.serviceId === id);
      if (found) {
        setIsBooked(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= BOOK SERVICE DIRECTLY =================
  const handleDirectBook = async () => {
    try {
      setBookingLoading(true);
      const session = await AsyncStorage.getItem("user_session");
      if (!session) {
        Alert.alert("Error", "Please login first to book.");
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

      if (data.success || data.insertedId) {
        Alert.alert("Success 🎉", "Booking Successful!");
        setIsBooked(true);
      } else {
        Alert.alert("Failed", data.message || "Booking Failed");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setBookingLoading(false);
    }
  };

  // ================= CALL =================
  const handleCall = async () => {
    if (!service?.phone) {
      Alert.alert("Unavailable", "Phone number not found");
      return;
    }
    const url = `tel:${service.phone}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert("Error", "Calling not supported");
    }
  };

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" />

      {/* HERO IMAGE */}
      <View style={styles.heroImageContainer}>
        {service.image ? (
          <Image source={{ uri: service.image }} style={styles.heroImage} />
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="image-outline" size={50} color="#94a3b8" />
          </View>
        )}
        <View style={styles.overlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroCategory}>{service.category}</Text>
          <Text style={styles.heroTitle}>{service.title}</Text>
        </View>
      </View>

      {/* INFO CARD */}
      <View style={styles.card}>
        <Text style={styles.price}>৳ {service.price}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color="#64748b" />
          <Text style={styles.infoText}>{service.location}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={18} color="#64748b" />
          <Text style={styles.infoText}>{service.providerEmail}</Text>
        </View>

        {service.phone && (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#64748b" />
            <Text style={styles.infoText}>{service.phone}</Text>
          </View>
        )}
      </View>

      {/* DESCRIPTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{service.description}</Text>
      </View>

      {/* DYNAMIC BOOKING SYSTEM COMPONENT */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Service Booking</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDirectBook}
          disabled={isBooked || bookingLoading}
          style={[
            styles.bookNowBtn,
            isBooked && styles.bookedBtnStatus,
            (isBooked || bookingLoading) && { opacity: 0.9 }
          ]}
        >
          {bookingLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name={isBooked ? "checkmark-done-circle" : "bookmark"} size={18} color="#fff" />
              <Text style={styles.btnText}>
                {isBooked ? "Already Booked ✔" : "Book Now"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* COMMUNICATION ACTIONS */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
          <Ionicons name="call" size={18} color="#fff" />
          <Text style={styles.btnText}>Call Provider</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() => router.push(`/chat/${id}`)}
        >
          <Ionicons name="chatbubble" size={18} color="#fff" />
          <Text style={styles.btnText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  heroImageContainer: {
    height: 260,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  noImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  heroContent: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroCategory: {
    color: "#93c5fd",
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 5,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 2,
  },
  price: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2563eb",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: "#475569",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  description: {
    color: "#64748b",
    lineHeight: 22,
    fontSize: 14,
  },
  bookNowBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  bookedBtnStatus: {
    backgroundColor: "#10b981",
  },
  actionRow: {
    flexDirection: "row",
    margin: 15,
    gap: 10,
    marginBottom: 45,
  },
  callBtn: {
    flex: 1,
    backgroundColor: "#475569",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  chatBtn: {
    flex: 1,
    backgroundColor: "#0284c7",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});