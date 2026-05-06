import React, { useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  View as RNView, 
  Alert,
  Dimensions
} from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';

const { width } = Dimensions.get('window');

const CLEANING_PACKAGES = [
  { id: '1', title: 'Basic Room', desc: 'Floor sweep, mop & dusting', price: 150, icon: 'home' },
  { id: '2', title: 'Deep Clean', desc: 'Bathroom, floor & windows', price: 400, icon: 'magic' },
  { id: '3', title: 'Laundry', desc: 'Wash & fold (up to 5kg)', price: 200, icon: 'shirtsinbulk' },
];

export default function CleaningScreen() {
  const [selectedPackage, setSelectedPackage] = useState('1');
  const [selectedTime, setSelectedTime] = useState('morning');

  const handleBooking = () => {
    const pkg = CLEANING_PACKAGES.find(p => p.id === selectedPackage);
    Alert.alert(
      "Booking Confirmed 🧹", 
      `We'll arrive tomorrow ${selectedTime === 'morning' ? 'between 9AM-12PM' : 'between 3PM-6PM'} for your ${pkg?.title}.`
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Cleaning Service', headerShadowVisible: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* --- Header Banner --- */}
        <RNView style={styles.headerBanner}>
          <FontAwesome name="check-circle" size={20} color="#fff" />
          <Text style={styles.bannerText}>Verified & Professional Cleaners</Text>
        </RNView>

        <Text style={styles.sectionTitle}>Select a Package</Text>
        
        {/* --- Packages List --- */}
        {CLEANING_PACKAGES.map((pkg) => (
          <TouchableOpacity 
            key={pkg.id}
            style={[styles.packageCard, selectedPackage === pkg.id && styles.activeCard]}
            onPress={() => setSelectedPackage(pkg.id)}
            activeOpacity={0.8}
          >
            <RNView style={[styles.iconBox, selectedPackage === pkg.id && styles.activeIconBox]}>
              <FontAwesome name={pkg.icon as any} size={24} color={selectedPackage === pkg.id ? '#fff' : '#f59e0b'} />
            </RNView>
            <RNView style={styles.pkgInfo}>
              <Text style={styles.pkgTitle}>{pkg.title}</Text>
              <Text style={styles.pkgDesc}>{pkg.desc}</Text>
            </RNView>
            <Text style={styles.pkgPrice}>{pkg.price}৳</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Preferred Time</Text>
        
        {/* --- Time Slots --- */}
        <RNView style={styles.timeGrid}>
          <TouchableOpacity 
            style={[styles.timeBtn, selectedTime === 'morning' && styles.activeTimeBtn]}
            onPress={() => setSelectedTime('morning')}
          >
            <FontAwesome name="sun-o" size={18} color={selectedTime === 'morning' ? '#fff' : '#64748b'} />
            <Text style={[styles.timeBtnText, selectedTime === 'morning' && styles.activeTimeText]}>Morning</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.timeBtn, selectedTime === 'evening' && styles.activeTimeBtn]}
            onPress={() => setSelectedTime('evening')}
          >
            <FontAwesome name="moon-o" size={18} color={selectedTime === 'evening' ? '#fff' : '#64748b'} />
            <Text style={[styles.timeBtnText, selectedTime === 'evening' && styles.activeTimeText]}>Evening</Text>
          </TouchableOpacity>
        </RNView>

        {/* --- Instructions --- */}
        <RNView style={styles.infoBox}>
          <FontAwesome name="info-circle" size={18} color="#f59e0b" />
          <Text style={styles.infoText}>
            Our cleaner will bring all necessary equipment. Please ensure someone is present at the room.
          </Text>
        </RNView>

      </ScrollView>

      {/* --- Bottom Dock --- */}
      <RNView style={styles.bottomDock}>
        <RNView style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Payable</Text>
          <Text style={styles.totalAmount}>
            {CLEANING_PACKAGES.find(p => p.id === selectedPackage)?.price}৳
          </Text>
        </RNView>
        <TouchableOpacity style={styles.bookBtn} onPress={handleBooking}>
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  
  headerBanner: { 
    flexDirection: 'row', 
    backgroundColor: '#f59e0b', 
    padding: 12, 
    marginHorizontal: 20, 
    borderRadius: 12, 
    alignItems: 'center', 
    gap: 10,
    marginTop: 10 
  },
  bannerText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginHorizontal: 20, marginTop: 25, marginBottom: 15 },

  // Package Cards
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  activeCard: { borderColor: '#f59e0b', backgroundColor: '#fff9f0' },
  iconBox: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#fff9f0', justifyContent: 'center', alignItems: 'center' },
  activeIconBox: { backgroundColor: '#f59e0b' },
  pkgInfo: { flex: 1, marginLeft: 15, backgroundColor: 'transparent' },
  pkgTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  pkgDesc: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  pkgPrice: { fontSize: 18, fontWeight: '800', color: '#1e293b' },

  // Time Slots
  timeGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 15, backgroundColor: 'transparent' },
  timeBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    backgroundColor: '#fff', 
    paddingVertical: 15, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  activeTimeBtn: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
  timeBtnText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
  activeTimeText: { color: '#fff' },

  // Info
  infoBox: { flexDirection: 'row', marginHorizontal: 20, marginTop: 30, padding: 15, backgroundColor: '#fef3c7', borderRadius: 15, gap: 12 },
  infoText: { flex: 1, fontSize: 12, color: '#92400e', lineHeight: 18 },

  // Bottom Dock
  bottomDock: { 
    position: 'absolute', 
    bottom: 0, 
    width: width, 
    backgroundColor: '#fff', 
    padding: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingBottom: 35
  },
  totalSection: { backgroundColor: 'transparent' },
  totalLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  totalAmount: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
  bookBtn: { backgroundColor: '#f59e0b', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 16 },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});