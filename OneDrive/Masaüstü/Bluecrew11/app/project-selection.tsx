import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectService } from '@/services/projectService';
import { Project } from '@/types';
import { Calendar, Clock, Package, FileText, Settings, ArrowRight, User } from 'lucide-react-native';

export default function ProjectSelectionScreen() {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key: string) => key);
  const authContext = useAuth();
  const userRole = authContext?.userRole || 'admin';
  const user = authContext?.user || null;
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const cardAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      console.log('Loading projects...');
      
      try {
        const firebaseProjects = await ProjectService.getProjects();
        console.log('Firebase projects loaded:', firebaseProjects.length);
        
        // Filter projects based on user role
        let filteredProjects = firebaseProjects;
        if (userRole === 'pm') {
          // PM can only see projects they are assigned to
          filteredProjects = firebaseProjects.filter(project => 
            project.assigned_pms?.includes(user?.name || '')
          );
          console.log('PM filtered projects:', filteredProjects.length);
        } else if (userRole === 'client') {
          // Client can only see their own projects
          filteredProjects = firebaseProjects.filter(project => 
            project.client_name === user?.name
          );
          console.log('Client filtered projects:', filteredProjects.length);
        }
        
        console.log('Final projects:', filteredProjects);
        setProjects(filteredProjects);
      } catch (firebaseError) {
        console.error('Firebase error loading projects:', firebaseError);
        setProjects([]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project: Project) => {
    console.log('Project selected:', project.id);
    try {
      // Doğrudan detay sayfasına git, animasyon olmadan
      router.push(`/(tabs)/project/${project.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to navigate to project details');
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#059669';
      case 'in_progress': return '#0ea5e9';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#236ecf" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  const visibleProjects = projects.filter(p =>
    activeTab === 'active' ? p.status !== 'completed' : p.status === 'completed'
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <Text style={styles.subtitle}>Manage all your projects</Text>
        <View style={styles.segmented}>
          <TouchableOpacity
            style={[styles.segmentItem, activeTab === 'active' && styles.segmentActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.segmentText, activeTab === 'active' && styles.segmentTextActive]}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentItem, activeTab === 'completed' && styles.segmentActive]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.segmentText, activeTab === 'completed' && styles.segmentTextActive]}>Completed</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {visibleProjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No projects available</Text>
          </View>
        ) : (
          <View style={styles.projectsList}>
            {visibleProjects.map((project) => (
              <Animated.View
                key={project.id}
                style={{
                  transform: [{ scale: cardAnimation }]
                }}>
                <TouchableOpacity
                  style={styles.projectCard}
                  onPress={() => handleProjectSelect(project)}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectTitle}>{project.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(project.status)}</Text>
                  </View>
                </View>
                <Text style={styles.projectClient}>Client: {project.client_name}</Text>
                <Text style={styles.projectDescription}>{project.description}</Text>
                <View style={styles.projectFooter}>
                  <Text style={styles.projectDate}>
                    {new Date(project.created_at).toLocaleDateString()}
                  </Text>
                  <Text style={styles.projectProgress}>
                    {project.progress_percentage}% Complete
                  </Text>
                </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
    marginTop: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  segmentItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  segmentTextActive: {
    color: '#236ecf',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  projectsList: {
    gap: 16,
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedProjectCard: {
    borderColor: '#236ecf',
    shadowOpacity: 0.3,
    shadowColor: '#236ecf',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.02 }],
    backgroundColor: '#f0f9ff',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
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
  projectClient: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  projectProgress: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  menuSection: {
    marginTop: 30,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  menuGrid: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  selectedProjectMenu: {
    borderWidth: 3,
    borderColor: '#236ecf',
    backgroundColor: '#f0f9ff',
    shadowOpacity: 0.3,
    shadowColor: '#236ecf',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.02 }],
    marginTop: 20,
    marginBottom: 10,
  },
  selectedProjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectedProjectBadge: {
    backgroundColor: '#236ecf',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedProjectBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});