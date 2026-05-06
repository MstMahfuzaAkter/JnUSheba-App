import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    View as RNView,
    Image,
    ActivityIndicator,
    Alert,
    Dimensions
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Stack, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const session = await AsyncStorage.getItem('user_session');
                if (!session) {
                    router.replace('/login');
                } else {
                    setUser(JSON.parse(session));
                    setGreeting(getGreeting()); // Dynamic greeting set kora
                }
            } catch (error) {
                router.replace('/login');
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const getGreeting = () => {
        const hours = new Date().getHours();
        if (hours < 12) return "Good Morning";
        if (hours < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const handleLogout = async () => {
        Alert.alert("Logout", "Are you sure you want to exit?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    await AsyncStorage.removeItem('user_session');
                    router.replace('/login');
                }
            }
        ]);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!user) return null;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Stack.Screen options={{
                title: '',
                headerTransparent: true,
                headerRight: () => (
                    <TouchableOpacity style={styles.headerActionBtn}>
                        <FontAwesome name="bell-o" size={18} color="#fff" />
                    </TouchableOpacity>
                ),
            }} />

            {/* --- Dynamic Header --- */}
            <LinearGradient colors={['#1e3a8a', '#3b82f6', '#60a5fa']} style={styles.headerBackground}>
                <RNView style={styles.profileHeader}>
                    <Text style={styles.greetingText}>{greeting},</Text>
                    <RNView style={styles.avatarWrapper}>
                        <RNView style={styles.statusRing} />
                        <Image
                            source={user.profileImage ? { uri: user.profileImage } : { uri: `https://ui-avatars.com/api/?name=${user.name}&background=fff&color=1e3a8a&bold=true` }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.editBadge}>
                            <FontAwesome name="pencil" size={12} color="#fff" />
                        </TouchableOpacity>
                    </RNView>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userRole}>{user.dept || 'Department Not Set'} • ID: {user.studentId || 'N/A'}</Text>
                </RNView>
            </LinearGradient>

            {/* --- Main Stats Card --- */}
            <View style={styles.statsCard}>
                <StatItem label="Used Services" value="14" icon="rocket" />
                <View style={styles.statDivider} />
                <StatItem label="Reward Points" value="520" icon="diamond" />
            </View>

            {/* --- Dynamic Order Tracker --- */}
            <View style={styles.orderStatusContainer}>
                <Text style={styles.sectionTitle}>Ongoing Service</Text>
                <RNView style={styles.orderCard}>
                    <RNView style={styles.orderInfo}>
                        <Text style={styles.orderName}>Printing & Copy</Text>
                        <Text style={styles.orderStep}>Processing by Admin</Text>
                    </RNView>
                    <RNView style={styles.progressContainer}>
                        <RNView style={[styles.progressBar, { width: '65%' }]} />
                    </RNView>
                    <FontAwesome name="refresh" size={14} color="#3b82f6" style={styles.spinningIcon} />
                </RNView>
            </View>

            {/* --- Settings Groups --- */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>
                <SettingLink
                    icon="user-o"
                    label="Edit Profile"
                    onPress={() => router.push('/edit-profile')} // Navigation add kora
                />
                <SettingLink icon="credit-card" label="Payment Methods" onPress={() => { }} />
                <SettingLink icon="history" label="Service History" onPress={() => { }} />
                <SettingLink icon="lock" label="Privacy & Security" onPress={() => { }} />
            </View>

            {/* --- Support Section --- */}
            <View style={[styles.section, { marginBottom: 20 }]}>
                <Text style={styles.sectionTitle}>Support</Text>
                <SettingLink icon="question-circle-o" label="Help Center" onPress={() => { }} />
                <SettingLink icon="info-circle" label="About Campus Service" onPress={() => { }} />
            </View>

            {/* --- Logout Button --- */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <LinearGradient colors={['#fff1f2', '#fff']} style={styles.logoutGradient}>
                    <FontAwesome name="sign-out" size={18} color="#ef4444" />
                    <Text style={styles.logoutText}>Log Out from Account</Text>
                </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.versionText}>Version 1.0.4 • Made with ❤️ for Campus</Text>
        </ScrollView>
    );
}

// Sub-components
const StatItem = ({ label, value, icon }: any) => (
    <View style={styles.statItem}>
        <RNView style={styles.statIconCircle}>
            <FontAwesome name={icon} size={14} color="#3b82f6" />
        </RNView>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const SettingLink = ({ icon, label, detail, onPress }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.6}>
        <RNView style={styles.iconWrapper}>
            <FontAwesome name={icon} size={18} color="#1e3a8a" />
        </RNView>
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <Text style={styles.settingLabel}>{label}</Text>
            {detail && <Text style={styles.settingDetail}>{detail}</Text>}
        </View>
        <FontAwesome name="angle-right" size={20} color="#cbd5e1" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    headerActionBtn: { marginRight: 15, padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
    headerBackground: { height: 350, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, paddingTop: 60 },
    profileHeader: { alignItems: 'center', backgroundColor: 'transparent' },
    greetingText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600' },

    avatarWrapper: { marginTop: 20, position: 'relative' },
    statusRing: { position: 'absolute', top: -8, left: -8, right: -8, bottom: -8, borderRadius: 100, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderStyle: 'dashed' },
    avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#fff' },
    editBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#1e3a8a', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },

    userName: { color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 15 },
    userRole: { color: '#dbeafe', fontSize: 14, fontWeight: '500' },

    statsCard: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 25, marginTop: -50, borderRadius: 30, padding: 25, elevation: 15, shadowColor: '#1e3a8a', shadowOpacity: 0.2, shadowRadius: 20 },
    statItem: { flex: 1, alignItems: 'center', backgroundColor: 'transparent' },
    statIconCircle: { backgroundColor: '#eff6ff', padding: 8, borderRadius: 10, marginBottom: 8 },
    statValue: { fontSize: 22, fontWeight: '900', color: '#1e293b' },
    statLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    statDivider: { width: 1, height: '70%', backgroundColor: '#f1f5f9', alignSelf: 'center' },

    section: { marginTop: 25, paddingHorizontal: 25, backgroundColor: 'transparent' },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: '#64748b', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1.5, paddingLeft: 5 },

    orderStatusContainer: { marginTop: 25, paddingHorizontal: 25, backgroundColor: 'transparent' },
    orderCard: { backgroundColor: '#fff', padding: 20, borderRadius: 24, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    orderInfo: { flex: 1, backgroundColor: 'transparent' },
    orderName: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    orderStep: { fontSize: 12, color: '#3b82f6', fontWeight: '600', marginTop: 2 },
    progressContainer: { width: 80, height: 6, backgroundColor: '#f1f5f9', borderRadius: 10, marginHorizontal: 15, overflow: 'hidden' },
    progressBar: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 10 },
    spinningIcon: { opacity: 0.6 },

    settingItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 22, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.02 },
    iconWrapper: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#f0f7ff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    settingLabel: { fontSize: 15, fontWeight: '700', color: '#334155' },
    settingDetail: { fontSize: 12, color: '#94a3b8' },

    logoutBtn: { marginHorizontal: 25, marginTop: 10, borderRadius: 22, overflow: 'hidden', borderWeight: 1, borderColor: '#fee2e2' },
    logoutGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, gap: 10 },
    logoutText: { color: '#ef4444', fontWeight: '800', fontSize: 16 },

    versionText: { textAlign: 'center', fontSize: 11, color: '#94a3b8', marginBottom: 30, fontWeight: '500' }
});