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
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const API = "https://junsheba.vercel.app";

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
  rating?: number;
  totalReviews?: number;
  providerName?: string;
  providerEmail?: string;
};

export default function ServicesListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialCategory = (params.category as string) || "";

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const categories = ["All", "Electric", "Plumbing", "Cleaning", "AC", "Painter", "Moving", "CCTV"];

  useEffect(() => {
    fetchServices();
  }, []);

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

  const filteredServices = useMemo(() => {
    return services.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        (item.providerName && item.providerName.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory =
        selectedCategory === "" ||
        selectedCategory === "All" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory, services]);

  const goToService = (id: string) => {
    router.push({ pathname: "/service-details", params: { id } });
  };

  const renderItem = ({ item }: { item: Service }) => (
    <TouchableOpacity activeOpacity={0.95} style={styles.card} onPress={() => goToService(item._id)}>
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="image-outline" size={36} color={COLORS.subtitle} />
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        <View style={styles.ratingReviewRow}>
          <Ionicons name="star" size={13} color="#FACC15" />
          <Text style={styles.ratingReviewText}>
            {(item.rating || 4.9).toFixed(1)} ({item.totalReviews || 120} Reviews)
          </Text>
        </View>

        <View style={styles.providerInfoRow}>
          <Ionicons name="person-outline" size={13} color={COLORS.subtitle} />
          <Text style={styles.providerInfoText} numberOfLines={1}>
            {item.providerName || "Campus Provider"}
          </Text>
        </View>

        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={13} color={COLORS.subtitle} />
          <Text style={styles.location} numberOfLines={1}>
            {item.location || "Jagannath University"}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>৳{item.price}</Text>
          <TouchableOpacity style={styles.bookNowBtn} onPress={() => goToService(item._id)}>
            <Text style={styles.bookNowText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.header} />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>All Services</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.subtitle} />
          <TextInput
            placeholder="Search services or providers..."
            placeholderTextColor={COLORS.subtitle}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={COLORS.subtitle} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CATEGORY FILTER CHIPS */}
      <View style={styles.filterWrapper}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterContainer}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item || (item === "All" && selectedCategory === "");
            return (
              <TouchableOpacity
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedCategory(item === "All" ? "" : item)}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* BODY LIST */}
      <View style={styles.body}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.header} />
          </View>
        ) : (
          <FlatList
            data={filteredServices}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="search-outline" size={50} color={COLORS.subtitle} />
                <Text style={styles.emptyText}>No services found</Text>
                <Text style={styles.emptySubText}>Try searching for something else</Text>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                tintColor={COLORS.header}
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
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    marginBottom: 14,
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
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cards,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "500",
  },
  filterWrapper: {
    marginVertical: 12,
    backgroundColor: "transparent",
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cards,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  filterChipActive: {
    backgroundColor: COLORS.header,
    borderColor: COLORS.header,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.subtitle,
  },
  filterTextActive: {
    color: "#fff",
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
  listContent: {
    paddingTop: 4,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.cards,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 160,
  },
  noImage: {
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.border,
  },
  cardBody: {
    padding: 14,
    backgroundColor: COLORS.cards,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  ratingReviewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
    backgroundColor: "transparent",
  },
  ratingReviewText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.subtitle,
  },
  providerInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 4,
    backgroundColor: "transparent",
  },
  providerInfoText: {
    fontSize: 12,
    color: COLORS.subtitle,
    fontWeight: "500",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 4,
    backgroundColor: "transparent",
  },
  location: {
    fontSize: 12,
    color: COLORS.subtitle,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    backgroundColor: "transparent",
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.header,
  },
  bookNowBtn: {
    backgroundColor: COLORS.button,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
  },
  bookNowText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    backgroundColor: "transparent",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 13,
    color: COLORS.subtitle,
    marginTop: 4,
  },
});