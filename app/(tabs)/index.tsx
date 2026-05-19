import React, { useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
  TextInput,
  Image,
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
  image?: string;
};

export default function ServicesScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const router = useRouter();

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API}/services`);
      const json = await res.json();
      setServices(json.data || json);
    } catch (err) {
      Alert.alert("Error", "Server not responding");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // ================= SEARCH FILTER =================
  const filteredServices = useMemo(() => {
    return services.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, services]);

  // ================= CARD =================
  const renderItem = ({ item }: { item: Service }) => (
    <TouchableOpacity
      activeOpacity={0.95}
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/service-details",
          params: { id: item._id },
        })
      }
    >
      {/* IMAGE SECTION */}
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="image-outline" size={36} color="#94a3b8" />
          </View>
        )}
        {/* Floating Category Badge */}
        <View style={styles.badge}>
          <Text style={styles.category}>{item.category}</Text>
        </View>
      </View>

      {/* CONTENT SECTION */}
      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.priceBadge}>
            <Text style={styles.price}>৳{item.price}</Text>
          </View>
        </View>

        <Text style={styles.desc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={15} color="#3b82f6" />
            <Text style={styles.location} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          <View style={styles.actionBtn}>
            <Text style={styles.viewBtn}>Details</Text>
            <Ionicons name="arrow-forward-circle" size={20} color="#3b82f6" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.brand}>JUNSHEBA</Text>
          <TouchableOpacity style={styles.iconCircle}>
            <Ionicons name="notifications-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.heading}>Find Expert Services</Text>

        {/* SEARCH BOX */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#64748b" />
            <TextInput
              placeholder="What service are you looking for?"
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* BODY */}
      <View style={styles.body}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : filteredServices.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={50} color="#cbd5e1" />
            <Text style={styles.emptyText}>No services found</Text>
            <Text style={styles.emptySubText}>Try searching for something else</Text>
          </View>
        ) : (
          <FlatList
            data={filteredServices}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20, paddingTop: 5 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                tintColor="#3b82f6"
                onRefresh={() => {
                  setRefreshing(true);
                  fetchServices();
                }}
              />
            }
          />
        )}
      </View>
    </View>
  );
}

// ================= MODERN STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc", // Soft clean background
  },

  header: {
    backgroundColor: "#1e40af", // Deep Premium Blue
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#1e40af",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
  },

  brand: {
    color: "#93c5fd",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2.5,
  },

  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  heading: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 20,
    letterSpacing: -0.5,
  },

  searchWrapper: {
    backgroundColor: "transparent",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "500",
  },

  body: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    // Premium iOS Shadow
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    // Android Shadow
    elevation: 3,
  },

  imageContainer: {
    position: "relative",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 170,
  },

  noImage: {
    height: 170,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },

  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  category: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  cardBody: {
    padding: 16,
    backgroundColor: "#fff",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
    marginRight: 10,
  },

  priceBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  price: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2563eb", // Vibrant Blue Price
  },

  desc: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 6,
    lineHeight: 18,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f8fafc",
    paddingTop: 12,
    backgroundColor: "transparent",
  },

  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    flex: 1,
    marginRight: 10,
  },

  location: {
    fontSize: 13,
    color: "#64748b",
    marginLeft: 5,
    fontWeight: "500",
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },

  viewBtn: {
    color: "#3b82f6",
    fontWeight: "700",
    fontSize: 14,
    marginRight: 4,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    backgroundColor: "transparent",
  },

  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
  },

  emptySubText: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 4,
  },
});