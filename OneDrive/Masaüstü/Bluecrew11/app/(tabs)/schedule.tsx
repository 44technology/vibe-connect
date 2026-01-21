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
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Plus, Calendar, Clock, MapPin, CheckCircle, X, ArrowLeft } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PMSchedule, Project } from '@/types';
import { ProjectService } from '@/services/projectService';
import { UserService } from '@/services/userService';
import { ScheduleService } from '@/services/scheduleService';

// Mock data removed - using Firebase PMs

export default function ScheduleScreen() {
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const { projectId } = useLocalSearchParams();
  const router = useRouter();
  const [schedules, setSchedules] = useState<PMSchedule[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pms, setPms] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showPMModal, setShowPMModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPM, setSelectedPM] = useState<any>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    pm_id: '',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    project_id: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDateSchedules, setSelectedDateSchedules] = useState<{ date: Date; schedules: PMSchedule[] } | null>(null);

  // Load projects, PMs, and schedules from Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [firebaseProjects, firebaseUsers, firebaseSchedules] = await Promise.all([
          ProjectService.getProjects(),
          UserService.getAllUsers(),
          ScheduleService.getSchedules()
        ]);
        
        console.log('Schedule - Firebase projects loaded:', firebaseProjects);
        console.log('Schedule - Firebase users loaded:', firebaseUsers);
        console.log('Schedule - Firebase schedules loaded:', firebaseSchedules);
        
        setProjects(firebaseProjects);
        setSchedules(firebaseSchedules);
        
        // Set selected project if projectId is provided
        if (projectId) {
          const project = firebaseProjects.find(p => p.id === projectId);
          if (project) {
            setSelectedProject(project);
            // Filter schedules for this project
            setSchedules(firebaseSchedules.filter(s => s.project_id === projectId));
          }
        }
        
        // Filter PM users
        const pmUsers = firebaseUsers.filter(u => u.role === 'pm');
        setPms(pmUsers);
      } catch (error) {
        console.error('Error loading data for schedule:', error);
        setProjects([]);
        setPms([]);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter schedules based on user role
  const getFilteredSchedules = () => {
    if (userRole === 'pm' && user) {
      return schedules.filter(s => s.pm_id === user.id);
    }
    return schedules;
  };

  const filteredSchedules = getFilteredSchedules();

  // Group schedules by start date
  const groupedSchedules = filteredSchedules.reduce((groups, schedule) => {
    const date = schedule.start_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(schedule);
    return groups;
  }, {} as Record<string, PMSchedule[]>);

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      setNewSchedule(prev => ({ ...prev, start_date: formattedDate }));
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      setNewSchedule(prev => ({ ...prev, end_date: formattedDate }));
    }
  };


  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setShowProjectModal(false);
    setShowPMModal(true);
  };

  const handlePMSelect = (pm: any) => {
    setSelectedPM(pm);
    setShowPMModal(false);
    setShowAddModal(true);
    setNewSchedule(prev => ({
      ...prev,
      project_id: selectedProject?.id || '',
      pm_id: pm.id,
      title: selectedProject?.title || '',
    }));
  };

  const handleAddSchedule = async () => {
    if (!newSchedule.pm_id || !newSchedule.title || !newSchedule.start_date || !newSchedule.end_date) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (new Date(newSchedule.start_date) > new Date(newSchedule.end_date)) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    try {
      const pm = pms.find(p => p.id === newSchedule.pm_id);
      const project = newSchedule.project_id ? projects.find(p => p.id === newSchedule.project_id) : null;

      const scheduleData = {
        pm_id: newSchedule.pm_id,
        pm_name: pm?.name || 'Unknown PM',
        title: newSchedule.title,
        description: newSchedule.description,
        start_date: newSchedule.start_date,
        end_date: newSchedule.end_date,
        project_id: newSchedule.project_id || '',
        project_name: project?.title || '',
      };

      const scheduleId = await ScheduleService.createSchedule(scheduleData);
      
      const newScheduleWithId: PMSchedule = {
        id: scheduleId,
        ...scheduleData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setSchedules(prev => [newScheduleWithId, ...prev]);
      setNewSchedule({
        pm_id: '',
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        project_id: '',
      });
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get schedules for a specific date (for monthly calendar view)
  const getSchedulesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredSchedules.filter(s => {
      const startDate = new Date(s.start_date);
      const endDate = new Date(s.end_date);
      const checkDate = new Date(dateStr);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  // Render web calendar
  const renderWebCalendar = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const calendarDays: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(year, month, day));
    }
    
    return (
      <View style={styles.calendarGrid}>
        <View style={styles.calendarWeekHeader}>
          {days.map((day) => (
            <View key={day} style={styles.calendarDayHeader}>
              <Text style={styles.calendarDayHeaderText}>{day}</Text>
            </View>
          ))}
        </View>
        <View style={styles.calendarDays}>
          {calendarDays.map((date, index) => {
            if (!date) {
              return <View key={`empty-${index}`} style={styles.calendarDay} />;
            }
            const dateSchedules = getSchedulesForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <View
                key={date.toISOString()}
                style={[
                  styles.calendarDay,
                  isToday && styles.calendarDayToday,
                  dateSchedules.length > 0 && styles.calendarDayWithSchedules
                ]}
              >
                <Text style={[styles.calendarDayNumber, isToday && styles.calendarDayNumberToday]}>
                  {date.getDate()}
                </Text>
                {dateSchedules.length > 0 && (
                  <View style={styles.calendarDaySchedules}>
                    {dateSchedules.slice(0, 2).map((schedule) => (
                      <View key={schedule.id} style={styles.calendarScheduleDot} />
                    ))}
                    {dateSchedules.length > 2 && (
                      <Text style={styles.calendarScheduleMore}>+{dateSchedules.length - 2}</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Render mobile calendar
  const renderMobileCalendar = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const calendarDays: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(year, month, day));
    }
    
    return (
      <View style={styles.calendarGrid}>
        <View style={styles.calendarWeekHeader}>
          {days.map((day) => (
            <View key={day} style={styles.calendarDayHeader}>
              <Text style={styles.calendarDayHeaderText}>{day}</Text>
            </View>
          ))}
        </View>
        <View style={styles.calendarDays}>
          {calendarDays.map((date, index) => {
            if (!date) {
              return <View key={`empty-${index}`} style={styles.calendarDay} />;
            }
            const dateSchedules = getSchedulesForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <TouchableOpacity
                key={date.toISOString()}
                style={[
                  styles.calendarDay,
                  isToday && styles.calendarDayToday,
                  dateSchedules.length > 0 && styles.calendarDayWithSchedules
                ]}
                onPress={() => {
                  // Show schedules for this date
                  if (dateSchedules.length > 0) {
                    setSelectedDateSchedules({ date, schedules: dateSchedules });
                  }
                }}
              >
                <Text style={[styles.calendarDayNumber, isToday && styles.calendarDayNumberToday]}>
                  {date.getDate()}
                </Text>
                {dateSchedules.length > 0 && (
                  <View style={styles.calendarDaySchedules}>
                    <Text style={styles.calendarScheduleCount}>{dateSchedules.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        {/* Show schedules for selected date */}
        {selectedDateSchedules && selectedDateSchedules.schedules && (
          <View style={styles.selectedDateSchedules}>
            <Text style={styles.selectedDateTitle}>
              {selectedDateSchedules.date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            {selectedDateSchedules.schedules.map((schedule: PMSchedule) => (
              <ScheduleCard key={schedule.id} schedule={schedule} />
            ))}
          </View>
        )}
      </View>
    );
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
          <Calendar size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {new Date(schedule.start_date).toLocaleDateString()} - {new Date(schedule.end_date).toLocaleDateString()}
          </Text>
        </View>
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
            onPress={() => handleDeleteSchedule(schedule)}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#236ecf" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#236ecf" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Schedule</Text>
            {selectedProject && (
              <Text style={styles.projectName}>{selectedProject.title}</Text>
            )}
            <Text style={styles.subtitle}>
              {filteredSchedules.length} scheduled items
            </Text>
          </View>
        </View>
        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'weekly' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('weekly')}
          >
            <Text style={[styles.viewModeText, viewMode === 'weekly' && styles.viewModeTextActive]}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'monthly' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('monthly')}
          >
            <Text style={[styles.viewModeText, viewMode === 'monthly' && styles.viewModeTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'weekly' ? (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          scrollEventThrottle={16}
        >
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
      ) : (
        <View style={styles.content}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.calendarNavButton}
              onPress={() => {
                const newMonth = new Date(selectedMonth);
                newMonth.setMonth(newMonth.getMonth() - 1);
                setSelectedMonth(newMonth);
              }}
            >
              <ArrowLeft size={20} color="#236ecf" />
            </TouchableOpacity>
            <Text style={styles.calendarMonthText}>
              {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity
              style={styles.calendarNavButton}
              onPress={() => {
                const newMonth = new Date(selectedMonth);
                newMonth.setMonth(newMonth.getMonth() + 1);
                setSelectedMonth(newMonth);
              }}
            >
              <ArrowLeft size={20} color="#236ecf" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          </View>
          {Platform.OS === 'web' ? (
            <View style={styles.calendarContainer}>
              {renderWebCalendar()}
            </View>
          ) : (
            <ScrollView style={styles.calendarContainer} showsVerticalScrollIndicator={false}>
              {renderMobileCalendar()}
            </ScrollView>
          )}
        </View>
      )}

      {userRole === 'admin' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowProjectModal(true)}>
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

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Selected Project and PM Info */}
            {selectedProject && selectedPM && (
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedInfoTitle}>Selected Assignment</Text>
                <View style={styles.selectedProjectInfo}>
                  <Text style={styles.selectedProjectTitle}>Project: {selectedProject.title}</Text>
                  <Text style={styles.selectedProjectClient}>Client: {selectedProject.client_name}</Text>
                </View>
                <View style={styles.selectedPMInfo}>
                  <Text style={styles.selectedPMName}>PM: {selectedPM.name}</Text>
                  <Text style={styles.selectedPMEmail}>{selectedPM.email}</Text>
                </View>
              </View>
            )}

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
              <Text style={styles.label}>Start Date *</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={newSchedule.start_date}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, start_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
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
                    <Text style={styles.datePickerText}>
                      {newSchedule.start_date || 'Select Start Date'}
                    </Text>
                    <Calendar size={20} color="#6b7280" />
                  </TouchableOpacity>
                  {showStartDatePicker && (
                    <DateTimePicker
                      value={newSchedule.start_date ? new Date(newSchedule.start_date) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleStartDateChange}
                      minimumDate={new Date()}
                    />
                  )}
                </>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>End Date *</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={newSchedule.end_date}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, end_date: e.target.value }))}
                  min={newSchedule.start_date || new Date().toISOString().split('T')[0]}
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
                    <Text style={styles.datePickerText}>
                      {newSchedule.end_date || 'Select End Date'}
                    </Text>
                    <Calendar size={20} color="#6b7280" />
                  </TouchableOpacity>
                  {showEndDatePicker && (
                    <DateTimePicker
                      value={newSchedule.end_date ? new Date(newSchedule.end_date) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleEndDateChange}
                      minimumDate={newSchedule.start_date ? new Date(newSchedule.start_date) : new Date()}
                    />
                  )}
                </>
              )}
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
                {projects.map((project) => (
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
          </ScrollView>
        </View>
      </Modal>

      {/* Project Selection Modal */}
      <Modal
        visible={showProjectModal}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Project</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowProjectModal(false)}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={styles.projectItem}
                  onPress={() => handleProjectSelect(project)}>
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <Text style={styles.projectClient}>Client: {project.client_name}</Text>
                    <Text style={styles.projectStatus}>Status: {project.status}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* PM Selection Modal */}
      <Modal
        visible={showPMModal}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Project Manager</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPMModal(false)}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {pms.map((pm) => (
                <TouchableOpacity
                  key={pm.id}
                  style={styles.pmItem}
                  onPress={() => handlePMSelect(pm)}>
                  <View style={styles.pmInfo}>
                    <Text style={styles.pmName}>{pm.name}</Text>
                    <Text style={styles.pmEmail}>{pm.email}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
            
            <Text style={styles.deleteTitle}>Are you sure?</Text>
            <Text style={styles.deleteMessage}>
              Do you really want to delete {scheduleToDelete?.title}? This process cannot be undone.
            </Text>
            
            <View style={styles.deleteButtons}>
              <TouchableOpacity 
                style={styles.cancelDeleteButton}
                onPress={cancelDelete}>
                <Text style={styles.cancelDeleteText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmDeleteButton}
                onPress={confirmDelete}>
                <Text style={styles.confirmDeleteText}>Delete</Text>
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
  webContainer: {
    maxWidth: 1400,
    marginHorizontal: 'auto',
    width: '100%',
    minHeight: '100vh',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    paddingBottom: 20,
    backgroundColor: '#1e40af', // Darker blue header
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00',
    ...(Platform.OS === 'web' ? {
      position: 'sticky' as any,
      top: 0,
      zIndex: 100,
    } : {}),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fbbf24',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffcc00', // Yellow text
  },
  subtitle: {
    fontSize: 16,
    color: '#fbbf24', // Light yellow like teams
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: Platform.OS === 'web' ? 40 : 20,
    paddingBottom: Platform.OS === 'web' ? 40 : 100, // Extra padding for mobile
    ...(Platform.OS === 'web' ? {
      maxWidth: 1200,
      marginHorizontal: 'auto',
      width: '100%',
    } : {}),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
    color: '#ffffff', // White text on blue background like teams
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#fbbf24', // Light yellow like teams
    marginTop: 8,
    textAlign: 'center',
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff', // White text on blue background like teams
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  scheduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: Platform.OS === 'web' ? 24 : 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00', // Yellow border like teams
    ...(Platform.OS === 'web' ? {
      maxWidth: '100%',
      cursor: 'default' as any,
    } : {}),
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
    color: '#236ecf', // Blue like teams
    marginBottom: 4,
  },
  projectName: {
    fontSize: 14,
    color: '#000000', // Black text for better readability
    fontWeight: '600',
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
    backgroundColor: '#ffcc00', // Yellow button
    borderColor: '#236ecf',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeStatusButtonText: {
    color: '#ffffff', // White text on yellow button
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
    right: Platform.OS === 'web' ? 40 : 20,
    bottom: Platform.OS === 'web' ? 40 : 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffcc00', // Yellow button
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer' as any,
      zIndex: 10,
    } : {}),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    ...(Platform.OS === 'web' ? {
      maxWidth: 800,
      marginHorizontal: 'auto',
      width: '100%',
      maxHeight: '90vh',
      borderRadius: 12,
      overflow: 'hidden',
    } : {}),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 24 : 50,
    paddingHorizontal: Platform.OS === 'web' ? 32 : 20,
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
    padding: Platform.OS === 'web' ? 32 : 20,
    paddingBottom: Platform.OS === 'web' ? 32 : 50, // Extra padding for mobile scroll
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
    backgroundColor: '#ffcc00', // Yellow button
  },
  submitButton: {
    backgroundColor: '#236ecf', // Blue button
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#ffffff', // White text on yellow button
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  datePickerText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  timePickerText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#236ecf', // Blue background
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ffffff', // White text on blue background
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      padding: 20,
    } : {}),
  },
  deleteModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: Platform.OS === 'web' ? 0 : 20,
    width: Platform.OS === 'web' ? 'auto' : '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    ...(Platform.OS === 'web' ? {
      minWidth: 400,
    } : {}),
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  deleteIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#fecaca',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
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
  projectItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  projectClient: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  projectStatus: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  pmItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pmInfo: {
    flex: 1,
  },
  pmName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  pmEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedInfo: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  selectedInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0c4a6e',
    marginBottom: 12,
  },
  selectedProjectInfo: {
    marginBottom: 8,
  },
  selectedProjectTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 2,
  },
  selectedProjectClient: {
    fontSize: 12,
    color: '#0369a1',
  },
  selectedPMInfo: {
    marginBottom: 0,
  },
  selectedPMName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 2,
  },
  selectedPMEmail: {
    fontSize: 12,
    color: '#0369a1',
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  viewModeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: '#ffcc00',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  viewModeTextActive: {
    color: '#236ecf',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
  },
  calendarNavButton: {
    padding: 8,
  },
  calendarMonthText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  calendarContainer: {
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
  },
  calendarGrid: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    ...(Platform.OS === 'web' ? {
      maxWidth: 800,
      marginHorizontal: 'auto',
    } : {}),
  },
  calendarWeekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarDayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  calendarDayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: Platform.OS === 'web' ? '14.28%' : '14.28%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 4,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
    ...(Platform.OS === 'web' ? {
      minHeight: 80,
    } : {
      minHeight: 60,
    }),
  },
  calendarDayToday: {
    backgroundColor: '#eff6ff',
    borderColor: '#236ecf',
    borderWidth: 2,
  },
  calendarDayWithSchedules: {
    backgroundColor: '#f0fdf4',
  },
  calendarDayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  calendarDayNumberToday: {
    fontWeight: '700',
    color: '#236ecf',
  },
  calendarDaySchedules: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
    gap: 2,
    alignItems: 'center',
  },
  calendarScheduleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  calendarScheduleMore: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  calendarScheduleCount: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  selectedDateSchedules: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
});