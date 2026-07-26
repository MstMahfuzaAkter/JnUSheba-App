import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { Text, View } from "@/components/Themed";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from "@expo-google-fonts/poppins";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { useFocusEffect, useRouter } from "expo-router";

const API = "https://jnushebaserver.onrender.com";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_WIDTH = SCREEN_WIDTH - 32;

const FONTS = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
  extrabold: "Poppins_800ExtraBold",
};

// ================= REFINED COLOR SYSTEM =================
const COLORS = {
  header: "#5B21B6",
  headerMid: "#7C3AED",
  headerDark: "#3B0764",
  background: "#F6F6FB",
  cards: "#FFFFFF",
  button: "#FF6B35",
  buttonDark: "#E8551F",
  success: "#16A34A",
  successBg: "#DCFCE7",
  danger: "#EF4444",
  gold: "#FACC15",
  pink: "#EC4899",
  text: "#181524",
  subtitle: "#6B7280",
  subtitleLight: "#9CA3AF",
  border: "#EFEFF6",
  chipBg: "#F1EEFB",
};

// Shape of a review as it's actually stored by the backend: POST /reviews
// pushes this exact object onto the parent service's `reviews` array, so
// GET /services already returns it embedded — no extra endpoint needed.
type EmbeddedReview = {
  _id: string;
  userEmail?: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type Service = {
  _id: string;
  title: string;
  description: string;
  price: number;
  priceType?: "fixed" | "hourly" | "starting";
  category: string;
  subCategory?: string;
  location: string;
  district?: string;
  area?: string;
  address?: string;
  image?: string;
  gallery?: string[];
  rating?: number;
  totalReviews?: number;
  totalBookings?: number;
  providerId?: string;
  providerName?: string;
  providerEmail?: string;
  phone?: string;
  availability?: "available" | "busy" | "offline";
  workingDays?: string[];
  startTime?: string;
  endTime?: string;
  experience?: number;
  serviceDuration?: string;
  warranty?: string;
  verified?: boolean;
  featured?: boolean;
  status?: "active" | "inactive" | string;
  tags?: string[];
  createdAt?: string;
  reviews?: EmbeddedReview[];
};

type Banner = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  bgColor: string;
  bgColorDark: string;
};

const BANNERS: Banner[] = [
  {
    id: "b1",
    badge: "JnU_ShabaLink Special",
    title: "30% Campus Offer",
    subtitle: "Professional cleaning & daily campus service",
    image: "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=800",
    bgColor: "#5B21B6",
    bgColorDark: "#3B0764",
  },
  {
    id: "b2",
    badge: "Verified Handymen",
    title: "Plumbing Experts",
    subtitle: "Fast & reliable fixes by skilled technicians",
    image: "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=800",
    bgColor: "#0369A1",
    bgColorDark: "#0C4A6E",
  },
  {
    id: "b3",
    badge: "Campus Express",
    title: "Deep House Clean",
    subtitle: "Keep your hostel & rooms fresh and tidy",
    image: "https://images.pexels.com/photos/6195125/pexels-photo-6195125.jpeg?auto=compress&cs=tinysrgb&w=800",
    bgColor: "#BE185D",
    bgColorDark: "#831843",
  },
];

// ================= CATEGORIES =================
const CATEGORIES = [
  { id: "1", name: "Electric", label: "Electric", lib: "MaterialCommunityIcons", iconName: "flash-outline", color: "#EAB308" },
  { id: "2", name: "Plumbing", label: "Plumbing", lib: "MaterialCommunityIcons", iconName: "pipe-leak", color: "#0284C7" },
  { id: "3", name: "Cleaning", label: "Cleaning", lib: "MaterialCommunityIcons", iconName: "broom", color: "#16A34A" },
  { id: "4", name: "Locksmith", label: "Key & Lock", lib: "MaterialCommunityIcons", iconName: "key-wireless", color: "#F59E0B" },
  { id: "5", name: "AC", label: "AC Repair", lib: "MaterialCommunityIcons", iconName: "air-conditioner", color: "#06B6D4" },
  { id: "6", name: "Painter", label: "Painter", lib: "FontAwesome5", iconName: "paint-roller", color: "#EC4899" },
  { id: "7", name: "Moving", label: "Moving", lib: "MaterialCommunityIcons", iconName: "truck-fast-outline", color: "#FF6B35" },
  { id: "8", name: "All", label: "More", lib: "Ionicons", iconName: "grid-outline", color: "#7C3AED" },
];

const CATEGORY_COLOR_MAP: Record<string, string> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.name.toLowerCase()]: c.color }),
  {}
);

const EMERGENCY_SERVICES = [
  { id: "e1", title: "Key & Lock Fix", icon: "key", color: "#F59E0B", cat: "Locksmith" },
  { id: "e2", title: "Instant Electrician", icon: "flash", color: "#EF4444", cat: "Electric" },
  { id: "e3", title: "Water Leakage", icon: "water", color: "#0369A1", cat: "Plumbing" },
];

const FEATURES = [
  { id: "f1", title: "100% Verified", desc: "Admin approved pros", icon: "shield-checkmark-outline", color: "#16A34A" },
  { id: "f2", title: "Student Friendly", desc: "Best campus prices", icon: "pricetag-outline", color: "#F59E0B" },
  { id: "f3", title: "Fast Delivery", desc: "Service under 30m", icon: "time-outline", color: "#5B21B6" },
];

const OFFERS = [
  { id: "o1", code: "JNU2026", title: "৳100 OFF", desc: "On first cleaning booking", bg: "#5B21B6" },
  { id: "o2", code: "HALL50", title: "50% Discount", desc: "Hostel key & plumbing fixes", bg: "#FF6B35" },
];

const CAMPUS_ZONES = [
  "Main Campus",
  "Science Building",
  "Nawab Faizunnesa Choudurani Hall",
  "Sadarghat",
  "Laxmibazar",
  "Shakharibazar",
  "Patuatuli",
  "Victoria Park",
];

export default function ServicesScreen() {
  
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bannerIndex, setBannerIndex] = useState(0);
  const [userName, setUserName] = useState("Mahfuza Akter");
  const [greeting, setGreeting] = useState("Good Morning");
  const [bannerImageErrors, setBannerImageErrors] = useState<{ [key: string]: boolean }>({});

  const router = useRouter();
  const bannerRef = useRef<FlatList<Banner>>(null);

  const setDynamicGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) setGreeting("Good Morning");
    else if (currentHour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  };

  const fetchUserData = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      if (session) {
        const user = JSON.parse(session);
        if (user && user.name) setUserName(user.name);
      }
    } catch (err) {
      console.log("Error loading user session:", err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API}/services`);
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const json = await res.json();
      setServices(json.data || json || []);
    } catch (err) {
      Alert.alert("Connection Error", "Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Greeting only depends on the current time, so it only needs to be
  // computed once when the screen first mounts.
  useEffect(() => {
    setDynamicGreeting();
  }, []);

  // Refetch every time this screen regains focus (e.g. after booking or
  // leaving a review) so rating/review data never goes stale.
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      fetchServices();
    }, [])
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => {
        const next = (prev + 1) % BANNERS.length;
        try {
          bannerRef.current?.scrollToIndex({ index: next, animated: true });
        } catch (e) {
          // ignore transient layout errors during rotation
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const activeServices = useMemo(
    () => services.filter((s) => s.status !== "inactive"),
    [services]
  );

  const filteredServices = useMemo(() => {
    return activeServices.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory, activeServices]);

  const popularServices = useMemo(
    () => [...activeServices].sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0)).slice(0, 6),
    [activeServices]
  );

  const topRatedServices = useMemo(
    () => [...activeServices].filter((s) => (s.rating || 0) > 0).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6),
    [activeServices]
  );

  const recommendedServices = useMemo(() => [...activeServices].reverse().slice(0, 6), [activeServices]);

  // Backend already stamps every service with `createdAt` on insert (see
  // POST /services), so the newest additions can be derived without a new
  // endpoint — sort descending and take the latest 5.
  const recentServices = useMemo(
    () =>
      [...activeServices]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5),
    [activeServices]
  );

  const featuredServices = useMemo(
    () => activeServices.filter((s) => s.featured).slice(0, 6),
    [activeServices]
  );

  const providerStats = useMemo(() => {
    const stats: Record<string, { avgRating: number; totalReviews: number; serviceCount: number }> = {};
    const grouped: Record<string, Service[]> = {};

    for (const s of activeServices) {
      if (!s.providerEmail) continue;
      if (!grouped[s.providerEmail]) grouped[s.providerEmail] = [];
      grouped[s.providerEmail].push(s);
    }

    for (const email of Object.keys(grouped)) {
      const providerServices = grouped[email];
      const rated = providerServices.filter((s) => (s.rating || 0) > 0);
      const avgRating = rated.length
        ? rated.reduce((sum, s) => sum + (s.rating || 0), 0) / rated.length
        : 0;
      const totalReviews = providerServices.reduce((sum, s) => sum + (s.totalReviews || 0), 0);
      stats[email] = { avgRating, totalReviews, serviceCount: providerServices.length };
    }

    return stats;
  }, [activeServices]);

  const nearbyProviders = useMemo(() => {
    const seen = new Set<string>();
    const list: Service[] = [];
    for (const s of activeServices) {
      if (s.providerEmail && !seen.has(s.providerEmail)) {
        seen.add(s.providerEmail);
        list.push(s);
      }
    }
    return list.slice(0, 6);
  }, [activeServices]);

  const recentReviews = useMemo(() => {
    const flattened = activeServices.flatMap((s) =>
      (s.reviews || []).map((r) => ({
        ...r,
        serviceTitle: s.title,
        providerName: s.providerName,
      }))
    );
    return flattened
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [activeServices]);

  const goToService = (id: string) => {
    router.push({ pathname: "/service-details", params: { id } });
  };

  const getCategoryColor = (category?: string) =>
    (category && CATEGORY_COLOR_MAP[category.toLowerCase()]) || COLORS.header;

  const maskEmail = (email?: string) => {
    if (!email) return "JnU Student";
    const [name] = email.split("@");
    if (name.length <= 2) return `${name}***`;
    return `${name.slice(0, 2)}***${name.slice(-1)}`;
  };

  const formatPrice = (item: Service) => {
    if (item.priceType === "hourly") return `৳${item.price}/hr`;
    if (item.priceType === "starting") return `From ৳${item.price}`;
    return `৳${item.price}`;
  };

  const getLocationText = (item: Service) => {
    if (item.area && item.district) return `${item.area}, ${item.district}`;
    if (item.area) return item.area;
    return item.location || "Jagannath University Area";
  };

  const getAvailabilityMeta = (availability?: string) => {
    if (availability === "busy") return { label: "Busy", color: "#F59E0B" };
    if (availability === "offline") return { label: "Offline", color: COLORS.danger };
    return { label: "Available", color: COLORS.success };
  };

  const renderCategoryIcon = (cat: (typeof CATEGORIES)[0], isSelected: boolean) => {
    const iconColor = isSelected ? "#fff" : cat.color;
    if (cat.lib === "MaterialCommunityIcons")
      return <MaterialCommunityIcons name={cat.iconName as any} size={24} color={iconColor} />;
    if (cat.lib === "FontAwesome5")
      return <FontAwesome5 name={cat.iconName as any} size={20} color={iconColor} />;
    return <Ionicons name={cat.iconName as any} size={24} color={iconColor} />;
  };

  const renderItem = ({ item }: { item: Service }) => {
    const catColor = getCategoryColor(item.category);
    const hasRating = (item.rating || 0) > 0;
    const availabilityMeta = getAvailabilityMeta(item.availability);
    return (
      <TouchableOpacity activeOpacity={0.95} style={styles.card} onPress={() => goToService(item._id)}>
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.image} />
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="image-outline" size={36} color={COLORS.subtitleLight} />
            </View>
          )}
          <View style={[styles.categoryTag, { backgroundColor: catColor }]}>
            <Text style={styles.categoryTagText}>{item.category}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            {item.verified && (
              <Ionicons name="checkmark-circle" size={16} color={COLORS.header} style={{ marginLeft: 4 }} />
            )}
          </View>
          <View style={styles.ratingReviewRow}>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={12} color={COLORS.gold} />
              <Text style={styles.ratingReviewText}>{hasRating ? item.rating!.toFixed(1) : "New"}</Text>
            </View>
            {hasRating && (
              <Text style={styles.reviewCountText}>({item.totalReviews} reviews)</Text>
            )}
            <View style={styles.availabilityRow}>
              <View style={[styles.availabilityDot, { backgroundColor: availabilityMeta.color }]} />
              <Text style={[styles.availabilityText, { color: availabilityMeta.color }]}>
                {availabilityMeta.label}
              </Text>
            </View>
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
              {getLocationText(item)}
            </Text>
          </View>
          <View style={styles.footer}>
            <Text style={styles.price}>{formatPrice(item)}</Text>
            <TouchableOpacity style={styles.bookNowBtn} onPress={() => goToService(item._id)}>
              <Text style={styles.bookNowText}>Details</Text>
              <Ionicons name="arrow-forward" size={12} color="#fff" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMiniCard = (item: Service) => {
    const hasRating = (item.rating || 0) > 0;
    return (
      <TouchableOpacity key={item._id} activeOpacity={0.9} style={styles.miniCard} onPress={() => goToService(item._id)}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.miniImage} />
        ) : (
          <View style={[styles.miniImage, styles.noImage]}>
            <Ionicons name="image-outline" size={24} color={COLORS.subtitleLight} />
          </View>
        )}
        <View style={styles.miniRatingRow}>
          <Ionicons name="star" size={11} color={COLORS.gold} />
          {/* FIX: same fake-"5" bug as above, now correctly falls back to "New" */}
          <Text style={styles.miniRatingText}>
            {hasRating ? `${item.rating!.toFixed(1)} (${item.totalReviews || 0})` : "New"}
          </Text>
        </View>
        <Text style={styles.miniTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.miniPrice}>{formatPrice(item)}</Text>
      </TouchableOpacity>
    );
  };

  const renderProviderCard = (item: Service, index: number) => {
    const stats = item.providerEmail ? providerStats[item.providerEmail] : undefined;
    const hasRating = stats && stats.avgRating > 0;
    return (
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
          <Ionicons name="star" size={11} color={COLORS.gold} />
          {/* FIX: same fake-"5" bug as above, now correctly falls back to "New" */}
          <Text style={styles.providerRatingText}>{hasRating ? stats!.avgRating.toFixed(1) : "New"}</Text>
        </View>
        <Text style={styles.providerDistance} numberOfLines={1}>
          🛠️ {stats?.serviceCount || 1} service{(stats?.serviceCount || 1) > 1 ? "s" : ""} listed
        </Text>
      </TouchableOpacity>
    );
  };

  // ================= HEADER: everything before the actual service list =================
  // Order: Banner -> Emergency -> Categories -> Featured -> Recently Added ->
  // Offers -> Features -> Popular -> Zones -> Providers -> Reviews -> Top
  // Rated -> Recommended -> Help Center banner -> Search bar -> "All
  // Services" title -> [main service list renders next, as FlatList data].
  const ListHeader = (
    <View style={{ backgroundColor: "transparent" }}>
      {/* BANNER SLIDER */}
      <FlatList
        ref={bannerRef}
        data={BANNERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH + 12}
        decelerationRate="fast"
        keyExtractor={(b) => b.id}
        style={{ marginTop: 14 }}
        contentContainerStyle={{ gap: 12 }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 12));
          setBannerIndex(idx);
        }}
        renderItem={({ item }) => {
          const hasError = bannerImageErrors[item.id];
          return (
            <View style={[styles.bannerCard, { backgroundColor: item.bgColor, width: BANNER_WIDTH }]}>
              <View style={[styles.bannerDecorCircle, { backgroundColor: item.bgColorDark }]} />

              <View style={styles.bannerLeftContent}>
                <View style={styles.bannerBadge}>
                  <Text style={styles.bannerBadgeText}>{item.badge}</Text>
                </View>
                <Text style={styles.bannerTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.bannerSubtitle} numberOfLines={2}>
                  {item.subtitle}
                </Text>
                <TouchableOpacity style={styles.bannerBtn} activeOpacity={0.85} onPress={() => setSearch("")}>
                  <Text style={styles.bannerBtnText}>Explore Service</Text>
                  <Ionicons name="arrow-forward" size={12} color="#fff" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>

              <View style={styles.bannerRightImageContainer}>
                {!hasError ? (
                  <Image
                    source={{ uri: item.image }}
                    onError={() => setBannerImageErrors((prev) => ({ ...prev, [item.id]: true }))}
                    style={styles.bannerImageFull}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.bannerImageFallback}>
                    <Ionicons name="image-outline" size={30} color="rgba(255,255,255,0.7)" />
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />
      <View style={styles.dotsRow}>
        {BANNERS.map((_, i) => (
          <View key={i} style={[styles.dot, i === bannerIndex && styles.dotActive]} />
        ))}
      </View>

      {/* EMERGENCY QUICK HELPS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Emergency Quick Helps</Text>
        <View style={styles.emergencyRow}>
          {EMERGENCY_SERVICES.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.emergencyCard, { borderColor: item.color, backgroundColor: `${item.color}12` }]}
              activeOpacity={0.8}
              onPress={() => setSelectedCategory(item.cat)}
            >
              <View style={[styles.emergencyIconCircle, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={18} color="#fff" />
              </View>
              <Text style={styles.emergencyText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* CATEGORIES GRID */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Categories</Text>
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryItem}
                onPress={() => setSelectedCategory(cat.name)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.categoryIconCircle,
                    isSelected && { backgroundColor: cat.color, borderColor: cat.color },
                  ]}
                >
                  {renderCategoryIcon(cat, isSelected)}
                </View>
                <Text
                  style={[styles.categoryLabel, isSelected && { color: cat.color, fontFamily: FONTS.bold }]}
                  numberOfLines={1}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* FEATURED SERVICES */}
      {featuredServices.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>🌟 Featured Services</Text>
            <Text style={styles.arrowText}>→</Text>
          </View>
          <FlatList
            data={featuredServices}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id + "featured"}
            renderItem={({ item }) => renderMiniCard(item)}
            contentContainerStyle={{ gap: 12 }}
          />
        </View>
      )}

      {/* RECENTLY ADDED — latest 5 services by createdAt */}
      {recentServices.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>🆕 Recently Added</Text>
            <Text style={styles.arrowText}>→</Text>
          </View>
          <FlatList
            data={recentServices}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id + "recent"}
            renderItem={({ item }) => renderMiniCard(item)}
            contentContainerStyle={{ gap: 12 }}
          />
        </View>
      )}

      {/* STUDENT PROMO OFFERS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏷️ Student Special Promo Coupons</Text>
        <FlatList
          data={OFFERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <View style={[styles.offerCard, { backgroundColor: item.bg }]}>
              <View style={styles.offerBadge}>
                <Text style={styles.offerBadgeText}>CODE: {item.code}</Text>
              </View>
              <Text style={styles.offerTitle}>{item.title}</Text>
              <Text style={styles.offerDesc}>{item.desc}</Text>
            </View>
          )}
        />
      </View>

      {/* WHY CHOOSE JNU_SHABALINK */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛡️ Why Choose JnU_ShabaLink?</Text>
        <View style={styles.featuresRow}>
          {FEATURES.map((f) => (
            <View key={f.id} style={styles.featureBox}>
              <View style={[styles.featureIconCircle, { backgroundColor: `${f.color}18` }]}>
                <Ionicons name={f.icon as any} size={20} color={f.color} />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
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

      {/* ACTIVE CAMPUS COVERAGE ZONES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Active Campus Coverage Zones</Text>
        <View style={styles.zonesWrapper}>
          {CAMPUS_ZONES.map((zone, idx) => (
            <View key={idx} style={styles.zoneChip}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={styles.zoneText}>{zone}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* NEARBY PROVIDERS */}
      {nearbyProviders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>JnU Verified Providers</Text>
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

      {/* RECENT STUDENT REVIEWS */}
      {recentReviews.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Recent Student Reviews</Text>
          <FlatList
            data={recentReviews}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(r) => r._id}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => (
              <View style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <Text style={styles.reviewRatingText}>⭐ {item.rating}</Text>
                  <Text style={styles.reviewEmailText} numberOfLines={1}>
                    {maskEmail(item.userEmail)}
                  </Text>
                </View>
                <Text style={styles.reviewText} numberOfLines={3}>
                  {item.comment}
                </Text>
                <Text style={styles.reviewRole} numberOfLines={1}>
                  {item.serviceTitle}
                </Text>
                <Text style={styles.reviewDateText}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                </Text>
              </View>
            )}
          />
        </View>
      )}

      {/* TOP RATED */}
      {topRatedServices.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Top Rated Experts</Text>
          <FlatList
            data={topRatedServices}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => renderMiniCard(item)}
            contentContainerStyle={{ gap: 12 }}
          />
        </View>
      )}

      {/* RECOMMENDED FOR YOU */}
      {recommendedServices.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended For Campus Area</Text>
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
        <View style={styles.helpCenterIconCircle}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />
        </View>
        <Text style={styles.helpCenterText}>JnU_ShabaLink Support Center</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.subtitleLight} />
      </TouchableOpacity>

      {/* SEARCH BAR — after the Help Center banner, right before the service list */}
      <View style={[styles.searchWrapper, { marginTop: 18 }]}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.header} />
          <TextInput
            placeholder="Search JnU_ShabaLink services..."
            placeholderTextColor={COLORS.subtitleLight}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} style={{ marginRight: 6 }}>
              <Ionicons name="close-circle" size={18} color={COLORS.subtitleLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* "All Services" title — right before the actual service list renders */}
      <Text style={[styles.sectionTitle, { marginTop: 18 }]}>
        {selectedCategory === "All" ? "All Campus Services" : `${selectedCategory} Services`}
      </Text>
    </View>
  );

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.header} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.header} />

      {/* MODERN TOP HEADER */}
      <View style={styles.header}>
        <View style={styles.headerDecorCircleLarge} />
        <View style={styles.headerDecorCircleSmall} />

        <View style={styles.headerTop}>
          <View style={styles.userInfoWrapper}>
            <TouchableOpacity activeOpacity={0.8} style={styles.avatarContainer} onPress={() => router.push("/profile" as any)}>
              <MaterialCommunityIcons name="account-circle" size={42} color="#ffffff" />
            </TouchableOpacity>
            <View style={{ backgroundColor: "transparent" }}>
              <Text style={styles.greetingText}>{greeting} 👋</Text>
              <Text style={styles.userNameText}>{userName}</Text>
              <View style={styles.locationBadge}>
                <Ionicons name="location-sharp" size={11} color={COLORS.button} />
                <Text style={styles.locationHeaderText}>Jagannath University</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconCircle} onPress={() => router.push("/settings" as any)}>
              <Ionicons name="notifications-outline" size={20} color="#fff" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* BODY: Banner -> Search -> All Services list -> everything else */}
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
                <Ionicons name="search-outline" size={50} color={COLORS.subtitleLight} />
                <Text style={styles.emptyText}>No services found</Text>
                <Text style={styles.emptySubText}>Try searching for something else on JnU_ShabaLink</Text>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                tintColor={COLORS.header}
                colors={[COLORS.header]}
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

  // MODERN TOP HEADER
  header: {
    backgroundColor: COLORS.header,
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: COLORS.headerDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
    position: "relative",
  },
  headerDecorCircleLarge: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.headerMid,
    opacity: 0.35,
    top: -90,
    right: -50,
  },
  headerDecorCircleSmall: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.button,
    opacity: 0.18,
    bottom: -40,
    left: -20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  userInfoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "transparent",
  },
  avatarContainer: {
    backgroundColor: "transparent",
  },
  greetingText: {
    color: "#DDD6FE",
    fontSize: 11,
    fontFamily: FONTS.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  userNameText: {
    color: "#ffffff",
    fontSize: 19,
    fontFamily: FONTS.extrabold,
    marginTop: 1,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  locationHeaderText: {
    color: "#ffffff",
    fontSize: 11,
    marginLeft: 3,
    fontFamily: FONTS.semibold,
  },
  headerRightIcons: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    borderWidth: 1.5,
    borderColor: COLORS.header,
  },

  // SEARCH BAR — now sits below the banner, not overlapping the header,
  // so it uses normal positive spacing instead of a negative overlap margin.
  searchWrapper: {
    backgroundColor: "transparent",
    marginTop: 14,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cards,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.headerDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.text,
    fontSize: 14,
    fontFamily: FONTS.medium,
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
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.subtitle,
    marginTop: 4,
  },

  // BANNER STYLES
  bannerCard: {
    borderRadius: 22,
    height: 152,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
    position: "relative",
  },
  bannerDecorCircle: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.35,
    top: -50,
    right: -30,
  },
  bannerLeftContent: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 8,
    backgroundColor: "transparent",
  },
  bannerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
  },
  bannerBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: FONTS.extrabold,
    lineHeight: 20,
  },
  bannerSubtitle: {
    color: "#EDE9FE",
    fontSize: 11,
    fontFamily: FONTS.medium,
    marginTop: 3,
    marginBottom: 8,
  },
  bannerBtn: {
    backgroundColor: COLORS.button,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  bannerBtnText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: 11,
  },
  bannerRightImageContainer: {
    width: 120,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 14,
    overflow: "hidden",
  },
  bannerImageFull: {
    width: "100%",
    height: "100%",
  },
  bannerImageFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dotsRow: { flexDirection: "row", justifyContent: "center", marginTop: 8, gap: 5, backgroundColor: "transparent" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.header, width: 16 },

  // EMERGENCY SECTION STYLES
  emergencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  emergencyCard: {
    width: "31%",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    borderWidth: 1.5,
  },
  emergencyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  emergencyText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: "center",
  },

  // CATEGORY STYLES
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    marginTop: 6,
  },
  categoryItem: {
    width: "23%",
    alignItems: "center",
    marginBottom: 14,
    backgroundColor: "transparent",
  },
  categoryIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.cards,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryLabel: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
    textAlign: "center",
  },

  // OFFERS STYLES
  offerCard: {
    width: 200,
    borderRadius: 16,
    padding: 14,
    justifyContent: "center",
  },
  offerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  offerBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: FONTS.bold,
  },
  offerTitle: {
    color: "#fff",
    fontSize: 15,
    fontFamily: FONTS.extrabold,
  },
  offerDesc: {
    color: "#F1F5F9",
    fontSize: 10,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },

  // FEATURE TRUST STYLES
  featuresRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  featureBox: {
    width: "31%",
    backgroundColor: COLORS.cards,
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  featureTitle: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: 6,
    textAlign: "center",
  },
  featureDesc: {
    fontSize: 9,
    fontFamily: FONTS.regular,
    color: COLORS.subtitle,
    marginTop: 2,
    textAlign: "center",
  },

  // ZONES STYLES
  zonesWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
    backgroundColor: "transparent",
  },
  zoneChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.successBg,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  zoneText: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    color: "#166534",
  },

  // REVIEWS STYLES
  reviewCard: {
    width: 210,
    backgroundColor: COLORS.cards,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  reviewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
    marginBottom: 6,
    gap: 6,
  },
  reviewRatingText: {
    fontSize: 12,
    fontFamily: FONTS.extrabold,
    color: "#f59e0b",
  },
  reviewEmailText: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.subtitle,
    flexShrink: 1,
    textAlign: "right",
  },
  reviewText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: 16,
  },
  reviewName: {
    fontSize: 11,
    fontFamily: FONTS.extrabold,
    color: COLORS.header,
  },
  reviewRole: {
    fontSize: 9,
    fontFamily: FONTS.regular,
    color: COLORS.subtitle,
  },
  reviewDateText: {
    fontSize: 9,
    fontFamily: FONTS.regular,
    color: COLORS.subtitleLight,
    marginTop: 4,
  },

  section: { marginTop: 18, backgroundColor: "transparent" },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, backgroundColor: "transparent" },
  sectionTitle: { fontSize: 16, fontFamily: FONTS.extrabold, color: COLORS.text, marginBottom: 8 },
  arrowText: { fontSize: 16, fontFamily: FONTS.extrabold, color: COLORS.header },
  miniCard: {
    width: 132,
    backgroundColor: COLORS.cards,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
  },
  miniImage: { width: "100%", height: 78, borderRadius: 12, backgroundColor: COLORS.border },
  miniRatingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 6, backgroundColor: "transparent" },
  miniRatingText: { fontSize: 11, fontFamily: FONTS.bold, color: COLORS.text },
  miniTitle: { fontSize: 12, fontFamily: FONTS.bold, color: COLORS.text, marginTop: 2 },
  miniPrice: { fontSize: 12, fontFamily: FONTS.extrabold, color: COLORS.header, marginTop: 2 },
  providerCard: {
    width: 108,
    alignItems: "center",
    backgroundColor: COLORS.cards,
    borderRadius: 16,
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
  providerName: { fontSize: 11, fontFamily: FONTS.bold, color: COLORS.text, textAlign: "center" },
  providerRatingRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 2, backgroundColor: "transparent" },
  providerRatingText: { fontSize: 10, fontFamily: FONTS.bold, color: COLORS.text },
  providerDistance: { fontSize: 10, fontFamily: FONTS.regular, color: COLORS.subtitle, marginTop: 2, textAlign: "center" },
  helpCenterBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cards,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 18,
    gap: 10,
  },
  helpCenterIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.header,
    justifyContent: "center",
    alignItems: "center",
  },
  helpCenterText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.cards,
    borderRadius: 18,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.headerDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
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
  categoryTag: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryTagText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: FONTS.extrabold,
  },
  cardBody: {
    padding: 14,
    backgroundColor: COLORS.cards,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  ratingReviewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
    backgroundColor: "transparent",
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
    backgroundColor: "transparent",
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availabilityText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FEF9C3",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingReviewText: {
    fontSize: 11,
    fontFamily: FONTS.extrabold,
    color: "#854D0E",
  },
  reviewCountText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.subtitle,
  },
  providerInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 4,
    backgroundColor: "transparent",
  },
  providerInfoText: {
    fontSize: 12,
    color: COLORS.subtitle,
    fontFamily: FONTS.medium,
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
    fontFamily: FONTS.medium,
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
    fontSize: 17,
    fontFamily: FONTS.extrabold,
    color: COLORS.header,
  },
  bookNowBtn: {
    backgroundColor: COLORS.button,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  bookNowText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
});