import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session = await AsyncStorage.getItem("user_session");
        if (session) {
          setUser(JSON.parse(session));
        }
      } catch (error) {
        console.error("Error loading session:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  // ইউজার না থাকলে লগইন এ পাঠিয়ে দেওয়া
  if (!user) {
    router.replace("/login");
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* 🔵 Dynamic Header */}
        <LinearGradient colors={["#1e3a8a", "#3b82f6"]} style={styles.header}>
          <Text style={styles.welcome}>Welcome Back, {user.name} 👋</Text>
          <Text style={styles.subtitle}>
            You are logged in as {user.role?.toUpperCase()}
          </Text>
        </LinearGradient>

        {/* 📊 Dynamic Stats based on Role */}
        <View style={styles.statsContainer}>
          {user.role === "student" ? (
            <>
              <StatCard icon="book" label="Applications" value="4" color="#22c55e" />
              <StatCard icon="users" label="Hired Tutors" value="1" color="#4b83f2" />
              <StatCard icon="star" label="My Reviews" value="12" color="#f59e0b" />
            </>
          ) : (
            <>
              <StatCard icon="briefcase" label="My Jobs" value="12" color="#22c55e" />
              <StatCard icon="money" label="Earnings" value="$250" color="#4b83f2" />
              <StatCard icon="star" label="Rating" value="4.8" color="#f59e0b" />
            </>
          )}
        </View>

        {/* ⚡ Dynamic Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          {user.role === "student" ? (
            <ActionButton 
                icon="search" 
                label="Find Tutor" 
                color="#4b83f2" 
                onPress={() => router.push("/tutors")} 
            />
          ) : (
            <ActionButton 
                icon="plus-circle" 
                label="Post Job" 
                color="#22c55e" 
                onPress={() => router.push("/post-job")} 
            />
          )}
          <ActionButton 
            icon="comments" 
            label="Messages" 
            color="#a855f7" 
            onPress={() => router.push("/messages")} 
          />
          <ActionButton 
            icon="user" 
            label="Profile" 
            color="#f97316" 
            onPress={() => router.push("/profile")} 
          />
          <ActionButton 
            icon="history" 
            label="History" 
            color="#64748b" 
            onPress={() => router.push("/history")} 
          />
        </View>

        {/* 📂 Relevant Services */}
        <Text style={styles.sectionTitle}>For You</Text>
        <ServiceCard 
          icon="shield" 
          title="Security Tips" 
          desc="Keep your profile updated and safe" 
          color="#ef4444" 
        />
        <ServiceCard 
          icon="support" 
          title="Help Center" 
          desc="Contact us for any assistance" 
          color="#06b6d4" 
        />

      </ScrollView>
    </SafeAreaView>
  );
}

// 🔹 Reusable Components
const StatCard = ({ icon, label, value, color }: any) => (
  <View style={styles.statCard}>
    <FontAwesome name={icon} size={20} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ActionButton = ({ icon, label, color, onPress }: any) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <View style={[styles.actionIcon, { backgroundColor: `${color}20` }]}>
      <FontAwesome name={icon} size={20} color={color} />
    </View>
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

const ServiceCard = ({ icon, title, desc, color }: any) => (
  <View style={styles.serviceCard}>
    <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
        <FontAwesome name={icon} size={20} color={color} />
    </View>
    <View style={{ marginLeft: 12 }}>
      <Text style={styles.serviceTitle}>{title}</Text>
      <Text style={styles.serviceDesc}>{desc}</Text>
    </View>
  </View>
);

// 🎨 Styles (Updated for Dynamic UI)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  header: { padding: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingBottom: 40 },
  welcome: { color: "#fff", fontSize: 24, fontWeight: "800" },
  subtitle: { color: "#e0f2fe", marginTop: 5, fontSize: 14, fontWeight: "500" },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", padding: 15, marginTop: -30 },
  statCard: { backgroundColor: "#fff", width: "31%", padding: 15, borderRadius: 20, alignItems: "center", elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  statValue: { fontSize: 18, fontWeight: "800", marginTop: 8, color: "#1e293b" },
  statLabel: { fontSize: 11, color: "#64748b", fontWeight: "600" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginHorizontal: 20, marginTop: 25, color: "#334155" },
  actionsContainer: { flexDirection: "row", flexWrap: "wrap", padding: 10, justifyContent: "space-around" },
  actionButton: { width: "23%", alignItems: "center", marginVertical: 10 },
  actionIcon: { width: 55, height: 55, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  actionText: { marginTop: 8, fontSize: 12, fontWeight: "600", color: "#475569" },
  serviceCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", marginHorizontal: 20, marginVertical: 8, padding: 18, borderRadius: 20, elevation: 2 },
  iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  serviceTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  serviceDesc: { fontSize: 12, color: "#64748b", marginTop: 2 },
});