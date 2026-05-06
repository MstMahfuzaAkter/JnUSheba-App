import React, { useState } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  View as RNView, 
  Dimensions 
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { TUITION_JOBS } from '@/data/demoData';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';

const { width } = Dimensions.get('window');

export default function TuitionJobsScreen() {
  const [search, setSearch] = useState('');

  // ফিল্টার করা জবেব লিস্ট (সার্চ বার এর জন্য)
  const filteredJobs = TUITION_JOBS.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) || 
    job.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Tuition Board', 
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#f8fafc' } 
      }} />

      {/* --- Search & Filter Section --- */}
      <View style={styles.headerSection}>
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={16} color="#94a3b8" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by area or class..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94a3b8"
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <FontAwesome name="sliders" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* --- Jobs List --- */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListHeaderComponent={() => (
          <Text style={styles.listCount}>{filteredJobs.length} Jobs found near you</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.jobCard} activeOpacity={0.9}>
            <RNView style={styles.jobTopRow}>
              <RNView style={styles.badgeContainer}>
                <RNView style={styles.classBadge}>
                  <Text style={styles.classText}>{item.classLevel}</Text>
                </RNView>
                <RNView style={styles.typeBadge}>
                  <Text style={styles.typeText}>Home Visit</Text>
                </RNView>
              </RNView>
              <Text style={styles.salaryText}>{item.salary}</Text>
            </RNView>

            <Text style={styles.jobTitle}>{item.title}</Text>
            
            <RNView style={styles.infoRow}>
              <RNView style={styles.iconInfo}>
                <FontAwesome name="map-marker" size={14} color="#64748b" />
                <Text style={styles.infoText}>{item.location}</Text>
              </RNView>
              <RNView style={styles.iconInfo}>
                <FontAwesome name="calendar-check-o" size={14} color="#64748b" />
                <Text style={styles.infoText}>{item.days}</Text>
              </RNView>
            </RNView>

            <RNView style={styles.divider} />

            <RNView style={styles.footerRow}>
              <RNView style={styles.postedInfo}>
                <Text style={styles.postedLabel}>Posted by</Text>
                <Text style={styles.posterName}>{item.postedBy}</Text>
              </RNView>
              <TouchableOpacity style={styles.detailsBtn}>
                <Text style={styles.detailsBtnText}>View Details</Text>
              </TouchableOpacity>
            </RNView>
          </TouchableOpacity>
        )}
      />

      {/* --- Floating Action Button --- */}
      <TouchableOpacity style={styles.fab}>
        <FontAwesome name="plus" size={20} color="#fff" />
        <Text style={styles.fabText}>Post a Job</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  
  // Header
  headerSection: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    gap: 12,
    backgroundColor: '#f8fafc'
  },
  searchContainer: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    paddingHorizontal: 15, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  searchInput: { flex: 1, height: 50, marginLeft: 10, fontSize: 15, color: '#1e293b' },
  filterBtn: { 
    width: 50, 
    height: 50, 
    backgroundColor: '#22c55e', 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#22c55e',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  listCount: { fontSize: 14, color: '#64748b', marginBottom: 15, fontWeight: '600' },

  // Job Card
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  jobTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: 'transparent' },
  badgeContainer: { flexDirection: 'row', gap: 8, backgroundColor: 'transparent' },
  classBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  classText: { color: '#16a34a', fontSize: 12, fontWeight: 'bold' },
  typeBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  typeText: { color: '#2563eb', fontSize: 12, fontWeight: 'bold' },
  salaryText: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  
  jobTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginTop: 12 },
  
  infoRow: { flexDirection: 'row', gap: 15, marginTop: 10, backgroundColor: 'transparent' },
  iconInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'transparent' },
  infoText: { fontSize: 13, color: '#64748b' },

  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },

  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' },
  postedInfo: { backgroundColor: 'transparent' },
  postedLabel: { fontSize: 11, color: '#94a3b8' },
  posterName: { fontSize: 13, fontWeight: '600', color: '#475569' },
  
  detailsBtn: { backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  detailsBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#22c55e',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    gap: 10
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});