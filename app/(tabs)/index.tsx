import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
  TextInput,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const API = "https://junsheba.vercel.app";

type Service = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
};

export default function ServicesScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API}/services`);
      const json = await res.json();
      setServices(json.data || json);
    } catch (err) {
      Alert.alert("Error", "Could not connect to the server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const renderItem = ({ item }: { item: Service }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => router.push({ pathname: "/service-details", params: { id: item._id } })}
    >
      {/* Visual Accent - Color side strip */}
      <View style={styles.accentStrip} />
      
      <View style={styles.cardMain}>
        <View style={styles.cardHeader}>
          <View style={styles.catContainer}>
            <Text style={styles.catText}>{item.category}</Text>
          </View>
          <Text style={styles.priceText}>৳{item.price}</Text>
        </View>

        <Text style={styles.serviceTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.descriptionText} numberOfLines={2}>{item.description}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.locBox}>
            <Ionicons name="map" size={12} color="#94a3b8" />
            <Text style={styles.footerText}>{item.location}</Text>
          </View>
          <View style={styles.viewAction}>
            <Text style={styles.actionText}>View</Text>
            <Ionicons name="arrow-forward" size={14} color="#2563eb" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Top Professional Header */}
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brandName}>JUNSHEBA</Text>
            <Text style={styles.welcomeText}>Find an Expert</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={20} color="#fff" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Search Bar UI */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#94a3b8" style={{marginLeft: 15}} />
          <TextInput 
            placeholder="Search services..." 
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.contentBody}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{marginTop: 40}} />
        ) : (
          <FlatList
            data={services}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchServices();}} />
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  topSection: {
    backgroundColor: "#0f172a", // Dark navy pro background
    paddingTop: 60,
    paddingHorizontal: 25,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
    marginBottom: 25,
  },
  brandName: {
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },
  welcomeText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  notifDot: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1,
    borderColor: "#0f172a",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    height: 50,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#0f172a",
  },
  contentBody: {
    flex: 1,
    marginTop: -20, // Overlap effect
    backgroundColor: "transparent",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#64748b",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  accentStrip: {
    width: 6,
    backgroundColor: "#2563eb",
  },
  cardMain: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "transparent",
  },
  catContainer: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  serviceTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  locBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  footerText: {
    fontSize: 12,
    color: "#94a3b8",
    marginLeft: 4,
  },
  viewAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
    marginRight: 4,
  },
});