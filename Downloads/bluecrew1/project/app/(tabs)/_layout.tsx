import { Tabs } from 'expo-router';
import { Building2, Users, Calendar, Settings, UserCheck, Package, User } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#236ecf20',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#236ecf',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('projects'),
          tabBarIcon: ({ size, color }) => (
            <Building2 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          title: t('employees'),
          tabBarIcon: ({ size, color }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ size, color }) => (
            <UserCheck size={size} color={color} />
          ),
          href: userRole === 'admin' ? '/clients' : null,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: t('schedule'),
          tabBarIcon: ({ size, color }) => (
            <Calendar size={size} color={color} />
          ),
          href: userRole === 'client' ? null : '/schedule',
        }}
      />
      <Tabs.Screen
        name="material-request"
        options={{
          title: 'Materials',
          tabBarIcon: ({ size, color }) => (
            <Package size={size} color={color} />
          ),
          href: userRole === 'client' ? null : '/material-request',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}