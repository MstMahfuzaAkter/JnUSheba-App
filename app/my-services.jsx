import AsyncStorage from "@react-native-async-storage/async-storage";
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
            <Text style={styles.title}>{item.title}</Text>
            <Text>৳ {item.price}</Text>

            <Text style={{ color: "#666" }} numberOfLines={2}>
                {item.description}
            </Text>

            <View style={styles.row}>
                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => openEdit(item)}
                >
                    <Text style={{ color: "#fff" }}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteService(item._id)}
                >
                    <Text style={{ color: "#fff" }}>Delete</Text>
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
            />

            {/* ================= EDIT MODAL ================= */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalBg}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Edit Service</Text>

                        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Title" />
                        <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="Price" keyboardType="numeric" />
                        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Description" />
                        <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Category" />
                        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Location" />
                        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" />

                        <TouchableOpacity style={styles.saveBtn} onPress={updateService}>
                            <Text style={{ color: "#fff", fontWeight: "700" }}>
                                Save Changes
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={{ textAlign: "center", marginTop: 10 }}>
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
    container: { flex: 1, padding: 15, backgroundColor: "#f8fafc" },

    header: { fontSize: 22, fontWeight: "800", marginBottom: 10 },

    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    card: {
        backgroundColor: "#fff",
        padding: 15,
        marginBottom: 10,
        borderRadius: 12,
    },

    title: {
        fontWeight: "700",
        fontSize: 16,
    },

    row: {
        flexDirection: "row",
        marginTop: 10,
        gap: 10,
    },

    editBtn: {
        flex: 1,
        backgroundColor: "#10b981",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
    },

    deleteBtn: {
        flex: 1,
        backgroundColor: "#ef4444",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
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
        borderRadius: 15,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 10,
    },

    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 10,
        marginBottom: 10,
        borderRadius: 8,
    },

    saveBtn: {
        backgroundColor: "#3b82f6",
        padding: 12,
        alignItems: "center",
        borderRadius: 8,
    },
});