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

const API = "https://jnushebaserver.onrender.com";

let socket;

export default function ChatScreen() {
  const { id: serviceId, receiver } = useLocalSearchParams(); 
  const router = useRouter();

  const [me, setMe] = useState(null);
  const [receiverEmail, setReceiverEmail] = useState(null);
  const [receiverName, setReceiverName] = useState("Chat");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [activeClientEmail, setActiveClientEmail] = useState(null);

  const listRef = useRef(null);

  useEffect(() => {
    init();
    return () => {
      if (socket) socket.disconnect();
    };
  }, [serviceId]);

  const init = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      const user = session ? JSON.parse(session) : null;
      if (!user) {
        router.back();
        return;
      }
      setMe(user.email);

      let targetEmail = receiver;
      let targetName = "User";

      if (targetEmail) {
        setReceiverEmail(targetEmail);
      } else {
        const svcRes = await fetch(`${API}/services/${serviceId}`);
        const service = await svcRes.json();
        targetEmail = service.providerEmail;
        setReceiverEmail(targetEmail);
      }

      // Determine who the client is for this specific chat thread
      // If logged in user is the provider, the receiver/target is the client. 
      // If logged in user is NOT the provider, the logged in user is the client.
      let fetchedClientEmail = user.email;
      const svcRes = await fetch(`${API}/services/${serviceId}`);
      const serviceData = await svcRes.json();
      
      if (user.email === serviceData.providerEmail) {
        // Logged in as provider, so the client is the receiver passed via params
        fetchedClientEmail = receiver;
      }
      setActiveClientEmail(fetchedClientEmail);

      try {
        const userRes = await fetch(`${API}/users/email/${targetEmail}`);
        const userData = await userRes.json();
        if (userData && userData.name) {
          targetName = userData.name;
        } else {
          targetName = targetEmail?.split("@")[0] || "Chat";
        }
      } catch (e) {
        targetName = targetEmail?.split("@")[0] || "Chat";
      }
      setReceiverName(targetName);

      // Fetch chat history with clientEmail filter
      const historyRes = await fetch(`${API}/chat/${serviceId}?clientEmail=${fetchedClientEmail}`);
      const history = await historyRes.json();
      setMessages(history);

      socket = io(API, { transports: ["websocket"] });

      socket.on("connect", () => {
        setConnected(true);
        socket.emit("join_room", serviceId);
      });

      socket.on("disconnect", () => setConnected(false));

      socket.on("receive_message", (msg) => {
        // Only append if it belongs to this specific chat thread
        if (msg.clientEmail === fetchedClientEmail) {
          setMessages((prev) => [...prev, msg]);
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
        }
      });
    } catch (err) {
      console.log("chat init error:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!text.trim() || !socket || !connected) return;

    const messageData = {
      serviceId,
      senderEmail: me,
      receiverEmail,
      clientEmail: activeClientEmail,
      text: text.trim(),
    };

    socket.emit("send_message", messageData);

    // Optimistically push or rely on socket broadcast if server handles room broadcasting. 
    // To ensure instant UI update if socket broadcasts to room:
    // (If socket server broadcasts back to room, remove local append to avoid duplication)
    
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
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{receiverName}</Text>
          <Text style={styles.headerSub}>{receiverEmail}</Text>
        </View>
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
                styles.bubbleWrapper,
                isMine ? styles.myWrapper : styles.theirWrapper,
              ]}
            >
              <Text style={styles.senderLabel}>
                {isMine ? "You" : receiverName}
              </Text>
              <View
                style={[
                  styles.bubble,
                  isMine ? styles.myBubble : styles.theirBubble,
                ]}
              >
                <Text style={isMine ? styles.myText : styles.theirText}>
                  {item.text}
                </Text>
              </View>
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
          placeholderTextColor="#94a3b8"
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
  headerInfo: { flex: 1 },
  headerTitle: { fontWeight: "700", fontSize: 16, color: "#0f172a" },
  headerSub: { fontSize: 11, color: "#64748b" },
  dot: { width: 8, height: 8, borderRadius: 4 },

  bubbleWrapper: {
    marginBottom: 10,
    maxWidth: "75%",
  },
  myWrapper: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  theirWrapper: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  senderLabel: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 2,
    marginHorizontal: 4,
    fontWeight: "600",
  },
  bubble: {
    padding: 12,
    borderRadius: 14,
  },
  myBubble: { 
    backgroundColor: "#2563eb", 
    borderBottomRightRadius: 2,
  },
  theirBubble: { 
    backgroundColor: "#e2e8f0", 
    borderBottomLeftRadius: 2,
  },
  myText: { color: "#fff", fontSize: 14 },
  theirText: { color: "#0f172a", fontSize: 14 },

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
    color: "#0f172a",
  },
  sendBtn: {
    backgroundColor: "#2563ef",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});