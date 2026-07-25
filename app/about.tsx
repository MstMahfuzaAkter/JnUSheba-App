import React from 'react';
import { StyleSheet, ScrollView, View as RNView, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// ================= FONTS =================
const FONTS = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
  extrabold: "Poppins_800ExtraBold",
};

// ================= COLOR SYSTEM =================
const COLORS = {
  header: "#5B21B6",
  headerMid: "#7C3AED",
  headerDark: "#3B0764",
  background: "#F6F6FB",
  cards: "#FFFFFF",
  button: "#FF6B35",
  buttonDark: "#E8551F",
  success: "#16A34A",
  successBg: "#DCFCE7",
  danger: "#EF4444",
  gold: "#FACC15",
  pink: "#EC4899",
  text: "#181524",
  subtitle: "#6B7280",
  subtitleLight: "#9CA3AF",
  border: "#EFEFF6",
  chipBg: "#F1EEFB",
};

export default function AboutScreen() {
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ 
        headerTitle: 'Our Mission',
        headerTransparent: true,
        headerTintColor: '#fff'
      }} />
      
      {/* Brand Identity Header */}
      <LinearGradient
        colors={[COLORS.headerDark, COLORS.header, COLORS.headerMid]}
        style={styles.brandHeader}
      >
        <RNView style={styles.logoCircle}>
          <FontAwesome name="link" size={40} color="#fff" />
        </RNView>
        <Text style={styles.brandTitle}>JnU ShebaLink</Text>
        <Text style={styles.brandTagline}>Empowering the JnU Community</Text>
        <RNView style={styles.versionBadge}>
          <Text style={styles.versionText}>VERSION 1.0.0</Text>
        </RNView>
      </LinearGradient>

      <View style={styles.mainCard}>
        {/* Core Mission */}
        <Text style={styles.paragraph}>
          <Text style={styles.highlightText}>JnU ShebaLink</Text> is more than an app; it's a digital bridge built exclusively for the Jagannath University ecosystem. 
        </Text>
        
        <Text style={styles.paragraph}>
          We streamline campus life by integrating essential services into a single, secure, and user-friendly interface.
        </Text>

        <View style={styles.divider} />

        {/* Section: Who We Serve */}
        <Text style={styles.sectionTitle}>Target Audience</Text>
        <View style={styles.featureGrid}>
          <ServicePill icon="graduation-cap" label="Students" color={COLORS.headerMid} />
          <ServicePill icon="briefcase" label="Faculty" color={COLORS.success} />
          <ServicePill icon="building" label="Staff" color="#D97706" />
          <ServicePill icon="home" label="Residents" color={COLORS.danger} />
        </View>

        {/* Section: Core Features */}
        <Text style={styles.sectionTitle}>Platform Capabilities</Text>
        
        <FeatureItem 
          icon="search" 
          title="Tutor Matching" 
          desc="Find verified student tutors from JnU departments." 
        />
        <FeatureItem 
          icon="print" 
          title="Express Print" 
          desc="Upload docs and get them delivered to your hall or dept." 
        />
        <FeatureItem 
          icon="star" 
          title="Campus Life" 
          desc="Photography, cleaning, and event management." 
        />
      </View>

      {/* Footer Info */}
      <Text style={styles.footerNote}>© 2026 JnU ShebaLink Team. All Rights Reserved.</Text>
    </ScrollView>
  );
}

// Sub-components for professional modularity
const ServicePill = ({ icon, label, color }: any) => (
  <RNView style={styles.pill}>
    <RNView style={[styles.pillIcon, { backgroundColor: `${color}15` }]}>
      <FontAwesome name={icon} size={16} color={color} />
    </RNView>
    <Text style={styles.pillLabel}>{label}</Text>
  </RNView>
);

const FeatureItem = ({ icon, title, desc }: any) => (
  <RNView style={styles.featureItem}>
    <FontAwesome name={icon} size={20} color={COLORS.header} style={styles.featureIcon} />
    <RNView style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </RNView>
  </RNView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, 
  },
  contentContainer: {
    paddingBottom: 40,
  },
  brandHeader: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  brandTitle: {
    fontSize: 28,
    fontFamily: FONTS.extrabold,
    color: '#fff',
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 14,
    color: '#E9D5FF',
    marginTop: 5,
    fontFamily: FONTS.medium,
  },
  versionBadge: {
    marginTop: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  versionText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: FONTS.extrabold,
    letterSpacing: 1,
  },
  mainCard: {
    backgroundColor: COLORS.cards,
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paragraph: {
    fontSize: 15,
    color: COLORS.subtitle,
    lineHeight: 24,
    marginBottom: 15,
    fontFamily: FONTS.regular,
  },
  highlightText: {
    color: COLORS.header,
    fontFamily: FONTS.bold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.extrabold,
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 15,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.chipBg,
    paddingRight: 12,
    paddingLeft: 6,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  pillLabel: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: COLORS.text,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  featureIcon: {
    marginTop: 3,
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  featureDesc: {
    fontSize: 13,
    color: COLORS.subtitle,
    marginTop: 2,
    fontFamily: FONTS.regular,
  },
  footerNote: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 12,
    color: COLORS.subtitleLight,
    fontFamily: FONTS.medium,
  }
});