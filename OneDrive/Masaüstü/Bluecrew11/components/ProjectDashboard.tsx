import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { ArrowLeft, Calendar, Clock, Package, FileText, Settings, Users, DollarSign } from 'lucide-react-native';
import { Project } from '@/types';
import { useRouter } from 'expo-router';

interface ProjectDashboardProps {
  project: Project;
  onBack: () => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ project, onBack }) => {
  const router = useRouter();

  const menuItems = [
    {
      id: 'materials',
      title: 'Material Requests',
      description: 'Request materials and supplies',
      icon: Package,
      color: '#f59e0b',
      route: '/material-request',
    },
    {
      id: 'changes',
      title: 'Change Requests',
      description: 'Request project changes',
      icon: FileText,
      color: '#8b5cf6',
      route: '/change-request',
    },
    {
      id: 'schedule',
      title: 'Schedule',
      description: 'Manage project timeline',
      icon: Calendar,
      color: '#059669',
      route: '/schedule',
    },
    {
      id: 'timeclock',
      title: 'Time Clock',
      description: 'Track working hours',
      icon: Clock,
      color: '#3b82f6',
      route: '/time-clock',
    },
    {
      id: 'team',
      title: 'Team Management',
      description: 'Manage project team',
      icon: Users,
      color: '#ef4444',
      route: '/team',
    },
    {
      id: 'budget',
      title: 'Budget & Finance',
      description: 'Track project costs',
      icon: DollarSign,
      color: '#10b981',
      route: '/budget',
    },
    {
      id: 'settings',
      title: 'Project Settings',
      description: 'Configure project settings',
      icon: Settings,
      color: '#6b7280',
      route: '/project-settings',
    },
  ];

  const handleMenuPress = (route: string) => {
    router.push(route);
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#059669';
      case 'completed': return '#3b82f6';
      case 'on_hold': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getProjectStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'on_hold': return 'On Hold';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color="#236ecf" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.projectTitle} numberOfLines={2}>
            {project.title}
          </Text>
          <View style={styles.projectMeta}>
            <View style={[styles.statusBadge, { backgroundColor: getProjectStatusColor(project.status) }]}>
              <Text style={styles.statusText}>
                {getProjectStatusText(project.status)}
              </Text>
            </View>
            <Text style={styles.progressText}>
              {project.progress_percentage}% Complete
            </Text>
          </View>
        </View>
      </View>

      {/* Project Info Card */}
      <View style={styles.projectInfoCard}>
        <View style={styles.projectInfoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Client</Text>
            <Text style={styles.infoValue}>{project.client_name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Budget</Text>
            <Text style={styles.infoValue}>
              ${project.total_budget?.toLocaleString() || 'N/A'}
            </Text>
          </View>
        </View>
        <View style={styles.projectInfoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Start Date</Text>
            <Text style={styles.infoValue}>
              {new Date(project.start_date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Deadline</Text>
            <Text style={styles.infoValue}>
              {new Date(project.deadline).toLocaleDateString()}
            </Text>
          </View>
        </View>
        {project.assigned_pms && project.assigned_pms.length > 0 && (
          <View style={styles.projectInfoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Project Managers</Text>
              <Text style={styles.infoValue}>
                {project.assigned_pms.join(', ')}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Menu Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Project Management</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.route)}>
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                <item.icon size={24} color="#ffffff" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
  },
  projectInfoCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectInfoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  menuGrid: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
});
