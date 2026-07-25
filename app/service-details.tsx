const FONTS = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
  extrabold: "Poppins_800ExtraBold",
};

import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";

const API = "https://jnushebaserver.onrender.com";

const COLORS = {
  header: "#5B21B6",
  background: "#F8FAFC",
  cards: "#FFFFFF",
  button: "#F97316",
  text: "#0F172A",
  subtitle: "#64748B",
  border: "#E2E8F0",
};

export default function ServiceDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [service, setService] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [isBooked, setIsBooked] = useState(false);
  const [existingBooking, setExistingBooking] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchService();
      checkBookedStatus();
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        checkBookedStatus();
      }
    }, [id])
  );

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
      setService(data.data || data);
    } catch (err) {
      Alert.alert("Error", "Failed to load service");
    } finally {
      setLoading(false);
    }
  };

  // ================= REVIEWS =================
  const loadReviews = async (providerEmail: string) => {
    try {
      setLoadingReviews(true);
      const res = await fetch(`${API}/reviews/${providerEmail}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : data.reviews || []);
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
      const userEmail = user.email || user.customerEmail;
      if (!userEmail) return;

      const res = await fetch(`${API}/bookings/user/${userEmail}`);
      const data = await res.json();

      const bookingsList = data.data || data;
      if (Array.isArray(bookingsList)) {
        const found = bookingsList.find((b: any) => b.serviceId === id || b.service?._id === id);
        if (found) {
          setIsBooked(true);
          setExistingBooking(found);
        } else {
          setIsBooked(false);
          setExistingBooking(null);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= REDIRECT TO BOOKING PAGE =================
  const handleBookNowPress = async () => {
    const session = await AsyncStorage.getItem("user_session");
    if (!session) {
      Alert.alert("Error", "Please login first to book a service");
      return;
    }

    router.push({
      pathname: "/bookings",
      params: { id: service._id },
    });
  };

  const goToPayment = (bookingId: string) => {
    router.push({
      pathname: `/payment/${bookingId}`,
      params: { amount: service.price, serviceTitle: service.title },
    });
  };

  // ================= CALL =================
  const handleCall = async () => {
    const phoneNo = service?.phone || service?.providerPhone;
    if (!phoneNo) {
      Alert.alert("Notice", "No phone number available");
      return;
    }

    const url = `tel:${phoneNo}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) Linking.openURL(url);
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.header} />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.text }}>Service not found</Text>
      </View>
    );
  }

  const isPaid = existingBooking?.paymentStatus === "paid";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.header} />

      {/* HERO */}
      <View style={styles.hero}>
        {service.image ? (
          <Image source={{ uri: service.image }} style={styles.image} />
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="image-outline" size={50} color={COLORS.subtitle} />
          </View>
        )}

        <View style={styles.overlay} />

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.heroText}>
          <Text style={styles.category}>{service.category}</Text>
          <Text style={styles.title}>{service.title}</Text>
        </View>
      </View>

      {/* INFO CARD (All Basic Information Added) */}
      <View style={styles.card}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ৳ {service.price} <Text style={styles.priceType}>({service.priceType || "fixed"})</Text>
          </Text>
          {service.availability && (
            <View style={[styles.badge, { backgroundColor: service.availability === "offline" ? "#fee2e2" : "#dcfce7" }]}>
              <Text style={[styles.badgeText, { color: service.availability === "offline" ? "#ef4444" : "#16a34a" }]}>
                {service.availability.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.detailText}>📂 Category: {service.category} {service.subCategory ? `> ${service.subCategory}` : ""}</Text>
        <Text style={styles.detailText}>📍 Location: {service.location || "Jagannath University"}</Text>
        {service.address ? <Text style={styles.detailText}>🏠 Address: {service.address}</Text> : null}

        <Text style={styles.detailText}>👤 Provider: {service.providerName || "Campus Provider"}</Text>
        <Text style={styles.detailText}>📞 Phone: {service.phone || service.providerPhone || "N/A"}</Text>

        {service.experience ? <Text style={styles.detailText}>🏆 Experience: {service.experience} Years</Text> : null}
        {service.serviceDuration ? <Text style={styles.detailText}>⏱️ Duration: {service.serviceDuration}</Text> : null}
        {service.warranty ? <Text style={styles.detailText}>🛡️ Warranty: {service.warranty}</Text> : null}

        <Text style={styles.detailText}>⏰ Working Hours: {service.startTime || "09:00"} - {service.endTime || "18:00"}</Text>

        {service.workingDays && service.workingDays.length > 0 && (
          <Text style={styles.detailText}>📅 Working Days: {service.workingDays.join(", ")}</Text>
        )}
      </View>

      {/* DESCRIPTION */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.descText}>{service.description || "No description provided."}</Text>
      </View>

      {/* BOOK / PAY ACTIONS */}
      <View style={styles.card}>
        {!isBooked ? (
          <TouchableOpacity
            onPress={handleBookNowPress}
            style={styles.bookBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Book Now</Text>
          </TouchableOpacity>
        ) : isPaid ? (
          <View style={[styles.bookBtn, { backgroundColor: "#10b981" }]}>
            <Text style={styles.btnText}>Booked & Paid ✔</Text>
          </View>
        ) : (
          <View style={styles.actionButtonGroup}>
            <TouchableOpacity
              onPress={() => router.push("/bookings")}
              style={[styles.bookBtn, { backgroundColor: COLORS.header, flex: 1 }]}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>Booked, Please Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => goToPayment(existingBooking._id)}
              style={[styles.bookBtn, { backgroundColor: "#f59e0b", flex: 1 }]}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ACTIONS */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.callBtn} onPress={handleCall} activeOpacity={0.85}>
          <Ionicons name="call-outline" size={16} color="#fff" />
          <Text style={styles.btnText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() =>
            router.push({
              pathname: `/chat/${id}`,
              params: { receiver: service.providerEmail },
            })
          }
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#fff" />
          <Text style={styles.btnText}>Chat</Text>
        </TouchableOpacity>
      </View>

      {/* ================= REVIEWS ================= */}
      <View style={[styles.card, { marginBottom: 40 }]}>
        <Text style={styles.sectionTitle}>⭐ Reviews</Text>

        {loadingReviews ? (
          <ActivityIndicator size="small" color={COLORS.header} />
        ) : reviews.length === 0 ? (
          <Text style={{ color: COLORS.subtitle }}>No reviews yet</Text>
        ) : (
          reviews.map((r) => (
            <View key={r._id || Math.random()} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.rating}>⭐ {r.rating}/5</Text>
                <Text style={styles.email}>{r.userEmail}</Text>
              </View>

              <Text style={styles.comment}>{r.comment}</Text>

              <Text style={styles.date}>
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
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
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  hero: { height: 260, position: "relative" },
  image: { width: "100%", height: "100%" },
  noImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.border,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroText: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  category: { color: "#93c5fd", fontWeight: "700", marginBottom: 2, fontSize: 13 },
  title: { color: "#fff", fontSize: 22, fontWeight: "800" },
  card: {
    backgroundColor: COLORS.cards,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  price: { fontSize: 22, fontWeight: "800", color: COLORS.header },
  priceType: { fontSize: 14, color: COLORS.subtitle, fontWeight: "600" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  detailText: { fontSize: 13, color: COLORS.subtitle, marginTop: 4, fontWeight: "500" },
  sectionTitle: { fontWeight: "800", marginBottom: 10, fontSize: 15, color: COLORS.text },
  descText: { color: COLORS.subtitle, lineHeight: 20, fontSize: 13 },
  bookBtn: {
    backgroundColor: COLORS.button,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonGroup: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "transparent",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  row: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 14,
  },
  callBtn: {
    flex: 1,
    backgroundColor: COLORS.subtitle,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  chatBtn: {
    flex: 1,
    backgroundColor: COLORS.header,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  reviewCard: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rating: { color: "#f59e0b", fontWeight: "800", fontSize: 13 },
  email: { fontSize: 11, color: COLORS.subtitle },
  comment: { marginTop: 6, fontWeight: "500", color: COLORS.text, fontSize: 13 },
  date: { marginTop: 6, fontSize: 11, color: COLORS.subtitle },
});