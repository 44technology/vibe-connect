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
  Image,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Plus, Camera, Calendar, Clock, User, Cloud, Sun, CloudRain, Wind, Eye, Edit, Trash2, CheckCircle, Upload, X } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Project } from '@/types';
import { DailyLogService, DailyLog } from '@/services/dailyLogService';
import { ProjectService } from '@/services/projectService';
import * as ImagePicker from 'expo-image-picker';


export default function DailyLogsScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useLanguage();
  const { userRole, user } = useAuth();

  // Client cannot access daily logs
  if (userRole === 'client') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Access Denied</Text>
        </View>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>You don't have permission to access daily logs.</Text>
        </View>
      </View>
    );
  }
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [showEditLogModal, setShowEditLogModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newLog, setNewLog] = useState<Partial<DailyLog>>({
    date: new Date().toISOString().split('T')[0],
    weather: {
      condition: 'sunny',
      wind_speed: 5,
      humidity: 60,
    },
    workers: [],
    work_completed: '',
    materials_used: '',
    equipment_used: '',
    issues_encountered: '',
    photos: [],
    notes: '',
  });

  useEffect(() => {
    loadProject();
    loadDailyLogs();
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      if (!id) return;
      const projectData = await ProjectService.getProjectById(id as string);
      setProject(projectData);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyLogs = async () => {
    if (!id) return;
    try {
      const projectLogs = await DailyLogService.getDailyLogsByProjectId(id as string);
      setDailyLogs(projectLogs);
    } catch (error) {
      console.error('Error loading daily logs:', error);
      setDailyLogs([]);
    }
  };

  const handleAddLog = async () => {
    // Validate required fields with detailed error messages
    const errors: string[] = [];
    
    if (!id) {
      errors.push('Project ID is missing');
    }
    
    if (!newLog.date || !newLog.date.trim()) {
      errors.push('Date is required');
    }
    
    if (!newLog.work_completed || !newLog.work_completed.trim()) {
      errors.push('Work Completed is required');
    }
    
    if (!newLog.weather || !newLog.weather.condition) {
      errors.push('Weather Condition is required');
    }
    
    if (errors.length > 0) {
      Alert.alert('Validation Error', `Please fill in all required fields:\n\n${errors.join('\n')}`);
      return;
    }

    try {
      const date = (newLog.date || '').trim();
      const workCompleted = (newLog.work_completed || '').trim();

      console.log('Adding daily log with data:', {
        project_id: id,
        date,
        work_completed: workCompleted,
        weather: newLog.weather,
      });

      const logData: Omit<DailyLog, 'id' | 'created_at'> = {
        project_id: id as string,
        date,
        weather: newLog.weather || {
          condition: 'sunny',
          wind_speed: 5,
          humidity: 60,
        },
        workers: newLog.workers || [],
        work_completed: workCompleted,
        materials_used: (newLog.materials_used || '').trim(),
        equipment_used: (newLog.equipment_used || '').trim(),
        issues_encountered: (newLog.issues_encountered || '').trim(),
        photos: newLog.photos || [],
        notes: (newLog.notes || '').trim(),
        created_by: user?.name || 'Current User',
        created_by_id: user?.id,
      };

      console.log('Calling DailyLogService.createDailyLog with:', logData);
      const logId = await DailyLogService.createDailyLog(logData);
      console.log('Daily log created with ID:', logId);
      
      // Reload daily logs from Firebase
      await loadDailyLogs();
      
      // Reset form
      setNewLog({
        date: new Date().toISOString().split('T')[0],
        weather: {
          condition: 'sunny',
          wind_speed: 5,
          humidity: 60,
        },
        workers: [],
        work_completed: '',
        materials_used: '',
        equipment_used: '',
        issues_encountered: '',
        photos: [],
        notes: '',
      });
      setUploadingPhoto(false);
      
      setShowAddLogModal(false);
      Alert.alert('Success', 'Daily log added successfully');
    } catch (error: any) {
      console.error('Error adding daily log:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
      });
      Alert.alert('Error', `Failed to add daily log: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleEditLog = (log: DailyLog) => {
    setSelectedLog(log);
    setNewLog(log);
    setShowEditLogModal(true);
  };

  const handleUpdateLog = async () => {
    // Validate required fields with detailed error messages
    const errors: string[] = [];
    
    if (!selectedLog) {
      errors.push('No log selected for update');
    }
    
    if (!newLog.date || !newLog.date.trim()) {
      errors.push('Date is required');
    }
    
    if (!newLog.work_completed || !newLog.work_completed.trim()) {
      errors.push('Work Completed is required');
    }
    
    if (!newLog.weather || !newLog.weather.condition) {
      errors.push('Weather Condition is required');
    }
    
    if (errors.length > 0) {
      Alert.alert('Validation Error', `Please fill in all required fields:\n\n${errors.join('\n')}`);
      return;
    }

    try {
      const date = (newLog.date || '').trim();
      const workCompleted = (newLog.work_completed || '').trim();
      await DailyLogService.updateDailyLog(selectedLog!.id, {
        date,
        weather: newLog.weather || {
          condition: 'sunny',
          wind_speed: 5,
          humidity: 60,
        },
        workers: newLog.workers || [],
        work_completed: workCompleted,
        materials_used: (newLog.materials_used || '').trim(),
        equipment_used: (newLog.equipment_used || '').trim(),
        issues_encountered: (newLog.issues_encountered || '').trim(),
        photos: newLog.photos || [],
        notes: (newLog.notes || '').trim(),
      });

      // Reload daily logs from Firebase
      await loadDailyLogs();
      
      setShowEditLogModal(false);
      setSelectedLog(null);
      Alert.alert('Success', 'Daily log updated successfully');
    } catch (error: any) {
      console.error('Error updating daily log:', error);
      Alert.alert('Error', `Failed to update daily log: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleDeleteLog = (logId: string) => {
    setLogToDelete(logId);
    setShowDeleteModal(true);
  };

  const confirmDeleteLog = async () => {
    if (logToDelete) {
      try {
        await DailyLogService.deleteDailyLog(logToDelete);
        setDailyLogs(prev => prev.filter(log => log.id !== logToDelete));
        setShowDeleteModal(false);
        setLogToDelete(null);
        Alert.alert('Success', 'Daily log deleted');
      } catch (error) {
        console.error('Error deleting daily log:', error);
        Alert.alert('Error', 'Failed to delete daily log');
      }
    }
  };

  const cancelDeleteLog = () => {
    setShowDeleteModal(false);
    setLogToDelete(null);
  };

  const handlePickImage = async () => {
    try {
      if (Platform.OS === 'web') {
        const input = window.document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        input.onchange = async (e: Event) => {
          const target = e.target as HTMLInputElement;
          if (target.files && target.files[0]) {
            const file = target.files[0];
            await uploadPhoto(file);
          }
          if (input.parentNode) {
            input.parentNode.removeChild(input);
          }
        };
        window.document.body.appendChild(input);
        input.click();
        return;
      } else {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert('Permission Required', 'Please grant camera roll permissions');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const fileName = asset.uri.split('/').pop() || 'image.jpg';
          await uploadPhoto(blob, fileName);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
      setUploadingPhoto(false);
    }
  };

  const uploadPhoto = async (file: File | Blob, fileName?: string) => {
    if (!id) return;
    
    try {
      setUploadingPhoto(true);
      
      const name = fileName || (file instanceof File ? file.name : 'image.jpg');
      
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('@/lib/firebase');
      
      const sanitizedName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `daily_logs/${id}/${Date.now()}_${sanitizedName}`);
      
      let fileToUpload: File | Blob = file;
      if (file instanceof Blob && !(file instanceof File)) {
        fileToUpload = new File([file], name, { type: file.type || 'image/jpeg' });
      }
      
      await uploadBytes(storageRef, fileToUpload);
      const fileUrl = await getDownloadURL(storageRef);

      // Add photo URL to photos array
      setNewLog(prev => ({
        ...prev,
        photos: [...(prev.photos || []), fileUrl]
      }));
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (photoUrl: string) => {
    setNewLog(prev => ({
      ...prev,
      photos: (prev.photos || []).filter(url => url !== photoUrl)
    }));
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun size={20} color="#f59e0b" />;
      case 'cloudy': return <Cloud size={20} color="#6b7280" />;
      case 'rainy': return <CloudRain size={20} color="#3b82f6" />;
      case 'stormy': return <CloudRain size={20} color="#ef4444" />;
      default: return <Sun size={20} color="#f59e0b" />;
    }
  };

  const getAttendanceColor = (attendance: string) => {
    switch (attendance) {
      case 'present': return '#10b981';
      case 'late': return '#f59e0b';
      case 'absent': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push(`/(tabs)/project/${id}`)} style={styles.backButton}>
            <ArrowLeft size={24} color="#ffcc00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Logs</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#236ecf" />
          <Text style={styles.loadingText}>Loading daily logs...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push(`/(tabs)/project/${id}`)} style={styles.backButton}>
          <ArrowLeft size={24} color="#ffcc00" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Logs</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddLogModal(true)}>
          <Plus size={24} color="#236ecf" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {dailyLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={64} color="#6b7280" />
            <Text style={styles.emptyTitle}>No Daily Logs</Text>
            <Text style={styles.emptyText}>Start recording daily activities</Text>
            <TouchableOpacity
              style={styles.addFirstLogButton}
              onPress={() => setShowAddLogModal(true)}>
              <Plus size={20} color="#ffffff" />
              <Text style={styles.addFirstLogText}>Add First Log</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.logsList}>
            {dailyLogs.map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <View style={styles.logDateContainer}>
                    <Calendar size={16} color="#236ecf" />
                    <Text style={styles.logDate}>{formatDate(log.date)}</Text>
                  </View>
                  <View style={styles.logActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditLog(log)}>
                      <Edit size={16} color="#6b7280" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteLog(log.id)}>
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Weather Info */}
                <View style={styles.weatherSection}>
                  <View style={styles.weatherItem}>
                    {getWeatherIcon(log.weather.condition)}
                    <Text style={styles.weatherText}>
                      {log.weather.condition.charAt(0).toUpperCase() + log.weather.condition.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.weatherItem}>
                    <Wind size={16} color="#6b7280" />
                    <Text style={styles.weatherText}>{log.weather.wind_speed} km/h</Text>
                  </View>
                </View>

                {/* Workers */}
                <View style={styles.workersSection}>
                  <Text style={styles.sectionTitle}>Workers ({log.workers.length})</Text>
                  {log.workers.map((worker, index) => (
                    <View key={index} style={styles.workerItem}>
                      <View style={styles.workerInfo}>
                        <Text style={styles.workerName}>{worker.name}</Text>
                        <Text style={styles.workerRole}>{worker.role}</Text>
                        <Text style={styles.workerHours}>{worker.hours_worked}h</Text>
                      </View>
                      <View style={[
                        styles.attendanceBadge,
                        { backgroundColor: getAttendanceColor(worker.attendance) }
                      ]}>
                        <Text style={styles.attendanceText}>
                          {worker.attendance.charAt(0).toUpperCase() + worker.attendance.slice(1)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Work Completed */}
                <View style={styles.workSection}>
                  <Text style={styles.sectionTitle}>Work Completed</Text>
                  <Text style={styles.workText}>{log.work_completed}</Text>
                </View>

                {/* Materials & Equipment */}
                {(log.materials_used || log.equipment_used) && (
                  <View style={styles.materialsSection}>
                    {log.materials_used && (
                      <View style={styles.materialItem}>
                        <Text style={styles.materialLabel}>Materials:</Text>
                        <Text style={styles.materialText}>{log.materials_used}</Text>
                      </View>
                    )}
                    {log.equipment_used && (
                      <View style={styles.materialItem}>
                        <Text style={styles.materialLabel}>Equipment:</Text>
                        <Text style={styles.materialText}>{log.equipment_used}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Issues */}
                {log.issues_encountered && (
                  <View style={styles.issuesSection}>
                    <Text style={styles.sectionTitle}>Issues Encountered</Text>
                    <Text style={styles.issuesText}>{log.issues_encountered}</Text>
                  </View>
                )}

                {/* Notes */}
                {log.notes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <Text style={styles.notesText}>{log.notes}</Text>
                  </View>
                )}

                {/* Photos */}
                {log.photos && log.photos.length > 0 && (
                  <View style={styles.photosSection}>
                    <Text style={styles.sectionTitle}>Photos</Text>
                    <View style={styles.photosGrid}>
                      {log.photos.map((photoUrl, idx) => (
                        <TouchableOpacity
                          key={`${photoUrl}-${idx}`}
                          style={styles.photoItem}
                          onPress={() => {
                            if (Platform.OS === 'web') {
                              window.open(photoUrl, '_blank');
                            }
                          }}
                        >
                          <Image source={{ uri: photoUrl }} style={styles.photoImage} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.logFooter}>
                  <Text style={styles.createdBy}>Created by {log.created_by}</Text>
                  <Text style={styles.createdAt}>
                    {new Date(log.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Log Modal */}
      <Modal
        visible={showAddLogModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Daily Log</Text>
            <TouchableOpacity onPress={() => setShowAddLogModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date *</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={newLog.date}
                  onChange={(e) => setNewLog(prev => ({ ...prev, date: e.target.value }))}
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
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Calendar size={20} color="#6b7280" />
                    <Text style={styles.datePickerText}>
                      {newLog.date || 'Select Date'}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={newLog.date ? new Date(newLog.date) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          const formattedDate = selectedDate.toISOString().split('T')[0];
                          setNewLog(prev => ({ ...prev, date: formattedDate }));
                        }
                      }}
                    />
                  )}
                </>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weather Condition</Text>
              <View style={styles.weatherOptions}>
                {['sunny', 'cloudy', 'rainy', 'stormy'].map((condition) => (
                  <TouchableOpacity
                    key={condition}
                    style={[
                      styles.weatherOption,
                      newLog.weather?.condition === condition && styles.selectedWeatherOption
                    ]}
                    onPress={() => setNewLog(prev => ({
                      ...prev,
                      weather: { ...prev.weather!, condition: condition as any }
                    }))}>
                    {getWeatherIcon(condition)}
                    <Text style={styles.weatherOptionText}>
                      {condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Work Completed *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newLog.work_completed}
                onChangeText={(text) => setNewLog(prev => ({ ...prev, work_completed: text }))}
                placeholder="Describe what work was completed today..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Materials Used</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newLog.materials_used}
                onChangeText={(text) => setNewLog(prev => ({ ...prev, materials_used: text }))}
                placeholder="List materials used..."
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Equipment Used</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newLog.equipment_used}
                onChangeText={(text) => setNewLog(prev => ({ ...prev, equipment_used: text }))}
                placeholder="List equipment used..."
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Issues Encountered</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newLog.issues_encountered}
                onChangeText={(text) => setNewLog(prev => ({ ...prev, issues_encountered: text }))}
                placeholder="Any issues or problems encountered..."
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Photos (Optional)</Text>
              <View style={styles.photoButtons}>
                <TouchableOpacity
                  style={[styles.photoButton, uploadingPhoto && styles.photoButtonDisabled]}
                  onPress={handlePickImage}
                  disabled={uploadingPhoto}
                >
                  <Camera size={18} color="#236ecf" />
                  <Text style={styles.photoButtonText}>Add Photo</Text>
                </TouchableOpacity>
              </View>
              {uploadingPhoto && (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="small" color="#236ecf" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
              {newLog.photos && newLog.photos.length > 0 && (
                <View style={styles.photosPreviewGrid}>
                  {newLog.photos.map((photoUrl, index) => (
                    <View key={index} style={styles.photoPreviewItem}>
                      <Image source={{ uri: photoUrl }} style={styles.photoPreviewImage} />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => removePhoto(photoUrl)}
                      >
                        <X size={16} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newLog.notes}
                onChangeText={(text) => setNewLog(prev => ({ ...prev, notes: text }))}
                placeholder="Additional notes..."
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddLog}>
              <Text style={styles.submitButtonText}>Add Daily Log</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Log Modal */}
      <Modal
        visible={showEditLogModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Daily Log</Text>
            <TouchableOpacity onPress={() => setShowEditLogModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Same form fields as add modal */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date *</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={newLog.date}
                  onChange={(e) => setNewLog(prev => ({ ...prev, date: e.target.value }))}
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
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Calendar size={20} color="#6b7280" />
                    <Text style={styles.datePickerText}>
                      {newLog.date || 'Select Date'}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={newLog.date ? new Date(newLog.date) : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          const formattedDate = selectedDate.toISOString().split('T')[0];
                          setNewLog(prev => ({ ...prev, date: formattedDate }));
                        }
                      }}
                    />
                  )}
                </>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Work Completed *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newLog.work_completed}
                onChangeText={(text) => setNewLog(prev => ({ ...prev, work_completed: text }))}
                placeholder="Describe what work was completed today..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Materials Used</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newLog.materials_used}
                onChangeText={(text) => setNewLog(prev => ({ ...prev, materials_used: text }))}
                placeholder="List materials used..."
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Equipment Used</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newLog.equipment_used}
                onChangeText={(text) => setNewLog(prev => ({ ...prev, equipment_used: text }))}
                placeholder="List equipment used..."
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Issues Encountered</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newLog.issues_encountered}
                onChangeText={(text) => setNewLog(prev => ({ ...prev, issues_encountered: text }))}
                placeholder="Any issues or problems encountered..."
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Photos (Optional)</Text>
              <View style={styles.photoButtons}>
                <TouchableOpacity
                  style={[styles.photoButton, uploadingPhoto && styles.photoButtonDisabled]}
                  onPress={handlePickImage}
                  disabled={uploadingPhoto}
                >
                  <Camera size={18} color="#236ecf" />
                  <Text style={styles.photoButtonText}>Add Photo</Text>
                </TouchableOpacity>
              </View>
              {uploadingPhoto && (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="small" color="#236ecf" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
              {newLog.photos && newLog.photos.length > 0 && (
                <View style={styles.photosPreviewGrid}>
                  {newLog.photos.map((photoUrl, index) => (
                    <View key={index} style={styles.photoPreviewItem}>
                      <Image source={{ uri: photoUrl }} style={styles.photoPreviewImage} />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => removePhoto(photoUrl)}
                      >
                        <X size={16} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newLog.notes}
                onChangeText={(text) => setNewLog(prev => ({ ...prev, notes: text }))}
                placeholder="Additional notes..."
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleUpdateLog}>
              <Text style={styles.submitButtonText}>Update Daily Log</Text>
            </TouchableOpacity>
          </ScrollView>
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
              style={styles.deleteCloseButton}
              onPress={cancelDeleteLog}>
              <Text style={styles.deleteCloseButtonText}>×</Text>
            </TouchableOpacity>
            
            <View style={styles.deleteIcon}>
              <Text style={styles.deleteIconText}>⚠</Text>
            </View>
            
            <Text style={styles.deleteTitle}>Silmek istediğinizden emin misiniz?</Text>
            <Text style={styles.deleteMessage}>
              Bu günlük kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </Text>
            
            <View style={styles.deleteButtons}>
              <TouchableOpacity 
                style={styles.cancelDeleteButton}
                onPress={cancelDeleteLog}>
                <Text style={styles.cancelDeleteText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmDeleteButton}
                onPress={confirmDeleteLog}>
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
    backgroundColor: '#1e40af', // Darker blue header
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00', // Yellow border
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffcc00', // Yellow text like teams
    flex: 1,
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffcc00', // Yellow button
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
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff', // White text on blue background
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  accessDeniedText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff', // White text on blue background
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#fbbf24', // Light yellow like teams
    marginBottom: 24,
  },
  addFirstLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffcc00', // Yellow button like teams
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addFirstLogText: {
    color: '#236ecf', // Blue text on yellow button
    fontSize: 16,
    fontWeight: '600',
  },
  logsList: {
    gap: 16,
  },
  logCard: {
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
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  logActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  weatherSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  weatherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherText: {
    fontSize: 14,
    color: '#6b7280',
  },
  workersSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  workerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  workerRole: {
    fontSize: 12,
    color: '#6b7280',
  },
  workerHours: {
    fontSize: 12,
    color: '#6b7280',
  },
  attendanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  attendanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  workSection: {
    marginBottom: 16,
  },
  workText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  materialsSection: {
    marginBottom: 16,
  },
  materialItem: {
    marginBottom: 8,
  },
  materialLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  materialText: {
    fontSize: 14,
    color: '#6b7280',
  },
  issuesSection: {
    marginBottom: 16,
  },
  issuesText: {
    fontSize: 14,
    color: '#ef4444',
    fontStyle: 'italic',
  },
  notesSection: {
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  createdBy: {
    fontSize: 12,
    color: '#6b7280',
  },
  createdAt: {
    fontSize: 12,
    color: '#9ca3af',
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
    color: '#ffcc00', // Yellow text like teams
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
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
  weatherOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  weatherOption: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  selectedWeatherOption: {
    borderColor: '#236ecf',
    backgroundColor: '#f0f9ff',
  },
  weatherOptionText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#ffcc00', // Yellow button like teams
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#236ecf', // Blue text on yellow button
    fontSize: 16,
    fontWeight: '600',
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
  // Delete Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  deleteCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  deleteCloseButtonText: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: '300',
  },
  deleteIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteIconText: {
    fontSize: 32,
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  confirmDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  photosSection: {
    marginBottom: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  photoItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  photoButtonDisabled: {
    opacity: 0.5,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#236ecf',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    marginBottom: 12,
  },
  uploadingText: {
    fontSize: 14,
    color: '#236ecf',
  },
  photosPreviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  photoPreviewItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


