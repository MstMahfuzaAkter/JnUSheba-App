import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  View,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";

import { Text } from "@/components/Themed";
import { Stack, useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

export default function EditProfileScreen() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const [role, setRole] = useState("");

  // ================= LOAD USER =================
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");

      if (session) {
        const u = JSON.parse(session);

        setUser(u);
        setName(u.name || "");
        setDept(u.dept || "");
        setStudentId(u.studentId || "");
        setPhone(u.phone || "");
        setProfileImage(u.profileImage || null);
        setRole(u.role || "student");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  // ================= IMAGE PICK =================
  const pickImage = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // ================= SAVE TO BACKEND =================
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name required");
      return;
    }

    setIsSaving(true);

    try {
      const updatedUser = {
        name: name.trim(),
        dept: dept.trim(),
        studentId: studentId.trim(),
        phone: phone.trim(),
        profileImage,
        role, // ✅ SAFE ROLE SUPPORT
      };

      const res = await fetch(
        `https://junsheba.vercel.app/users/${user.email}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUser),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      // ================= UPDATE SESSION =================
      await AsyncStorage.setItem(
        "user_session",
        JSON.stringify(data.user)
      );

      Alert.alert("Success", "Profile updated 🎉", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Edit Profile",
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <Text style={styles.saveBtn}>Save</Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>

        {/* ================= PROFILE IMAGE ================= */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <FontAwesome name="user-circle" size={110} color="#cbd5e1" />
            )}
          </TouchableOpacity>

          <Text style={styles.roleText}>
            Role: {role.toUpperCase()}
          </Text>
        </View>

        {/* ================= ROLE DISPLAY (NO EDIT ABUSE) ================= */}
        <View style={styles.roleBox}>
          <Text style={styles.roleLabel}>
            Account Type: {role}
          </Text>
        </View>

        {/* ================= FORM ================= */}
        <Input label="Full Name" value={name} onChange={setName} icon="user" />
        <Input label="Department" value={dept} onChange={setDept} icon="graduation-cap" />

        {role === "student" && (
          <Input label="Student ID" value={studentId} onChange={setStudentId} icon="id-card" />
        )}

        <Input label="Phone" value={phone} onChange={setPhone} icon="phone" />

      </ScrollView>
    </View>
  );
}

/* ================= INPUT ================= */
const Input = ({ label, value, onChange, icon }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>

    <View style={styles.inputBox}>
      <FontAwesome name={icon} size={16} color="#94a3b8" />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={label}
        style={styles.input}
      />
    </View>
  </View>
);

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  saveBtn: {
    color: "#3b82f6",
    fontWeight: "800",
    marginRight: 10,
  },

  content: {
    padding: 20,
  },

  avatarSection: {
    alignItems: "center",
    marginVertical: 20,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  roleText: {
    marginTop: 10,
    fontWeight: "700",
    color: "#0f172a",
  },

  roleBox: {
    padding: 10,
    backgroundColor: "#eef2ff",
    borderRadius: 10,
    marginBottom: 15,
  },

  roleLabel: {
    fontWeight: "700",
    color: "#4338ca",
    textAlign: "center",
  },

  inputGroup: {
    marginBottom: 10,
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
    marginBottom: 6,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  input: {
    flex: 1,
    marginLeft: 10,
  },
});