import React, { useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  View as RNView, 
  Dimensions,
  TextInput 
} from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';

const { width } = Dimensions.get('window');

const ROOMMATE_POSTS = [
  { 
    id: '1', 
    name: 'Tanvir Ahmed', 
    dept: 'Software Engineering',
    location: 'Central Road, Near Gate 2', 
    rent: '3500৳', 
    gender: 'Male',
    pref: 'Non-Smoker, Quiet',
    description: 'Looking for a roommate for a single bed in a master room.' 
  },
  { 
    id: '2', 
    name: 'Saima Jahan', 
    dept: 'Economics',
    location: 'Female Dorm Area', 
    rent: '4200৳', 
    gender: 'Female',
    pref: 'Student Only',
    description: 'Spacious room with attached balcony and WiFi.' 
  },
];

export default function RoommateFinderScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Roommate Finder', headerShadowVisible: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* --- Header & Search --- */}
        <RNView style={styles.headerBox}>
          <Text style={styles.headerSubtitle}>Find your perfect campus companion</Text>
          <RNView style={styles.searchBar}>
            <FontAwesome name="search" size={16} color="#94a3b8" />
            <TextInput placeholder="Search area (e.g. Gate 1)" style={styles.searchInput} />
          </RNView>
        </RNView>

        {/* --- Filters --- */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['All', 'Male', 'Female', 'Near Campus', 'Budget Friendly'].map((f) => (
            <TouchableOpacity key={f} style={styles.filterChip}>
              <Text style={styles.filterChipText}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Available Vacancies</Text>

        {/* --- Posts List --- */}
        {ROOMMATE_POSTS.map((post) => (
          <RNView key={post.id} style={styles.postCard}>
            <RNView style={styles.postHeader}>
              <RNView style={styles.avatar}>
                <FontAwesome name="user-circle" size={40} color="#06b6d4" />
              </RNView>
              <RNView style={styles.headerText}>
                <Text style={styles.userName}>{post.name}</Text>
                <Text style={styles.userDept}>{post.dept}</Text>
              </RNView>
              <RNView style={[styles.genderBadge, { backgroundColor: post.gender === 'Male' ? '#e0f2fe' : '#fce7f3' }]}>
                <Text style={[styles.genderText, { color: post.gender === 'Male' ? '#0369a1' : '#be185d' }]}>{post.gender}</Text>
              </RNView>
            </RNView>

            <RNView style={styles.locationRow}>
              <FontAwesome name="map-marker" size={14} color="#06b6d4" />
              <Text style={styles.locationText}>{post.location}</Text>
            </RNView>

            <Text style={styles.postDesc}>{post.description}</Text>

            <RNView style={styles.prefBox}>
              <Text style={styles.prefLabel}>Preference: <Text style={styles.prefValue}>{post.pref}</Text></Text>
            </RNView>

            <RNView style={styles.divider} />

            <RNView style={styles.postFooter}>
              <RNView>
                <Text style={styles.rentLabel}>Monthly Rent</Text>
                <Text style={styles.rentValue}>{post.rent}</Text>
              </RNView>
              <TouchableOpacity style={styles.contactBtn}>
                <Text style={styles.contactBtnText}>View Details</Text>
              </TouchableOpacity>
            </RNView>
          </RNView>
        ))}

      </ScrollView>

      {/* --- Post Ad Button --- */}
      <TouchableOpacity style={styles.fab}>
        <FontAwesome name="edit" size={20} color="#fff" />
        <Text style={styles.fabText}>Post Ad</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  
  headerBox: { padding: 20, backgroundColor: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 15, borderRadius: 12, height: 45 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },

  filterScroll: { paddingHorizontal: 20, marginVertical: 15, backgroundColor: 'transparent' },
  filterChip: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  filterChipText: { fontSize: 12, fontWeight: '700', color: '#475569' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginHorizontal: 20, marginBottom: 15 },

  // Post Card
  postCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 24, padding: 20, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  postHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', marginBottom: 15 },
  avatar: { backgroundColor: 'transparent' },
  headerText: { flex: 1, marginLeft: 12, backgroundColor: 'transparent' },
  userName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  userDept: { fontSize: 12, color: '#94a3b8' },
  genderBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  genderText: { fontSize: 10, fontWeight: 'bold' },

  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, backgroundColor: 'transparent' },
  locationText: { fontSize: 13, color: '#0891b2', fontWeight: '600' },
  
  postDesc: { fontSize: 14, color: '#475569', lineHeight: 20 },
  
  prefBox: { backgroundColor: '#f0f9ff', padding: 10, borderRadius: 10, marginTop: 12 },
  prefLabel: { fontSize: 12, color: '#0369a1', fontWeight: 'bold' },
  prefValue: { fontWeight: '500', color: '#0c4a6e' },

  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },

  postFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' },
  rentLabel: { fontSize: 11, color: '#94a3b8' },
  rentValue: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
  contactBtn: { backgroundColor: '#06b6d4', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  contactBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

  fab: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#06b6d4', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 30, elevation: 5, gap: 8 },
  fabText: { color: '#fff', fontWeight: 'bold' }
});