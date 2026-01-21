import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User, Settings } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export const UserRoleSelector: React.FC = () => {
  const { t } = useLanguage();
  const { userRole, setUserRole } = useAuth();
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.roleButton,
          userRole === 'client' ? styles.activeButton : styles.inactiveButton
        ]}
        onPress={() => setUserRole('client')}>
        <User size={16} color={userRole === 'client' ? '#ffffff' : '#6b7280'} />
        <Text style={[
          styles.roleText,
          userRole === 'client' ? styles.activeText : styles.inactiveText
        ]}>
          {t('client')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.roleButton,
          userRole === 'pm' ? styles.activeButton : styles.inactiveButton
        ]}
        onPress={() => setUserRole('pm')}>
        <Settings size={16} color={userRole === 'pm' ? '#ffffff' : '#6b7280'} />
        <Text style={[
          styles.roleText,
          userRole === 'pm' ? styles.activeText : styles.inactiveText
        ]}>
          {t('manager')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 2,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  activeButton: {
    backgroundColor: '#236ecf',
  },
  inactiveButton: {
    backgroundColor: 'transparent',
  },
  roleText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#ffffff',
  },
  inactiveText: {
    color: '#6b7280',
  },
});