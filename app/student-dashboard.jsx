import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function StudentDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await AsyncStorage.getItem("user_session");
        if (session) {
          setUser(JSON.parse(session));
        }
      } catch (e) {
        console.log(e);
      }
    };

    loadUser();
  }, []);

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <Text style={styles.greeting}>
        Hello 👋 {user?.name || "Student"}
      </Text>

      <Text style={styles.subtitle}>
        Welcome to your dashboard
      </Text>

      {/* STATS */}
      <View style={styles.cardRow}>

        <View style={styles.card}>
          <FontAwesome name="rocket" size={20} color="#3b82f6" />
          <Text style={styles.cardNumber}>14</Text>
          <Text style={styles.cardLabel}>Services Used</Text>
        </View>

        <View style={styles.card}>
          <FontAwesome name="star" size={20} color="#f59e0b" />
          <Text style={styles.cardNumber}>520</Text>
          <Text style={styles.cardLabel}>Reward Points</Text>
        </View>

      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actions}>

        <TouchableOpacity style={styles.button}>
          <FontAwesome name="search" size={18} color="#fff" />
          <Text style={styles.btnText}>Find Services</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: "#10b981" }]}>
          <FontAwesome name="history" size={18} color="#fff" />
          <Text style={styles.btnText}>Service History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: "#64748b" }]}>
          <FontAwesome name="user" size={18} color="#fff" />
          <Text style={styles.btnText}>My Profile</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 20,
  },

  greeting: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 10,
  },

  subtitle: {
    color: "#64748b",
    marginBottom: 20,
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 5,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 3,
  },

  cardNumber: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 8,
    color: "#0f172a",
  },

  cardLabel: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },

  actions: {
    marginTop: 30,
    gap: 12,
  },

  button: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  btnText: {
    color: "#fff",
    fontWeight: "800",
  },
});