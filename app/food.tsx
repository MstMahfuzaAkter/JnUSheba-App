import React, { useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  View as RNView, 
  Image,
  Dimensions,
  TextInput 
} from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';

const { width } = Dimensions.get('window');

const FOOD_ITEMS = [
  { id: '1', name: 'Chicken Khichuri', price: 120, restaurant: 'Campus Canteen', rating: 4.5, time: '15 min' },
  { id: '2', name: 'Beef Burger', price: 180, restaurant: 'Foodie Hub', rating: 4.8, time: '25 min' },
  { id: '3', name: 'Masala Tea', price: 15, restaurant: 'TSC Corner', rating: 4.9, time: '05 min' },
  { id: '4', name: 'Fried Rice Combo', price: 250, restaurant: 'Chinese Kitchen', rating: 4.3, time: '30 min' },
];

export default function FoodDeliveryScreen() {
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Campus Food', headerShadowVisible: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* --- Search Bar --- */}
        <RNView style={styles.searchBox}>
          <FontAwesome name="search" size={16} color="#94a3b8" />
          <TextInput placeholder="Search food, restaurants..." style={styles.searchInput} />
        </RNView>

        {/* --- Categories --- */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {['All', 'Lunch', 'Snacks', 'Drinks', 'Fast Food'].map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.catBtn, activeCategory === cat && styles.activeCatBtn]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.catBtnText, activeCategory === cat && styles.activeCatText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Popular Now</Text>

        {/* --- Food List --- */}
        <RNView style={styles.foodGrid}>
          {FOOD_ITEMS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.foodCard}>
              <RNView style={styles.imagePlaceholder}>
                <FontAwesome name="cutlery" size={30} color="#f97316" />
                <RNView style={styles.timeBadge}>
                  <Text style={styles.timeText}>{item.time}</Text>
                </RNView>
              </RNView>

              <RNView style={styles.cardInfo}>
                <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.restName}>{item.restaurant}</Text>
                
                <RNView style={styles.priceRow}>
                  <Text style={styles.priceText}>{item.price}৳</Text>
                  <RNView style={styles.ratingBox}>
                    <FontAwesome name="star" size={10} color="#f97316" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </RNView>
                </RNView>
              </RNView>

              <TouchableOpacity style={styles.addBtn}>
                <FontAwesome name="plus" size={14} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </RNView>

        {/* --- Cart Floating View (Visual) --- */}
        <TouchableOpacity style={styles.cartBar}>
          <RNView style={styles.cartLeft}>
            <RNView style={styles.cartCount}>
              <Text style={styles.cartCountText}>2</Text>
            </RNView>
            <Text style={styles.cartTotal}>View Cart • 300৳</Text>
          </RNView>
          <FontAwesome name="shopping-basket" size={18} color="#fff" />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  
  // Search
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 20, paddingHorizontal: 15, borderRadius: 15, height: 50, borderWidth: 1, borderColor: '#f1f5f9' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },

  // Categories
  catScroll: { paddingLeft: 20, marginBottom: 20 },
  catBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', marginRight: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  activeCatBtn: { backgroundColor: '#f97316', borderColor: '#f97316' },
  catBtnText: { fontWeight: '700', color: '#64748b', fontSize: 13 },
  activeCatText: { color: '#fff' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginHorizontal: 20, marginBottom: 15 },

  // Food Grid
  foodGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, backgroundColor: 'transparent' },
  foodCard: { 
    backgroundColor: '#fff', 
    width: (width - 50) / 2, 
    margin: 5, 
    borderRadius: 20, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  imagePlaceholder: { height: 120, backgroundColor: '#fff7ed', justifyContent: 'center', alignItems: 'center' },
  timeBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  timeText: { fontSize: 10, fontWeight: 'bold', color: '#c2410c' },

  cardInfo: { padding: 12, backgroundColor: 'transparent' },
  foodName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  restName: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, backgroundColor: 'transparent' },
  priceText: { fontSize: 16, fontWeight: '800', color: '#f97316' },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'transparent' },
  ratingText: { fontSize: 11, fontWeight: '700', color: '#475569' },

  addBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: '#f97316', width: 28, height: 28, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  // Cart Bar
  cartBar: { 
    flexDirection: 'row', 
    backgroundColor: '#1e293b', 
    margin: 20, 
    padding: 15, 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginTop: 30
  },
  cartLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'transparent' },
  cartCount: { backgroundColor: '#f97316', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  cartCountText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  cartTotal: { color: '#fff', fontWeight: '700', fontSize: 14 }
});