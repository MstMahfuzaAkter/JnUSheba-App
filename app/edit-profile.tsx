import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  View as RNView, 
  ActivityIndicator, 
  Alert,
  Image 
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Stack, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [dept, setDept] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const session = await AsyncStorage.getItem('user_session');
      if (session) {
        const userData = JSON.parse(session);
        setName(userData.name || '');
        setDept(userData.dept || '');
        setStudentId(userData.studentId || '');
        setPhone(userData.phone || '');
        setProfileImage(userData.profileImage || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Image Picker Function ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Compression for faster saving
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty!");
      return;
    }

    setIsSaving(true);
    try {
      const session = await AsyncStorage.getItem('user_session');
      const currentData = session ? JSON.parse(session) : {};

      // Creating Updated Object
      const updatedData = {
        ...currentData,
        name: name.trim(),
        dept: dept.trim(),
        studentId: studentId.trim(),
        phone: phone.trim(),
        profileImage: profileImage, // Saving Image URI
      };

      await AsyncStorage.setItem('user_session', JSON.stringify(updatedData));
      
      Alert.alert("Success", "Profile updated successfully! 🎉", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (e) {
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Edit Profile', 
        headerShadowVisible: false,
        headerRight: () => (
          <TouchableOpacity onPress={handleSave} disabled={isSaving} style={{paddingRight: 10}}>
            {isSaving ? <ActivityIndicator size="small" color="#3b82f6" /> : <Text style={styles.saveBtnText}>Save</Text>}
          </TouchableOpacity>
        )
      }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        
        {/* --- Dynamic Profile Image Section --- */}
        <RNView style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.imagePreview} />
            ) : (
              <FontAwesome name="user-circle" size={100} color="#cbd5e1" />
            )}
            <RNView style={styles.cameraIcon}>
              <FontAwesome name="camera" size={14} color="#fff" />
            </RNView>
          </TouchableOpacity>
          <Text style={styles.changePhotoText} onPress={pickImage}>Change Profile Photo</Text>
        </RNView>

        {/* --- Input Fields --- */}
        <RNView style={styles.form}>
          <InputField label="Full Name" value={name} onChangeText={setName} icon="user" />
          <InputField label="Department" value={dept} onChangeText={setDept} icon="graduation-cap" />
          <InputField label="Student ID" value={studentId} onChangeText={setStudentId} icon="id-card" />
          <InputField label="Phone Number" value={phone} onChangeText={setPhone} icon="phone" keyboardType="phone-pad" />
        </RNView>

        <Text style={styles.infoText}>* Your data is stored locally on this device.</Text>

      </ScrollView>
    </View>
  );
}

const InputField = ({ label, value, onChangeText, icon, keyboardType = 'default' }: any) => (
  <RNView style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <RNView style={styles.inputWrapper}>
      <FontAwesome name={icon} size={16} color="#94a3b8" style={styles.inputIcon} />
      <TextInput 
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={`Enter your ${label.toLowerCase()}`}
        placeholderTextColor="#cbd5e1"
        keyboardType={keyboardType}
      />
    </RNView>
  </RNView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#3b82f6', fontWeight: '800', fontSize: 16 },
  
  avatarSection: { alignItems: 'center', marginVertical: 30, backgroundColor: 'transparent' },
  avatarWrapper: { position: 'relative' },
  imagePreview: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#f1f5f9' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3b82f6', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  changePhotoText: { color: '#3b82f6', fontSize: 14, fontWeight: '700', marginTop: 12 },

  form: { gap: 20, backgroundColor: 'transparent' },
  inputGroup: { backgroundColor: 'transparent' },
  label: { fontSize: 13, fontWeight: '800', color: '#64748b', marginBottom: 8, textTransform: 'uppercase' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 15, paddingHorizontal: 15, height: 55, borderWidth: 1, borderColor: '#f1f5f9' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, color: '#1e293b', fontWeight: '600' },
  
  infoText: { textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 40 }
});