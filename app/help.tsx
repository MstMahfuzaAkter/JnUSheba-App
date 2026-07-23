import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Linking,
} from "react-native";

import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// ================= COLOR PALETTE =================
const COLORS = {
  header: "#4f46e5",
  background: "#f8fafc",
  cards: "#FFFFFF",
  button: "#f97316",
  success: "#22c55e",
  text: "#0f172a",
  subtitle: "#64748b",
  border: "#f1f5f9",
};

type FAQItem = {
  question: string;
  answer: string;
};

const FAQS: FAQItem[] = [
  {
    question: "How do I book a service?",
    answer: "Browse or search for your required service from the home screen, tap on 'Details', and click on the 'Book Now' button to confirm your booking.",
  },
  {
    question: "Are the service providers verified?",
    answer: "Yes! Every single service provider on our campus platform is strictly verified and approved by the system administration.",
  },
  {
    question: "Can I cancel a booking?",
    answer: "Yes, you can cancel your booking anytime before the provider accepts or arrives at your location by visiting your 'My Bookings' section.",
  },
  {
    question: "How do I contact the provider directly?",
    answer: "Once a booking is confirmed, you will see the provider's direct contact details and call option right inside the booking details page.",
  },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  
  // Support Form State
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleCallHotline = () => {
    Linking.openURL("tel:+8801700000000");
  };

  const handleOpenEmail = () => {
    Linking.openURL("mailto:support@junsheba.com?subject=Support Request");
  };

  const handleSubmitTicket = () => {
    if (!userName.trim() || !userEmail.trim() || !message.trim()) {
      Alert.alert("Error", "Please fill in all fields before submitting.");
      return;
    }

    setSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert("Success", "Your message has been sent. Our support team will contact you soon.");
      setUserName("");
      setUserEmail("");
      setMessage("");
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.header} />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.iconCircle} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 36 }} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* QUICK CONTACT CARDS */}
        <Text style={styles.sectionTitle}>Quick Support</Text>
        <View style={styles.quickContactRow}>
          <TouchableOpacity style={styles.contactCard} onPress={handleCallHotline} activeOpacity={0.85}>
            <View style={[styles.contactIconCircle, { backgroundColor: "#dbeafe" }]}>
              <Ionicons name="call" size={22} color="#2563eb" />
            </View>
            <Text style={styles.contactCardTitle}>Call Hotline</Text>
            <Text style={styles.contactCardSub}>24/7 Available</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleOpenEmail} activeOpacity={0.85}>
            <View style={[styles.contactIconCircle, { backgroundColor: "#fef3c7" }]}>
              <Ionicons name="mail" size={22} color="#d97706" />
            </View>
            <Text style={styles.contactCardTitle}>Email Us</Text>
            <Text style={styles.contactCardSub}>Fast Response</Text>
          </TouchableOpacity>

        <TouchableOpacity 
            style={styles.contactCard} 
            onPress={() => router.push({
              pathname: "/chat/[id]",
              params: { id: "support" }
            } as any)} 
            activeOpacity={0.85}
          >
            <View style={[styles.contactIconCircle, { backgroundColor: "#dcfce7" }]}>
              <Ionicons name="chatbubbles" size={22} color="#16a34a" />
            </View>
            <Text style={styles.contactCardTitle}>Live Chat</Text>
            <Text style={styles.contactCardSub}>Instant Help</Text>
          </TouchableOpacity>
        </View>

        {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Frequently Asked Questions</Text>
        <View style={styles.faqContainer}>
          {FAQS.map((faq, index) => {
            const isExpanded = expandedFAQ === index;
            return (
              <View key={index} style={styles.faqCard}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.faqQuestionRow}
                  onPress={() => toggleFAQ(index)}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={COLORS.subtitle}
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* SEND A MESSAGE / TICKET FORM */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Send Us a Message</Text>
        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor={COLORS.subtitle}
            value={userName}
            onChangeText={setUserName}
          />

          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.subtitle}
            keyboardType="email-address"
            autoCapitalize="none"
            value={userEmail}
            onChangeText={setUserEmail}
          />

          <Text style={styles.inputLabel}>Describe Your Problem</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write details about your issue..."
            placeholderTextColor={COLORS.subtitle}
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.85}
            onPress={handleSubmitTicket}
          >
            <Text style={styles.submitBtnText}>
              {submitting ? "Sending..." : "Submit Ticket"}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.header,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "transparent",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 10,
  },
  quickContactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    gap: 10,
  },
  contactCard: {
    flex: 1,
    backgroundColor: COLORS.cards,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  contactCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
  contactCardSub: {
    fontSize: 11,
    color: COLORS.subtitle,
    marginTop: 2,
  },
  faqContainer: {
    backgroundColor: "transparent",
    gap: 8,
  },
  faqCard: {
    backgroundColor: COLORS.cards,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: COLORS.cards,
  },
  faqQuestionText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
    paddingRight: 8,
  },
  faqAnswerContainer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    backgroundColor: COLORS.cards,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  faqAnswerText: {
    fontSize: 12.5,
    color: COLORS.subtitle,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: COLORS.cards,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    color: COLORS.text,
    fontSize: 13,
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  submitBtn: {
    backgroundColor: COLORS.button,
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
});