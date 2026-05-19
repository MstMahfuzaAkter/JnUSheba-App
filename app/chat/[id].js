import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

const API = "https://junsheba.vercel.app";

export default function ChatScreen() {
  const { id } = useLocalSearchParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // LOAD MESSAGES
  const loadMessages = async () => {
    try {
      const res = await fetch(`${API}/chat/${id}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadMessages();

    // simple realtime (polling)
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!text) return;

    const msg = {
      serviceId: id,
      message: text,
      sender: "user",
    };

    try {
      await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });

      setText("");
      loadMessages();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item, i) => i.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.msg,
              item.sender === "user" ? styles.user : styles.provider,
            ]}
          >
            <Text style={{ color: "#fff" }}>{item.message}</Text>
          </View>
        )}
      />

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type message..."
        />

        <TouchableOpacity style={styles.btn} onPress={sendMessage}>
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9", padding: 10 },

  msg: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: "75%",
  },

  user: {
    backgroundColor: "#2563eb",
    alignSelf: "flex-end",
  },

  provider: {
    backgroundColor: "#111827",
    alignSelf: "flex-start",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  input: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
  },

  btn: {
    backgroundColor: "#2563eb",
    padding: 10,
    marginLeft: 8,
    borderRadius: 10,
  },
});