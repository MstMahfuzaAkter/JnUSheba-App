import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// react-native-webview has no web implementation, so we only import/use it on native platforms.
let WebView = null;
if (Platform.OS !== "web") {
  WebView = require("react-native-webview").WebView;
}

const API = "https://junsheba.vercel.app";

export default function PaymentScreen() {
  const { bookingId, amount, serviceTitle } = useLocalSearchParams();
  const router = useRouter();

  const [gatewayUrl, setGatewayUrl] = useState(null);
  const [tranId, setTranId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [openedInBrowser, setOpenedInBrowser] = useState(false);

  const pollRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    startPayment();

    let onMessage;
    if (Platform.OS === "web") {
      onMessage = (event) => {
        if (event?.data?.type === "payment-result") {
          if (pollRef.current) clearInterval(pollRef.current);
          const s = event.data.status;
          handleResult(s === "success" ? "paid" : s === "cancel" ? "cancelled" : "failed");
        }
      };
      window.addEventListener("message", onMessage);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (onMessage) window.removeEventListener("message", onMessage);
    };
  }, []);

  const startPayment = async () => {
    try {
      const session = await AsyncStorage.getItem("user_session");
      const user = session ? JSON.parse(session) : null;

      const res = await fetch(`${API}/payment/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          amount,
          customerName: user?.name || "Customer",
          customerEmail: user?.email,
          customerPhone: user?.phone || "01700000000",
        }),
      });

      const data = await res.json();

      if (data.success && data.url) {
        setGatewayUrl(data.url);
        setTranId(data.tran_id);

        if (Platform.OS === "web" && !openedInBrowser) {
          popupRef.current = window.open(data.url, "_blank");
          setOpenedInBrowser(true);
          startPolling(data.tran_id);
        }
      } else {
        Alert.alert("Error", "Could not start payment. Please try again.");
        router.back();
      }
    } catch (err) {
      console.log("startPayment error:", err);
      Alert.alert("Error", "Network error while starting payment.");
      router.back();
    } finally {
      // ✅ এটি নিশ্চিত করবে যে API কল সফল হোক বা ব্যর্থ, লোডিং বন্ধ হয়ে স্ক্রিন চলে আসবে
      setLoading(false);
    }
  };

  const startPolling = (tran_id) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/payment/status/${tran_id}`);
        const data = await res.json();

        if (data.success && data.status !== "pending") {
          clearInterval(pollRef.current);
          handleResult(data.status);
        }
      } catch (err) {
        console.log("poll error:", err);
      }
    }, 3000);
  };

  const manualCheckStatus = async () => {
    if (!tranId) return;

    setTimeout(() => {
      try {
        popupRef.current?.close();
      } catch (e) {}
    }, 1000);

    setCheckingStatus(true);
    try {
      const res = await fetch(`${API}/payment/status/${tranId}`);
      const data = await res.json();

      if (data.success && data.status !== "pending") {
        if (pollRef.current) clearInterval(pollRef.current);
        handleResult(data.status);
      } else {
        Alert.alert("Still pending", "Payment not completed yet. Finish it in the other tab, then check again.");
      }
    } catch (err) {
      console.log("manualCheckStatus error:", err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleResult = (status) => {
    if (finished) return;
    setFinished(true);

    try {
      popupRef.current?.close();
    } catch (e) {}

    if (status === "paid") {
      Alert.alert("Payment Successful 🎉", "Your booking is now confirmed and paid.", [
        { 
          text: "OK", 
          onPress: () => {
            router.replace({
              pathname: router.canGoBack() ? router.segments.join('/') : "/", 
              params: { refresh: Date.now() }
            });
            router.back();
          } 
        },
      ]);
    } else if (status === "cancelled") {
      Alert.alert("Payment Cancelled", "You cancelled the payment.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      Alert.alert("Payment Failed", "The payment could not be completed.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  };

  const handleNavChange = (navState) => {
    if (finished) return;

    if (navState.url.includes("/payment/result-page")) {
      const isSuccess = navState.url.includes("status=success");
      const isCancel = navState.url.includes("status=cancel");
      setTimeout(() => handleResult(isSuccess ? "paid" : isCancel ? "cancelled" : "failed"), 300);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 10 }}>Preparing payment for {serviceTitle}...</Text>
      </View>
    );
  }

  if (!gatewayUrl) {
    return (
      <View style={styles.center}>
        <Text>Unable to load payment gateway.</Text>
      </View>
    );
  }

  if (Platform.OS === "web") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 16, fontWeight: "700", fontSize: 16 }}>
          Payment page opened in a new tab
        </Text>
        <Text style={{ marginTop: 6, color: "#64748b", textAlign: "center", paddingHorizontal: 30 }}>
          Complete the payment there, then come back here — this checks automatically every few
          seconds, or tap the button below.
        </Text>

        <TouchableOpacity
          style={styles.reopenBtn}
          onPress={() => { popupRef.current = window.open(gatewayUrl, "_blank"); }}
        >
          <Text style={{ color: "#2563eb", fontWeight: "600" }}>Reopen payment tab</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.checkBtn} onPress={manualCheckStatus} disabled={checkingStatus}>
          {checkingStatus ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700" }}>I've completed payment — check now</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: gatewayUrl }}
        onNavigationStateChange={handleNavChange}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  reopenBtn: { marginTop: 24, padding: 10 },
  checkBtn: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});