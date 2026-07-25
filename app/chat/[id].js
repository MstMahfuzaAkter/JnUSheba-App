import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { io } from "socket.io-client";

const API = "https://jnushebaserver.onrender.com"; // ⚠️ see setup notes: Socket.io needs a persistent server, this must point to that server

let socket; // module-level so it isn't recreated on every render

export default function ChatScreen() {
  const { id: serviceId, receiver } = useLocalSearchParams(); // serviceId doubles as the chat room id
  const router = useRouter();

  const [me, setMe] = useState(null);
  const [receiverEmail, setReceiverEmail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const listRef = useRef(null);

  useEffect(() => {
    init();
    return () => {
      if (socket) socket.disconnect();
    };
  }, [serviceId]);

  const init = async () => {
    try {
      // 1. who am I?
      const session = await AsyncStorage.getItem("user_session");
      const user = session ? JSON.parse(session) : null;
      if (!user) {
        router.back();
        return;
      }
      setMe(user.email);

      // 2. who am I chatting with?
      // Prefer the explicit `receiver` param (passed by whoever opened this screen).
      // Fall back to the service's provider — covers the common "student opens chat from service page" case.
      if (receiver) {
        setReceiverEmail(receiver);
      } else {
        const svcRes = await fetch(`${API}/services/${serviceId}`);
        const service = await svcRes.json();
        setReceiverEmail(service.providerEmail);
      }

      // 3. load message history over plain HTTP
      const historyRes = await fetch(`${API}/chat/${serviceId}`);
      const history = await historyRes.json();
      setMessages(history);

      // 4. connect socket + join this service's chat room
      socket = io(API, { transports: ["websocket"] });

      socket.on("connect", () => {
        setConnected(true);
        socket.emit("join_room", serviceId);
      });

      socket.on("disconnect", () => setConnected(false));

      socket.on("receive_message", (msg) => {
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      });
    } catch (err) {
      console.log("chat init error:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!text.trim() || !socket || !connected) return;

    socket.emit("send_message", {
      serviceId,
      senderEmail: me,
      receiverEmail,
      text: text.trim(),
    });

    setText("");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{receiverEmail}</Text>
        <View style={[styles.dot, { backgroundColor: connected ? "#10b981" : "#ef4444" }]} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item, i) => item._id?.toString() || i.toString()}
        contentContainerStyle={{ padding: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isMine = item.senderEmail === me;
          return (
            <View
              style={[
                styles.bubble,
                isMine ? styles.myBubble : styles.theirBubble,
              ]}
            >
              <Text style={isMine ? styles.myText : styles.theirText}>{item.text}</Text>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  headerTitle: { fontWeight: "700", fontSize: 15, flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },

  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  myBubble: { alignSelf: "flex-end", backgroundColor: "#2563eb" },
  theirBubble: { alignSelf: "flex-start", backgroundColor: "#e2e8f0" },
  myText: { color: "#fff" },
  theirText: { color: "#0f172a" },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: "#2563eb",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});