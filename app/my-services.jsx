import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const API = "https://jnushebaserver.onrender.com";

export default function MyServices() {
    const router = useRouter();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    // ===== EDIT STATE =====
    const [modalVisible, setModalVisible] = useState(false);
    const [selected, setSelected] = useState(null);

    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const session = await AsyncStorage.getItem("user_session");
            const user = JSON.parse(session);
            if (!user) return;

            const res = await fetch(`${API}/services/provider/${user.email}`);
            const data = await res.json();

            setServices(data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // ================= DELETE =================
    const deleteService = async (id) => {
        Alert.alert("Delete", "Are you sure?", [
            { text: "Cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        const res = await fetch(`${API}/services/${id}`, {
                            method: "DELETE",
                        });

                        const data = await res.json();

                        if (data.success) {
                            setServices((prev) =>
                                prev.filter((item) => item._id !== id)
                            );
                        }
                    } catch (err) {
                        Alert.alert("Error", "Delete failed");
                    }
                },
            },
        ]);
    };

    // ================= OPEN EDIT =================
    const openEdit = (item) => {
        setSelected(item);
        setTitle(item.title);
        setPrice(String(item.price));
        setDescription(item.description || "");
        setCategory(item.category || "");
        setLocation(item.location || "");
        setPhone(item.phone || "");
        setModalVisible(true);
    };

    // ================= UPDATE =================
    const updateService = async () => {
        if (!selected) return;

        try {
            const res = await fetch(`${API}/services/${selected._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    price: Number(price),
                    description,
                    category,
                    location,
                    phone,
                }),
            });

            const data = await res.json();

            if (data.success) {
                Alert.alert("Success", "Service Updated 🎉");
                setModalVisible(false);
                loadServices();
            } else {
                Alert.alert("Error", data.message || "Update failed");
            }
        } catch (err) {
            Alert.alert("Error", "Update failed");
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.priceTag}>৳ {item.price}</Text>
            </View>

            <Text style={styles.descText} numberOfLines={2}>
                {item.description || "No description provided."}
            </Text>

            {/* CHAT BUTTON */}
            <TouchableOpacity
                style={styles.chatBtn}
                onPress={() =>
                    router.push({
                        pathname: `/chat/${item._id}`,
                        params: { receiver: item.providerEmail },
                    })
                }
                activeOpacity={0.8}
            >
                <Ionicons name="chatbubbles-outline" size={16} color="#4f46e5" />
                <Text style={styles.chatBtnText}>Open Chat Room</Text>
            </TouchableOpacity>

            <View style={styles.row}>
                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => openEdit(item)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="create-outline" size={16} color="#fff" />
                    <Text style={styles.btnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteService(item._id)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                    <Text style={styles.btnText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>My Services</Text>

            <FlatList
                data={services}
                keyExtractor={(i) => i._id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            />

            {/* ================= EDIT MODAL ================= */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalBg}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Edit Service</Text>

                        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor="#94a3b8" />
                        <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="Price" keyboardType="numeric" placeholderTextColor="#94a3b8" />
                        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor="#94a3b8" />
                        <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Category" placeholderTextColor="#94a3b8" />
                        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Location" placeholderTextColor="#94a3b8" />
                        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor="#94a3b8" />

                        <TouchableOpacity style={styles.saveBtn} onPress={updateService} activeOpacity={0.8}>
                            <Text style={{ color: "#fff", fontWeight: "700" }}>
                                Save Changes
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 12 }}>
                            <Text style={{ textAlign: "center", color: "#64748b", fontWeight: "600" }}>
                                Cancel
                            </Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ================= STYLES =================
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#f8fafc" },
    header: { fontSize: 22, fontWeight: "800", marginBottom: 12, color: "#0f172a" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    card: {
        backgroundColor: "#fff",
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    title: {
        fontWeight: "700",
        fontSize: 16,
        color: "#0f172a",
        flex: 1,
    },
    priceTag: {
        fontWeight: "800",
        fontSize: 15,
        color: "#4f46e5",
    },
    descText: {
        color: "#64748b",
        fontSize: 13,
        marginBottom: 10,
    },
    chatBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e0e7ff",
        paddingVertical: 8,
        borderRadius: 10,
        gap: 6,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#c7d2fe",
    },
    chatBtnText: {
        color: "#4f46e5",
        fontSize: 12,
        fontWeight: "700",
    },
    row: {
        flexDirection: "row",
        gap: 10,
    },
    editBtn: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#10b981",
        padding: 10,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    deleteBtn: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#ef4444",
        padding: 10,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    btnText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 13,
    },
    modalBg: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 20,
    },
    modalCard: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 14,
        color: "#0f172a",
    },
    input: {
        borderWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: "#f8fafc",
        padding: 12,
        marginBottom: 10,
        borderRadius: 10,
        color: "#0f172a",
        fontSize: 14,
    },
    saveBtn: {
        backgroundColor: "#4f46e5",
        padding: 14,
        alignItems: "center",
        borderRadius: 10,
        marginTop: 6,
    },
});