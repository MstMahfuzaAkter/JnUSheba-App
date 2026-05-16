import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";

import { Text } from "react-native";
import { Stack, useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await AsyncStorage.getItem("user_session");

        if (!session) {
          router.replace("/login");
          return;
        }

        const parsed = JSON.parse(session);
        setUser(parsed);
        setGreeting(getGreeting());
      } catch (error) {
        await AsyncStorage.removeItem("user_session");
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("user_session");
          router.replace("/login");
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!user) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen
        options={{
          title: "",
          headerTransparent: true,
          headerRight: () => (
            <TouchableOpacity style={styles.headerActionBtn}>
              <FontAwesome name="bell-o" size={18} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* HEADER */}
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#3b82f6"]}
        style={styles.headerBackground}
      >
        <View style={styles.profileHeader}>
          <Text style={styles.greetingText}>{greeting},</Text>

          <View style={styles.avatarWrapper}>
            <View style={styles.statusRing} />

            <Image
              source={{
                uri: user.profileImage
                  ? user.profileImage
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name
                    )}`,
              }}
              style={styles.avatar}
            />
          </View>

          <Text style={styles.userName}>{user.name}</Text>

          <Text style={styles.userRole}>
            {user.role || "User"} • ID: {user.studentId || "N/A"}
          </Text>
        </View>
      </LinearGradient>

      {/* STATS */}
      <View style={styles.statsCard}>
        <StatItem label="Used Services" value="14" icon="rocket" />
        <View style={styles.statDivider} />
        <StatItem label="Reward Points" value="520" icon="diamond" />
      </View>

      {/* SETTINGS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <SettingLink
          icon="user-o"
          label="Edit Profile"
          onPress={() => router.push("/edit-profile")}
        />
        <SettingLink icon="history" label="Service History" onPress={() => {}} />
        <SettingLink icon="lock" label="Privacy & Security" onPress={() => {}} />
      </View>

      {/* SUPPORT */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingLink icon="question-circle-o" label="Help Center" onPress={() => {}} />
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LinearGradient
          colors={["#fee2e2", "#ffffff"]}
          style={styles.logoutGradient}
        >
          <FontAwesome name="sign-out" size={18} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.versionText}>Version 1.0.4</Text>
    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */

const StatItem = ({ label, value, icon }) => (
  <View style={styles.statItem}>
    <View style={styles.statIconCircle}>
      <FontAwesome name={icon} size={14} color="#3b82f6" />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const SettingLink = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.iconWrapper}>
      <FontAwesome name={icon} size={18} color="#1e3a8a" />
    </View>
    <Text style={styles.settingLabel}>{label}</Text>
    <FontAwesome name="angle-right" size={18} color="#94a3b8" />
  </TouchableOpacity>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  headerActionBtn: {
    marginRight: 15,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
  },

  headerBackground: {
    height: 340,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 60,
  },

  profileHeader: {
    alignItems: "center",
  },

  greetingText: {
    color: "#e2e8f0",
    fontSize: 16,
  },

  avatarWrapper: {
    marginTop: 20,
  },

  statusRing: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: "#60a5fa",
    opacity: 0.4,
  },

  avatar: {
    width: 115,
    height: 115,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
  },

  userName: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 10,
    letterSpacing: 0.5,
  },

  userRole: {
    color: "#cbd5e1",
    fontSize: 13,
  },

  statsCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 25,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statIconCircle: {
    backgroundColor: "#eff6ff",
    padding: 8,
    borderRadius: 10,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 4,
  },

  statLabel: {
    fontSize: 10,
    color: "#94a3b8",
  },

  statDivider: {
    width: 1,
    backgroundColor: "#e2e8f0",
  },

  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    marginBottom: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  iconWrapper: {
    width: 40,
    height: 40,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginRight: 10,
  },

  settingLabel: {
    flex: 1,
    fontWeight: "600",
  },

  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 25,
  },

  logoutGradient: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  logoutText: {
    color: "#ef4444",
    fontWeight: "800",
    marginLeft: 8,
  },

  versionText: {
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
    color: "#94a3b8",
    fontSize: 11,
  },
});