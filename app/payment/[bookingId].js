import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// react-native-webview has no web implementation, so we only import/use it on native platforms.
let WebView = null;
if (Platform.OS !== "web") {
  WebView = require("react-native-webview").WebView;
}

const API = "https://jnushebaserver.onrender.com";

const FONTS = {
  regular: "Inter",
  medium: "Inter",
  semibold: "Inter",
  bold: "Inter",
  extrabold: "Inter",
};

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
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <View style={styles.iconCircle}>
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
          <Text style={styles.loadingTitle}>Preparing Payment</Text>
          <Text style={styles.loadingSubtitle}>{serviceTitle || "Secure Checkout"}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!gatewayUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <View style={[styles.iconCircle, { backgroundColor: "#fee2e2" }]}>
            <Ionicons name="alert-circle" size={28} color="#ef4444" />
          </View>
          <Text style={styles.loadingTitle}>Gateway Error</Text>
          <Text style={styles.loadingSubtitle}>Unable to load payment gateway.</Text>
          <TouchableOpacity style={styles.checkBtn} onPress={() => router.back()}>
            <Text style={styles.checkBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (Platform.OS === "web") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Secure Checkout</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.webContainer}>
          <View style={styles.webCard}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="shield-checkmark" size={32} color="#6366f1" />
            </View>
            <Text style={styles.webTitle}>Payment Page Opened</Text>
            <Text style={styles.webDescription}>
              Complete your payment of <Text style={{ fontFamily: FONTS.extrabold, color: "#1e293b" }}>৳{amount || "0"}</Text> in the newly opened browser tab. This screen checks automatically or you can use the buttons below.
            </Text>

            <TouchableOpacity
              style={styles.reopenBtn}
              onPress={() => { popupRef.current = window.open(gatewayUrl, "_blank"); }}
            >
              <Ionicons name="open-outline" size={16} color="#6366f1" />
              <Text style={styles.reopenBtnText}>Reopen payment tab</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checkBtn} 
              onPress={manualCheckStatus} 
              disabled={checkingStatus}
            >
              {checkingStatus ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={styles.checkBtnText}>I've completed payment — check now</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Checkout</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <WebView
        source={{ uri: gatewayUrl }}
        onNavigationStateChange={handleNavChange}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fdf2f8" 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 24 
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 18,
    fontFamily: FONTS.extrabold,
    color: "#1e293b",
    marginBottom: 4,
  },
  loadingSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: "#64748b",
    textAlign: "center",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    elevation: 2,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: FONTS.extrabold,
    color: "#1e293b",
  },
  webContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  webCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeaderIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  webTitle: {
    fontSize: 18,
    fontFamily: FONTS.extrabold,
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  webDescription: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: FONTS.semibold,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  reopenBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#e0e7ff",
    gap: 8,
    width: "100%",
    marginBottom: 10,
  },
  reopenBtnText: {
    color: "#4f46e5",
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  checkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6366f1",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 8,
    width: "100%",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  checkBtnText: {
    color: "#fff",
    fontFamily: FONTS.extrabold,
    fontSize: 13,
  },
});