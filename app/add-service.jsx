import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API = "https://jnushebaserver.onrender.com";
const IMGBB_KEY = "2c7e810f139593dc180added26dd51a7";

export default function AddService() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState(null);

  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    subCategory: "",
    location: "",
    district: "",
    area: "",
    address: "",
    phone: "",
    priceType: "fixed",
    serviceDuration: "1 Hour",
    warranty: "No Warranty",
    experience: "",
  });

  useEffect(() => {
    const verifyProvider = async () => {
      try {
        const session = await AsyncStorage.getItem("user_session");
        if (!session) {
          router.replace("/login");
          return;
        }

        const parsedUser = JSON.parse(session);
        const identifier = parsedUser?.email || parsedUser?._id || parsedUser?.id;

        const res = await fetch(`${API}/users/${identifier}`);
        const user = await res.json();

        if (!user || user.role !== "provider" || !user.isApproved) {
          Alert.alert("Access Denied", "You must be an approved provider to add services.");
          router.replace("/profile");
          return;
        }
      } catch (err) {
        console.log("Auth verification error:", err);
        router.replace("/profile");
      } finally {
        setChecking(false);
      }
    };

    verifyProvider();
  }, []);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      uploadToImgBB(result.assets[0].base64);
    }
  };

  const uploadToImgBB = async (base64Img) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", base64Img);

      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        setImage(data.data.url);
        Alert.alert("Success", "Image uploaded ✅");
      } else {
        Alert.alert("Error", "Upload failed");
      }
    } catch (err) {
      Alert.alert("Error", "Image upload error");
    } finally {
      setUploading(false);
    }
  };

  const addService = async () => {
    if (!form.title || !form.price) {
      Alert.alert("Error", "Title & Price required");
      return;
    }

    if (!image) {
      Alert.alert("Error", "Please upload image first");
      return;
    }

    setLoading(true);

    try {
      const session = await AsyncStorage.getItem("user_session");
      const user = JSON.parse(session);

      const res = await fetch(`${API}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          image,
          price: Number(form.price),
          experience: Number(form.experience) || 0,
          providerId: user._id || user.id || "",
          providerEmail: user.email,
          providerName: user.name,
          profileImage: user.profileImage || user.image || "",
          phone: form.phone || user.phone || "",
        }),
      });

      const data = await res.json();

      if (data.success) {
        Alert.alert("Success", "Service Added 🎉");
        setForm({
          title: "",
          price: "",
          description: "",
          category: "",
          subCategory: "",
          location: "",
          district: "",
          area: "",
          address: "",
          phone: "",
          priceType: "fixed",
          serviceDuration: "1 Hour",
          warranty: "No Warranty",
          experience: "",
        });
        setImage(null);
      } else {
        Alert.alert("Error", data.message || "Failed to add service");
      }
    } catch (err) {
      Alert.alert("Error", "Server error");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator size="large" color="#5B21B6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>➕ Create Service</Text>

      <TouchableOpacity style={styles.imgBtn} onPress={pickImage}>
        <Text style={styles.btnText}>
          {uploading ? "Uploading..." : "Pick Image"}
        </Text>
      </TouchableOpacity>

      {image && (
        <Image source={{ uri: image }} style={styles.preview} />
      )}

      <Input label="Title" value={form.title} onChange={(v) => handleChange("title", v)} />
      <Input label="Price" value={form.price} onChange={(v) => handleChange("price", v)} keyboard />
      <Input label="Price Type (fixed / hourly / starting)" value={form.priceType} onChange={(v) => handleChange("priceType", v)} />

      <Input label="Category" value={form.category} onChange={(v) => handleChange("category", v)} />
      <Input label="Sub Category" value={form.subCategory} onChange={(v) => handleChange("subCategory", v)} />

      <Input label="District" value={form.district} onChange={(v) => handleChange("district", v)} />
      <Input label="Area" value={form.area} onChange={(v) => handleChange("area", v)} />
      <Input label="Address" value={form.address} onChange={(v) => handleChange("address", v)} />

      <Input label="Phone" value={form.phone} onChange={(v) => handleChange("phone", v)} keyboard />
      <Input label="Experience (Years)" value={form.experience} onChange={(v) => handleChange("experience", v)} keyboard />
      <Input label="Service Duration (e.g., 1 Hour)" value={form.serviceDuration} onChange={(v) => handleChange("serviceDuration", v)} />
      <Input label="Warranty" value={form.warranty} onChange={(v) => handleChange("warranty", v)} />

      <Input
        label="Description"
        value={form.description}
        onChange={(v) => handleChange("description", v)}
        multiline
      />

      <TouchableOpacity style={styles.btn} onPress={addService}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Publish Service</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const Input = ({ label, value, onChange, keyboard, multiline }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      keyboardType={keyboard ? "numeric" : "default"}
      multiline={multiline}
      style={[styles.input, multiline && { height: 100 }]}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f8fafc" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 15 },
  label: { fontSize: 12, fontWeight: "700", color: "#64748b", marginBottom: 4 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  btn: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  imgBtn: {
    backgroundColor: "#10b981",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  btnText: { color: "#fff", fontWeight: "800" },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
  },
});