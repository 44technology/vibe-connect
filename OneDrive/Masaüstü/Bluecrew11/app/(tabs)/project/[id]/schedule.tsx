import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Plus, Calendar, Clock, MapPin, CheckCircle, X, ArrowLeft, Search, User } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PMSchedule, Project } from '@/types';
import { ProjectService } from '@/services/projectService';
import { UserService } from '@/services/userService';
import { ScheduleService } from '@/services/scheduleService';

export default function ProjectScheduleScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [schedules, setSchedules] = useState<PMSchedule[]>([]);
  const [pms, setPms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showPMModal, setShowPMModal] = useState(false);
  const [pmSearchTerm, setPmSearchTerm] = useState('');
  const [selectedPM, setSelectedPM] = useState<any>(null);
  const [newSchedule, setNewSchedule] = useState({
    pm_id: '',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    project_id: id as string,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projectData, firebaseUsers, projectSchedules] = await Promise.all([
        ProjectService.getProjectById(id as string),
        UserService.getAllUsers(),
        ScheduleService.getSchedules()
      ]);
      
      setProject(projectData);
      
      // Filter schedules for this project
      const projectSchedulesFiltered = projectSchedules.filter(s => s.project_id === id);
      setSchedules(projectSchedulesFiltered);
      
      // Filter PM users
      const pmUsers = firebaseUsers.filter(u => u.role === 'pm');
      setPms(pmUsers);
    } catch (error) {
      console.error('Error loading project data:', error);
      Alert.alert('Error', 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const validateSchedule = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!newSchedule.pm_id) {
      newErrors.pm_id = 'PM selection is required';
    }
    if (!newSchedule.title || newSchedule.title.trim() === '') {
      newErrors.title = 'Title is required';
    }
    if (!newSchedule.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!newSchedule.end_date) {
      newErrors.end_date = 'End date is required';
    }
    if (newSchedule.start_date && newSchedule.end_date && new Date(newSchedule.start_date) > new Date(newSchedule.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSchedule = async () => {
    if (!validateSchedule()) {
      return;
    }

    try {
      const pm = pms.find(p => p.id === newSchedule.pm_id);

      const scheduleData = {
        pm_id: newSchedule.pm_id,
        pm_name: pm?.name || 'Unknown PM',
        title: newSchedule.title,
        description: newSchedule.description,
        start_date: newSchedule.start_date,
        end_date: newSchedule.end_date,
        project_id: newSchedule.project_id,
        project_name: project?.title || '',
      };

      const scheduleId = await ScheduleService.createSchedule(scheduleData);
      
      const newScheduleWithId: PMSchedule = {
        id: scheduleId,
        ...scheduleData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'pending',
      };

      setSchedules(prev => [newScheduleWithId, ...prev]);
      setNewSchedule({
        pm_id: '',
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        project_id: id as string,
      });
      setErrors({});
      setSelectedPM(null);
      setShowAddModal(false);
      Alert.alert('Success', 'Schedule added successfully');
    } catch (error) {
      console.error('Error adding schedule:', error);
      Alert.alert('Error', 'Failed to add schedule');
    }
  };

  const handleUpdateScheduleStatus = async (scheduleId: string, newStatus: PMSchedule['status']) => {
    try {
      await ScheduleService.updateSchedule(scheduleId, { status: newStatus });
      setSchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, status: newStatus }
          : schedule
      ));
    } catch (error) {
      console.error('Error updating schedule status:', error);
      Alert.alert('Error', 'Failed to update schedule status');
    }
  };

  const handleDeleteSchedule = (schedule: any) => {
    setScheduleToDelete(schedule);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (scheduleToDelete) {
      try {
        await ScheduleService.deleteSchedule(scheduleToDelete.id);
        setSchedules(prev => prev.filter(s => s.id !== scheduleToDelete.id));
        setShowDeleteModal(false);
        setScheduleToDelete(null);
        Alert.alert('Success', 'Schedule deleted successfully');
      } catch (error) {
        console.error('Error deleting schedule:', error);
        Alert.alert('Error', 'Failed to delete schedule');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setScheduleToDelete(null);
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
        <ActivityIndicator size="large" color="#ffcc00" />
        <Text style={styles.loadingText}>Loading schedule...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color="#ffcc00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Schedule</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Project not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push(`/(tabs)/project/${id}`)}>
          <ArrowLeft size={24} color="#ffcc00" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Schedule</Text>
          <Text style={styles.headerSubtitle}>{project.title}</Text>
        </View>
        {(userRole === 'admin' || userRole === 'pm') && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}>
            <Plus size={24} color="#ffcc00" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {schedules.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#ffffff" />
            <Text style={styles.emptyText}>No schedules found</Text>
            <Text style={styles.emptySubtext}>Add a new schedule to get started</Text>
          </View>
        ) : (
          <View style={styles.schedulesList}>
            {schedules.map((schedule) => (
              <View key={schedule.id} style={styles.scheduleCard}>
                <View style={styles.scheduleHeader}>
                  <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(schedule.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(schedule.status)}</Text>
                  </View>
                </View>
                
                <Text style={styles.scheduleDescription}>{schedule.description}</Text>
                
                <View style={styles.scheduleDetails}>
                  <View style={styles.detailRow}>
                    <Clock size={16} color="#6b7280" />
                    <Text style={styles.detailText}>
                      {new Date(schedule.date).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Calendar size={16} color="#6b7280" />
                    <Text style={styles.detailText}>
                      {new Date(schedule.date).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <User size={16} color="#6b7280" />
                    <Text style={styles.detailText}>PM: {schedule.pm_name}</Text>
                  </View>
                  
                  {schedule.start_date && schedule.end_date && (
                    <View style={styles.detailRow}>
                      <Calendar size={16} color="#6b7280" />
                      <Text style={styles.detailText}>
                        {new Date(schedule.start_date).toLocaleDateString()} - {new Date(schedule.end_date).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>

                {userRole === 'admin' && (
                  <View style={styles.scheduleActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.completeButton]}
                      onPress={() => handleUpdateScheduleStatus(schedule.id, 'completed')}>
                      <CheckCircle size={16} color="#059669" />
                      <Text style={styles.actionButtonText}>Complete</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteSchedule(schedule)}>
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Schedule Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Schedule</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PM *</Text>
              <TouchableOpacity
                style={[styles.selectButton, errors.pm_id && styles.inputError]}
                onPress={() => setShowPMModal(true)}>
                <Text style={[styles.selectButtonText, !selectedPM && styles.placeholderText]}>
                  {selectedPM ? selectedPM.name : 'Select PM'}
                </Text>
                <User size={20} color="#6b7280" />
              </TouchableOpacity>
              {errors.pm_id && (
                <Text style={styles.errorText}>{errors.pm_id}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={newSchedule.title}
                onChangeText={(text) => {
                  setNewSchedule(prev => ({ ...prev, title: text }));
                  if (errors.title) {
                    setErrors(prev => ({ ...prev, title: '' }));
                  }
                }}
                placeholder="Enter schedule title"
              />
              {errors.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newSchedule.description}
                onChangeText={(text) => setNewSchedule(prev => ({ ...prev, description: text }))}
                placeholder="Enter description"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date Range *</Text>
              <View style={styles.dateRangeContainer}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateLabel}>Start Date</Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="date"
                      value={newSchedule.start_date}
                      onChange={(e) => {
                        setNewSchedule(prev => ({ ...prev, start_date: e.target.value }));
                        if (errors.start_date) {
                          setErrors(prev => ({ ...prev, start_date: '' }));
                        }
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: errors.start_date ? '1px solid #ef4444' : '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        marginTop: '8px',
                        backgroundColor: '#ffffff',
                      }}
                    />
                  ) : (
                    <>
                      <TouchableOpacity 
                        style={[styles.datePickerButton, errors.start_date && styles.inputError]}
                        onPress={() => setShowStartDatePicker(true)}
                      >
                        <Calendar size={20} color="#6b7280" />
                        <Text style={styles.datePickerText}>
                          {newSchedule.start_date ? new Date(newSchedule.start_date).toLocaleDateString() : 'Select start date'}
                        </Text>
                      </TouchableOpacity>
                      {showStartDatePicker && (
                        <DateTimePicker
                          value={newSchedule.start_date ? new Date(newSchedule.start_date) : new Date()}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={(event, selectedDate) => {
                            setShowStartDatePicker(false);
                            if (selectedDate) {
                              const formattedDate = selectedDate.toISOString().split('T')[0];
                              setNewSchedule(prev => ({ ...prev, start_date: formattedDate }));
                              if (errors.start_date) {
                                setErrors(prev => ({ ...prev, start_date: '' }));
                              }
                            }
                          }}
                          minimumDate={new Date()}
                        />
                      )}
                    </>
                  )}
                  {errors.start_date && (
                    <Text style={styles.errorText}>{errors.start_date}</Text>
                  )}
                </View>
                
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateLabel}>End Date</Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="date"
                      value={newSchedule.end_date}
                      onChange={(e) => {
                        setNewSchedule(prev => ({ ...prev, end_date: e.target.value }));
                        if (errors.end_date) {
                          setErrors(prev => ({ ...prev, end_date: '' }));
                        }
                      }}
                      min={newSchedule.start_date || new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: errors.end_date ? '1px solid #ef4444' : '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        marginTop: '8px',
                        backgroundColor: '#ffffff',
                      }}
                    />
                  ) : (
                    <>
                      <TouchableOpacity 
                        style={[styles.datePickerButton, errors.end_date && styles.inputError]}
                        onPress={() => setShowEndDatePicker(true)}
                      >
                        <Calendar size={20} color="#6b7280" />
                        <Text style={styles.datePickerText}>
                          {newSchedule.end_date ? new Date(newSchedule.end_date).toLocaleDateString() : 'Select end date'}
                        </Text>
                      </TouchableOpacity>
                      {showEndDatePicker && (
                        <DateTimePicker
                          value={newSchedule.end_date ? new Date(newSchedule.end_date) : new Date()}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={(event, selectedDate) => {
                            setShowEndDatePicker(false);
                            if (selectedDate) {
                              const formattedDate = selectedDate.toISOString().split('T')[0];
                              setNewSchedule(prev => ({ ...prev, end_date: formattedDate }));
                              if (errors.end_date) {
                                setErrors(prev => ({ ...prev, end_date: '' }));
                              }
                            }
                          }}
                          minimumDate={newSchedule.start_date ? new Date(newSchedule.start_date) : new Date()}
                        />
                      )}
                    </>
                  )}
                  {errors.end_date && (
                    <Text style={styles.errorText}>{errors.end_date}</Text>
                  )}
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddSchedule}>
              <Text style={styles.submitButtonText}>Add Schedule</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Date Picker Modal - Only for mobile when not using inline picker */}
      {Platform.OS !== 'web' && showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerModal}>
              <DateTimePicker
                value={newSchedule.date ? new Date(newSchedule.date) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const formattedDate = selectedDate.toISOString().split('T')[0];
                    setNewSchedule(prev => ({ ...prev, date: formattedDate }));
                  }
                }}
                minimumDate={new Date()}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={cancelDelete}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            
            <View style={styles.deleteIcon}>
              <Text style={styles.deleteIconText}>⚠</Text>
            </View>
            
            <Text style={styles.deleteTitle}>Silmek istediğinizden emin misiniz?</Text>
            <Text style={styles.deleteMessage}>
              {scheduleToDelete?.title} adlı zamanlamayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </Text>
            
            <View style={styles.deleteButtons}>
              <TouchableOpacity
                style={styles.cancelDeleteButton}
                onPress={cancelDelete}>
                <Text style={styles.cancelDeleteText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={confirmDelete}>
                <Text style={styles.confirmDeleteText}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#236ecf', // Blue background like teams
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e40af', // Darker blue header
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00', // Yellow border
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffcc00', // Yellow text like teams
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fbbf24', // Light yellow like teams
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#236ecf',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#236ecf',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ffffff', // White text on blue background
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff', // White text on blue background
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff', // White text on blue background
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#fbbf24', // Light yellow like teams
    marginTop: 4,
  },
  schedulesList: {
    gap: 16,
  },
  scheduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00', // Yellow border like teams
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scheduleTitle: {
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
  scheduleDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  scheduleDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  completeButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#236ecf',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 50,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    marginLeft: 4,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  dateRangeContainer: {
    gap: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
    backgroundColor: '#f9fafb',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 8,
  },
  inputText: {
    fontSize: 16,
    color: '#374151',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  timeInput: {
    flex: 1,
  },
  pmList: {
    gap: 8,
  },
  pmOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  selectedPMOption: {
    borderColor: '#236ecf',
    backgroundColor: '#f0f9ff',
  },
  pmInfo: {
    flex: 1,
  },
  pmName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  pmEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#236ecf',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#236ecf',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerModal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  datePickerText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  deleteModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  deleteIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#fecaca',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteIconText: {
    fontSize: 24,
    color: '#ef4444',
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelDeleteButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelDeleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmDeleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});



