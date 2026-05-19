import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen({ navigation }) {
  const [darkMode, setDarkMode] = useState(false);
  const [notification, setNotification] = useState(true);
  const [location, setLocation] = useState(true);

  const handleLogout = () => {
    Alert.alert("Logout", "Do you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          // এখানে AsyncStorage clear বা token remove করবে
          navigation.replace("Login");
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* PROFILE SECTION */}
      <View style={styles.card}>
        <Ionicons name="person-circle" size={60} color="#4f46e5" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.name}>Your Name</Text>
          <Text style={styles.email}>your@email.com</Text>
        </View>
      </View>

      {/* SETTINGS OPTIONS */}
      <View style={styles.cardRow}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      <View style={styles.cardRow}>
        <Text style={styles.label}>Notifications</Text>
        <Switch value={notification} onValueChange={setNotification} />
      </View>

      <View style={styles.cardRow}>
        <Text style={styles.label}>Location Access</Text>
        <Switch value={location} onValueChange={setLocation} />
      </View>

      {/* NAV OPTIONS */}
      <TouchableOpacity style={styles.menuItem}>
        <Ionicons name="lock-closed-outline" size={22} />
        <Text style={styles.menuText}>Privacy Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <Ionicons name="help-circle-outline" size={22} />
        <Text style={styles.menuText}>Help & Support</Text>
      </TouchableOpacity>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 15,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  email: {
    color: "gray",
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 15,
  },

  logoutBtn: {
    flexDirection: "row",
    backgroundColor: "red",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    justifyContent: "center",
  },
  logoutText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "bold",
  },
});