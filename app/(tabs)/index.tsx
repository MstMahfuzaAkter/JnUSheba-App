import React, { useEffect, useState, useMemo, useRef } from "react";
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
  Dimensions,
} from "react-native";

import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://junsheba.vercel.app";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ================= COLOR PALETTE =================
const COLORS = {
  header: "#4f46e5",
  background: "#f8fafc",
  cards: "#FFFFFF",
  button: "#f97316",
  success: "#22c55e",
  text: "#0f172a",
  subtitle: "#64748b",
  border: "#f1f5f9",
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

type Banner = {
  id: string;
  title: string;
  subtitle: string;
};

const BANNERS: Banner[] = [
  {
    id: "b1",
    title: "30% OFF",
    subtitle: "Book Any Campus Service Today",
  },
  {
    id: "b2",
    title: "Verified Providers",
    subtitle: "Every provider is approved by admin",
  },
  {
    id: "b3",
    title: "24/7 Emergency Help",
    subtitle: "Electrician, plumbing & more, anytime",
  },
];

const CATEGORIES = [
  { id: "1", name: "Electric", label: "Electric", icon: "⚡" },
  { id: "2", name: "Plumbing", label: "Plumbing", icon: "🚰" },
  { id: "3", name: "Cleaning", label: "Cleaning", icon: "🧹" },
  { id: "4", name: "AC", label: "AC", icon: "❄️" },
  { id: "5", name: "Painter", label: "Painter", icon: "🎨" },
  { id: "6", name: "Moving", label: "Moving", icon: "📦" },
  { id: "7", name: "CCTV", label: "CCTV", icon: "📷" },
  { id: "8", name: "All", label: "More", icon: "➕" },
];

export default function ServicesScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bannerIndex, setBannerIndex] = useState(0);
  const [userName, setUserName] = useState("Mahfuza Akter");
  const [greeting, setGreeting] = useState("Good Morning");

  const router = useRouter();
  const bannerRef = useRef<FlatList<Banner>>(null);

  useEffect(() => {
    fetchUserData();
    fetchServices();
    setDynamicGreeting();
  }, []);

  const setDynamicGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Good Morning");
    } else if (currentHour < 17) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  };

  const fetchUserData = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      if (session) {
        const user = JSON.parse(session);
        if (user && user.name) {
          setUserName(user.name);
        }
      }
    } catch (err) {
      console.log("Error loading user session:", err);
    }
  };

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

  // ================= BANNER AUTOPLAY =================
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => {
        const next = (prev + 1) % BANNERS.length;
        bannerRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // ================= SEARCH & CATEGORY FILTER =================
  const filteredServices = useMemo(() => {
    return services.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory =
        selectedCategory === "All" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory, services]);

  // ================= DERIVED SECTIONS =================
  const popularServices = useMemo(
    () => [...services].sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0)).slice(0, 6),
    [services]
  );

  const topRatedServices = useMemo(
    () =>
      [...services]
        .filter((s) => (s.rating || 0) > 0)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6),
    [services]
  );

  const recommendedServices = useMemo(
    () => [...services].reverse().slice(0, 6),
    [services]
  );

  const nearbyProviders = useMemo(() => {
    const seen = new Set<string>();
    const list: Service[] = [];
    for (const s of services) {
      if (s.providerEmail && !seen.has(s.providerEmail)) {
        seen.add(s.providerEmail);
        list.push(s);
      }
    }
    return list.slice(0, 6);
  }, [services]);

  const goToService = (id: string) => {
    router.push({ pathname: "/service-details", params: { id } });
  };

  // ================= MAIN SERVICE CARD =================
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
          <Ionicons name="star" size={13} color="#facc15" />
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

  // ================= SMALL MINI CARD =================
  const renderMiniCard = (item: Service, showRatingOnly?: boolean) => (
    <TouchableOpacity
      key={item._id}
      activeOpacity={0.9}
      style={styles.miniCard}
      onPress={() => goToService(item._id)}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.miniImage} />
      ) : (
        <View style={[styles.miniImage, styles.noImage]}>
          <Ionicons name="image-outline" size={24} color={COLORS.subtitle} />
        </View>
      )}
      <View style={styles.miniRatingRow}>
        <Ionicons name="star" size={11} color="#facc15" />
        <Text style={styles.miniRatingText}>
          {showRatingOnly ? (item.rating || 5.0).toFixed(1) : `${(item.rating || 4.9).toFixed(1)} (${item.totalReviews || 120})`}
        </Text>
      </View>
      <Text style={styles.miniTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.miniPrice}>৳{item.price}</Text>
    </TouchableOpacity>
  );

  // ================= NEARBY PROVIDER CARD =================
  const renderProviderCard = (item: Service, index: number) => (
    <TouchableOpacity
      key={item.providerEmail || index}
      activeOpacity={0.9}
      style={styles.providerCard}
      onPress={() => setSearch(item.providerName || "")}
    >
      <View style={styles.providerAvatar}>
        <Ionicons name="person" size={20} color="#fff" />
      </View>
      <Text style={styles.providerName} numberOfLines={1}>
        {item.providerName || "Provider"}
      </Text>
      <View style={styles.providerRatingRow}>
        <Ionicons name="star" size={11} color="#facc15" />
        <Text style={styles.providerRatingText}>4.9</Text>
      </View>
      <Text style={styles.providerDistance} numberOfLines={1}>
        📍 {(index + 1) * 150}m Away
      </Text>
    </TouchableOpacity>
  );

  // ================= HOME PAGE HEADER =================
  const ListHeader = (
    <View style={{ backgroundColor: "transparent" }}>
      {/* SEARCH BAR */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={COLORS.subtitle} />
          <TextInput
            placeholder="Search services..."
            placeholderTextColor={COLORS.subtitle}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} style={{ marginRight: 6 }}>
              <Ionicons name="close-circle" size={18} color={COLORS.subtitle} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* BANNER SLIDER */}
      <FlatList
        ref={bannerRef}
        data={BANNERS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(b) => b.id}
        style={{ marginTop: 18 }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32));
          setBannerIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={[styles.banner, { width: SCREEN_WIDTH - 32 }]}>
            <View style={{ flex: 1, backgroundColor: "transparent", justifyContent: "center" }}>
              <Text style={styles.bannerBadgeText}>🎉 {item.title}</Text>
              <Text style={styles.bannerTitle}>{item.subtitle}</Text>
              <TouchableOpacity style={styles.bannerBtn} onPress={() => setSearch("")}>
                <Text style={styles.bannerBtnText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={styles.dotsRow}>
        {BANNERS.map((_, i) => (
          <View key={i} style={[styles.dot, i === bannerIndex && styles.dotActive]} />
        ))}
      </View>

      {/* CATEGORIES GRID */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryItem}
                onPress={() => setSelectedCategory(cat.name)}
              >
                <View style={[styles.categoryIconCircle, isSelected && styles.selectedCategoryCircle]}>
                  <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                </View>
                <Text style={[styles.categoryLabel, isSelected && styles.selectedCategoryLabel]} numberOfLines={1}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* POPULAR SERVICES */}
      {popularServices.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Popular Services</Text>
            <Text style={styles.arrowText}>→</Text>
          </View>
          <FlatList
            data={popularServices}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => renderMiniCard(item)}
            contentContainerStyle={{ gap: 12 }}
          />
        </View>
      )}

      {/* NEARBY PROVIDERS */}
      {nearbyProviders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Nearby Providers</Text>
            <Text style={styles.arrowText}>→</Text>
          </View>
          <FlatList
            data={nearbyProviders}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, idx) => item.providerEmail || idx.toString()}
            renderItem={({ item, index }) => renderProviderCard(item, index)}
            contentContainerStyle={{ gap: 12 }}
          />
        </View>
      )}

      {/* TOP RATED */}
      {topRatedServices.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Top Rated</Text>
          <FlatList
            data={topRatedServices}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => renderMiniCard(item, true)}
            contentContainerStyle={{ gap: 12 }}
          />
        </View>
      )}

      {/* RECOMMENDED FOR YOU */}
      {recommendedServices.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <FlatList
            data={recommendedServices}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id + "rec"}
            renderItem={({ item }) => renderMiniCard(item)}
            contentContainerStyle={{ gap: 12 }}
          />
        </View>
      )}

      {/* HELP CENTER BUTTON BANNER */}
      <TouchableOpacity style={styles.helpCenterBanner} activeOpacity={0.85} onPress={() => router.push("/help" as any)}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.header} />
        <Text style={styles.helpCenterText}>Help Center & Support</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { marginTop: 15 }]}>
        {selectedCategory === "All" ? "All Services" : `${selectedCategory} Services`}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.header} />

      {/* TOP HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ backgroundColor: "transparent" }}>
            <Text style={styles.greetingText}>👋 {greeting}</Text>
            <Text style={styles.userNameText}>{userName}</Text>
            <View style={styles.locationRowHeader}>
              <Ionicons name="location" size={13} color="#e0e7ff" />
              <Text style={styles.locationHeaderText}>Jagannath University</Text>
            </View>
          </View>
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={[styles.iconCircle, { marginRight: 8 }]} onPress={() => router.push("/settings" as any)}>
              <Ionicons name="notifications-outline" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle} onPress={() => router.push("/profile" as any)}>
              <Ionicons name="person-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* BODY */}
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
            contentContainerStyle={{ paddingBottom: 90, paddingTop: 5 }}
            ListHeaderComponent={ListHeader}
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

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.header,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: COLORS.header,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  greetingText: {
    color: "#e0e7ff",
    fontSize: 12,
    fontWeight: "600",
  },
  userNameText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 1,
  },
  locationRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    backgroundColor: "transparent",
  },
  locationHeaderText: {
    color: "#f1f5f9",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  headerRightIcons: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchWrapper: {
    backgroundColor: "transparent",
    marginTop: -18,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cards,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 55,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.text,
    fontSize: 14,
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
  empty: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
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
  banner: {
    borderRadius: 18,
    padding: 18,
    height: 110,
    backgroundColor: COLORS.header,
    justifyContent: "center",
  },
  bannerBadgeText: { color: "#e0e7ff", fontSize: 13, fontWeight: "700" },
  bannerTitle: { color: "#fff", fontSize: 18, fontWeight: "800", marginTop: 2 },
  bannerBtn: {
    backgroundColor: COLORS.button,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  bannerBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  dotsRow: { flexDirection: "row", justifyContent: "center", marginTop: 8, gap: 5, backgroundColor: "transparent" },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.header, width: 14 },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    marginTop: 4,
  },
  categoryItem: {
    width: "23%",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "transparent",
  },
  categoryIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.cards,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  selectedCategoryCircle: {
    borderColor: COLORS.header,
    backgroundColor: "#e0e7ff",
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  selectedCategoryLabel: {
    color: COLORS.header,
    fontWeight: "800",
  },
  section: { marginTop: 16, backgroundColor: "transparent" },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, backgroundColor: "transparent" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text, marginBottom: 8 },
  arrowText: { fontSize: 16, fontWeight: "800", color: COLORS.subtitle },
  miniCard: {
    width: 130,
    backgroundColor: COLORS.cards,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
  },
  miniImage: { width: "100%", height: 76, borderRadius: 10, backgroundColor: COLORS.border },
  miniRatingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 6, backgroundColor: "transparent" },
  miniRatingText: { fontSize: 11, fontWeight: "700", color: COLORS.text },
  miniTitle: { fontSize: 12, fontWeight: "700", color: COLORS.text, marginTop: 2 },
  miniPrice: { fontSize: 12, fontWeight: "800", color: COLORS.header, marginTop: 2 },
  providerCard: {
    width: 105,
    alignItems: "center",
    backgroundColor: COLORS.cards,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  providerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.header,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  providerName: { fontSize: 11, fontWeight: "700", color: COLORS.text, textAlign: "center" },
  providerRatingRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 2, backgroundColor: "transparent" },
  providerRatingText: { fontSize: 10, fontWeight: "700", color: COLORS.text },
  providerDistance: { fontSize: 10, color: COLORS.subtitle, marginTop: 2, textAlign: "center" },
  helpCenterBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cards,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 18,
    gap: 8,
  },
  helpCenterText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.header,
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
});