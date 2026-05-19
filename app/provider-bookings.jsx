import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://junsheba.vercel.app";

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const session = await AsyncStorage.getItem("user_session");
    const user = JSON.parse(session);

    const res = await fetch(
      `${API}/provider-bookings/${user.email}`
    );

    const data = await res.json();
    setBookings(data);
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API}/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    loadBookings();
  };

  return (
    <View style={{ padding: 15 }}>
      <Text style={{ fontSize: 20, fontWeight: "800" }}>
        📅 Bookings
      </Text>

      {bookings.map((b) => (
        <View key={b._id} style={{ padding: 15, backgroundColor: "#fff", marginVertical: 10 }}>

          <Text>Service: {b.serviceTitle}</Text>
          <Text>User: {b.userEmail}</Text>
          <Text>Status: {b.status}</Text>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>

            <TouchableOpacity
              onPress={() => updateStatus(b._id, "accepted")}
              style={{ backgroundColor: "green", padding: 8 }}
            >
              <Text style={{ color: "#fff" }}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => updateStatus(b._id, "rejected")}
              style={{ backgroundColor: "red", padding: 8 }}
            >
              <Text style={{ color: "#fff" }}>Reject</Text>
            </TouchableOpacity>

          </View>

        </View>
      ))}
    </View>
  );
}