import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";

const API = "https://jnushebaserver.onrender.com";

const COLORS = {
  header: "#2563EB",
  background: "#F8FAFC",
  cards: "#FFFFFF",
  button: "#F97316",
  text: "#0F172A",
  subtitle: "#64748B",
  border: "#E2E8F0",
};

type Service = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  image?: string;
  providerName?: string;
  providerEmail?: string;
};

export default function BookServiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const serviceId = params.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states matching your backend booking requirements
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  useEffect(() => {
    fetchServiceDetails();
    loadUserProfile();
  }, [serviceId]);

  const loadUserProfile = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      if (session) {
        const user = JSON.parse(session);
        if (user.name) setCustomerName(user.name);
        if (user.email) setCustomerEmail(user.email);
        if (user.phone) setCustomerPhone(user.phone);
      }
    } catch (err) {
      console.log("Error loading user profile:", err);
    }
  };

  const fetchServiceDetails = async () => {
    try {
      const res = await fetch(`${API}/services/${serviceId}`);
      const json = await res.json();
      setService(json.data || json);
    } catch (err) {
      Alert.alert("Error", "Could not fetch service details");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!customerName || !customerEmail || !customerPhone || !address || !bookingDate || !bookingTime) {
      Alert.alert("Required", "Please fill in all the required booking fields.");
      return;
    }

    try {
      setSubmitting(true);
      const bookingData = {
        serviceId: service?._id,
        serviceTitle: service?.title,
        providerName: service?.providerName || "Campus Provider",
        providerEmail: service?.providerEmail,
        customerName,
        customerEmail,
        userEmail: customerEmail, // backend support
        customerPhone,
        address,
        location: service?.location || "Jagannath University",
        bookingDate,
        bookingTime,
        price: service?.price,
        totalAmount: service?.price,
        status: "pending",
        paymentStatus: "unpaid",
      };

      const res = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const json = await res.json();
      setSubmitting(false);

      if (res.ok || json.success) {
        // অ্যালার্ট যাতে সঠিকভাবে স্ক্রিনে শো করে, সেজন্য ছোট ডিলে দেওয়া হয়েছে
        setTimeout(() => {
          Alert.alert(
            "Success",
            "Booking request created successfully!",
            [
              { 
                text: "OK", 
                onPress: () => router.back() // সার্ভিস ডিটেইলস পেজে ফিরে যাবে
              },
            ],
            { cancelable: false }
          );
        }, 100);
      } else {
        Alert.alert("Error", json.message || "Failed to create booking");
      }
    } catch (err) {
      setSubmitting(false);
      Alert.alert("Error", "Something went wrong. Please check your connection.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.header} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.header} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Book Service</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* SERVICE SUMMARY CARD */}
        {service && (
          <View style={styles.summaryCard}>
            <Text style={styles.serviceTitle} numberOfLines={1}>{service.title}</Text>
            <Text style={styles.providerText}>Provider: {service.providerName || "Campus Provider"}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total Price:</Text>
              <Text style={styles.priceValue}>৳{service.price}</Text>
            </View>
          </View>
        )}

        {/* BOOKING FORM */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Customer Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.subtitle}
              value={customerName}
              onChangeText={setCustomerName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.subtitle}
              keyboardType="email-address"
              value={customerEmail}
              onChangeText={setCustomerEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor={COLORS.subtitle}
              keyboardType="phone-pad"
              value={customerPhone}
              onChangeText={setCustomerPhone}
            />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Schedule & Location</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Booking Date</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 28 July 2026"
              placeholderTextColor={COLORS.subtitle}
              value={bookingDate}
              onChangeText={setBookingDate}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Booking Time</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 10:00 AM"
              placeholderTextColor={COLORS.subtitle}
              value={bookingTime}
              onChangeText={setBookingTime}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address / Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your hall / room or address"
              placeholderTextColor={COLORS.subtitle}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.85}
            onPress={handleBooking}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Confirm Booking</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.header,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: COLORS.cards,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },
  providerText: {
    fontSize: 13,
    color: COLORS.subtitle,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    backgroundColor: "transparent",
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.subtitle,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.header,
  },
  formContainer: {
    backgroundColor: COLORS.cards,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 14,
    backgroundColor: "transparent",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.subtitle,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
    color: COLORS.text,
  },
  submitBtn: {
    backgroundColor: COLORS.button,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
});