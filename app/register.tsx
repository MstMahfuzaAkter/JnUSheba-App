import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image,
  SafeAreaView, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://junsheba.vercel.app";

export default function RegisterScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("student");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [profileImage, setProfileImage] = useState(null);

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

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert("Fill all fields");
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
                  onPress={() => setRole(item)}
                  style={[styles.roleBtn, role === item && styles.activeRole]}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput placeholder="Name" style={styles.input} onChangeText={setName} />
            <TextInput placeholder="Email" style={styles.input} onChangeText={setEmail} />
            <TextInput placeholder="Password" style={styles.input} secureTextEntry onChangeText={setPassword} />

            {role === "student" && (
              <TextInput placeholder="Student ID" style={styles.input} onChangeText={setStudentId} />
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

  btn: {
    backgroundColor: "#4f46e5",
    padding: 15,
    marginTop: 10,
    alignItems: "center",
    borderRadius: 10
  }
});