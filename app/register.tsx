import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("student");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  // ================= IMAGE PICK =================
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // ================= REGISTER =================
  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert("Fill all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://junsheba.vercel.app/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          studentId: role === "student" ? studentId : null,
          profileImage,
          createdAt: new Date(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Server Error");
        return;
      }

      alert("Account Created Successfully 🎉");

      // ✅ SAFE ROLE CHECK (fallback)
      // const userRole = data.role || role;

      // if (userRole === "admin") {
      //   router.replace("/admin-dashboard");
      // } else {
      //   router.replace("/student-dashboard");
      // }
      router.replace("/");

    } catch (error) {
      console.log(error);
      alert("Network Error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>

          <View style={styles.card}>

            {/* TITLE */}
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join ShebaLink</Text>

            {/* IMAGE PICK */}
            <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.img} />
              ) : (
                <Ionicons name="camera" size={35} color="#4f46e5" />
              )}
            </TouchableOpacity>

            {/* ROLE SWITCH */}
            {/* ROLE SWITCH */}
            <View style={styles.roleBox}>

              {/* STUDENT */}
              <TouchableOpacity
                onPress={() => setRole("student")}
                style={[
                  styles.roleBtn,
                  role === "student" && styles.activeRole,
                ]}
              >
                <Text
                  style={
                    role === "student"
                      ? styles.activeText
                      : styles.roleText
                  }
                >
                  Student
                </Text>
              </TouchableOpacity>

              {/* PROVIDER */}
              <TouchableOpacity
                onPress={() => setRole("provider")}
                style={[
                  styles.roleBtn,
                  role === "provider" && styles.activeRole,
                ]}
              >
                <Text
                  style={
                    role === "provider"
                      ? styles.activeText
                      : styles.roleText
                  }
                >
                  Provider
                </Text>
              </TouchableOpacity>

              {/* ADMIN */}
              <TouchableOpacity
                onPress={() => setRole("admin")}
                style={[
                  styles.roleBtn,
                  role === "admin" && styles.activeRole,
                ]}
              >
                <Text
                  style={
                    role === "admin"
                      ? styles.activeText
                      : styles.roleText
                  }
                >
                  Admin
                </Text>
              </TouchableOpacity>

            </View>

            {/* INPUTS */}
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              onChangeText={setEmail}
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              style={styles.input}
              onChangeText={setPassword}
            />

            {role === "student" && (
              <TextInput
                placeholder="Student ID"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                onChangeText={setStudentId}
              />
            )}

            {/* BUTTON */}
            <TouchableOpacity
              onPress={handleRegister}
              style={styles.button}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* LOGIN LINK */}
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.footer}>
                Already have an account?{" "}
                <Text style={{ color: "#4f46e5", fontWeight: "700" }}>
                  Login
                </Text>
              </Text>
            </TouchableOpacity>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 25,
    padding: 22,
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    color: "#0f172a",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: 20,
  },

  imageBox: {
    width: 85,
    height: 85,
    borderRadius: 50,
    backgroundColor: "#eef2ff",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  img: {
    width: 85,
    height: 85,
    borderRadius: 50,
  },

  roleBox: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    marginBottom: 15,
  },

  roleBtn: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },

  activeRole: {
    backgroundColor: "#fff",
    borderRadius: 12,
  },

  roleText: {
    color: "#64748b",
    fontWeight: "700",
  },

  activeText: {
    color: "#4f46e5",
    fontWeight: "800",
  },

  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "800",
  },

  footer: {
    textAlign: "center",
    marginTop: 15,
    color: "#64748b",
  },
});     