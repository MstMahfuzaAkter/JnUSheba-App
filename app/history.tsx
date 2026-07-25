import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

const API = "https://jnushebaserver.onrender.com";

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      if (!session) return;
      const user = JSON.parse(session);

      let endpoint = "";
      if (user.role === "admin") {
        endpoint = `${API}/admin/transactions`;
      } else if (user.role === "provider") {
        endpoint = `${API}/provider/transactions/${user.email}`;
      } else {
        endpoint = `${API}/user/transactions/${user.email}`;
      }

      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.log("Transaction Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 10, color: "#64748b" }}>Loading Transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Transaction History", headerShown: true }} />

      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="history" size={40} color="#cbd5e1" />
          <Text style={styles.emptyText}>No transaction history found.</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.trxId}>TrxID: {item.tran_id || item._id}</Text>
                <Text style={[styles.status, { color: item.status === "VALID" ? "#16a34a" : "#dc2626" }]}>
                  {item.status || "Completed"}
                </Text>
              </View>
              <Text style={styles.amount}>Amount: ৳{item.total_amount || item.amount || 0}</Text>
              <Text style={styles.date}>{new Date(item.createdAt || Date.now()).toLocaleString()}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { marginTop: 10, color: "#64748b", fontSize: 15 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  trxId: { fontSize: 12, color: "#64748b", fontWeight: "600" },
  status: { fontSize: 12, fontWeight: "bold" },
  amount: { fontSize: 16, fontWeight: "bold", color: "#0f172a", marginBottom: 4 },
  date: { fontSize: 11, color: "#94a3b8" },
});