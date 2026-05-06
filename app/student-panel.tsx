import React from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  View as RNView, 
  Dimensions 
} from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';

const { width } = Dimensions.get('window');

export default function StudentPanelScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Student Dashboard', headerShown: true, headerShadowVisible: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* --- Profile Overview Card --- */}
        <RNView style={styles.profileCard}>
          <RNView style={styles.profileInfo}>
            <Text style={styles.studentName}>Abir Hossain</Text>
            <Text style={styles.studentId}>ID: 12005042 | CSE</Text>
            <RNView style={styles.semesterBadge}>
              <Text style={styles.semesterText}>3rd Year, 2nd Semester</Text>
            </RNView>
          </RNView>
          <RNView style={styles.cgpaCircle}>
            <Text style={styles.cgpaValue}>3.85</Text>
            <Text style={styles.cgpaLabel}>CGPA</Text>
          </RNView>
        </RNView>

        {/* --- Stats Grid --- */}
        <RNView style={styles.statsGrid}>
          <RNView style={styles.statBox}>
            <FontAwesome name="check-square-o" size={20} color="#8b5cf6" />
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </RNView>
          <RNView style={styles.statBox}>
            <FontAwesome name="book" size={20} color="#8b5cf6" />
            <Text style={styles.statNumber}>06</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </RNView>
          <RNView style={styles.statBox}>
            <FontAwesome name="clock-o" size={20} color="#8b5cf6" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Credits</Text>
          </RNView>
        </RNView>

        {/* --- Today's Classes --- */}
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        
        <RNView style={styles.scheduleCard}>
          <RNView style={styles.timeLine}>
            <Text style={styles.timeText}>10:30 AM</Text>
            <RNView style={styles.line} />
          </RNView>
          <RNView style={styles.classInfo}>
            <Text style={styles.classTitle}>Software Engineering</Text>
            <Text style={styles.classRoom}>Room: 402 | Dr. Nasir Uddin</Text>
          </RNView>
        </RNView>

        <RNView style={styles.scheduleCard}>
          <RNView style={styles.timeLine}>
            <Text style={styles.timeText}>01:30 PM</Text>
            <RNView style={styles.line} />
          </RNView>
          <RNView style={styles.classInfo}>
            <Text style={styles.classTitle}>Database Systems Lab</Text>
            <Text style={styles.classRoom}>Lab 2 | Ms. Farhana</Text>
          </RNView>
        </RNView>

        {/* --- Quick Actions --- */}
        <Text style={styles.sectionTitle}>Academic Services</Text>
        <RNView style={styles.actionGrid}>
          <ActionItem icon="file-pdf-o" label="Result Sheet" />
          <ActionItem icon="calendar" label="Exam Routine" />
          <ActionItem icon="credit-card" label="Pay Fees" />
          <ActionItem icon="users" label="Faculty List" />
        </RNView>

      </ScrollView>
    </View>
  );
}

// Small Component for Quick Actions
const ActionItem = ({ icon, label }: { icon: any, label: string }) => (
  <TouchableOpacity style={styles.actionItem}>
    <RNView style={styles.actionIcon}>
      <FontAwesome name={icon} size={20} color="#8b5cf6" />
    </RNView>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  
  // Profile Card
  profileCard: {
    backgroundColor: '#8b5cf6',
    margin: 20,
    borderRadius: 24,
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  profileInfo: { flex: 1, backgroundColor: 'transparent' },
  studentName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  studentId: { fontSize: 13, color: '#ddd6fe', marginTop: 4 },
  semesterBadge: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginTop: 12 },
  semesterText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  cgpaCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  cgpaValue: { fontSize: 20, fontWeight: '900', color: '#8b5cf6' },
  cgpaLabel: { fontSize: 10, color: '#8b5cf6', fontWeight: 'bold' },

  // Stats Grid
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, backgroundColor: 'transparent' },
  statBox: { backgroundColor: '#fff', width: (width - 60) / 3, padding: 15, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  statNumber: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginTop: 8 },
  statLabel: { fontSize: 10, color: '#64748b', marginTop: 2 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginHorizontal: 20, marginTop: 30, marginBottom: 15 },

  // Schedule Cards
  scheduleCard: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 15, backgroundColor: 'transparent' },
  timeLine: { alignItems: 'center', width: 70, backgroundColor: 'transparent' },
  timeText: { fontSize: 12, fontWeight: '700', color: '#8b5cf6' },
  line: { flex: 1, width: 2, backgroundColor: '#e2e8f0', marginVertical: 5 },
  classInfo: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', marginLeft: 10 },
  classTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  classRoom: { fontSize: 12, color: '#64748b', marginTop: 4 },

  // Action Grid
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20, backgroundColor: 'transparent' },
  actionItem: { width: (width - 52) / 2, backgroundColor: '#fff', padding: 15, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  actionIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f5f3ff', justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 13, fontWeight: '700', color: '#475569' },
});