import React, { useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  View as RNView, 
  Dimensions,
  FlatList
} from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';

const { width } = Dimensions.get('window');

const BUS_SCHEDULES = [
  { id: '1', busName: 'Campus Express', route: 'Town → Campus', time: '08:30 AM', status: 'On Time' },
  { id: '2', busName: 'Shuttle 02', route: 'Hall → Campus', time: '09:15 AM', status: 'Delayed', delay: '10 min' },
  { id: '3', busName: 'Night Bus', route: 'Campus → Town', time: '07:30 PM', status: 'On Time' },
];

export default function CampusRideScreen() {
  const [activeTab, setActiveTab] = useState('Town');

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Campus Ride', headerShadowVisible: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* --- Route Selector --- */}
        <RNView style={styles.tabContainer}>
          {['Town', 'Halls', 'City'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </RNView>

        {/* --- Live Status Card --- */}
        <RNView style={styles.statusCard}>
          <RNView style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Next Bus In</Text>
            <RNView style={styles.liveIndicator}>
              <RNView style={styles.redDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </RNView>
          </RNView>
          <Text style={styles.timerText}>12:45 <Text style={styles.minText}>mins</Text></Text>
          <Text style={styles.busInfo}>Campus Express • Town Route</Text>
        </RNView>

        <Text style={styles.sectionTitle}>Full Schedule</Text>

        {/* --- Bus List --- */}
        {BUS_SCHEDULES.map((bus) => (
          <RNView key={bus.id} style={styles.busCard}>
            <RNView style={styles.busIconBox}>
              <FontAwesome name="bus" size={24} color="#ec4899" />
            </RNView>

            <RNView style={styles.busDetails}>
              <Text style={styles.busName}>{bus.busName}</Text>
              <Text style={styles.routeText}>{bus.route}</Text>
              <RNView style={styles.timeTag}>
                <FontAwesome name="clock-o" size={12} color="#64748b" />
                <Text style={styles.timeText}>{bus.time}</Text>
              </RNView>
            </RNView>

            <RNView style={styles.busStatusSide}>
              <Text style={[
                styles.statusText, 
                { color: bus.status === 'On Time' ? '#10b981' : '#f59e0b' }
              ]}>
                {bus.status}
              </Text>
              {bus.delay && <Text style={styles.delayText}>{bus.delay}</Text>}
              <TouchableOpacity style={styles.trackBtn}>
                <Text style={styles.trackBtnText}>Track</Text>
              </TouchableOpacity>
            </RNView>
          </RNView>
        ))}

        {/* --- Quick Actions --- */}
        <Text style={styles.sectionTitle}>Services</Text>
        <RNView style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <FontAwesome name="id-card" size={20} color="#ec4899" />
            <Text style={styles.actionLabel}>Bus Pass</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <FontAwesome name="map-o" size={20} color="#ec4899" />
            <Text style={styles.actionLabel}>Live Map</Text>
          </TouchableOpacity>
        </RNView>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  
  // Tab Selector
  tabContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', margin: 20, borderRadius: 15, padding: 5 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: '#fff', elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
  activeTabText: { color: '#ec4899' },

  // Live Status Card
  statusCard: { backgroundColor: '#ec4899', marginHorizontal: 20, borderRadius: 25, padding: 25, elevation: 8, shadowColor: '#ec4899', shadowOpacity: 0.3, shadowRadius: 15 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent', alignItems: 'center' },
  statusTitle: { color: '#fbcfe8', fontWeight: '700', fontSize: 14 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 5 },
  redDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  timerText: { fontSize: 40, fontWeight: '900', color: '#fff', marginTop: 10 },
  minText: { fontSize: 18, fontWeight: '500' },
  busInfo: { color: '#fff', marginTop: 5, fontSize: 13, opacity: 0.9 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginHorizontal: 20, marginTop: 30, marginBottom: 15 },

  // Bus Card
  busCard: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 20, padding: 15, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  busIconBox: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#fdf2f8', justifyContent: 'center', alignItems: 'center' },
  busDetails: { flex: 1, marginLeft: 15, backgroundColor: 'transparent' },
  busName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  routeText: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  timeTag: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, backgroundColor: 'transparent' },
  timeText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  busStatusSide: { alignItems: 'flex-end', backgroundColor: 'transparent', justifyContent: 'center' },
  statusText: { fontSize: 11, fontWeight: '800' },
  delayText: { fontSize: 10, color: '#f59e0b', fontWeight: '600' },
  trackBtn: { marginTop: 8, backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  trackBtnText: { fontSize: 11, fontWeight: '700', color: '#ec4899' },

  // Quick Actions
  actionRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 15, backgroundColor: 'transparent' },
  actionBtn: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 18, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  actionLabel: { fontSize: 13, fontWeight: '700', color: '#475569' }
});