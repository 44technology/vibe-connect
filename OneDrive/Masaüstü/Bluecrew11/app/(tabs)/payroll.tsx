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
  ActivityIndicator,
  Platform,
} from 'react-native';
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle,
  DollarSign,
  User,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Save,
  Eye,
  Plus
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/services/userService';
import { TimeClockService } from '@/services/timeClockService';
import { TimeClockEntry } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, orderBy } from 'firebase/firestore';
import HamburgerMenu from '@/components/HamburgerMenu';
import TopNavigationBar from '@/components/TopNavigationBar';

interface PayrollEntry {
  id?: string;
  user_id: string;
  user_name: string;
  week_start: string; // Monday date YYYY-MM-DD
  week_end: string; // Sunday date YYYY-MM-DD
  monday_hours: number;
  tuesday_hours: number;
  wednesday_hours: number;
  thursday_hours: number;
  friday_hours: number;
  saturday_hours: number;
  sunday_hours: number;
  monday_rate: number;
  tuesday_rate: number;
  wednesday_rate: number;
  thursday_rate: number;
  friday_rate: number;
  saturday_rate: number;
  sunday_rate: number;
  total_hours: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
}

export default function PayrollScreen() {
  const { userRole, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
    return monday.toISOString().split('T')[0];
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<PayrollEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<PayrollEntry | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedWeek]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allUsers, entries] = await Promise.all([
        UserService.getAllUsers(),
        loadPayrollEntries(),
      ]);
      setUsers(allUsers);
      
      // Load time clock data for the selected week
      const weekStart = selectedWeek;
      const weekStartDate = new Date(weekStart);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);
      const weekEnd = weekEndDate.toISOString().split('T')[0];
      
      const weeklyTimeClock = await TimeClockService.getWeeklyTimeClock(weekStart, weekEnd);
      
      // Group time clock entries by user and day
      const userHoursByDay: { [userId: string]: { [day: string]: number } } = {};
      
      weeklyTimeClock.entries.forEach(entry => {
        if (!entry.clock_out || !entry.total_hours) return; // Only count completed entries
        
        const entryDate = new Date(entry.date);
        const dayOfWeek = entryDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[dayOfWeek];
        
        if (!userHoursByDay[entry.user_id]) {
          userHoursByDay[entry.user_id] = {};
        }
        
        if (!userHoursByDay[entry.user_id][dayName]) {
          userHoursByDay[entry.user_id][dayName] = 0;
        }
        
        userHoursByDay[entry.user_id][dayName] += entry.total_hours || 0;
      });
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadPayrollEntries = async (): Promise<PayrollEntry[]> => {
    try {
      const weekStart = selectedWeek;
      const weekStartDate = new Date(weekStart);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);
      const weekEnd = weekEndDate.toISOString().split('T')[0];

      // Load existing payroll entries
      const q = query(
        collection(db, 'payroll'),
        where('week_start', '==', weekStart),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const existingEntries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PayrollEntry[];

      // Load time clock data for the week
      const weeklyTimeClock = await TimeClockService.getWeeklyTimeClock(weekStart, weekEnd);
      
      // Load all users to get daily rates
      const allUsers = await UserService.getAllUsers();
      
      // Group time clock entries by user and day
      const userHoursByDay: { [userId: string]: { [day: string]: number } } = {};
      
      weeklyTimeClock.entries.forEach(entry => {
        if (!entry.clock_out || !entry.total_hours) return; // Only count completed entries
        
        const entryDate = new Date(entry.date);
        const dayOfWeek = entryDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[dayOfWeek];
        
        if (!userHoursByDay[entry.user_id]) {
          userHoursByDay[entry.user_id] = {};
        }
        
        if (!userHoursByDay[entry.user_id][dayName]) {
          userHoursByDay[entry.user_id][dayName] = 0;
        }
        
        userHoursByDay[entry.user_id][dayName] += entry.total_hours || 0;
      });

      // Get all employees (admin, pm, sales, office)
      const employees = allUsers.filter(u => 
        u.role === 'admin' || u.role === 'pm' || u.role === 'sales' || u.role === 'office'
      );

      // Create or update payroll entries for each employee
      const entries: PayrollEntry[] = [];
      
      for (const employee of employees) {
        const userId = employee.id;
        const userHours = userHoursByDay[userId] || {};
        const dailyRate = (employee as any).daily_rate || 0;
        
        // Check if there's an existing entry for this user and week
        const existingEntry = existingEntries.find(e => e.user_id === userId);
        
        if (existingEntry) {
          // Use existing entry (admin may have edited it)
          entries.push(existingEntry);
        } else {
          // Create new entry from time clock data
          const mondayHours = userHours.monday || 0;
          const tuesdayHours = userHours.tuesday || 0;
          const wednesdayHours = userHours.wednesday || 0;
          const thursdayHours = userHours.thursday || 0;
          const fridayHours = userHours.friday || 0;
          const saturdayHours = userHours.saturday || 0;
          const sundayHours = userHours.sunday || 0;
          
          // Only create entry if there are hours worked
          if (mondayHours > 0 || tuesdayHours > 0 || wednesdayHours > 0 || 
              thursdayHours > 0 || fridayHours > 0 || saturdayHours > 0 || sundayHours > 0) {
            
            const totalHours = mondayHours + tuesdayHours + wednesdayHours + 
                             thursdayHours + fridayHours + saturdayHours + sundayHours;
            
            // Calculate total amount using daily rate for each day with hours > 0
            const totalAmount = 
              (mondayHours > 0 ? dailyRate : 0) +
              (tuesdayHours > 0 ? dailyRate : 0) +
              (wednesdayHours > 0 ? dailyRate : 0) +
              (thursdayHours > 0 ? dailyRate : 0) +
              (fridayHours > 0 ? dailyRate : 0) +
              (saturdayHours > 0 ? dailyRate : 0) +
              (sundayHours > 0 ? dailyRate : 0);
            
            const newEntry: Omit<PayrollEntry, 'id'> = {
              user_id: userId,
              user_name: employee.name,
              week_start: weekStart,
              week_end: weekEnd,
              monday_hours: mondayHours,
              tuesday_hours: tuesdayHours,
              wednesday_hours: wednesdayHours,
              thursday_hours: thursdayHours,
              friday_hours: fridayHours,
              saturday_hours: saturdayHours,
              sunday_hours: sundayHours,
              monday_rate: mondayHours > 0 ? dailyRate : 0,
              tuesday_rate: tuesdayHours > 0 ? dailyRate : 0,
              wednesday_rate: wednesdayHours > 0 ? dailyRate : 0,
              thursday_rate: thursdayHours > 0 ? dailyRate : 0,
              friday_rate: fridayHours > 0 ? dailyRate : 0,
              saturday_rate: saturdayHours > 0 ? dailyRate : 0,
              sunday_rate: sundayHours > 0 ? dailyRate : 0,
              total_hours: totalHours,
              total_amount: totalAmount,
              status: 'pending',
              created_at: new Date().toISOString(),
            };
            
            // Save to Firebase
            const docRef = await addDoc(collection(db, 'payroll'), newEntry);
            entries.push({ ...newEntry, id: docRef.id });
          }
        }
      }
      
      setPayrollEntries(entries);
      return entries;
    } catch (error) {
      console.error('Error loading payroll entries:', error);
      return [];
    }
  };

  const getWeekDates = () => {
    const start = new Date(selectedWeek);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const current = new Date(selectedWeek);
    if (direction === 'prev') {
      current.setDate(current.getDate() - 7);
    } else {
      current.setDate(current.getDate() + 7);
    }
    setSelectedWeek(current.toISOString().split('T')[0]);
  };

  const calculateTotal = (entry: Partial<PayrollEntry>) => {
    const totalHours = 
      (entry.monday_hours || 0) +
      (entry.tuesday_hours || 0) +
      (entry.wednesday_hours || 0) +
      (entry.thursday_hours || 0) +
      (entry.friday_hours || 0) +
      (entry.saturday_hours || 0) +
      (entry.sunday_hours || 0);
    
    // Calculate total amount using daily rates (only count days with hours > 0)
    const totalAmount = 
      ((entry.monday_hours || 0) > 0 ? (entry.monday_rate || 0) : 0) +
      ((entry.tuesday_hours || 0) > 0 ? (entry.tuesday_rate || 0) : 0) +
      ((entry.wednesday_hours || 0) > 0 ? (entry.wednesday_rate || 0) : 0) +
      ((entry.thursday_hours || 0) > 0 ? (entry.thursday_rate || 0) : 0) +
      ((entry.friday_hours || 0) > 0 ? (entry.friday_rate || 0) : 0) +
      ((entry.saturday_hours || 0) > 0 ? (entry.saturday_rate || 0) : 0) +
      ((entry.sunday_hours || 0) > 0 ? (entry.sunday_rate || 0) : 0);
    
    return { totalHours, totalAmount };
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry || !editingEntry.id) {
      Alert.alert('Error', 'No entry selected for editing');
      return;
    }

    const { totalHours, totalAmount } = calculateTotal(editingEntry);

    try {
      const entryRef = doc(db, 'payroll', editingEntry.id);
      await updateDoc(entryRef, {
        monday_hours: editingEntry.monday_hours || 0,
        tuesday_hours: editingEntry.tuesday_hours || 0,
        wednesday_hours: editingEntry.wednesday_hours || 0,
        thursday_hours: editingEntry.thursday_hours || 0,
        friday_hours: editingEntry.friday_hours || 0,
        saturday_hours: editingEntry.saturday_hours || 0,
        sunday_hours: editingEntry.sunday_hours || 0,
        monday_rate: editingEntry.monday_rate || 0,
        tuesday_rate: editingEntry.tuesday_rate || 0,
        wednesday_rate: editingEntry.wednesday_rate || 0,
        thursday_rate: editingEntry.thursday_rate || 0,
        friday_rate: editingEntry.friday_rate || 0,
        saturday_rate: editingEntry.saturday_rate || 0,
        sunday_rate: editingEntry.sunday_rate || 0,
        total_hours: totalHours,
        total_amount: totalAmount,
      });
      Alert.alert('Success', 'Payroll entry updated successfully');
      setShowEditModal(false);
      setEditingEntry(null);
      loadPayrollEntries();
    } catch (error) {
      console.error('Error updating payroll entry:', error);
      Alert.alert('Error', 'Failed to update payroll entry');
    }
  };


  const handleApprove = async (entryId: string) => {
    try {
      const entryRef = doc(db, 'payroll', entryId);
      await updateDoc(entryRef, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user?.name || 'Admin',
      });
      Alert.alert('Success', 'Payroll entry approved');
      loadPayrollEntries();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error approving payroll entry:', error);
      Alert.alert('Error', 'Failed to approve payroll entry');
    }
  };

  const handleReject = async (entryId: string) => {
    Alert.prompt(
      'Reject Payroll Entry',
      'Please enter rejection reason:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          onPress: async (reason) => {
            if (!reason) {
              Alert.alert('Error', 'Please enter a rejection reason');
              return;
            }
            try {
              const entryRef = doc(db, 'payroll', entryId);
              await updateDoc(entryRef, {
                status: 'rejected',
                rejected_at: new Date().toISOString(),
                rejected_by: user?.name || 'Admin',
                rejection_reason: reason,
              });
              Alert.alert('Success', 'Payroll entry rejected');
              loadPayrollEntries();
              setShowDetailModal(false);
            } catch (error) {
              console.error('Error rejecting payroll entry:', error);
              Alert.alert('Error', 'Failed to reject payroll entry');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const weekDates = getWeekDates();
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayFields = ['monday_hours', 'tuesday_hours', 'wednesday_hours', 'thursday_hours', 'friday_hours', 'saturday_hours', 'sunday_hours'] as const;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#236ecf" />
          <Text style={styles.loadingText}>Loading payroll data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? <TopNavigationBar /> : <HamburgerMenu />}
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/hr')}
        >
          <ArrowLeft size={24} color="#236ecf" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <DollarSign size={28} color="#236ecf" />
            <Text style={styles.title}>Payroll</Text>
          </View>
          <Text style={styles.subtitle}>
            Manage weekly payroll entries
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Week Navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity
            style={styles.weekNavButton}
            onPress={() => navigateWeek('prev')}
          >
            <ChevronLeft size={20} color="#236ecf" />
          </TouchableOpacity>
          <View style={styles.weekInfo}>
            <Text style={styles.weekText}>
              {weekDates.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.weekNavButton}
            onPress={() => navigateWeek('next')}
          >
            <ChevronRight size={20} color="#236ecf" />
          </TouchableOpacity>
        </View>

        {/* Payroll Entries */}
        <ScrollView style={styles.entriesContainer} showsVerticalScrollIndicator={false}>
          {payrollEntries.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Clock size={32} color="#6b7280" />
              <Text style={styles.emptyCardTitle}>No payroll entries</Text>
              <Text style={styles.emptyCardSubtext}>
                Entries are created automatically from time clock data.
              </Text>
            </View>
          ) : (
            payrollEntries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryCard}
                onPress={() => {
                  setSelectedEntry(entry);
                  setShowDetailModal(true);
                }}
              >
                <View style={styles.entryHeader}>
                  <View style={styles.entryUserInfo}>
                    <User size={20} color="#236ecf" />
                    <Text style={styles.entryUserName}>{entry.user_name}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(entry.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(entry.status) }]}>
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.entryDetails}>
                  <View style={styles.entryRow}>
                    <Text style={styles.entryLabel}>Total Hours:</Text>
                    <Text style={styles.entryValue}>{entry.total_hours.toFixed(2)} hrs</Text>
                  </View>
                  <View style={styles.entryRow}>
                    <Text style={styles.entryLabel}>Days Worked:</Text>
                    <Text style={styles.entryValue}>
                      {[
                        (entry.monday_hours || 0) > 0 ? 'Mon' : null,
                        (entry.tuesday_hours || 0) > 0 ? 'Tue' : null,
                        (entry.wednesday_hours || 0) > 0 ? 'Wed' : null,
                        (entry.thursday_hours || 0) > 0 ? 'Thu' : null,
                        (entry.friday_hours || 0) > 0 ? 'Fri' : null,
                        (entry.saturday_hours || 0) > 0 ? 'Sat' : null,
                        (entry.sunday_hours || 0) > 0 ? 'Sun' : null,
                      ].filter(Boolean).join(', ') || 'None'}
                    </Text>
                  </View>
                  <View style={[styles.entryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalValue}>
                      ${entry.total_amount.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {userRole === 'admin' && entry.status === 'pending' && (
                  <View style={styles.entryActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleApprove(entry.id!);
                      }}
                    >
                      <CheckCircle size={16} color="#ffffff" />
                      <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleReject(entry.id!);
                      }}
                    >
                      <XCircle size={16} color="#ffffff" />
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>


      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Payroll Entry Details</Text>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          {selectedEntry && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.detailSection}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Employee:</Text>
                  <Text style={styles.detailValue}>{selectedEntry.user_name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Week:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedEntry.week_start).toLocaleDateString()} - {new Date(selectedEntry.week_end).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedEntry.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(selectedEntry.status) }]}>
                      {selectedEntry.status.charAt(0).toUpperCase() + selectedEntry.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Daily Hours</Text>
                {daysOfWeek.map((day, index) => {
                  const dayField = dayFields[index];
                  const hours = selectedEntry[dayField] || 0;
                  return (
                    <View key={day} style={styles.dayDetailRow}>
                      <Text style={styles.dayDetailLabel}>{day}:</Text>
                      <Text style={styles.dayDetailValue}>{hours.toFixed(2)} hrs</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Hours:</Text>
                  <Text style={styles.summaryValue}>{selectedEntry.total_hours.toFixed(2)} hrs</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Days Worked:</Text>
                  <Text style={styles.summaryValue}>
                    {[
                      (selectedEntry.monday_hours || 0) > 0 ? 'Mon' : null,
                      (selectedEntry.tuesday_hours || 0) > 0 ? 'Tue' : null,
                      (selectedEntry.wednesday_hours || 0) > 0 ? 'Wed' : null,
                      (selectedEntry.thursday_hours || 0) > 0 ? 'Thu' : null,
                      (selectedEntry.friday_hours || 0) > 0 ? 'Fri' : null,
                      (selectedEntry.saturday_hours || 0) > 0 ? 'Sat' : null,
                      (selectedEntry.sunday_hours || 0) > 0 ? 'Sun' : null,
                    ].filter(Boolean).join(', ') || 'None'}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.totalSummaryRow]}>
                  <Text style={styles.totalSummaryLabel}>Total Amount:</Text>
                  <Text style={styles.totalSummaryValue}>
                    ${selectedEntry.total_amount.toFixed(2)}
                  </Text>
                </View>
              </View>

              {selectedEntry.approved_at && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Approval Info</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Approved at:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedEntry.approved_at).toLocaleString()}
                    </Text>
                  </View>
                  {selectedEntry.approved_by && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Approved by:</Text>
                      <Text style={styles.detailValue}>{selectedEntry.approved_by}</Text>
                    </View>
                  )}
                </View>
              )}

              {selectedEntry.rejected_at && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Rejection Info</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Rejected at:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedEntry.rejected_at).toLocaleString()}
                    </Text>
                  </View>
                  {selectedEntry.rejected_by && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Rejected by:</Text>
                      <Text style={styles.detailValue}>{selectedEntry.rejected_by}</Text>
                    </View>
                  )}
                  {selectedEntry.rejection_reason && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Reason:</Text>
                      <Text style={styles.detailValue}>{selectedEntry.rejection_reason}</Text>
                    </View>
                  )}
                </View>
              )}

              {userRole === 'admin' && (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => {
                      setEditingEntry({ ...selectedEntry });
                      setShowDetailModal(false);
                      setShowEditModal(true);
                    }}
                  >
                    <Edit size={20} color="#ffffff" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  {selectedEntry.status === 'pending' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleApprove(selectedEntry.id!)}
                      >
                        <CheckCircle size={20} color="#ffffff" />
                        <Text style={styles.actionButtonText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleReject(selectedEntry.id!)}
                      >
                        <XCircle size={20} color="#ffffff" />
                        <Text style={styles.actionButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Payroll Entry</Text>
            <TouchableOpacity onPress={() => {
              setShowEditModal(false);
              setEditingEntry(null);
            }}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          {editingEntry && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Employee</Text>
                <Text style={styles.readOnlyValue}>{editingEntry.user_name}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Weekly Hours & Daily Rates</Text>
                {daysOfWeek.map((day, index) => {
                  const dayField = dayFields[index];
                  const rateField = dayField.replace('_hours', '_rate') as keyof PayrollEntry;
                  return (
                    <View key={day} style={styles.dayRow}>
                      <Text style={styles.dayLabel}>{day}:</Text>
                      <View style={styles.dayInputs}>
                        <View style={styles.dayInputGroup}>
                          <Text style={styles.dayInputLabel}>Hours:</Text>
                          <TextInput
                            style={styles.hourInput}
                            value={editingEntry[dayField]?.toString() || '0'}
                            onChangeText={(text) => {
                              const hours = parseFloat(text) || 0;
                              setEditingEntry(prev => prev ? { ...prev, [dayField]: hours } : null);
                            }}
                            keyboardType="decimal-pad"
                          />
                        </View>
                        <View style={styles.dayInputGroup}>
                          <Text style={styles.dayInputLabel}>Rate ($):</Text>
                          <TextInput
                            style={styles.rateInput}
                            value={editingEntry[rateField]?.toString() || '0'}
                            onChangeText={(text) => {
                              const rate = parseFloat(text) || 0;
                              setEditingEntry(prev => prev ? { ...prev, [rateField]: rate } : null);
                            }}
                            keyboardType="decimal-pad"
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={styles.calculationBox}>
                <Text style={styles.calculationTitle}>Calculation</Text>
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>Total Hours:</Text>
                  <Text style={styles.calculationValue}>
                    {editingEntry ? calculateTotal(editingEntry).totalHours.toFixed(2) : '0.00'} hrs
                  </Text>
                </View>
                <View style={[styles.calculationRow, styles.totalCalculationRow]}>
                  <Text style={styles.totalCalculationLabel}>Total Amount:</Text>
                  <Text style={styles.totalCalculationValue}>
                    ${editingEntry ? calculateTotal(editingEntry).totalAmount.toFixed(2) : '0.00'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleUpdateEntry}
              >
                <Save size={20} color="#ffffff" />
                <Text style={styles.submitButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#236ecf', // Blue background like other pages
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1e40af', // Darker blue header like other pages
    borderBottomWidth: 1,
    borderBottomColor: '#ffcc00', // Yellow border like other pages
    gap: 16,
    ...(Platform.OS === 'web' ? {
      position: 'sticky' as any,
      top: 65,
      zIndex: 100,
    } : {}),
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffcc00', // Yellow text like other pages
  },
  subtitle: {
    fontSize: 14,
    color: '#fbbf24', // Light yellow like other pages
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#236ecf',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
    ...(Platform.OS === 'web' ? {
      maxWidth: 1200,
      marginHorizontal: 'auto',
      width: '100%',
    } : {}),
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  weekNavButton: {
    padding: 8,
  },
  weekInfo: {
    flex: 1,
    alignItems: 'center',
  },
  weekText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  entriesContainer: {
    flex: 1,
  },
  emptyStateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 8,
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  emptyCardSubtext: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  entryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#236ecf',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  entryDetails: {
    gap: 8,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  entryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#236ecf',
  },
  entryActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  readOnlyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: 'bold',
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
  userList: {
    gap: 8,
  },
  userOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  selectedUserOption: {
    borderColor: '#236ecf',
    backgroundColor: '#eff6ff',
  },
  userOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedUserOptionText: {
    color: '#236ecf',
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#236ecf',
  },
  dayRow: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dayInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  dayInputGroup: {
    flex: 1,
    gap: 4,
  },
  dayInputLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  hourInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  rateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  calculationBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  calculationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  totalCalculationRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalCalculationLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  totalCalculationValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#236ecf',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#236ecf',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    textAlign: 'right',
  },
  dayDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dayDetailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  dayDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  totalSummaryRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#236ecf',
  },
  totalSummaryLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  totalSummaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#236ecf',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ffffff', // White text on blue background like other pages
    fontWeight: '500',
  },
});

