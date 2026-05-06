import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { TUTORS } from '@/data/demoData';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';

export default function TutorsListScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'All Available Tutors', headerShown: true }} />

      <FlatList
        data={TUTORS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.listCard} activeOpacity={0.8}>
            <RNView style={styles.avatar}>
              <Text style={styles.avatarText}>{item.avatar}</Text>
            </RNView>
            
            <RNView style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.dept}>{item.department}</Text>
              <Text style={styles.subjects}>📚 {item.subject}</Text>
              
              <RNView style={styles.footer}>
                <RNView style={styles.ratingRow}>
                  <FontAwesome name="star" size={14} color="#f59e0b" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </RNView>
                <Text style={styles.rate}>{item.rate}</Text>
              </RNView>
            </RNView>
            
            <FontAwesome name="chevron-right" size={16} color="#cbd5e1" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatar: { width: 60, height: 60, borderRadius: 15, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#2563eb' },
  info: { flex: 1, marginLeft: 15, backgroundColor: 'transparent' },
  name: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  dept: { fontSize: 12, color: '#64748b', marginVertical: 2 },
  subjects: { fontSize: 12, color: '#475569', marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center', backgroundColor: 'transparent' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'transparent' },
  ratingText: { fontSize: 13, fontWeight: '700' },
  rate: { fontSize: 14, fontWeight: 'bold', color: '#10b981' }
});