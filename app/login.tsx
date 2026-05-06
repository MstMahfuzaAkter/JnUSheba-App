import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
} from "react-native";

// Imports for Auth & Storage
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ১. চেক করা ইউজার আগে থেকেই লগইন কি না
  useEffect(() => {
    const checkSession = async () => {
      const session = await AsyncStorage.getItem("user_session");
      if (session) {
        router.replace("/home"); // সেশন থাকলে সরাসরি হোমে চলে যাবে
      }
    };
    checkSession();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      // ২. Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ৩. সেশন ডেটা তৈরি
      const sessionData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || email.split('@')[0],
      };

      // ৪. সেশন লোকাল স্টোরেজে সেভ করা
      await AsyncStorage.setItem("user_session", JSON.stringify(sessionData));

      Alert.alert("Success", "Login successful ✅");
      
      // ৫. হোমপেজে পাঠানো
      router.replace("/(tabs)");

    } catch (error: any) {
      console.error("Firebase Error:", error);
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.logoBox}>
            <Ionicons name="construct" size={34} color="#0A84FF" />
          </View>
          <Text style={styles.appName}>JNU ShebaLink</Text>
          <Text style={styles.title}>WELCOME BACK</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <View style={styles.inputBox}>
            <MaterialIcons name="email" size={20} color="#888" />
            <TextInput
              placeholder="Enter your email"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

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

          <TouchableOpacity style={styles.actionBtn} onPress={handleLogin}>
            <Text style={styles.btnText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR LOGIN WITH</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.googleBtn}>
            <AntDesign name="google" size={20} color="#DB4437" />
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 20 }}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.footerText}>
              New user?{" "}
              <Text style={{ color: "#0A84FF", fontWeight: "bold" }}>
                Sign up now
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6fb" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  logoBox: {
    alignSelf: "center",
    width: 65,
    height: 65,
    borderRadius: 18,
    backgroundColor: "#EAF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  appName: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#0A84FF",
    marginBottom: 5,
  },
  title: { textAlign: "center", fontSize: 18, fontWeight: "bold", color: "#333" },
  subtitle: { textAlign: "center", fontSize: 14, color: "#777", marginBottom: 20 },
  label: { fontSize: 11, fontWeight: "700", color: "#555", marginTop: 15 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 15,
    borderRadius: 15,
    marginTop: 8,
    height: 55,
  },
  input: { flex: 1, paddingHorizontal: 10, fontSize: 15 },
  actionBtn: {
    backgroundColor: "#0A84FF",
    height: 55,
    borderRadius: 15,
    marginTop: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16, letterSpacing: 1 },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: "#EEE" },
  orText: { marginHorizontal: 10, fontSize: 11, color: "#AAA", fontWeight: "600" },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
    height: 55,
    borderRadius: 15,
    gap: 12,
  },
  googleText: { fontWeight: "700", color: "#444" },
  footerText: { textAlign: "center", fontSize: 14, color: "#666" },
});