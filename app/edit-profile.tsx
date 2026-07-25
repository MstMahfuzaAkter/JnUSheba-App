import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { Text } from "@/components/Themed";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";

const API = "https://jnushebaserver.onrender.com";

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

  const [role, setRole] = useState("student");

  // ================= LOAD USER =================
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");

      if (session) {
        const parsedUser = JSON.parse(session);

        setUser(parsedUser);

        setName(parsedUser?.name || "");
        setDept(parsedUser?.dept || "");
        setStudentId(parsedUser?.studentId || "");
        setPhone(parsedUser?.phone || "");
        setProfileImage(parsedUser?.profileImage || null);
        setRole(parsedUser?.role || "student");
      }
    } catch (error) {
      console.log("LOAD USER ERROR:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ================= IMAGE PICKER =================
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Gallery permission is needed"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("IMAGE PICK ERROR:", error);
    }
  };

  // ================= SAVE PROFILE =================
  const handleSave = async () => {
    try {
      if (!user?.email) {
        Alert.alert("Error", "User not found");
        return;
      }

      if (!name.trim()) {
        Alert.alert("Validation", "Name is required");
        return;
      }

      setIsSaving(true);

      // SAFE DATA
      const updatedUser = {
        name: name.trim(),
        dept: dept.trim(),
        studentId: studentId.trim(),
        phone: phone.trim(),
        profileImage,
      };

      const response = await fetch(
        `${API}/users/${user.email}`,
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
        throw new Error(data.message || "Update failed");
      }

      // ================= UPDATE LOCAL SESSION =================
      await AsyncStorage.setItem(
        "user_session",
        JSON.stringify(data.user)
      );

      setUser(data.user);

      Alert.alert(
        "Success",
        "Profile updated successfully 🎉",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Update Failed",
        error.message || "Something went wrong"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ================= LOADING =================
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Edit Profile",
            headerShadowVisible: false,

            headerRight: () => (
              <TouchableOpacity
                disabled={isSaving}
                onPress={handleSave}
              >
                {isSaving ? (
                  <ActivityIndicator
                    size="small"
                    color="#2563eb"
                  />
                ) : (
                  <Text style={styles.saveBtn}>
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            ),
          }}
        />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ================= PROFILE IMAGE ================= */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={pickImage}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.placeholderAvatar}>
                  <FontAwesome
                    name="user"
                    size={45}
                    color="#94a3b8"
                  />
                </View>
              )}

              <View style={styles.cameraBadge}>
                <FontAwesome
                  name="camera"
                  size={14}
                  color="#fff"
                />
              </View>
            </TouchableOpacity>

            <Text style={styles.namePreview}>
              {name || "Unnamed User"}
            </Text>

            <Text style={styles.roleText}>
              {role.toUpperCase()}
            </Text>
          </View>

          {/* ================= ROLE BOX ================= */}
          <View style={styles.roleBox}>
            <Text style={styles.roleLabel}>
              Account Type: {role}
            </Text>
          </View>

          {/* ================= FORM ================= */}
          <Input
            label="Full Name"
            value={name}
            onChange={setName}
            icon="user"
          />

          <Input
            label="Department"
            value={dept}
            onChange={setDept}
            icon="graduation-cap"
          />

          {role === "student" && (
            <Input
              label="Student ID"
              value={studentId}
              onChange={setStudentId}
              icon="id-card"
            />
          )}

          <Input
            label="Phone Number"
            value={phone}
            onChange={setPhone}
            icon="phone"
            keyboardType="phone-pad"
          />

          {/* ================= SAVE BUTTON ================= */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <FontAwesome
                  name="save"
                  size={18}
                  color="#fff"
                />

                <Text style={styles.saveButtonText}>
                  Save Changes
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// ================= INPUT COMPONENT =================
const Input = ({
  label,
  value,
  onChange,
  icon,
  keyboardType = "default",
}) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputBox}>
        <FontAwesome
          name={icon}
          size={16}
          color="#94a3b8"
        />

        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={label}
          style={styles.input}
          keyboardType={keyboardType}
          placeholderTextColor="#94a3b8"
        />
      </View>
    </View>
  );
};

// ================= STYLES =================
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

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  saveBtn: {
    color: "#2563eb",
    fontWeight: "800",
    marginRight: 12,
    fontSize: 15,
  },

  avatarSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 25,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  placeholderAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },

  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#2563eb",
    width: 32,
    height: 32,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  namePreview: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },

  roleText: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },

  roleBox: {
    backgroundColor: "#dbeafe",
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
  },

  roleLabel: {
    textAlign: "center",
    fontWeight: "800",
    color: "#1d4ed8",
  },

  inputGroup: {
    marginBottom: 15,
  },

  label: {
    marginBottom: 6,
    color: "#475569",
    fontWeight: "700",
    fontSize: 13,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    color: "#0f172a",
    fontSize: 15,
  },

  saveButton: {
    marginTop: 25,
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  saveButtonText: {
    color: "#fff",
    fontWeight: "800",
    marginLeft: 10,
    fontSize: 15,
  },
});