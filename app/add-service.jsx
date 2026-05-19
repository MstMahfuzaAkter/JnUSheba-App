import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://junsheba.vercel.app";

export default function AddService() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    location: "",
    phone: "",
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const addService = async () => {
    if (!form.title || !form.price) {
      Alert.alert("Error", "Title & Price required");
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
          price: Number(form.price),
          providerEmail: user.email,
          providerName: user.name,
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
          location: "",
          phone: "",
        });
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (err) {
      Alert.alert("Error", "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>➕ Create Service</Text>

      <Input label="Title" value={form.title} onChange={(v) => handleChange("title", v)} />
      <Input label="Price" value={form.price} onChange={(v) => handleChange("price", v)} keyboard />

      <Input label="Category" value={form.category} onChange={(v) => handleChange("category", v)} />
      <Input label="Location" value={form.location} onChange={(v) => handleChange("location", v)} />
      <Input label="Phone" value={form.phone} onChange={(v) => handleChange("phone", v)} />

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
  label: { fontSize: 12, fontWeight: "700", color: "#64748b" },
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
  },
  btnText: { color: "#fff", fontWeight: "800" },
});