import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  Alert,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { height } = useWindowDimensions();

  const slideAnim = useRef(new Animated.Value(-500)).current;

  useEffect(() => {
    const checkUser = async () => {
      const session = await AsyncStorage.getItem("user_session");
      if (session) {
        setUser(JSON.parse(session));
      } else {
        setUser(null);
      }
    };
    checkUser();
  }, [menuVisible]);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: menuVisible ? 0 : -500,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [menuVisible]);

  const handleNavigate = (path: string) => {
    setMenuVisible(false);
    router.push(path);
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive", 
        onPress: async () => {
          await AsyncStorage.removeItem("user_session");
          setUser(null);
          router.replace("/login");
        } 
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#1e3a8a", "#3b82f6"]} style={styles.headerContainer}>
        <Pressable
          style={styles.iconButton}
          onPress={() => setMenuVisible(!menuVisible)}
          hitSlop={15}
        >
          <FontAwesome name={menuVisible ? "times" : "bars"} size={22} color="#ffffff" />
        </Pressable>

        <Text style={styles.title}>{title}</Text>

        <Pressable 
          style={styles.iconButton} 
          onPress={() => handleNavigate(user ? "/profile" : "/login")}
          hitSlop={15}
        >
          <FontAwesome name={user ? "user-circle" : "sign-in"} size={22} color="#ffffff" />
        </Pressable>
      </LinearGradient>

      {menuVisible && (
        <View style={[styles.dropdownOverlay, { height }]}>
          <TouchableOpacity activeOpacity={1} style={styles.dropdownBackground} onPress={() => setMenuVisible(false)} />

          <Animated.View style={[styles.dropdownMenuWrapper, { transform: [{ translateY: slideAnim }] }]}>
            <BlurView intensity={60} tint="light" style={styles.dropdownMenu}>
              
              {user ? (
                <>
                  <TouchableOpacity style={styles.profileSummary} onPress={() => handleNavigate("/profile")}>
                    <View style={styles.avatarPlaceholder}>
                      <FontAwesome name="user" size={24} color="#1e3a8a" />
                    </View>
                    <View>
                      <Text style={styles.userName}>{user.name}</Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                    </View>
                    <FontAwesome name="chevron-right" size={12} color="#94a3b8" style={styles.chevron} />
                  </TouchableOpacity>
                  <View style={styles.divider} />
                </>
              ) : (
                <View style={styles.guestHeader}>
                   <Text style={styles.guestTitle}>Welcome to ShebaLink</Text>
                   <Text style={styles.guestSub}>Login to access all services</Text>
                </View>
              )}

              {/* Navigation Items */}
              <MenuLink icon="home" label="Home" color="#4b83f2" onPress={() => handleNavigate("/")} />
              
              {/* --- DASHBOARD OPTION (Added) --- */}
              {user && (
                <MenuLink icon="th-large" label="Dashboard" color="#0092b8" onPress={() => handleNavigate("/dashboard")} />
              )}

              <MenuLink icon="info-circle" label="About Platform" color="#10b981" onPress={() => handleNavigate("/about")} />
              
              {user ? (
                <>
                  <View style={styles.divider} />
                  <MenuLink icon="gears" label="Settings" color="#64748b" onPress={() => handleNavigate("/settings")} />
                  <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
                    <View style={[styles.iconBox, { backgroundColor: "#fef2f2" }]}>
                      <FontAwesome name="sign-out" size={20} color="#ef4444" />
                    </View>
                    <Text style={[styles.menuText, { color: "#ef4444" }]}>Logout</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.divider} />
                  <MenuLink icon="sign-in" label="Login / Register" color="#1e3a8a" onPress={() => handleNavigate("/login")} />
                </>
              )}
            </BlurView>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const MenuLink = ({ icon, label, color, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.iconBox, { backgroundColor: `${color}10` }]}>
      <FontAwesome name={icon} size={18} color={color} />
    </View>
    <Text style={styles.menuText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { zIndex: 100 },
  headerContainer: { height: 70, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, elevation: 4 },
  title: { color: "#f8fafc", fontSize: 18, fontWeight: "700" },
  iconButton: { padding: 5, width: 40, alignItems: "center" },
  dropdownOverlay: { position: "absolute", top: 70, left: 0, right: 0, zIndex: 100 },
  dropdownBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15, 23, 42, 0.4)" },
  dropdownMenuWrapper: { overflow: "hidden" },
  dropdownMenu: { backgroundColor: "rgba(255, 255, 255, 0.95)", borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingVertical: 15 },
  profileSummary: { flexDirection: "row", alignItems: "center", paddingHorizontal: 22, paddingVertical: 15 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#e2e8f0", justifyContent: "center", alignItems: "center", marginRight: 15 },
  userName: { fontSize: 18, fontWeight: "800", color: "#1e2937" },
  userEmail: { fontSize: 13, color: "#64748b" },
  guestHeader: { paddingHorizontal: 22, paddingVertical: 15 },
  guestTitle: { fontSize: 18, fontWeight: "800", color: "#1e3a8a" },
  guestSub: { fontSize: 13, color: "#64748b" },
  chevron: { marginLeft: "auto" },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 10, marginHorizontal: 22 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 22 },
  logoutItem: { marginTop: 5 },
  iconBox: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 16 },
  menuText: { color: "#334155", fontSize: 16, fontWeight: "600" },
});