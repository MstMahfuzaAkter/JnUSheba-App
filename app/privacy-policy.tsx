import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme_mode");
      if (savedTheme === "dark") {
        setDarkMode(true);
      }
    } catch (err) {
      console.log("Error loading theme:", err);
    }
  };

  const currentTheme = darkMode ? darkStyles : lightStyles;

  return (
    <ScrollView style={[styles.container, currentTheme.container]} showsVerticalScrollIndicator={false}>
      
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={darkMode ? "#f8fafc" : "#0f172a"} />
        </TouchableOpacity>
        <Text style={[styles.title, currentTheme.textPrimary]}>Privacy Policy</Text>
        <View style={{ width: 36 }} />
      </View>

      <Text style={[styles.lastUpdated, currentTheme.textSecondary]}>Last updated: July 2026</Text>

      {/* CONTENT CARD */}
      <View style={[styles.card, currentTheme.card]}>
        
        <Text style={[styles.sectionTitle, currentTheme.textPrimary]}>1. Introduction</Text>
        <Text style={[styles.paragraph, currentTheme.textSecondary]}>
          Welcome to our campus service platform. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our mobile application.
        </Text>

        <Text style={[styles.sectionTitle, currentTheme.textPrimary]}>2. Information We Collect</Text>
        <Text style={[styles.paragraph, currentTheme.textSecondary]}>
          - **Account Information:** Name, university email address, and authentication details when you sign up.{"\n"}
          - **Service Data:** Information regarding services you post, book, or review.{"\n"}
          - **Device & Usage Data:** Preferences like dark mode status, notification settings, and location permissions to enhance app performance.
        </Text>

        <Text style={[styles.sectionTitle, currentTheme.textPrimary]}>3. How We Use Your Information</Text>
        <Text style={[styles.paragraph, currentTheme.textSecondary]}>
          We use the collected information to:{"\n"}
          - Facilitate service bookings and campus communications.{"\n"}
          - Maintain account security and manage user sessions.{"\n"}
          - Send relevant push notifications and app updates (if enabled).{"\n"}
          - Improve overall app experience and feature performance.
        </Text>

        <Text style={[styles.sectionTitle, currentTheme.textPrimary]}>4. Data Security & Storage</Text>
        <Text style={[styles.paragraph, currentTheme.textSecondary]}>
          Your session tokens and personal preferences are securely stored locally using AsyncStorage. We take reasonable measures to protect your information against unauthorized access or disclosure.
        </Text>

        <Text style={[styles.sectionTitle, currentTheme.textPrimary]}>5. Contact Us</Text>
        <Text style={[styles.paragraph, currentTheme.textSecondary]}>
          If you have any questions or concerns regarding this Privacy Policy, feel free to reach out through our Help & Support section inside the app.
        </Text>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 6,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  lastUpdated: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    padding: 20,
    borderRadius: 14,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 14,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "400",
    marginBottom: 10,
  },
});

const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: "#f8fafc",
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  textPrimary: {
    color: "#0f172a",
  },
  textSecondary: {
    color: "#64748b",
  },
});

const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: "#0f172a",
  },
  card: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  textPrimary: {
    color: "#f8fafc",
  },
  textSecondary: {
    color: "#94a3b8",
  },
});