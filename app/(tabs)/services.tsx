import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  View as RNView,
} from "react-native";

import { Text, View } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Stack, useRouter } from "expo-router"; // useRouter ইমপোর্ট করা হয়েছে
import { LinearGradient } from "expo-linear-gradient";

type Service = {
  _id: string;
  title: string;
  description: string;
  price: number;
};

export default function ServicesScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // router হুক কল করা হয়েছে

  useEffect(() => {
    fetchServices();
  }, []);

  // ================= FETCH SERVICES =================
  const fetchServices = async () => {
    try {
      const res = await fetch("https://junsheba.vercel.app/services");
      const data = await res.json();
      setServices(data.data || data);
    } catch (error) {
      console.log("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER CONFIGURATION */}
      <Stack.Screen
        options={{
          title: "All Services",
          headerLargeTitle: true,
          headerShadowVisible: false,
          headerLargeTitleStyle: {
            fontSize: 28,
            fontWeight: "800",
            color: "#0f172a",
          },
          headerStyle: { backgroundColor: "#f8fafc" },
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* INTERACTIVE SEARCH BAR PLACEHOLDER */}
        <Pressable style={styles.searchPlaceholder}>
          <FontAwesome name="search" size={16} color="#64748b" />
          <Text style={styles.searchText}>
            Search for services (Tutor, Print...)
          </Text>
        </Pressable>

        <Text style={styles.categoryLabel}>CAMPUS SERVICES</Text>

        {/* SERVICE LIST / LOADING STATE */}
        {loading ? (
          <RNView style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </RNView>
        ) : (
          <RNView style={styles.serviceList}>
            {services.map((service) => (
              <Pressable
                key={service._id}
                style={({ pressed }) => [
                  styles.serviceCard,
                  pressed && styles.cardPressed,
                ]}
                // এখানে ক্লিকের মাধ্যমে আইডি সহ ডিটেইলস পেজে রিডাইরেক্ট করা হচ্ছে
                onPress={() =>
                  router.push({
                    pathname: "/service-details", // আপনার ডিটেইলস পেজের সঠিক পাথ
                    params: { id: service._id },
                  })
                }
              >
                {/* ICON BADGE */}
                <RNView style={styles.iconBox}>
                  <FontAwesome name="briefcase" size={20} color="#2563eb" />
                </RNView>

                {/* CARD INFO */}
                <RNView style={styles.cardInfo}>
                  <RNView style={styles.cardHeaderRow}>
                    <Text style={styles.serviceTitle} numberOfLines={1}>
                      {service.title}
                    </Text>
                    {/* Premium Price Tag */}
                    <RNView style={styles.priceBadge}>
                      <Text style={styles.priceText}>৳{service.price}</Text>
                    </RNView>
                  </RNView>

                  <Text style={styles.serviceDesc} numberOfLines={2}>
                    {service.description}
                  </Text>
                </RNView>

                {/* ACTION ARROW */}
                <RNView style={styles.actionIcon}>
                  <FontAwesome name="angle-right" size={18} color="#94a3b8" />
                </RNView>
              </Pressable>
            ))}
          </RNView>
        )}

        {/* PREMIUM SUPPORT CARD */}
        <LinearGradient
          colors={["#ffffff", "#f0f9ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.supportCard}
        >
          <RNView style={styles.supportIconBox}>
            <FontAwesome name="question-circle" size={22} color="#0284c7" />
          </RNView>

          <RNView style={styles.supportTextBox}>
            <Text style={styles.supportTitle}>Need Custom Help?</Text>
            <Text style={styles.supportSubText}>
              Contact our 24/7 campus support team.
            </Text>
          </RNView>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

// ================= PREMIUM STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  searchPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  searchText: {
    marginLeft: 12,
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1.5,
    marginBottom: 14,
    textTransform: "uppercase",
  },
  centerContainer: {
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceList: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
    backgroundColor: "#f8fafc",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eff6ff",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 14,
    backgroundColor: "transparent",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
    marginRight: 8,
  },
  priceBadge: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  priceText: {
    color: "#16a34a",
    fontWeight: "700",
    fontSize: 13,
  },
  serviceDesc: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 18,
  },
  actionIcon: {
    paddingLeft: 12,
    backgroundColor: "transparent",
  },
  supportCard: {
    marginTop: 30,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0f2fe",
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  supportIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
  },
  supportTextBox: {
    marginLeft: 14,
    flex: 1,
    backgroundColor: "transparent",
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0369a1",
  },
  supportSubText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "500",
  },
});