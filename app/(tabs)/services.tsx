import React from 'react';
import { StyleSheet, ScrollView, Pressable, Dimensions, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { SERVICE_CATEGORIES } from '@/data/demoData'; // Tomar existing data
import { Link, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ServicesScreen() {
  return (
    <View style={styles.container}>
      {/* Screen Header Configuration */}
      <Stack.Screen options={{ 
        title: 'All Services',
        headerLargeTitle: true,
        headerTransparent: false,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#F8FAFC' }
      }} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar Placeholder (Premium Feel) */}
        <Pressable style={styles.searchPlaceholder}>
          <FontAwesome name="search" size={16} color="#94a3b8" />
          <Text style={styles.searchText}>Search for services (Tutor, Print...)</Text>
        </Pressable>

        <Text style={styles.categoryLabel}>CAMPUS DIRECTORY</Text>

        <View style={styles.serviceList}>
          {SERVICE_CATEGORIES.map((service, index) => (
            <Link href={service.route as any} key={service.id} asChild>
              <Pressable style={styles.serviceCard}>
                <RNView style={[styles.iconBox, { backgroundColor: `${service.color}10` }]}>
                  <FontAwesome name={service.icon as any} size={22} color={service.color} />
                </RNView>

                <View style={styles.cardInfo}>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDesc}>
                    Get instant access to {service.title.toLowerCase()} support.
                  </Text>
                </View>

                <RNView style={styles.actionIcon}>
                  <FontAwesome name="angle-right" size={20} color="#cbd5e1" />
                </RNView>
              </Pressable>
            </Link>
          ))}
        </View>

        {/* Support Banner */}
        <LinearGradient
          colors={['#f8fafc', '#eff6ff']}
          style={styles.supportCard}
        >
          <FontAwesome name="question-circle" size={24} color="#3b82f6" />
          <View style={{backgroundColor: 'transparent', flex: 1, marginLeft: 15}}>
            <Text style={styles.supportTitle}>Need Custom Help?</Text>
            <Text style={styles.supportText}>Contact our 24/7 campus support team.</Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  searchPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchText: {
    color: '#94a3b8',
    marginLeft: 12,
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1.5,
    marginBottom: 15,
    marginLeft: 5,
  },
  serviceList: {
    backgroundColor: 'transparent',
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 15,
    backgroundColor: 'transparent',
  },
  serviceTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
  },
  serviceDesc: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 3,
    lineHeight: 18,
  },
  actionIcon: {
    paddingLeft: 10,
  },
  supportCard: {
    marginTop: 30,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  supportText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
});