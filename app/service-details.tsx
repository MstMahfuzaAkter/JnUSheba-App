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
            console.log(err);
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

    // ================= CANCEL BOOKING =================
    const cancelBooking = async () => {
        try {
            const session = await AsyncStorage.getItem("user_session");

            if (!session) {
                Alert.alert("Login Required");
                return;
            }

            const user = JSON.parse(session);

            Alert.alert(
                "Cancel Booking",
                "Are you sure you want to cancel?",
                [
                    {
                        text: "No",
                        style: "cancel",
                    },

                    {
                        text: "Yes",
                        style: "destructive",

                        onPress: async () => {
                            try {
                                const res = await fetch(
                                    `${API}/bookings/${bookingIdDoc}`,
                                    {
                                        method: "DELETE",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },

                                        body: JSON.stringify({
                                            email: user.email,
                                        }),
                                    }
                                );

                                const data = await res.json();

                                if (data.success) {
                                    setIsBooked(false);
                                    setBookingIdDoc("");

                                    Alert.alert("Success", "Booking cancelled");
                                } else {
                                    Alert.alert("Failed", data.message);
                                }
                            } catch (err) {
                                console.log(err);
                                Alert.alert("Error", "Something went wrong");
                            }
                        },
                    },
                ]
            );
        } catch (err) {
            console.log(err);
        }
    };

    // ================= LOADING =================
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    // ================= NO SERVICE =================
    if (!service) {
        return (
            <View style={styles.center}>
                <Text>Service not found</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <StatusBar barStyle="dark-content" />

            {/* HEADER CARD */}
            <View style={styles.heroCard}>
                <View style={styles.topRow}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>
                            {service.category}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.statusBadge,
                            isBooked
                                ? styles.bookedBadge
                                : styles.notBookedBadge,
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                {
                                    color: isBooked
                                        ? "#166534"
                                        : "#991b1b",
                                },
                            ]}
                        >
                            {isBooked ? "Booked" : "Available"}
                        </Text>
                    </View>
                </View>

                <Text style={styles.title}>
                    {service.title}
                </Text>

                <Text style={styles.price}>
                    ৳ {service.price}
                </Text>

                <View style={styles.infoRow}>
                    <Ionicons
                        name="location-outline"
                        size={18}
                        color="#64748b"
                    />

                    <Text style={styles.infoText}>
                        {service.location}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons
                        name="mail-outline"
                        size={18}
                        color="#64748b"
                    />

                    <Text style={styles.infoText}>
                        {service.providerEmail}
                    </Text>
                </View>

                {service.phone && (
                    <View style={styles.infoRow}>
                        <Ionicons
                            name="call-outline"
                            size={18}
                            color="#64748b"
                        />

                        <Text style={styles.infoText}>
                            {service.phone}
                        </Text>
                    </View>
                )}
            </View>

            {/* DESCRIPTION */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                    Description
                </Text>

                <Text style={styles.description}>
                    {service.description}
                </Text>
            </View>

            {/* ACTIONS */}
            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={styles.callBtn}
                    activeOpacity={0.8}
                    onPress={handleCall}
                >
                    <Ionicons
                        name="call"
                        size={20}
                        color="#fff"
                    />

                    <Text style={styles.btnText}>
                        Call Now
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.chatBtn}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/chat/${id}`)}
                >
                    <Ionicons
                        name="chatbubble"
                        size={20}
                        color="#fff"
                    />

                    <Text style={styles.btnText}>
                        Chat
                    </Text>
                </TouchableOpacity>
            </View>

            {/* CANCEL */}
            {isBooked && (
                <TouchableOpacity
                    style={styles.cancelBtn}
                    activeOpacity={0.8}
                    onPress={cancelBooking}
                >
                    <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#fff"
                    />

                    <Text style={styles.btnText}>
                        Cancel Booking
                    </Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

// ================= STYLES =================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
        padding: 16,
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },

    heroCard: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },

    categoryBadge: {
        backgroundColor: "#dbeafe",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 50,
    },

    categoryText: {
        color: "#2563eb",
        fontWeight: "700",
        textTransform: "capitalize",
    },

    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 50,
    },

    bookedBadge: {
        backgroundColor: "#dcfce7",
    },

    notBookedBadge: {
        backgroundColor: "#fee2e2",
    },

    statusText: {
        fontWeight: "700",
    },

    title: {
        fontSize: 26,
        fontWeight: "800",
        color: "#0f172a",
        marginBottom: 10,
    },

    price: {
        fontSize: 28,
        fontWeight: "800",
        color: "#2563eb",
        marginBottom: 16,
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },

    infoText: {
        marginLeft: 10,
        color: "#475569",
        fontSize: 15,
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 20,

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
        color: "#0f172a",
    },

    description: {
        color: "#475569",
        lineHeight: 24,
        fontSize: 15,
    },

    actionRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 20,
    },

    callBtn: {
        flex: 1,
        backgroundColor: "#16a34a",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
        borderRadius: 18,
        gap: 8,
    },

    chatBtn: {
        flex: 1,
        backgroundColor: "#2563eb",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
        borderRadius: 18,
        gap: 8,
    },

    cancelBtn: {
        backgroundColor: "#ef4444",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
        borderRadius: 18,
        marginTop: 14,
        gap: 8,
    },

    btnText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 15,
    },
});