import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  FlatList, 
  TouchableOpacity, 
  View as RNView, 
  Modal, 
  TextInput, 
  Alert, 
  Dimensions 
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { TUTORS, TUITION_JOBS } from '@/data/demoData';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useRouter } from 'expo-router'; // useRouter যোগ করা হয়েছে

const { height } = Dimensions.get('window');

export default function HomeTutorScreen() {
  const router = useRouter(); // রাউটার হুক
  
  // Modal & Form States
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('');

  // Handle Apply Button Click
  const handleApply = (job: any) => {
    setSelectedJob(job);
    setModalVisible(true);
  };

  // Handle Form Submission
  const submitApplication = () => {
    if (!phone || !experience) {
      Alert.alert("Error", "Please fill in all fields before submitting.");
      return;
    }

    Alert.alert(
      "Success ✅", 
      `Your application for "${selectedJob?.title}" has been submitted.`
    );

    setModalVisible(false);
    setPhone('');
    setExperience('');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Home Tutor', headerShown: true }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* --- Available Tutors Section --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Tutors</Text>
          {/* See All এ ক্লিক করলে লিস্ট পেজে যাবে */}
          <TouchableOpacity onPress={() => router.push('/tutors-list')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={TUTORS}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.tutorCard} 
              activeOpacity={0.7}
              onPress={() => router.push('/tutors-list')} // কার্ডে ক্লিক করলেও লিস্টে যাবে
            >
              <RNView style={styles.avatar}>
                <Text style={styles.avatarText}>{item.avatar}</Text>
              </RNView>
              <Text style={styles.tutorName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.dept} numberOfLines={1}>{item.department}</Text>
              
              <RNView style={styles.subjectBadge}>
                <Text style={styles.subjectText}>{item.subject.split(',')[0]}</Text>
              </RNView>

              <View style={styles.cardFooter}>
                <View style={styles.ratingRow}>
                  <FontAwesome name="star" size={10} color="#f59e0b" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
                <Text style={styles.rateText}>{item.rate}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* --- Recent Tuition Jobs Section --- */}
        <View style={[styles.sectionHeader, { marginTop: 25 }]}>
          <Text style={styles.sectionTitle}>Recent Tuition Jobs</Text>
        </View>

        {TUITION_JOBS.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <RNView style={styles.jobMainInfo}>
              <RNView style={styles.jobBadge}>
                <Text style={styles.jobBadgeText}>{job.classLevel}</Text>
              </RNView>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobLoc}>
                <FontAwesome name="map-marker" size={12} color="#64748b" /> {job.location} • {job.days}
              </Text>
              <Text style={styles.postedBy}>Posted by: {job.postedBy}</Text>
            </RNView>
            
            <RNView style={styles.jobRightSide}>
              <Text style={styles.jobSalaryText}>{job.salary}</Text>
              <TouchableOpacity 
                style={styles.applyBtn} 
                onPress={() => handleApply(job)}
              >
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </RNView>
          </View>
        ))}
      </ScrollView>

      {/* --- Application Modal --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quick Apply</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome name="times-circle" size={26} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.jobNameHint}>Job: {selectedJob?.title}</Text>

            <Text style={styles.inputLabel}>Your Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="017XXXXXXXX"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor="#94a3b8"
            />

            <Text style={styles.inputLabel}>Total Experience</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2 Years / Student"
              value={experience}
              onChangeText={setExperience}
              placeholderTextColor="#94a3b8"
            />

            <TouchableOpacity style={styles.submitBtn} onPress={submitApplication}>
              <Text style={styles.submitBtnText}>Submit Application</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 15 },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginVertical: 15,
    backgroundColor: 'transparent'
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  seeAll: { color: '#2563eb', fontWeight: '600', fontSize: 14 },
  
  // Tutor Card
  tutorCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 24,
    marginRight: 15,
    width: 150,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  avatar: { width: 55, height: 55, borderRadius: 20, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#2563eb' },
  tutorName: { fontSize: 14, fontWeight: '700', color: '#334155' },
  dept: { fontSize: 10, color: '#64748b', marginBottom: 8 },
  subjectBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  subjectText: { fontSize: 9, fontWeight: '600', color: '#475569' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 12, backgroundColor: 'transparent', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'transparent' },
  ratingText: { fontSize: 11, fontWeight: '700' },
  rateText: { fontSize: 11, fontWeight: 'bold', color: '#10b981' },

  // Job Card
  jobCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  jobMainInfo: { flex: 1, backgroundColor: 'transparent' },
  jobBadge: { backgroundColor: '#eff6ff', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  jobBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#2563eb' },
  jobTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  jobLoc: { fontSize: 12, color: '#64748b', marginTop: 4 },
  postedBy: { fontSize: 10, color: '#94a3b8', marginTop: 6 },
  jobRightSide: { alignItems: 'flex-end', justifyContent: 'center', marginLeft: 10, backgroundColor: 'transparent' },
  jobSalaryText: { fontSize: 16, fontWeight: '800', color: '#10b981', marginBottom: 8 },
  applyBtn: { backgroundColor: '#2563eb', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  applyBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15,
    backgroundColor: 'transparent'
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  jobNameHint: { fontSize: 14, color: '#2563eb', marginBottom: 20, fontWeight: '600' },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 8 },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    marginBottom: 20,
    color: '#334155'
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});