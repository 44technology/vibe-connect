import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Plus, X } from 'lucide-react-native';
import { ProjectCard } from '@/components/ProjectCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Project, ProjectStep } from '@/types';

// Mock data - In real app, this would come from MongoDB
const mockSteps: ProjectStep[] = [
  {
    id: '1',
    project_id: '1',
    name: 'Foundation',
    description: 'Excavation and foundation work',
    status: 'completed',
    order_index: 1,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    project_id: '1',
    name: 'Framing',
    description: 'Structural framing',
    status: 'ongoing',
    order_index: 2,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    project_id: '1',
    name: 'Roofing',
    description: 'Roof installation',
    status: 'pending',
    order_index: 3,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '4',
    project_id: '1',
    name: 'Finishing',
    description: 'Interior finishing work',
    status: 'pending',
    order_index: 4,
    created_at: '2024-01-15T00:00:00Z',
  },
];

// Mock clients - In real app, this would come from database
const mockClients = [
  { id: 'client1', name: 'John Smith', email: 'john@example.com' },
  { id: 'client2', name: 'Sarah Johnson', email: 'sarah@example.com' },
  { id: 'client3', name: 'Mike Wilson', email: 'mike@example.com' },
];

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Luxury Villa - Miami Beach',
    description: 'Modern luxury villa construction with ocean view and premium finishes',
    category: 'residential',
    start_date: '2024-01-15',
    deadline: '2024-08-30',
    status: 'active',
    client_id: 'client1',
    client_name: 'John Smith',
    manager_id: 'manager1',
    progress_percentage: 45,
    created_at: '2024-01-15T00:00:00Z',
    steps: mockSteps,
  },
  {
    id: '2',
    title: 'Office Complex - Downtown',
    description: '15-story office building with modern amenities',
    category: 'commercial',
    start_date: '2024-02-01',
    deadline: '2024-12-15',
    status: 'active',
    client_id: 'client2',
    client_name: 'Sarah Johnson',
    manager_id: 'manager1',
    progress_percentage: 25,
    created_at: '2024-02-01T00:00:00Z',
    steps: [],
  },
  {
    id: '3',
    title: 'Shopping Center Renovation',
    description: 'Complete renovation of existing shopping center',
    category: 'renovation',
    start_date: '2024-03-10',
    deadline: '2024-07-20',
    status: 'active',
    client_id: 'client3',
    client_name: 'Mike Wilson',
    manager_id: 'manager1',
    progress_percentage: 75,
    created_at: '2024-03-10T00:00:00Z',
    steps: [],
  },
  {
    id: '4',
    title: 'Client Test Project',
    description: 'This is a test project assigned to the client user for demonstration purposes',
    category: 'residential',
    start_date: '2024-01-20',
    deadline: '2024-06-15',
    status: 'active',
    client_id: 'client5',
    client_name: 'Client User',
    manager_id: 'manager1',
    progress_percentage: 30,
    created_at: '2024-01-20T00:00:00Z',
    steps: [
      {
        id: '4-1',
        project_id: '4',
        name: 'Planning Phase',
        description: 'Initial planning and design',
        status: 'completed',
        order_index: 1,
        created_at: '2024-01-20T00:00:00Z',
      },
      {
        id: '4-2',
        project_id: '4',
        name: 'Foundation Work',
        description: 'Foundation construction',
        status: 'ongoing',
        order_index: 2,
        created_at: '2024-01-20T00:00:00Z',
      },
      {
        id: '4-3',
        project_id: '4',
        name: 'Construction',
        description: 'Main construction work',
        status: 'pending',
        order_index: 3,
        created_at: '2024-01-20T00:00:00Z',
      },
    ],
  },
];

export default function ProjectsScreen() {
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: 'residential',
    client_id: '',
    startDate: '',
    deadline: '',
  });

  // Filter and sort projects based on user role
  const getFilteredProjects = () => {
    let filteredProjects = [...projects];
    
    // Client can only see their own projects
    if (userRole === 'client' && user) {
      filteredProjects = filteredProjects.filter(p => p.client_id === user.id);
    }
    
    return filteredProjects
      .filter(p => p.status === 'active')
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  };

  const sortedProjects = getFilteredProjects();

  const handleDeleteProject = (projectId: string) => {
    Alert.alert(
      t('delete') + ' ' + t('projects'),
      'Are you sure you want to delete this project?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => {
            setProjects(prev => prev.filter(p => p.id !== projectId));
          },
        },
      ]
    );
  };

  const handleEditProject = (project: Project) => {
    // In real app, this would open edit modal
    console.log('Edit project:', project);
  };

  const handleAddProject = () => {
    if (!newProject.title || !newProject.description || !newProject.client_id || !newProject.startDate || !newProject.deadline) {
      Alert.alert('Error', 'Please fill in all required fields including client selection');
      return;
    }

    const selectedClient = mockClients.find(c => c.id === newProject.client_id);
    if (!selectedClient) {
      Alert.alert('Error', 'Please select a valid client');
      return;
    }

    const project: Project = {
      id: Date.now().toString(),
      title: newProject.title,
      description: newProject.description,
      category: newProject.category,
      start_date: newProject.startDate,
      deadline: newProject.deadline,
      status: 'active',
      client_id: newProject.client_id,
      client_name: selectedClient.name,
      manager_id: 'manager-1',
      progress_percentage: 0,
      created_at: new Date().toISOString(),
      steps: [],
    };

    setProjects(prev => [...prev, project]);
    setShowAddModal(false);
    setNewProject({
      title: '',
      description: '',
      category: 'residential',
      client_id: '',
      startDate: '',
      deadline: '',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('projects')}</Text>
          <Text style={styles.subtitle}>
            {sortedProjects.length} active projects
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sortedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDelete={undefined}
            onEdit={userRole === 'pm' ? handleEditProject : undefined}
          />
        ))}
        
        {sortedProjects.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('noData')}</Text>
          </View>
        )}
      </ScrollView>

             {userRole === 'admin' && (
               <TouchableOpacity
                 style={styles.fab}
                 onPress={() => setShowAddModal(true)}>
                 <Plus size={24} color="#ffffff" />
               </TouchableOpacity>
             )}

      {/* Add Project Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('newProject')}</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('projectTitle')}</Text>
              <TextInput
                style={styles.input}
                value={newProject.title}
                onChangeText={(text) => setNewProject(prev => ({ ...prev, title: text }))}
                placeholder="Enter project title"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('description')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newProject.description}
                onChangeText={(text) => setNewProject(prev => ({ ...prev, description: text }))}
                placeholder="Enter project description"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Client *</Text>
              <View style={styles.clientList}>
                {mockClients.map((client) => (
                  <TouchableOpacity
                    key={client.id}
                    style={[
                      styles.clientOption,
                      newProject.client_id === client.id && styles.selectedClientOption,
                    ]}
                    onPress={() => setNewProject(prev => ({ ...prev, client_id: client.id }))}>
                    <View style={styles.clientInfo}>
                      <Text style={styles.clientName}>{client.name}</Text>
                      <Text style={styles.clientEmail}>{client.email}</Text>
                    </View>
                    {newProject.client_id === client.id && (
                      <View style={styles.selectedIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('category')}</Text>
              <TextInput
                style={styles.input}
                value={newProject.category}
                onChangeText={(text) => setNewProject(prev => ({ ...prev, category: text }))}
                placeholder="e.g. residential, commercial"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('startDate')}</Text>
              <TextInput
                style={styles.input}
                value={newProject.startDate}
                onChangeText={(text) => setNewProject(prev => ({ ...prev, startDate: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('deadline')}</Text>
              <TextInput
                style={styles.input}
                value={newProject.deadline}
                onChangeText={(text) => setNewProject(prev => ({ ...prev, deadline: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddProject}>
              <Text style={styles.submitButtonText}>{t('add')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4e4a6', // Dark yellow background
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#236ecf20',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#236ecf',
    marginBottom: 4,
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 90,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#236ecf',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#236ecf',
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#236ecf',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  clientList: {
    gap: 6,
  },
  clientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  selectedClientOption: {
    borderColor: '#236ecf',
    backgroundColor: '#f0f9ff',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 12,
    color: '#6b7280',
  },
  selectedIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#236ecf',
  },
});