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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ⚠️ প্রয়োজনীয় স্টেট দুটি এখানে যুক্ত করা হলো
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

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


  // ================= REAL-TIME EMAIL CHANGE =================
  const handleEmailChange = (text) => {
    setEmail(text);
    if (!text.trim()) {
      setEmailError("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(text)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  // ================= REAL-TIME PASSWORD CHANGE =================
  const handlePasswordChange = (text) => {
    setPassword(text);
    if (!text) {
      setPasswordError("Password is required");
    } else if (text.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    let isValid = true;

    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    }
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    }

    if (!isValid || emailError || passwordError) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `https://jnushebaserver.onrender.com/users/${email.trim()}`
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Login Failed", data.message || "User not found");
        setLoading(false);
        return;
      }

      // ❗ PASSWORD CHECK
      if (data.password && data.password !== password) {
        setPasswordError("Wrong password");
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
          <View style={[styles.inputBox, emailError ? styles.errorBorder : null]}>
            <MaterialIcons name="email" size={20} color="#888" />
            <TextInput
              placeholder="Enter email"
              style={styles.input}
              value={email}
              onChangeText={handleEmailChange}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          {/* PASSWORD */}
          <Text style={styles.label}>PASSWORD</Text>
          <View style={[styles.inputBox, passwordError ? styles.errorBorder : null]}>
            <MaterialIcons name="lock" size={20} color="#888" />
            <TextInput
              placeholder="Enter password"
              style={styles.input}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={handlePasswordChange}
            />

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

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
    borderWidth: 1,
    borderColor: "transparent",
  },

  errorBorder: {
    borderColor: "#f43f5e",
  },

  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 15,
  },

  errorText: {
    color: "#f43f5e",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 4,
    marginLeft: 4,
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