import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectService } from '@/services/projectService';
import { Project } from '@/types';
import { ArrowLeft, CheckCircle, Calendar, DollarSign, User, Filter, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ProjectCard } from '@/components/ProjectCard';

export default function CompletedProjectsScreen() {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const router = useRouter();
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'pm' | 'sales' | 'client'>('all');
  const [searchName, setSearchName] = useState('');
  
  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    loadCompletedProjects();
  }, []);

  const loadCompletedProjects = async () => {
    try {
      setLoading(true);
      const projects = await ProjectService.getProjects();
      const completed = projects.filter(project => project.status === 'completed');
      setCompletedProjects(completed);
      setFilteredProjects(completed);
    } catch (error) {
      console.error('Error loading completed projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalValue = () => {
    return filteredProjects.reduce((sum, project) => sum + (project.total_budget || 0), 0);
  };

  const applyFilters = () => {
    let filtered = [...completedProjects];

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(project => 
        project.deadline && project.deadline >= startDate
      );
    }
    if (endDate) {
      filtered = filtered.filter(project => 
        project.deadline && project.deadline <= endDate
      );
    }

    // Role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(project => {
        if (selectedRole === 'pm') {
          return project.assigned_pms && project.assigned_pms.length > 0;
        } else if (selectedRole === 'sales') {
          return project.created_by_name?.toLowerCase().includes('sales') || 
                 project.assigned_pms?.some(pm => pm.toLowerCase().includes('sales'));
        } else if (selectedRole === 'client') {
          return project.client_name;
        }
        return true;
      });
    }

    // Name search filter
    if (searchName.trim()) {
      const searchTerm = searchName.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchTerm) ||
        project.client_name.toLowerCase().includes(searchTerm) ||
        (project.assigned_pms && project.assigned_pms.some(pm => 
          pm.toLowerCase().includes(searchTerm)
        ))
      );
    }

    setFilteredProjects(filtered);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedRole('all');
    setSearchName('');
    setFilteredProjects(completedProjects);
  };

  if (userRole !== 'admin' && userRole !== 'pm') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#236ecf" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Completed Projects</Text>
        </View>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>You do not have access to this page.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#236ecf" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completed Projects</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={24} color="#236ecf" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <CheckCircle size={24} color="#059669" />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryValue}>{filteredProjects.length}</Text>
              <Text style={styles.summaryLabel}>Completed Projects</Text>
            </View>
          </View>
          
          <View style={styles.summaryCard}>
            <DollarSign size={24} color="#059669" />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryValue}>{formatCurrency(getTotalValue())}</Text>
              <Text style={styles.summaryLabel}>Total Value</Text>
            </View>
          </View>
        </View>

        {/* Projects List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#236ecf" />
            <Text style={styles.loadingText}>Loading completed projects...</Text>
          </View>
        ) : filteredProjects.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Completed Projects</Text>
            <Text style={styles.emptySubtitle}>
              {completedProjects.length === 0 
                ? 'Projects that have been completed will appear here.'
                : 'No projects match your current filters.'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.projectsList}>
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Projects</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Date Range Filters */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Start Date</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      marginTop: '8px',
                      backgroundColor: '#ffffff',
                    }}
                  />
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowStartDatePicker(true)}
                    >
                      <Calendar size={20} color="#6b7280" />
                      <Text style={styles.datePickerText}>
                        {startDate ? formatDate(startDate) : 'Select start date'}
                      </Text>
                    </TouchableOpacity>
                    {showStartDatePicker && (
                      <DateTimePicker
                        value={startDate ? new Date(startDate) : new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                          setShowStartDatePicker(false);
                          if (selectedDate) {
                            const formattedDate = selectedDate.toISOString().split('T')[0];
                            setStartDate(formattedDate);
                          }
                        }}
                      />
                    )}
                  </>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>End Date</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      marginTop: '8px',
                      backgroundColor: '#ffffff',
                    }}
                  />
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowEndDatePicker(true)}
                    >
                      <Calendar size={20} color="#6b7280" />
                      <Text style={styles.datePickerText}>
                        {endDate ? formatDate(endDate) : 'Select end date'}
                      </Text>
                    </TouchableOpacity>
                    {showEndDatePicker && (
                      <DateTimePicker
                        value={endDate ? new Date(endDate) : new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                          setShowEndDatePicker(false);
                          if (selectedDate) {
                            const formattedDate = selectedDate.toISOString().split('T')[0];
                            setEndDate(formattedDate);
                          }
                        }}
                        minimumDate={startDate ? new Date(startDate) : new Date()}
                      />
                    )}
                  </>
                )}
              </View>

              {/* Role Filter */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.roleSelector}>
                  {['all', 'pm', 'sales', 'client'].map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleButton,
                        selectedRole === role && styles.selectedRoleButton,
                      ]}
                      onPress={() => setSelectedRole(role as any)}
                    >
                      <Text style={[
                        styles.roleButtonText,
                        selectedRole === role && styles.selectedRoleButtonText,
                      ]}>
                        {role.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Search by Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Search by Name</Text>
                <TextInput
                  style={styles.input}
                  value={searchName}
                  onChangeText={setSearchName}
                  placeholder="Enter project name, client, or PM name"
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearFilters}
                >
                  <Text style={styles.clearButtonText}>Clear Filters</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={applyFilters}
                >
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  filterButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  accessDeniedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryContent: {
    marginLeft: 12,
    flex: 1,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
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
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  projectHeader: {
    marginBottom: 12,
  },
  projectTitleContainer: {
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
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  projectCategory: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  projectDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  projectInfo: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  // Filter Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  dateInputText: {
    fontSize: 14,
    color: '#374151',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    marginTop: 8,
  },
  datePickerText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  dateIcon: {
    fontSize: 16,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  selectedRoleButton: {
    backgroundColor: '#236ecf',
    borderColor: '#236ecf',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  selectedRoleButtonText: {
    color: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#236ecf',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Date Picker Styles
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  datePickerContent: {
    alignItems: 'center',
  },
  datePickerInput: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
});
