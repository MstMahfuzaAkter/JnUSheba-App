import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://junsheba.vercel.app";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  // ================= LOAD BOOKINGS =================
  const loadBookings = async () => {
    try {
      setLoading(true);

      const session = await AsyncStorage.getItem("user_session");
      const user = JSON.parse(session);

      const res = await fetch(`${API}/bookings/user/${user.email}`);
      const data = await res.json();

      setBookings(data);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  // ================= UPDATE STATUS =================
  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", `Booking ${status}`);
        loadBookings();
      } else {
        Alert.alert("Error", data.message || "Update failed");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Something went wrong");
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  // ================= BADGE UI =================
  const StatusBadge = ({ status }) => {
    let color = "orange";

    if (status === "accepted") color = "green";
    if (status === "rejected") color = "red";

    return (
      <Text style={{ color, fontWeight: "bold", fontSize: 14 }}>
        {status.toUpperCase()}
      </Text>
    );
  };

  // ================= ITEM =================
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>📌 {item.serviceTitle}</Text>

      <Text style={styles.text}>
        Status: <StatusBadge status={item.status} />
      </Text>

      <Text style={styles.text}>Provider: {item.providerEmail}</Text>

      {/* ================= BUTTONS ================= */}
      {item.status === "pending" && (
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "green" }]}
            onPress={() => updateStatus(item._id, "accepted")}
          >
            <Text style={styles.btnText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "red" }]}
            onPress={() => updateStatus(item._id, "rejected")}
          >
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📦 My Bookings</Text>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={loadBookings}
      />
    </View>
  );
}

// ================= STYLE =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
    marginBottom: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  btnRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginRight: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});