import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View, RefreshControl } from "react-native";

const API = "https://jnushebaserver.onrender.com";

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
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
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions(true);
  }, []);

  // আরও প্রফেশনাল কালার কম্বিনেশন (Paid/Success এর জন্য রিচ এমারেল্ড টোন)
  const getStatusStyle = (status) => {
    const formattedStatus = (status || "Completed").toUpperCase();
    if (formattedStatus === "VALID" || formattedStatus === "SUCCESS" || formattedStatus === "COMPLETED" || formattedStatus === "PAID") {
      return { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0", icon: "check-circle" };
    } else if (formattedStatus === "FAILED" || formattedStatus === "CANCELLED") {
      return { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca", icon: "times-circle" };
    }
    return { bg: "#fffbeb", text: "#b45309", border: "#fde68a", icon: "clock-o" }; // Pending / Default
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Loading Transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Transaction History", 
          headerShown: true,
          headerStyle: { backgroundColor: "#ffffff" },
          headerTintColor: "#0f172a",
          headerTitleStyle: { fontWeight: "600", fontSize: 17 },
          headerShadowVisible: false,
        }} 
      />

      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <FontAwesome name="history" size={32} color="#0284c7" />
          </View>
          <Text style={styles.emptyTitle}>No Transactions Yet</Text>
          <Text style={styles.emptySubtitle}>Your transaction history will appear here once you make a payment.</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0284c7" />
          }
          renderItem={({ item }) => {
            const statusStyle = getStatusStyle(item.status);
            return (
              <View style={[styles.card, { borderColor: statusStyle.border }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.trxIdWrapper}>
                    <FontAwesome name="shield" size={12} color="#64748b" style={{ marginRight: 4 }} />
                    <Text style={styles.trxId} numberOfLines={1}>
                      ID: {item.tran_id || item._id}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <FontAwesome name={statusStyle.icon} size={11} color={statusStyle.text} style={{ marginRight: 4 }} />
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {item.status || "Completed"}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.amountLabel}>Total Amount</Text>
                  <Text style={styles.amount}>৳{item.total_amount || item.amount || 0}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.dateWrapper}>
                    <FontAwesome name="calendar-o" size={11} color="#94a3b8" style={{ marginRight: 5 }} />
                    <Text style={styles.date}>
                      {new Date(item.createdAt || Date.now()).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8fafc" 
  },
  loading: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#f8fafc" 
  },
  loadingText: { 
    marginTop: 12, 
    color: "#64748b", 
    fontSize: 14,
    fontWeight: "500" 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingHorizontal: 40 
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#1e293b",
    marginBottom: 6,
  },
  emptySubtitle: { 
    textAlign: "center",
    color: "#64748b", 
    fontSize: 14,
    lineHeight: 20,
  },
  listContainer: { 
    padding: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  cardHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginBottom: 12,
  },
  trxIdWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  trxId: { 
    fontSize: 12, 
    color: "#64748b", 
    fontWeight: "500" 
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: { 
    fontSize: 10, 
    fontWeight: "700",
    textTransform: "uppercase",
  },
  cardBody: {
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 11,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  amount: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: "#0f172a" 
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#f8fafc",
    paddingTop: 10,
  },
  dateWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: { 
    fontSize: 11, 
    color: "#94a3b8",
    fontWeight: "500" 
  },
});