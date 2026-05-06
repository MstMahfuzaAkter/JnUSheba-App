import React, { useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  View as RNView, 
  TextInput, 
  Dimensions 
} from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';

const { width } = Dimensions.get('window');

const SUBJECTS = [
  { id: '1', title: 'CSE', files: '120 Files', color: '#6366f1', icon: 'code' },
  { id: '2', title: 'EEE', files: '85 Files', color: '#f59e0b', icon: 'bolt' },
  { id: '3', title: 'BBA', files: '64 Files', color: '#10b981', icon: 'line-chart' },
  { id: '4', title: 'English', files: '42 Files', color: '#ec4899', icon: 'book' },
];

const RECENT_UPLOADS = [
  { id: '1', name: 'Algorithm_Final_Notes.pdf', size: '2.4 MB', type: 'pdf' },
  { id: '2', name: 'Economics_Mid_Question.jpg', size: '1.1 MB', type: 'image' },
  { id: '3', name: 'Lab_Report_Template.docx', size: '540 KB', type: 'doc' },
];

export default function NotesScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Study Resources', headerShadowVisible: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* --- Search Bar --- */}
        <RNView style={styles.searchContainer}>
          <RNView style={styles.searchBox}>
            <FontAwesome name="search" size={16} color="#94a3b8" />
            <TextInput placeholder="Search subjects, topics..." style={styles.searchInput} />
          </RNView>
          <TouchableOpacity style={styles.uploadIconBtn}>
            <FontAwesome name="plus-circle" size={32} color="#6366f1" />
          </TouchableOpacity>
        </RNView>

        {/* --- Department Folders --- */}
        <Text style={styles.sectionTitle}>Departments</Text>
        <RNView style={styles.folderGrid}>
          {SUBJECTS.map((sub) => (
            <TouchableOpacity key={sub.id} style={styles.folderCard}>
              <RNView style={[styles.folderIcon, { backgroundColor: `${sub.color}15` }]}>
                <FontAwesome name={sub.icon as any} size={24} color={sub.color} />
              </RNView>
              <Text style={styles.folderTitle}>{sub.title}</Text>
              <Text style={styles.fileCount}>{sub.files}</Text>
            </TouchableOpacity>
          ))}
        </RNView>

        {/* --- Recent Files --- */}
        <RNView style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Uploads</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
        </RNView>

        {/* --- Files List --- */}
        {RECENT_UPLOADS.map((file) => (
          <TouchableOpacity key={file.id} style={styles.fileRow}>
            <RNView style={[styles.fileIconBox, { backgroundColor: file.type === 'pdf' ? '#fef2f2' : '#f0f9ff' }]}>
              <FontAwesome 
                name={file.type === 'pdf' ? 'file-pdf-o' : file.type === 'image' ? 'file-image-o' : 'file-word-o'} 
                size={18} 
                color={file.type === 'pdf' ? '#ef4444' : '#0ea5e9'} 
              />
            </RNView>
            <RNView style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              <Text style={styles.fileSize}>{file.size}</Text>
            </RNView>
            <TouchableOpacity style={styles.downloadBtn}>
              <FontAwesome name="download" size={16} color="#64748b" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {/* --- Contribution Card --- */}
        <RNView style={styles.contributeCard}>
          <RNView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Text style={styles.contributeTitle}>Help your peers!</Text>
            <Text style={styles.contributeText}>Upload your notes and help others to score better.</Text>
          </RNView>
          <TouchableOpacity style={styles.contributeBtn}>
            <Text style={styles.contributeBtnText}>Upload</Text>
          </TouchableOpacity>
        </RNView>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  
  // Search
  searchContainer: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 15 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, borderRadius: 15, height: 50, borderWidth: 1, borderColor: '#e2e8f0' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
  uploadIconBtn: { backgroundColor: 'transparent' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginHorizontal: 20, marginBottom: 15 },

  // Folders
  folderGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, backgroundColor: 'transparent' },
  folderCard: { 
    width: (width - 60) / 2, 
    backgroundColor: '#fff', 
    margin: 7, 
    padding: 20, 
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'flex-start'
  },
  folderIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  folderTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  fileCount: { fontSize: 12, color: '#94a3b8', marginTop: 4 },

  // Files
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20, backgroundColor: 'transparent', marginTop: 20 },
  viewAll: { color: '#6366f1', fontWeight: '700', fontSize: 13 },
  fileRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, padding: 15, borderRadius: 18, marginBottom: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  fileIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  fileInfo: { flex: 1, marginLeft: 15, backgroundColor: 'transparent' },
  fileName: { fontSize: 14, fontWeight: '600', color: '#334155' },
  fileSize: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  downloadBtn: { padding: 10 },

  // Contribute
  contributeCard: { backgroundColor: '#1e293b', margin: 20, padding: 20, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 15 },
  contributeTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  contributeText: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  contributeBtn: { backgroundColor: '#6366f1', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
  contributeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 }
});