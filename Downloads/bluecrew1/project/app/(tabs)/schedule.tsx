import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Plus, Calendar, Clock, MapPin, CheckCircle, X } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PMSchedule, Project } from '@/types';

// Mock data
const mockPMSchedules: PMSchedule[] = [
  {
    id: '1',
    pm_id: 'pm1',
    pm_name: 'John Smith',
    title: 'Site Inspection - Villa Project',
    description: 'Morning site inspection for progress check',
    date: '2024-01-20',
    start_time: '09:00',
    end_time: '11:00',
    location: 'Miami Beach Villa',
    status: 'pending',
    project_id: '1',
    project_name: 'Luxury Villa - Miami Beach',
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    pm_id: 'pm1',
    pm_name: 'John Smith',
    title: 'Client Meeting',
    description: 'Weekly progress update with client',
    date: '2024-01-20',
    start_time: '14:00',
    end_time: '15:30',
    location: 'Office',
    status: 'pending',
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    pm_id: 'pm2',
    pm_name: 'Sarah Johnson',
    title: 'Material Delivery Check',
    description: 'Verify material delivery for office project',
    date: '2024-01-21',
    start_time: '10:00',
    end_time: '12:00',
    location: 'Downtown Office Site',
    status: 'pending',
    project_id: '2',
    project_name: 'Office Complex - Downtown',
    created_at: '2024-01-15T00:00:00Z',
  },
];

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Luxury Villa - Miami Beach',
    description: 'Modern luxury villa construction',
    category: 'residential',
    start_date: '2024-01-15',
    deadline: '2024-08-30',
    status: 'active',
    client_id: 'client1',
    client_name: 'John Smith',
    manager_id: 'manager1',
    progress_percentage: 45,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    title: 'Office Complex - Downtown',
    description: '15-story office building',
    category: 'commercial',
    start_date: '2024-02-01',
    deadline: '2024-12-15',
    status: 'active',
    client_id: 'client2',
    client_name: 'Sarah Johnson',
    manager_id: 'manager1',
    progress_percentage: 25,
    created_at: '2024-02-01T00:00:00Z',
  },
];

const mockPMs = [
  { id: 'pm1', name: 'John Smith', email: 'john@example.com' },
  { id: 'pm2', name: 'Sarah Johnson', email: 'sarah@example.com' },
  { id: 'pm3', name: 'Mike Wilson', email: 'mike@example.com' },
];

export default function ScheduleScreen() {
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const [schedules, setSchedules] = useState<PMSchedule[]>(mockPMSchedules);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    pm_id: '',
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    project_id: '',
  });

  // Filter schedules based on user role
  const getFilteredSchedules = () => {
    if (userRole === 'pm' && user) {
      return schedules.filter(s => s.pm_id === user.id);
    }
    return schedules;
  };

  const filteredSchedules = getFilteredSchedules();

  // Group schedules by date
  const groupedSchedules = filteredSchedules.reduce((groups, schedule) => {
    const date = schedule.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(schedule);
    return groups;
  }, {} as Record<string, PMSchedule[]>);

  const handleAddSchedule = () => {
    if (!newSchedule.pm_id || !newSchedule.title || !newSchedule.date || !newSchedule.start_time || !newSchedule.end_time) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const pm = mockPMs.find(p => p.id === newSchedule.pm_id);
    const project = newSchedule.project_id ? mockProjects.find(p => p.id === newSchedule.project_id) : null;

    const schedule: PMSchedule = {
      id: Date.now().toString(),
      pm_id: newSchedule.pm_id,
      pm_name: pm?.name || 'Unknown PM',
      title: newSchedule.title,
      description: newSchedule.description,
      date: newSchedule.date,
      start_time: newSchedule.start_time,
      end_time: newSchedule.end_time,
      location: newSchedule.location,
      status: 'pending',
      project_id: newSchedule.project_id || undefined,
      project_name: project?.title,
      created_at: new Date().toISOString(),
    };

    setSchedules(prev => [...prev, schedule]);
    setShowAddModal(false);
    setNewSchedule({
      pm_id: '',
      title: '',
      description: '',
      date: '',
      start_time: '',
      end_time: '',
      location: '',
      project_id: '',
    });
  };

  const handleUpdateScheduleStatus = (scheduleId: string, newStatus: PMSchedule['status']) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, status: newStatus }
        : schedule
    ));
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSchedules(prev => prev.filter(s => s.id !== scheduleId));
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: PMSchedule['status']) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const ScheduleCard = ({ schedule }: { schedule: PMSchedule }) => (
    <View style={styles.scheduleCard}>
      <View style={styles.scheduleHeader}>
        <View style={styles.scheduleInfo}>
          <Text style={styles.scheduleTitle}>{schedule.title}</Text>
          {schedule.project_name && (
            <Text style={styles.projectName}>{schedule.project_name}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(schedule.status) }]}>
          <Text style={styles.statusText}>{schedule.status}</Text>
        </View>
      </View>

      {schedule.description && (
        <Text style={styles.scheduleDescription}>{schedule.description}</Text>
      )}

      <View style={styles.scheduleDetails}>
        <View style={styles.detailRow}>
          <Clock size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {schedule.start_time} - {schedule.end_time}
          </Text>
        </View>
        {schedule.location && (
          <View style={styles.detailRow}>
            <MapPin size={16} color="#6b7280" />
            <Text style={styles.detailText}>{schedule.location}</Text>
          </View>
        )}
      </View>

      <View style={styles.scheduleActions}>
        <View style={styles.statusButtons}>
          {['pending', 'in_progress', 'completed'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                schedule.status === status && styles.activeStatusButton,
              ]}
              onPress={() => handleUpdateScheduleStatus(schedule.id, status as PMSchedule['status'])}>
              <Text style={[
                styles.statusButtonText,
                schedule.status === status && styles.activeStatusButtonText,
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {userRole === 'admin' && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteSchedule(schedule.id)}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Schedule</Text>
          <Text style={styles.subtitle}>
            {filteredSchedules.length} scheduled items
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedSchedules).length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No schedules found</Text>
            <Text style={styles.emptySubtext}>
              {userRole === 'admin' ? 'Add schedules for your PMs' : 'Your schedule will appear here'}
            </Text>
          </View>
        ) : (
          Object.entries(groupedSchedules)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, dateSchedules]) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{formatDate(date)}</Text>
                {dateSchedules.map((schedule) => (
                  <ScheduleCard key={schedule.id} schedule={schedule} />
                ))}
              </View>
            ))
        )}
      </ScrollView>

      {userRole === 'admin' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}>
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      )}

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

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PM *</Text>
              <View style={styles.pmList}>
                {mockPMs.map((pm) => (
                  <TouchableOpacity
                    key={pm.id}
                    style={[
                      styles.pmOption,
                      newSchedule.pm_id === pm.id && styles.selectedPMOption,
                    ]}
                    onPress={() => setNewSchedule(prev => ({ ...prev, pm_id: pm.id }))}>
                    <View style={styles.pmInfo}>
                      <Text style={styles.pmName}>{pm.name}</Text>
                      <Text style={styles.pmEmail}>{pm.email}</Text>
                    </View>
                    {newSchedule.pm_id === pm.id && (
                      <View style={styles.selectedIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={newSchedule.title}
                onChangeText={(text) => setNewSchedule(prev => ({ ...prev, title: text }))}
                placeholder="Enter schedule title"
              />
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
              <Text style={styles.label}>Date *</Text>
              <TextInput
                style={styles.input}
                value={newSchedule.date}
                onChangeText={(text) => setNewSchedule(prev => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Text style={styles.label}>Start Time *</Text>
                <TextInput
                  style={styles.input}
                  value={newSchedule.start_time}
                  onChangeText={(text) => setNewSchedule(prev => ({ ...prev, start_time: text }))}
                  placeholder="HH:MM"
                />
              </View>
              <View style={styles.timeInput}>
                <Text style={styles.label}>End Time *</Text>
                <TextInput
                  style={styles.input}
                  value={newSchedule.end_time}
                  onChangeText={(text) => setNewSchedule(prev => ({ ...prev, end_time: text }))}
                  placeholder="HH:MM"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={newSchedule.location}
                onChangeText={(text) => setNewSchedule(prev => ({ ...prev, location: text }))}
                placeholder="Enter location"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Project (Optional)</Text>
              <View style={styles.projectList}>
                <TouchableOpacity
                  style={[
                    styles.projectOption,
                    newSchedule.project_id === '' && styles.selectedProjectOption,
                  ]}
                  onPress={() => setNewSchedule(prev => ({ ...prev, project_id: '' }))}>
                  <Text style={styles.projectName}>General Task</Text>
                  {newSchedule.project_id === '' && (
                    <View style={styles.selectedIndicator} />
                  )}
                </TouchableOpacity>
                {mockProjects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={[
                      styles.projectOption,
                      newSchedule.project_id === project.id && styles.selectedProjectOption,
                    ]}
                    onPress={() => setNewSchedule(prev => ({ ...prev, project_id: project.id }))}>
                    <Text style={styles.projectName}>{project.title}</Text>
                    {newSchedule.project_id === project.id && (
                      <View style={styles.selectedIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddSchedule}>
              <Text style={styles.submitButtonText}>Add Schedule</Text>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  scheduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 14,
    color: '#6b7280',
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
    textTransform: 'capitalize',
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  scheduleDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  scheduleActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  activeStatusButton: {
    backgroundColor: '#236ecf',
    borderColor: '#236ecf',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeStatusButtonText: {
    color: '#ffffff',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
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
    justifyContent: 'space-between',
    padding: 16,
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
    color: '#374151',
    marginBottom: 4,
  },
  pmEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  projectList: {
    gap: 8,
  },
  projectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  selectedProjectOption: {
    borderColor: '#236ecf',
    backgroundColor: '#f0f9ff',
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#236ecf',
  },
  submitButton: {
    backgroundColor: '#236ecf',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});