import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Globe, User, Settings as SettingsIcon, Info, LogOut, ArrowLeft } from 'lucide-react-native';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import HamburgerMenu from '@/components/HamburgerMenu';
import { Platform } from 'react-native';

export default function SettingsScreen() {
  const { language, setLanguage, t } = useLanguage();
  const { user, userRole, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      console.log('Logout button pressed');
      await logout();
      console.log('Logout completed, navigating to login');
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  };

  const LanguageOption = ({ lang, label }: { lang: Language; label: string }) => (
    <TouchableOpacity
      style={[
        styles.languageOption,
        language === lang && styles.selectedLanguage
      ]}
      onPress={() => setLanguage(lang)}>
      <Text style={[
        styles.languageText,
        language === lang && styles.selectedLanguageText
      ]}>
        {label}
      </Text>
      {language === lang && (
        <View style={styles.selectedDot} />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <HamburgerMenu />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/');
              }
            }}
          >
            <ArrowLeft size={24} color="#236ecf" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>{t('settings')}</Text>
          </View>
        </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User size={32} color="#ffffff" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userRole?.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe size={20} color="#236ecf" />
            <Text style={styles.sectionTitle}>{t('language')}</Text>
          </View>
          
          <View style={styles.languageContainer}>
            <LanguageOption lang="en" label={t('english')} />
            <LanguageOption lang="es" label={t('spanish')} />
          </View>
        </View>


        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SettingsIcon size={20} color="#236ecf" />
            <Text style={styles.sectionTitle}>App Settings</Text>
          </View>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Notifications</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Privacy Policy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color="#236ecf" />
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.appName}>BlueCrew Project Manager</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
            <Text style={styles.description}>
              Professional construction project management and tracking application 
              designed for BlueCrew Contractors.
            </Text>
          </View>
        </View>
      </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#236ecf', // Blue background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e40af', // Darker blue header
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00',
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffcc00', // Yellow text
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00', // Yellow border like teams
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#236ecf',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#236ecf',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  roleBadge: {
    backgroundColor: '#236ecf',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00', // Yellow border like teams
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#236ecf',
    marginLeft: 12,
  },
  languageContainer: {
    gap: 8,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  selectedLanguage: {
    backgroundColor: '#236ecf20',
  },
  languageText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedLanguageText: {
    color: '#236ecf',
    fontWeight: '600',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#236ecf',
  },
  settingItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  settingText: {
    fontSize: 14,
    color: '#374151',
  },
  infoContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#236ecf',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 8,
  },
});