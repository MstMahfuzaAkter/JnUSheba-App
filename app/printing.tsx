import React, { useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  View as RNView, 
  Alert 
} from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';

export default function PrintingScreen() {
  const [pages, setPages] = useState('1');
  const [printType, setPrintType] = useState('bw'); // bw = Black & White, color = Color
  const [deliveryType, setDeliveryType] = useState('pickup'); // pickup or delivery

  const pricePerPage = printType === 'bw' ? 2 : 10;
  const totalPrice = parseInt(pages || '0') * pricePerPage + (deliveryType === 'delivery' ? 20 : 0);

  const handleOrder = () => {
    Alert.alert("Order Placed ✅", "Your printing request has been sent. Check status in 'My Orders'.");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Printing & Copy', headerShadowVisible: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* --- Upload Section --- */}
        <View style={styles.uploadCard}>
          <View style={styles.iconCircle}>
            <FontAwesome name="cloud-upload" size={30} color="#10b981" />
          </View>
          <Text style={styles.uploadTitle}>Upload Documents</Text>
          <Text style={styles.uploadSub}>PDF, DOCX or Images (Max 20MB)</Text>
          <TouchableOpacity style={styles.selectBtn}>
            <Text style={styles.selectBtnText}>Select Files</Text>
          </TouchableOpacity>
        </View>

        {/* --- Configuration --- */}
        <Text style={styles.sectionTitle}>Print Settings</Text>
        
        <View style={styles.settingsGrid}>
          {/* Black & White */}
          <TouchableOpacity 
            style={[styles.optionCard, printType === 'bw' && styles.activeOption]} 
            onPress={() => setPrintType('bw')}
          >
            <FontAwesome name="file-text-o" size={20} color={printType === 'bw' ? '#10b981' : '#64748b'} />
            <Text style={[styles.optionLabel, printType === 'bw' && styles.activeText]}>B&W</Text>
            <Text style={styles.optionPrice}>2৳ /page</Text>
          </TouchableOpacity>

          {/* Color */}
          <TouchableOpacity 
            style={[styles.optionCard, printType === 'color' && styles.activeOption]} 
            onPress={() => setPrintType('color')}
          >
            <FontAwesome name="image" size={20} color={printType === 'color' ? '#10b981' : '#64748b'} />
            <Text style={[styles.optionLabel, printType === 'color' && styles.activeText]}>Color</Text>
            <Text style={styles.optionPrice}>10৳ /page</Text>
          </TouchableOpacity>
        </View>

        {/* --- Quantity & Location --- */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Number of Pages</Text>
          <TextInput 
            style={styles.input}
            keyboardType="numeric"
            value={pages}
            onChangeText={setPages}
            placeholder="e.g. 10"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Delivery Method</Text>
          <RNView style={styles.deliveryToggle}>
            <TouchableOpacity 
              style={[styles.toggleBtn, deliveryType === 'pickup' && styles.activeToggle]} 
              onPress={() => setDeliveryType('pickup')}
            >
              <Text style={[styles.toggleText, deliveryType === 'pickup' && styles.activeToggleText]}>Self Pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, deliveryType === 'delivery' && styles.activeToggle]} 
              onPress={() => setDeliveryType('delivery')}
            >
              <Text style={[styles.toggleText, deliveryType === 'delivery' && styles.activeToggleText]}>Hall Delivery</Text>
            </TouchableOpacity>
          </RNView>
        </View>

        {/* --- Bill Summary --- */}
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Bill Summary</Text>
          <RNView style={styles.billRow}>
            <Text style={styles.billLabel}>Printing Cost</Text>
            <Text style={styles.billValue}>{parseInt(pages || '0') * pricePerPage}৳</Text>
          </RNView>
          <RNView style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Charge</Text>
            <Text style={styles.billValue}>{deliveryType === 'delivery' ? '20৳' : 'Free'}</Text>
          </RNView>
          <RNView style={styles.divider} />
          <RNView style={styles.billRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>{totalPrice}৳</Text>
          </RNView>
        </View>

      </ScrollView>

      {/* --- Action Button --- */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.orderBtn} onPress={handleOrder}>
          <Text style={styles.orderBtnText}>Confirm Printing Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 20 },
  
  // Upload Section
  uploadCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#ecfdf5', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  uploadTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  uploadSub: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  selectBtn: { backgroundColor: '#10b981', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 15 },
  selectBtnText: { color: '#fff', fontWeight: '700' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginTop: 25, marginBottom: 15 },
  
  // Settings Options
  settingsGrid: { flexDirection: 'row', gap: 15, backgroundColor: 'transparent' },
  optionCard: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  activeOption: { borderColor: '#10b981', backgroundColor: '#f0fdf4' },
  optionLabel: { fontSize: 14, fontWeight: '700', color: '#64748b', marginTop: 8 },
  activeText: { color: '#10b981' },
  optionPrice: { fontSize: 11, color: '#94a3b8', marginTop: 2 },

  // Inputs
  inputGroup: { marginTop: 20, backgroundColor: 'transparent' },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 10 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 16 },
  
  deliveryToggle: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 5 },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  activeToggle: { backgroundColor: '#fff', elevation: 2 },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  activeToggleText: { color: '#1e293b' },

  // Bill Summary
  billCard: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, marginTop: 30 },
  billTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 15 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, backgroundColor: 'transparent' },
  billLabel: { color: '#94a3b8', fontSize: 14 },
  billValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 10 },
  totalLabel: { color: '#fff', fontSize: 16, fontWeight: '800' },
  totalValue: { color: '#10b981', fontSize: 20, fontWeight: '800' },

  // Footer
  footer: { paddingVertical: 20, backgroundColor: 'transparent' },
  orderBtn: { backgroundColor: '#10b981', height: 55, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  orderBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});