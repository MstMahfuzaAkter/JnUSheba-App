import React, { useState } from "react";
import {
  ActivityIndicator, Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

const API = "https://jnushebaserver.onrender.com";

export default function RegisterScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("student");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  // রিয়েল-টাইম এরর স্টেটস
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [studentIdError, setStudentIdError] = useState("");

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

  // ================= REAL-TIME NAME VALIDATION =================
  const handleNameChange = (text) => {
    setName(text);
    if (!text.trim()) {
      setNameError("Name is required");
    } else {
      setNameError("");
    }
  };

  // ================= REAL-TIME EMAIL VALIDATION =================
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

  // ================= REAL-TIME PASSWORD VALIDATION =================
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

  // ================= REAL-TIME STUDENT ID VALIDATION =================
  const handleStudentIdChange = (text) => {
    setStudentId(text);
    if (role === "student" && !text.trim()) {
      setStudentIdError("Student ID is required");
    } else {
      setStudentIdError("");
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || (role === "student" && !studentId)) {
      alert("Fill all fields");
      return;
    }

    if (nameError || emailError || passwordError || (role === "student" && studentIdError)) {
      alert("Please fix the errors before registering");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.trim().toLowerCase(),
          password,
          role,
          studentId: role === "student" ? studentId : null,
          profileImage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error");
        return;
      }

      const session = {
        uid: data.result?.insertedId || null,
        name,
        email: email.toLowerCase(),
        role,
      };

      await AsyncStorage.setItem("user_session", JSON.stringify(session));

      alert("Account Created 🎉");
      router.replace("/");

    } catch (err) {
      console.log(err);
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

            <Text style={styles.title}>Create Account</Text>

            <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.img} />
              ) : (
                <Ionicons name="camera" size={35} color="#4f46e5" />
              )}
            </TouchableOpacity>

            <View style={styles.roleBox}>
              {["student", "provider", "admin"].map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => {
                    setRole(item);
                    if (item !== "student") setStudentIdError("");
                  }}
                  style={[styles.roleBtn, role === item && styles.activeRole]}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Name"
              style={[styles.input, nameError ? styles.errorBorder : null]}
              value={name}
              onChangeText={handleNameChange}
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

            <TextInput
              placeholder="Email"
              style={[styles.input, emailError ? styles.errorBorder : null]}
              value={email}
              onChangeText={handleEmailChange}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <TextInput
              placeholder="Password"
              style={[styles.input, passwordError ? styles.errorBorder : null]}
              secureTextEntry
              value={password}
              onChangeText={handlePasswordChange}
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            {role === "student" && (
              <>
                <TextInput
                  placeholder="Student ID"
                  style={[styles.input, studentIdError ? styles.errorBorder : null]}
                  value={studentId}
                  onChangeText={handleStudentIdChange}
                />
                {studentIdError ? <Text style={styles.errorText}>{studentIdError}</Text> : null}
              </>
            )}

            <TouchableOpacity style={styles.btn} onPress={handleRegister}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{color:"#fff"}}>Register</Text>}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#dbdee6" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: { backgroundColor: "#fff", padding: 20, borderRadius: 20 },

  title: { fontSize: 22, fontWeight: "bold", textAlign: "center" },

  imageBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#eee", alignSelf: "center",
    justifyContent: "center", alignItems: "center",
    margin: 10
  },

  img: { width: 80, height: 80, borderRadius: 40 },

  roleBox: { flexDirection: "row", marginVertical: 10 },

  roleBtn: {
    flex: 1, padding: 10, alignItems: "center"
  },

  activeRole: { backgroundColor: "#ddd" },

  input: {
    borderWidth: 1, borderColor: "#ccc",
    padding: 10, marginVertical: 5,
    borderRadius: 10
  },

  errorBorder: {
    borderColor: "#f43f5e",
  },

  errorText: {
    color: "#f43f5e",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
    marginLeft: 4,
  },

  btn: {
    backgroundColor: "#4f46e5",
    padding: 15,
    marginTop: 10,
    alignItems: "center",
    borderRadius: 10
  }
});