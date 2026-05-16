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

  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      if (session) {
        const user = JSON.parse(session);
        setName(user.name || "");
        setDept(user.dept || "");
        setStudentId(user.studentId || "");
        setPhone(user.phone || "");
        setProfileImage(user.profileImage || null);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Name cannot be empty!");
      return;
    }

    setIsSaving(true);

    try {
      const session = await AsyncStorage.getItem("user_session");

      if (!session) {
        Alert.alert("Error", "Session expired");
        return;
      }

      const oldData = JSON.parse(session);

      const updatedUser = {
        name: name.trim(),
        dept: dept.trim(),
        studentId: studentId.trim(),
        phone: phone.trim(),
        profileImage,
      };

      // 🔥 BACKEND API CALL
      const response = await fetch(
        `https://junsheba.vercel.app//users/${oldData.email}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUser),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      // 🔥 UPDATE LOCAL SESSION
      await AsyncStorage.setItem(
        "user_session",
        JSON.stringify(data.user)
      );

      Alert.alert("Success", "Profile updated successfully 🎉", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
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
          headerShadowVisible: false,
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* PROFILE IMAGE */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarBox}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.avatar}
              />
            ) : (
              <FontAwesome name="user-circle" size={110} color="#cbd5e1" />
            )}

            <View style={styles.cameraBadge}>
              <FontAwesome name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={pickImage}>
            <Text style={styles.changeText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          <Input label="Full Name" value={name} onChange={setName} icon="user" />
          <Input label="Department" value={dept} onChange={setDept} icon="graduation-cap" />
          <Input label="Student ID" value={studentId} onChange={setStudentId} icon="id-card" />
          <Input label="Phone" value={phone} onChange={setPhone} icon="phone" />
        </View>

      </ScrollView>
    </View>
  );
}

/* ================= INPUT COMPONENT ================= */

const Input = ({ label, value, onChange, icon }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>

    <View style={styles.inputBox}>
      <FontAwesome name={icon} size={16} color="#94a3b8" />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={`Enter ${label}`}
        placeholderTextColor="#cbd5e1"
        style={styles.input}
      />
    </View>
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  saveBtn: {
    color: "#3b82f6",
    fontWeight: "800",
    fontSize: 16,
    marginRight: 10,
  },

  content: {
    padding: 20,
  },

  /* AVATAR */
  avatarSection: {
    alignItems: "center",
    marginVertical: 25,
  },

  avatarBox: {
    position: "relative",
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#e2e8f0",
  },

  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3b82f6",
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },

  changeText: {
    marginTop: 10,
    color: "#3b82f6",
    fontWeight: "700",
  },

  /* FORM */
  form: {
    gap: 18,
  },

  inputGroup: {
    marginBottom: 5,
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
    marginBottom: 8,
    textTransform: "uppercase",
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    height: 55,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },

  note: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 12,
    color: "#94a3b8",
  },
});