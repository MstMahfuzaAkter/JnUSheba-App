import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Ionicons, MaterialIcons, AntDesign } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================= AUTO LOGIN =================
  useEffect(() => {
    const checkSession = async () => {
      const session = await AsyncStorage.getItem("user_session");

      if (!session) return;

      const user = JSON.parse(session);

      if (user.role === "admin") {
        router.replace("/admin-dashboard");

      } else if (user.role === "provider") {
        router.replace("/provider-dashboard");

      } else if (user.role === "student") {
        router.replace("/student-dashboard");

      } else {
        router.replace("/");
      }
    };

    checkSession();
  }, []);

  // ================= ROLE REDIRECT FUNCTION =================
  const redirectByRole = () => {
    router.replace("/");
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `https://junsheba.vercel.app/users/${email}`
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Login Failed", data.message || "User not found");
        setLoading(false);
        return;
      }

      // ❗ PASSWORD CHECK (basic)
      if (data.password && data.password !== password) {
        Alert.alert("Error", "Wrong password");
        setLoading(false);
        return;
      }

      // ================= SESSION =================
      const sessionData = {
        uid: data._id,
        name: data.name,
        email: data.email,
        role: data.role || "student",
        studentId: data.studentId || null,
        profileImage: data.profileImage || null,
      };

      await AsyncStorage.setItem(
        "user_session",
        JSON.stringify(sessionData)
      );

      Alert.alert("Success", "Login successful 🎉");

      // ================= REDIRECT =================
      redirectByRole(data.role);

    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>

          {/* LOGO */}
          <View style={styles.logoBox}>
            <Ionicons name="log-in-outline" size={34} color="#0A84FF" />
          </View>

          <Text style={styles.appName}>ShebaLink</Text>
          <Text style={styles.title}>WELCOME BACK</Text>
          <Text style={styles.subtitle}>Login to continue</Text>

          {/* EMAIL */}
          <Text style={styles.label}>EMAIL</Text>
          <View style={styles.inputBox}>
            <MaterialIcons name="email" size={20} color="#888" />
            <TextInput
              placeholder="Enter email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          {/* PASSWORD */}
          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.inputBox}>
            <MaterialIcons name="lock" size={20} color="#888" />
            <TextInput
              placeholder="Enter password"
              style={styles.input}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          {/* LOGIN BUTTON */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>LOGIN</Text>
            )}
          </TouchableOpacity>

          {/* REGISTER */}
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.footerText}>
              New user?{" "}
              <Text style={{ color: "#0A84FF", fontWeight: "bold" }}>
                Register now
              </Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6fb" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 25,
    elevation: 8,
  },

  logoBox: {
    alignSelf: "center",
    width: 65,
    height: 65,
    borderRadius: 18,
    backgroundColor: "#EAF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  appName: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#0A84FF",
  },

  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },

  subtitle: {
    textAlign: "center",
    fontSize: 13,
    color: "#777",
    marginBottom: 20,
  },

  label: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 15,
    color: "#555",
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 15,
    borderRadius: 15,
    marginTop: 8,
    height: 55,
  },

  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 15,
  },

  actionBtn: {
    backgroundColor: "#0A84FF",
    height: 55,
    borderRadius: 15,
    marginTop: 25,
    alignItems: "center",
    justifyContent: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  footerText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});