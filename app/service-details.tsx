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
    const [bookingIdDoc, setBookingIdDoc] = useState("");

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

    // ================= CHECK BOOKED =================
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
                setBookingIdDoc(found._id);
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchService();
        checkBookedStatus();
    }, [id]);

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

    // ================= LOADING =================
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

            {/* ================= HERO IMAGE ================= */}
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

            {/* ================= MAIN CARD ================= */}
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

            {/* ================= DESCRIPTION ================= */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{service.description}</Text>
            </View>

            {/* ================= ACTION BUTTONS ================= */}
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
                    <Ionicons name="call" size={18} color="#fff" />
                    <Text style={styles.btnText}>Call</Text>
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

// ================= STYLES =================
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

    // HERO IMAGE
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

    // CARD
    card: {
        backgroundColor: "#fff",
        margin: 15,
        padding: 15,
        borderRadius: 16,
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
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 8,
    },

    description: {
        color: "#64748b",
        lineHeight: 22,
    },

    // BUTTONS
    actionRow: {
        flexDirection: "row",
        margin: 15,
        gap: 10,
    },

    callBtn: {
        flex: 1,
        backgroundColor: "#16a34a",
        padding: 14,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
    },

    chatBtn: {
        flex: 1,
        backgroundColor: "#2563eb",
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
    },
});