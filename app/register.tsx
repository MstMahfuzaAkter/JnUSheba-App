import {
  AntDesign,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";

// Firebase Imports
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; 
import { auth, db } from "../firebase"; // নিশ্চিত করুন আপনার ফাইলে db এক্সপোর্ট করা আছে
import * as ImagePicker from 'expo-image-picker';

export default function RegisterScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  
  // Role State
  const [role, setRole] = useState("student"); // 'student' or 'admin'

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || (role === "student" && !studentId)) {
      alert("সবগুলো তথ্য সঠিকভাবে পূরণ করুন");
      return;
    }

    setLoading(true);
    try {
      // ১. Firebase Auth এ ইউজার তৈরি করা
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ২. Firestore এ ইউজারের বিস্তারিত তথ্য এবং রোল সেভ করা
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        studentId: role === "student" ? studentId : "N/A",
        profileImage: profileImage || null,
        createdAt: new Date().toISOString(),
      });

      alert("অ্যাকাউন্ট তৈরি সফল হয়েছে! 🎉");
      router.replace("/login");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            
            <View style={styles.logoBox}>
              <Ionicons name="person-add" size={34} color="#4f46e5" />
            </View>

            <Text style={styles.appName}>Create Account</Text>
            <Text style={styles.subtitle}>Join JNU ShebaLink today</Text>

            {/* --- Role Selection Toggle --- */}
            <View style={styles.rolePicker}>
              <TouchableOpacity 
                style={[styles.roleBtn, role === "student" && styles.activeRoleBtn]} 
                onPress={() => setRole("student")}
              >
                <Text style={[styles.roleBtnText, role === "student" && styles.activeRoleText]}>Student</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.roleBtn, role === "admin" && styles.activeRoleBtn]} 
                onPress={() => setRole("admin")}
              >
                <Text style={[styles.roleBtnText, role === "admin" && styles.activeRoleText]}>Admin</Text>
              </TouchableOpacity>
            </View>

            {/* Profile Photo */}
            <TouchableOpacity style={styles.photoCircle} onPress={pickImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.selectedPhoto} />
              ) : (
                <Ionicons name="camera" size={30} color="#4f46e5" />
              )}
            </TouchableOpacity>

            {/* Name */}
            <Text style={styles.label}>FULL NAME</Text>
            <View style={styles.inputBox}>
              <FontAwesome5 name="user-alt" size={16} color="#888" />
              <TextInput
                placeholder="Enter your name"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Conditional Student ID Field */}
            {role === "student" && (
              <>
                <Text style={styles.label}>STUDENT ID</Text>
                <View style={styles.inputBox}>
                  <MaterialIcons name="badge" size={20} color="#888" />
                  <TextInput
                    placeholder="e.g. B2005040"
                    style={styles.input}
                    value={studentId}
                    onChangeText={setStudentId}
                  />
                </View>
              </>
            )}

            {/* Email */}
            <Text style={styles.label}>EMAIL</Text>
            <View style={styles.inputBox}>
              <MaterialIcons name="email" size={20} color="#888" />
              <TextInput
                placeholder="Enter email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputBox}>
              <MaterialIcons name="lock" size={20} color="#888" />
              <TextInput
                placeholder="Create password"
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

            {/* Register Button */}
            <TouchableOpacity 
              style={[styles.actionBtn, loading && { opacity: 0.7 }]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>REGISTER AS {role.toUpperCase()}</Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.footerText}>
                Already have account?{" "}
                <Text style={{ color: "#4f46e5", fontWeight: 'bold' }}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: { backgroundColor: "#ffffff", borderRadius: 30, padding: 25, elevation: 8, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  logoBox: { alignSelf: "center", width: 60, height: 60, borderRadius: 18, backgroundColor: "#eef2ff", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  appName: { textAlign: "center", fontSize: 24, fontWeight: "900", color: "#1e3a8a" },
  subtitle: { textAlign: "center", fontSize: 13, color: "#64748b", marginBottom: 20 },

  // Role Picker Styles
  rolePicker: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 15, padding: 5, marginBottom: 20 },
  roleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  activeRoleBtn: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 },
  roleBtnText: { fontSize: 14, fontWeight: '700', color: '#94a3b8' },
  activeRoleText: { color: '#4f46e5' },

  photoCircle: { alignSelf: "center", width: 90, height: 90, borderRadius: 45, backgroundColor: "#f1f5f9", borderWidth: 2, borderColor: "#e2e8f0", borderStyle: "dashed", justifyContent: "center", alignItems: "center", marginBottom: 10, overflow: "hidden" },
  selectedPhoto: { width: "100%", height: "100%" },
  label: { fontSize: 11, fontWeight: "800", color: "#64748b", marginTop: 15, textTransform: 'uppercase' },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", paddingHorizontal: 15, borderRadius: 15, marginTop: 8, height: 52, borderWidth: 1, borderColor: "#f1f5f9" },
  input: { flex: 1, paddingHorizontal: 10, fontSize: 15, color: "#1e293b" },
  actionBtn: { backgroundColor: "#4f46e5", height: 55, borderRadius: 18, marginTop: 30, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 15, letterSpacing: 0.5 },
  footerText: { textAlign: "center", fontSize: 14, color: "#64748b", marginTop: 25 },
});