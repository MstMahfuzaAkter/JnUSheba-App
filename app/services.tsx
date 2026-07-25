import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

const API = "https://jnushebaserver.onrender.com";

// ================= FONTS =================
const FONTS = {
    regular: "Times New Roman",
    medium: "Times New Roman",
    semibold: "Times New Roman",
    bold: "Times New Roman",
    extrabold: "Times New Roman",
};

// ================= COLOR SYSTEM =================
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

type EmbeddedReview = {
    _id: string;
    bookingId?: string;
    providerEmail?: string;
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
    rating?: number;
    totalReviews?: number;
    totalBookings?: number;
    providerId?: string;
    providerName?: string;
    providerEmail?: string;
    phone?: string;
    availability?: "available" | "busy" | "offline";
    verified?: boolean;
    featured?: boolean;
    status?: "active" | "inactive" | string;
    createdAt?: string;
    reviews?: EmbeddedReview[];
};

export default function ServicesListScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");

    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [sortBy, setSortBy] = useState<"default" | "price-low" | "price-high" | "rating">("default");

    useEffect(() => {
        if (params.category) {
            setSelectedCategory(params.category as string);
        }
    }, [params.category]);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch(`${API}/services`);
            if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
            const json = await res.json();
            setServices(json.data || json || []);
        } catch (err) {
            Alert.alert("Error", "Server not responding");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Filter out inactive listings dynamically
    const activeServices = useMemo(
        () => services.filter((s) => s.status !== "inactive"),
        [services]
    );

    // Dynamic Category Chips with item counts
    const categories = useMemo(() => {
        const counts: { [key: string]: number } = {};
        activeServices.forEach((s) => {
            if (s.category) {
                counts[s.category] = (counts[s.category] || 0) + 1;
            }
        });

        const unique = Array.from(new Set(activeServices.map((s) => s.category).filter(Boolean)));
        return [{ name: "All", count: activeServices.length }, ...unique.map((cat) => ({ name: cat, count: counts[cat] || 0 }))];
    }, [activeServices]);

    // Flatten embedded reviews across services to generate a dynamic review ticker
    const recentReviews = useMemo(() => {
        const flattened = activeServices.flatMap((s) =>
            (s.reviews || []).map((r) => ({
                ...r,
                serviceTitle: s.title,
            }))
        );
        return flattened
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 8);
    }, [activeServices]);

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
        return item.location || "Jagannath University";
    };

    const getAvailabilityMeta = (availability?: string) => {
        if (availability === "busy") return { label: "Busy", color: "#F59E0B" };
        if (availability === "offline") return { label: "Offline", color: COLORS.danger };
        return { label: "Available", color: COLORS.success };
    };

    // Filtered & Sorted Services
    const filteredServices = useMemo(() => {
        let result = activeServices.filter((item) => {
            const matchesSearch =
                item.title?.toLowerCase().includes(search.toLowerCase()) ||
                item.category?.toLowerCase().includes(search.toLowerCase()) ||
                (item.providerName && item.providerName.toLowerCase().includes(search.toLowerCase()));

            const matchesCategory =
                !selectedCategory ||
                selectedCategory === "All" ||
                item.category?.toLowerCase().trim() === selectedCategory.toLowerCase().trim();

            return matchesSearch && matchesCategory;
        });

        // Dynamic Sorting Logic
        if (sortBy === "price-low") {
            result.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortBy === "price-high") {
            result.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortBy === "rating") {
            result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        return result;
    }, [search, selectedCategory, sortBy, activeServices]);

    const goToService = (id: string) => {
        router.push({ pathname: "/service-details", params: { id } });
    };

    const renderItem = ({ item }: { item: Service }) => {
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
                        <Ionicons name="star" size={13} color={COLORS.gold} />
                        <Text style={styles.ratingReviewText}>
                            {hasRating
                                ? `${item.rating!.toFixed(1)} (${item.totalReviews || 0} Reviews)`
                                : "5⭐"}
                        </Text>
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
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.header} />

            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitleText}>All Services ({filteredServices.length})</Text>
                    <View style={{ width: 36 }} />
                </View>

                {/* SEARCH BAR */}
                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={18} color={COLORS.subtitle} />
                    <TextInput
                        placeholder="Search services or providers..."
                        placeholderTextColor={COLORS.subtitleLight}
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

            {/* CATEGORY FILTER CHIPS WITH COUNTS */}
            {categories.length > 1 && (
                <View style={styles.filterWrapper}>
                    <FlatList
                        data={categories}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.name}
                        contentContainerStyle={styles.filterContainer}
                        renderItem={({ item }) => {
                            const isSelected = selectedCategory === item.name || (item.name === "All" && !selectedCategory);
                            return (
                                <TouchableOpacity
                                    style={[styles.filterChip, isSelected && styles.filterChipActive]}
                                    onPress={() => setSelectedCategory(item.name === "All" ? "" : item.name)}
                                >
                                    <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                                        {item.name} ({item.count})
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            )}

            {/* SORTING BAR */}
            <View style={styles.sortRow}>
                <Text style={styles.sortLabel}>Sort by:</Text>
                {[
                    { key: "default", label: "Default" },
                    { key: "price-low", label: "Low Price" },
                    { key: "price-high", label: "High Price" },
                    { key: "rating", label: "Top Rated" },
                ].map((s) => (
                    <TouchableOpacity
                        key={s.key}
                        style={[styles.sortChip, sortBy === s.key && styles.sortChipActive]}
                        onPress={() => setSortBy(s.key as any)}
                    >
                        <Text style={[styles.sortChipText, sortBy === s.key && styles.sortChipTextActive]}>
                            {s.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* RECENT REVIEWS RAIL */}
            {recentReviews.length > 0 && search === "" && !selectedCategory && (
                <View style={styles.reviewsSection}>
                    <Text style={styles.reviewsSectionTitle}>💬 Recent Student Reviews</Text>
                    <FlatList
                        data={recentReviews}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(r) => r._id}
                        contentContainerStyle={styles.reviewsListContent}
                        renderItem={({ item }) => (
                            <View style={styles.reviewCard}>
                                <View style={styles.reviewTop}>
                                    <Text style={styles.reviewRatingText}>⭐ {item.rating}/5</Text>
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
                                <Ionicons name="search-outline" size={50} color={COLORS.subtitleLight} />
                                <Text style={styles.emptyText}>No services found</Text>
                                <Text style={styles.emptySubText}>Try clearing your filters or search keywords</Text>
                                <TouchableOpacity 
                                    style={styles.resetFilterBtn} 
                                    onPress={() => { setSearch(""); setSelectedCategory(""); setSortBy("default"); }}
                                >
                                    <Text style={styles.resetFilterText}>Reset Filters</Text>
                                </TouchableOpacity>
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
        fontFamily: FONTS.bold,
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
        fontFamily: FONTS.medium,
    },
    filterWrapper: {
        marginTop: 10,
        backgroundColor: "transparent",
    },
    filterContainer: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: COLORS.cards,
        borderWidth: 1,
        borderColor: COLORS.border,
        height: 34,
        justifyContent: "center",
        alignItems: "center",
    },
    filterChipActive: {
        backgroundColor: COLORS.header,
        borderColor: COLORS.header,
    },
    filterText: {
        fontSize: 12,
        fontFamily: FONTS.semibold,
        color: COLORS.subtitle,
    },
    filterTextActive: {
        color: "#fff",
    },
    sortRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        marginVertical: 10,
        gap: 6,
        backgroundColor: "transparent",
    },
    sortLabel: {
        fontSize: 12,
        fontFamily: FONTS.semibold,
        color: COLORS.subtitle,
    },
    sortChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: COLORS.cards,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sortChipActive: {
        backgroundColor: COLORS.headerMid,
        borderColor: COLORS.headerMid,
    },
    sortChipText: {
        fontSize: 10,
        fontFamily: FONTS.medium,
        color: COLORS.subtitle,
    },
    sortChipTextActive: {
        color: "#fff",
        fontFamily: FONTS.bold,
    },
    reviewsSection: {
        marginTop: 2,
        marginBottom: 4,
        backgroundColor: "transparent",
    },
    reviewsSectionTitle: {
        fontSize: 15,
        fontFamily: FONTS.extrabold,
        color: COLORS.text,
        marginBottom: 6,
        marginHorizontal: 16,
    },
    reviewsListContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
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
        marginTop: 4,
        gap: 4,
        backgroundColor: "transparent",
    },
    ratingReviewText: {
        fontSize: 12,
        fontFamily: FONTS.semibold,
        color: COLORS.subtitle,
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
        fontSize: 16,
        fontFamily: FONTS.extrabold,
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
        fontFamily: FONTS.bold,
        fontSize: 12,
    },
    empty: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 50,
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
        color: COLORS.subtitle,
        fontFamily: FONTS.regular,
        marginTop: 4,
        textAlign: "center",
    },
    resetFilterBtn: {
        marginTop: 14,
        backgroundColor: COLORS.header,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    resetFilterText: {
        color: "#fff",
        fontFamily: FONTS.bold,
        fontSize: 12,
    },
});