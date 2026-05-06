import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Pressable, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { SERVICE_CATEGORIES } from '@/data/demoData';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient'; // Optional: install expo-linear-gradient

const { width } = Dimensions.get('window');

export default function TabOneScreen() {
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header / Welcome Section */}

      <View style={styles.heroCard}>
        <Text style={styles.heroText}>Your campus, right in your pocket.</Text>
        <Text style={styles.heroSubtext}>Connecting students, staff, and residents.</Text>
      </View>

      {/* Auth Actions - Professional Pill Style
      <View style={styles.actionsContainer}>
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <FontAwesome name="sign-in" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/register" asChild>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Register</Text>
          </TouchableOpacity>
        </Link>
      </View> */}

      {/* Grid Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Essential Services</Text>
        <Link href="/services" asChild>
          <Pressable>
            <Text style={styles.sectionLink}>View All</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.grid}>
        {SERVICE_CATEGORIES.map((service) => (
          <Link href={service.route as any} asChild key={service.id}>
            <Pressable style={styles.gridItem}>
              <View style={[styles.iconContainer, { backgroundColor: `${service.color}15` }]}>
                <FontAwesome name={service.icon as any} size={24} color={service.color} />
              </View>
              <Text style={styles.gridText}>{service.title}</Text>
              <View style={styles.arrowCircle}>
                <FontAwesome name="chevron-right" size={10} color="#9ca3af" />
              </View>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: 'transparent',
  },
  heroCard: {
    backgroundColor: '#1e40af', // Deep JnU Blue
    borderRadius: 24,
    padding: 25,
    marginBottom: 25,
    elevation: 8,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  heroText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSubtext: {
    color: '#bfdbfe',
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 35,
    backgroundColor: 'transparent',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#2563eb',
    height: 55,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    height: 55,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  sectionLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    backgroundColor: 'transparent',
  },
  gridItem: {
    backgroundColor: '#fff',
    width: (width - 55) / 2, // Perfect spacing for 2-column grid
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  gridText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  arrowCircle: {
    position: 'absolute',
    right: 15,
    bottom: 15,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  }
});