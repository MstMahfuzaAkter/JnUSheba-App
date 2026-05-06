import React, { useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  View as RNView, 
  Alert,
  Dimensions,
  FlatList
} from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';

const { width } = Dimensions.get('window');

const PHOTO_CATEGORIES = [
  { id: '1', title: 'Portrait', price: '500৳', icon: 'user', desc: 'Single person, 10 edited photos' },
  { id: '2', title: 'Event', price: '2000৳', icon: 'calendar', desc: 'Birthdays/Parties, 2 hours' },
  { id: '3', title: 'Graduation', price: '1200৳', icon: 'graduation-cap', desc: 'Group/Solo, convocation style' },
];

export default function PhotographyScreen() {
  const [selectedCat, setSelectedCat] = useState('1');

  const handleBooking = () => {
    Alert.alert("Request Sent! 📸", "Our photographer will contact you to discuss the details and venue.");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Photography', headerShadowVisible: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* --- Hero / Portfolio Preview --- */}
        <RNView style={styles.portfolioContainer}>
          <Text style={styles.sectionTitle}>Sample Clicks</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {[1, 2, 3].map((img) => (
              <RNView key={img} style={styles.imageWrapper}>
                <RNView style={styles.placeholderImg}>
                   <FontAwesome name="image" size={40} color="#cbd5e1" />
                </RNView>
              </RNView>
            ))}
          </ScrollView>
        </RNView>

        <Text style={styles.sectionTitle}>Choose Package</Text>

        {/* --- Packages --- */}
        {PHOTO_CATEGORIES.map((cat) => (
          <TouchableOpacity 
            key={cat.id}
            style={[styles.packageCard, selectedCat === cat.id && styles.activeCard]}
            onPress={() => setSelectedCat(cat.id)}
          >
            <RNView style={[styles.iconCircle, selectedCat === cat.id && styles.activeIcon]}>
              <FontAwesome name={cat.icon as any} size={20} color={selectedCat === cat.id ? '#fff' : '#ef4444'} />
            </RNView>
            
            <RNView style={styles.pkgTextContent}>
              <Text style={styles.pkgTitle}>{cat.title}</Text>
              <Text style={styles.pkgDesc}>{cat.desc}</Text>
            </RNView>

            <RNView style={styles.priceTag}>
              <Text style={styles.priceText}>{cat.price}</Text>
            </RNView>
          </TouchableOpacity>
        ))}

        {/* --- Perks Section --- */}
        <RNView style={styles.perksCard}>
          <Text style={styles.perksTitle}>Why choose our photographers?</Text>
          <RNView style={styles.perkItem}>
            <FontAwesome name="flash" size={14} color="#ef4444" />
            <Text style={styles.perkText}>High-end DSLR Gear</Text>
          </RNView>
          <RNView style={styles.perkItem}>
            <FontAwesome name="clock-o" size={14} color="#ef4444" />
            <Text style={styles.perkText}>Delivery within 48 Hours</Text>
          </RNView>
          <RNView style={styles.perkItem}>
            <FontAwesome name="magic" size={14} color="#ef4444" />
            <Text style={styles.perkText}>Professional Photo Retouching</Text>
          </RNView>
        </RNView>

      </ScrollView>

      {/* --- Footer --- */}
      <RNView style={styles.footer}>
        <TouchableOpacity style={styles.bookBtn} onPress={handleBooking}>
          <Text style={styles.bookBtnText}>Book Photographer</Text>
        </TouchableOpacity>
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  // Portfolio
  portfolioContainer: { marginTop: 10, paddingLeft: 20, backgroundColor: 'transparent' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 15, marginTop: 10 },
  imageScroll: { flexDirection: 'row' },
  imageWrapper: { width: width * 0.7, height: 180, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 15, overflow: 'hidden' },
  placeholderImg: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Package Cards
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginHorizontal: 20,
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#f8fafc',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  activeCard: { borderColor: '#ef4444', backgroundColor: '#fffbfa' },
  iconCircle: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#fff1f0', justifyContent: 'center', alignItems: 'center' },
  activeIcon: { backgroundColor: '#ef4444' },
  pkgTextContent: { flex: 1, marginLeft: 15, backgroundColor: 'transparent' },
  pkgTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  pkgDesc: { fontSize: 11, color: '#64748b', marginTop: 2 },
  priceTag: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  priceText: { fontSize: 14, fontWeight: '800', color: '#ef4444' },

  // Perks
  perksCard: { margin: 20, padding: 20, backgroundColor: '#f8fafc', borderRadius: 20 },
  perksTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  perkItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, backgroundColor: 'transparent' },
  perkText: { fontSize: 13, color: '#475569' },

  // Footer
  footer: { position: 'absolute', bottom: 0, width: width, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingBottom: 35 },
  bookBtn: { backgroundColor: '#ef4444', height: 55, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});